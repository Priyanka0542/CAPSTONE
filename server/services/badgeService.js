const User = require('../models/User');
const Badge = require('../models/Badge');

const BADGE_TYPES = {
  SEVEN_DAY_STREAK: '7-day-streak',
  THIRTY_DAY_STREAK: '30-day-streak',
  FIRST_MILESTONE: 'first-milestone',
  PATH_COMPLETED: 'path-completed',
  THREE_PATHS: '3-paths-created',
};

/**
 * Check and award badges based on current state.
 * Returns array of newly earned badges.
 */
async function checkAndAwardBadges(userId, context = {}) {
  const newBadges = [];
  const user = await User.findById(userId);
  if (!user) return newBadges;

  // Streak badges
  if (user.currentStreak >= 7) {
    const badge = await awardBadge(userId, BADGE_TYPES.SEVEN_DAY_STREAK);
    if (badge) newBadges.push(badge);
  }
  if (user.currentStreak >= 30) {
    const badge = await awardBadge(userId, BADGE_TYPES.THIRTY_DAY_STREAK);
    if (badge) newBadges.push(badge);
  }

  // Milestone badge
  if (context.milestoneCompleted) {
    const badge = await awardBadge(userId, BADGE_TYPES.FIRST_MILESTONE);
    if (badge) newBadges.push(badge);
  }

  // Path completed badge
  if (context.pathCompleted) {
    const badge = await awardBadge(userId, BADGE_TYPES.PATH_COMPLETED);
    if (badge) newBadges.push(badge);
  }

  // 3 paths created
  if (context.totalPaths >= 3) {
    const badge = await awardBadge(userId, BADGE_TYPES.THREE_PATHS);
    if (badge) newBadges.push(badge);
  }

  // Update user's badge array
  if (newBadges.length > 0) {
    const badgeIds = newBadges.map((b) => b._id);
    await User.findByIdAndUpdate(userId, {
      $addToSet: { totalBadgesEarned: { $each: badgeIds } },
    });
  }

  return newBadges;
}

/**
 * Award a badge if not already earned. Returns the badge doc or null.
 */
async function awardBadge(userId, badgeType) {
  try {
    const badge = await Badge.create({ userId, badgeType });
    return badge;
  } catch (error) {
    // Duplicate key = badge already earned
    if (error.code === 11000) return null;
    throw error;
  }
}

module.exports = { checkAndAwardBadges, BADGE_TYPES };
