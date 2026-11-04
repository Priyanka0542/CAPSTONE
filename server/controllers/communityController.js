const CareerPath = require('../models/CareerPath');
const CommunityMessage = require('../models/CommunityMessage');
const User = require('../models/User');
const { getGoalKey } = require('../utils/goalKey');

// Basic profanity/spam filter (denylist)
const PROFANITY_DENYLIST = [
  'fuck', 'shit', 'ass', 'bitch', 'damn', 'crap', 'bastard', 'whore', 'slut',
  'dick', 'pussy', 'cock', 'penis', 'vagina', 'sex', 'nude', 'naked',
  'porn', 'xxx', 'kill', 'murder', 'die', 'suicide', 'rape', 'abuse',
];

function containsProfanity(text) {
  const lowerText = text.toLowerCase();
  return PROFANITY_DENYLIST.some((word) => lowerText.includes(word));
}

// Rate limit tracking (in-memory, per user)
const userLastMessageTime = new Map();
const RATE_LIMIT_MS = 3000; // 3 seconds

// Helper to verify if user is pursuing this canonical career path
async function isUserPursuingGoal(userId, canonicalSlug, rawSlug) {
  const userPaths = await CareerPath.find({
    userId,
    status: { $ne: 'deleted' },
  });

  return userPaths.some(
    (p) =>
      p.goalSlug === canonicalSlug ||
      p.goalSlug === rawSlug ||
      getGoalKey(p.goalTitle) === canonicalSlug
  );
}

// GET /api/community/:goalSlug/members
exports.getMembers = async (req, res, next) => {
  try {
    const { goalSlug } = req.params;
    const currentUserId = req.user.userId;
    const rawSlug = (goalSlug || '').trim().toLowerCase();
    const canonicalSlug = getGoalKey(rawSlug);

    // Verify current user is pursuing this canonical path
    const isPursuing = await isUserPursuingGoal(currentUserId, canonicalSlug, rawSlug);
    if (!isPursuing) {
      return res.status(403).json({ message: 'You must be pursuing this career path to view its members.' });
    }

    // Find all active/non-deleted paths for this canonical goal
    const allPaths = await CareerPath.find({
      $or: [
        { goalSlug: canonicalSlug },
        { goalSlug: rawSlug },
      ],
      status: { $ne: 'deleted' },
    }).populate('userId', 'name currentStreak');

    const seenUsers = new Set();
    const members = [];
    const allUniqueUsers = new Set();

    for (const path of allPaths) {
      if (!path.userId || !path.userId._id) continue;
      const uid = path.userId._id.toString();
      allUniqueUsers.add(uid);

      // Exclude current user from companions list
      if (uid === currentUserId.toString()) continue;

      if (!seenUsers.has(uid)) {
        seenUsers.add(uid);
        members.push({
          displayName: path.userId.name || 'Anonymous',
          currentStreak: path.userId.currentStreak || 0,
          timelineHealth: path.timelineHealth,
          currentPace: path.currentPace,
        });
      }
    }

    const totalPursuing = allUniqueUsers.size;

    res.json({ members, totalPursuing });
  } catch (error) {
    next(error);
  }
};

// GET /api/community/:goalSlug/messages?since=<timestamp>
exports.getMessages = async (req, res, next) => {
  try {
    const { goalSlug } = req.params;
    const { since } = req.query;
    const userId = req.user.userId;
    const rawSlug = (goalSlug || '').trim().toLowerCase();
    const canonicalSlug = getGoalKey(rawSlug);

    // Verify requesting user is pursuing this path
    const isPursuing = await isUserPursuingGoal(userId, canonicalSlug, rawSlug);
    if (!isPursuing) {
      return res.status(403).json({ message: 'You must be pursuing this career path to view its messages.' });
    }

    const slugFilter =
      canonicalSlug === rawSlug
        ? canonicalSlug
        : { $in: [canonicalSlug, rawSlug] };

    let messages;
    if (since) {
      messages = await CommunityMessage.find({
        goalSlug: slugFilter,
        createdAt: { $gt: new Date(since) },
      })
        .sort({ createdAt: 1 })
        .limit(100);
    } else {
      const recent = await CommunityMessage.find({ goalSlug: slugFilter })
        .sort({ createdAt: -1 })
        .limit(100);
      messages = recent.reverse();
    }

    res.json({ messages });
  } catch (error) {
    next(error);
  }
};

// POST /api/community/:goalSlug/messages
exports.postMessage = async (req, res, next) => {
  try {
    const { goalSlug } = req.params;
    const { message } = req.body;
    const userId = req.user.userId;
    const rawSlug = (goalSlug || '').trim().toLowerCase();
    const canonicalSlug = getGoalKey(rawSlug);

    // Rate limit check
    const lastMessageTime = userLastMessageTime.get(userId.toString());
    const now = Date.now();
    if (lastMessageTime && now - lastMessageTime < RATE_LIMIT_MS) {
      const waitTime = Math.ceil((RATE_LIMIT_MS - (now - lastMessageTime)) / 1000);
      return res.status(429).json({
        message: `Please wait ${waitTime} seconds before sending another message.`,
        retryAfter: waitTime,
      });
    }

    // Validate message
    if (!message || typeof message !== 'string' || message.trim().length === 0) {
      return res.status(400).json({ message: 'Message is required.' });
    }

    if (message.length > 1000) {
      return res.status(400).json({ message: 'Message must be 1000 characters or less.' });
    }

    // Profanity filter
    if (containsProfanity(message)) {
      return res.status(400).json({ message: 'Message contains inappropriate content.' });
    }

    // Verify user is pursuing this path
    const isPursuing = await isUserPursuingGoal(userId, canonicalSlug, rawSlug);
    if (!isPursuing) {
      return res.status(403).json({ message: 'You must be pursuing this career path to post messages.' });
    }

    // Get user display name
    const user = await User.findById(userId).select('name');
    const displayName = user?.name || 'Anonymous';

    // Create message ALWAYS associated with canonicalSlug
    const newMessage = await CommunityMessage.create({
      goalSlug: canonicalSlug,
      userId,
      displayName,
      message: message.trim(),
    });

    // Update rate limit tracker
    userLastMessageTime.set(userId.toString(), now);

    res.status(201).json({ message: newMessage });
  } catch (error) {
    next(error);
  }
};

// POST /api/community/:goalSlug/messages/:messageId/report
exports.reportMessage = async (req, res, next) => {
  try {
    const { goalSlug, messageId } = req.params;
    const userId = req.user.userId;
    const rawSlug = (goalSlug || '').trim().toLowerCase();
    const canonicalSlug = getGoalKey(rawSlug);

    // Verify user is pursuing this path
    const isPursuing = await isUserPursuingGoal(userId, canonicalSlug, rawSlug);
    if (!isPursuing) {
      return res.status(403).json({ message: 'You must be pursuing this career path to report messages.' });
    }

    const message = await CommunityMessage.findOne({
      _id: messageId,
      goalSlug: { $in: [canonicalSlug, rawSlug] },
    });

    if (!message) {
      return res.status(404).json({ message: 'Message not found.' });
    }

    message.reported = true;
    await message.save();

    res.json({ message: 'Message reported for moderation.' });
  } catch (error) {
    next(error);
  }
};
