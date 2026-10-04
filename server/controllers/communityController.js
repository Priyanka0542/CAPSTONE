const CareerPath = require('../models/CareerPath');
const CommunityMessage = require('../models/CommunityMessage');
const User = require('../models/User');

// Basic profanity/spam filter (denylist)
const PROFANITY_DENYLIST = [
  'fuck', 'shit', 'ass', 'bitch', 'damn', 'crap', 'bastard', 'whore', 'slut',
  'dick', 'pussy', 'cock', 'penis', 'vagina', 'sex', 'nude', 'naked',
  'porn', 'xxx', 'kill', 'murder', 'die', 'suicide', 'rape', 'abuse'
];

function containsProfanity(text) {
  const lowerText = text.toLowerCase();
  return PROFANITY_DENYLIST.some(word => lowerText.includes(word));
}

// Rate limit tracking (in-memory, per user)
const userLastMessageTime = new Map();
const RATE_LIMIT_MS = 3000; // 3 seconds

// GET /api/community/:goalSlug/members
exports.getMembers = async (req, res, next) => {
  try {
    const { goalSlug } = req.params;
    const currentUserId = req.user.userId;

    // Find all paths with this goalSlug (excluding current user)
    const paths = await CareerPath.find({
      goalSlug,
      userId: { $ne: currentUserId },
      status: { $ne: 'deleted' },
    }).populate('userId', 'name');

    // Get user streak data
    const userIds = paths.map(p => p.userId);
    const users = await User.find({ _id: { $in: userIds } }).select('name currentStreak');

    const members = paths.map(path => {
      const user = users.find(u => u._id.toString() === path.userId.toString());
      return {
        displayName: user?.name || 'Anonymous',
        currentStreak: user?.currentStreak || 0,
        timelineHealth: path.timelineHealth,
        currentPace: path.currentPace,
      };
    });

    res.json({ members });
  } catch (error) {
    next(error);
  }
};

// GET /api/community/:goalSlug/messages?since=<timestamp>
exports.getMessages = async (req, res, next) => {
  try {
    const { goalSlug } = req.params;
    const { since } = req.query;

    const query = { goalSlug };
    if (since) {
      query.createdAt = { $gt: new Date(since) };
    }

    const messages = await CommunityMessage.find(query)
      .sort({ createdAt: 1 })
      .limit(50);

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

    // Verify user has a path with this goalSlug
    const userPath = await CareerPath.findOne({
      userId,
      goalSlug,
      status: { $ne: 'deleted' },
    });

    if (!userPath) {
      return res.status(403).json({ message: 'You must be pursuing this goal to post messages.' });
    }

    // Get user display name
    const user = await User.findById(userId).select('name');
    const displayName = user?.name || 'Anonymous';

    // Create message
    const newMessage = await CommunityMessage.create({
      goalSlug,
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

    const message = await CommunityMessage.findOne({
      _id: messageId,
      goalSlug,
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
