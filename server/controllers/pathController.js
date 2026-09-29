const CareerPath = require('../models/CareerPath');
const User = require('../models/User');
const { generateRoadmap, mentorChat } = require('../services/llmService');
const { checkAndAwardBadges } = require('../services/badgeService');

// POST /api/paths — Create a new career path (triggers LLM)
exports.createPath = async (req, res, next) => {
  try {
    const { goal, profile } = req.body;
    const userId = req.user.userId;

    // Call LLM
    const roadmapData = await generateRoadmap(goal, profile || {});

    // Extract target timeline
    const targetDuration = profile?.targetDuration || req.body.targetDuration || roadmapData.estimatedMonths;
    const durationUnit = profile?.durationUnit || req.body.durationUnit || 'Months';
    const monthsToDays = durationUnit === 'Years' ? targetDuration * 365 : targetDuration * 30;
    const targetCompletionDate = profile?.targetCompletionDate || req.body.targetCompletionDate || new Date(Date.now() + monthsToDays * 86400000);
    const estimatedWeeklyHours = roadmapData.estimatedWeeklyHours || 20;

    // Create career path
    const careerPath = await CareerPath.create({
      userId,
      goalTitle: roadmapData.goalTitle,
      estimatedMonths: roadmapData.estimatedMonths,
      estimatedCostINR: roadmapData.estimatedCostINR,
      estimatedOutcomeSalaryINR: roadmapData.estimatedOutcomeSalaryINR,
      estimatedWeeklyHours,
      targetDuration,
      durationUnit,
      targetCompletionDate,
      riskLevel: roadmapData.riskLevel,
      assumptions: roadmapData.assumptions,
      roadmap: roadmapData.roadmap.map((step) => ({
        month: step.month,
        milestone: step.milestone,
        tasks: step.tasks,
        completed: false,
      })),
      userProfile: profile || {},
    });

    // Set as focus path if it's the user's first path
    const user = await User.findById(userId);
    if (!user.focusPathId) {
      user.focusPathId = careerPath._id;
      await user.save();
    }

    // Check for badges (3 paths created)
    const totalPaths = await CareerPath.countDocuments({ userId, status: { $ne: 'deleted' } });
    const newBadges = await checkAndAwardBadges(userId, { totalPaths });

    res.status(201).json({
      message: 'Career path created successfully.',
      careerPath,
      newBadges,
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/paths — Get all paths for user
exports.getPaths = async (req, res, next) => {
  try {
    const paths = await CareerPath.find({ userId: req.user.userId }).sort({ createdAt: -1 });
    res.json({ paths });
  } catch (error) {
    next(error);
  }
};

// GET /api/paths/compare?ids=id1,id2,id3
exports.comparePaths = async (req, res, next) => {
  try {
    const ids = req.query.ids.split(',').map((id) => id.trim()).filter(Boolean);

    if (ids.length < 2 || ids.length > 3) {
      return res.status(400).json({ message: 'Please select 2-3 paths to compare.' });
    }

    const paths = await CareerPath.find({
      _id: { $in: ids },
      userId: req.user.userId,
    });

    if (paths.length !== ids.length) {
      return res.status(404).json({ message: 'One or more paths not found.' });
    }

    res.json({ paths });
  } catch (error) {
    next(error);
  }
};

// GET /api/paths/:id — Get single path
exports.getPath = async (req, res, next) => {
  try {
    const path = await CareerPath.findOne({
      _id: req.params.id,
      userId: req.user.userId,
    });

    if (!path) {
      return res.status(404).json({ message: 'Career path not found.' });
    }

    res.json({ path });
  } catch (error) {
    next(error);
  }
};

// PATCH /api/paths/:id — Update path status
exports.updatePath = async (req, res, next) => {
  try {
    const { status, focusPath } = req.body;
    const userId = req.user.userId;

    const path = await CareerPath.findOne({
      _id: req.params.id,
      userId,
    });

    if (!path) {
      return res.status(404).json({ message: 'Career path not found.' });
    }

    if (status) {
      path.status = status;
    }

    await path.save();

    // Set as focus path
    if (focusPath) {
      await User.findByIdAndUpdate(userId, { focusPathId: path._id });
    }

    // Check badges if path completed
    let newBadges = [];
    if (status === 'completed') {
      newBadges = await checkAndAwardBadges(userId, { pathCompleted: true });
    }

    res.json({ message: 'Path updated.', path, newBadges });
  } catch (error) {
    next(error);
  }
};

// DELETE /api/paths/:id — Soft delete
exports.deletePath = async (req, res, next) => {
  try {
    const path = await CareerPath.findOne({
      _id: req.params.id,
      userId: req.user.userId,
    });

    if (!path) {
      return res.status(404).json({ message: 'Career path not found.' });
    }

    path.status = 'deleted';
    await path.save();

    // If this was the focus path, clear it
    const user = await User.findById(req.user.userId);
    if (user.focusPathId?.toString() === path._id.toString()) {
      const nextPath = await CareerPath.findOne({
        userId: req.user.userId,
        status: 'active',
        _id: { $ne: path._id },
      });
      user.focusPathId = nextPath ? nextPath._id : null;
      await user.save();
    }

    res.json({ message: 'Path deleted.' });
  } catch (error) {
    next(error);
  }
};

// PATCH /api/paths/:id/milestone/:milestoneId — Complete a milestone
exports.completeMilestone = async (req, res, next) => {
  try {
    const { id, milestoneId } = req.params;
    const userId = req.user.userId;

    const path = await CareerPath.findOne({ _id: id, userId });
    if (!path) {
      return res.status(404).json({ message: 'Career path not found.' });
    }

    const milestone = path.roadmap.id(milestoneId);
    if (!milestone) {
      return res.status(404).json({ message: 'Milestone not found.' });
    }

    milestone.completed = true;

    // Update monthsElapsed
    const completedMonths = path.roadmap.filter((m) => m.completed).length;
    path.monthsElapsed = completedMonths;

    await path.save();

    // Check badges
    const newBadges = await checkAndAwardBadges(userId, { milestoneCompleted: true });

    // Auto-complete path if all milestones done
    if (completedMonths === path.roadmap.length && path.roadmap.length > 0) {
      path.status = 'completed';
      path.monthsElapsed = path.estimatedMonths;
      await path.save();
      const completionBadges = await checkAndAwardBadges(userId, { pathCompleted: true });
      newBadges.push(...completionBadges);
    }

    res.json({ message: 'Milestone completed.', path, newBadges });
  } catch (error) {
    next(error);
  }
};

// POST /api/paths/:id/mentor-chat
exports.mentorChat = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const { id } = req.params;
    const { userMessage, conversationHistory } = req.body;

    const careerPath = await CareerPath.findOne({ _id: id, userId });
    if (!careerPath) {
      return res.status(404).json({ message: 'Career path not found.' });
    }

    const response = await mentorChat({ careerPath, userMessage, conversationHistory });
    res.json({ message: response });
  } catch (error) {
    next(error);
  }
};

// GET /api/paths/benchmark?goalTitle=...
exports.getPeerBenchmark = async (req, res, next) => {
  try {
    const { goalTitle } = req.query;
    if (!goalTitle) {
      return res.status(400).json({ message: 'goalTitle is required.' });
    }

    const results = await CareerPath.aggregate([
      {
        $match: {
          goalTitle: { $regex: new RegExp(goalTitle.replace(/[.*+?^${}()|[\\]\\\\]/g, '\\\\$&'), 'i') },
          status: { $ne: 'deleted' },
        },
      },
      {
        $group: {
          _id: null,
          userIds: { $addToSet: '$userId' },
          totalPaths: { $sum: 1 },
          avgMonthsElapsed: { $avg: '$monthsElapsed' },
          avgEstimatedMonths: { $avg: '$estimatedMonths' },
          paces: { $push: '$currentPace' },
          roadmaps: { $push: '$roadmap' },
        },
      },
    ]);

    const result = results[0];
    if (!result || !result.userIds || result.userIds.length < 2) {
      return res.json({ insufficient: true, userCount: result?.userIds?.length || 0 });
    }

    // Calculate average progress
    let totalProgress = 0;
    result.roadmaps.forEach(roadmap => {
      const completed = roadmap.filter(m => m.completed).length;
      const total = roadmap.length;
      if (total > 0) {
        totalProgress += completed / total;
      }
    });
    const averageProgress = Math.round((totalProgress / result.roadmaps.length) * 100);

    // Calculate pace label
    const paceCounts = {};
    let maxCount = 0;
    let mostCommonPace = 'on_track';
    result.paces.forEach(pace => {
      if (!pace) return;
      paceCounts[pace] = (paceCounts[pace] || 0) + 1;
      if (paceCounts[pace] > maxCount) {
        maxCount = paceCounts[pace];
        mostCommonPace = pace;
      }
    });

    res.json({
      userCount: result.userIds.length,
      averageProgress,
      paceLabel: mostCommonPace,
      insufficient: false
    });
  } catch (error) {
    next(error);
  }
};
