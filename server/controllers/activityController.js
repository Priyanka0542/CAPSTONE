const DailyActivity = require('../models/DailyActivity');
const Badge = require('../models/Badge');
const CareerPath = require('../models/CareerPath');
const User = require('../models/User');
const { updateStreak, getStreakHistory } = require('../services/streakService');
const { checkAndAwardBadges } = require('../services/badgeService');

// GET /api/activity/today
exports.getToday = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const activities = await DailyActivity.find({
      userId,
      date: { $gte: today, $lt: tomorrow },
    }).populate('careerPathId', 'goalTitle');

    // Get user's focus path for "today's task"
    const user = await User.findById(userId);
    let todayTask = null;

    if (user.focusPathId) {
      const focusPath = await CareerPath.findById(user.focusPathId);
      if (focusPath) {
        // Find current uncompleted milestone
        const currentMilestone = focusPath.roadmap.find((m) => !m.completed);
        if (currentMilestone && currentMilestone.tasks.length > 0) {
          todayTask = {
            pathId: focusPath._id,
            pathTitle: focusPath.goalTitle,
            milestone: currentMilestone.milestone,
            task: currentMilestone.tasks[0],
            month: currentMilestone.month,
          };
        }
      }
    }

    res.json({ activities, todayTask });
  } catch (error) {
    next(error);
  }
};

// POST /api/activity/checkin
exports.checkin = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const { careerPathId, taskDescription } = req.body;

    // Verify path belongs to user
    const path = await CareerPath.findOne({ _id: careerPathId, userId });
    if (!path) {
      return res.status(404).json({ message: 'Career path not found.' });
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Create activity record
    const activity = await DailyActivity.create({
      userId,
      careerPathId,
      date: today,
      taskDescription,
      completed: true,
    });

    // Update streak
    const streakResult = await updateStreak(userId);

    // Check for badges
    const newBadges = await checkAndAwardBadges(userId);

    res.status(201).json({
      message: 'Check-in recorded!',
      activity,
      streak: streakResult,
      newBadges,
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/streaks
exports.getStreaks = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const user = await User.findById(userId);

    const history = await getStreakHistory(userId, 30);

    res.json({
      currentStreak: user.currentStreak,
      longestStreak: user.longestStreak,
      lastActiveDate: user.lastActiveDate,
      history,
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/badges
exports.getBadges = async (req, res, next) => {
  try {
    const badges = await Badge.find({ userId: req.user.userId }).sort({ earnedAt: -1 });
    res.json({ badges });
  } catch (error) {
    next(error);
  }
};
