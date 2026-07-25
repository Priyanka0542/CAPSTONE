const User = require('../models/User');
const StreakLog = require('../models/StreakLog');

/**
 * Update streak for a user after a daily check-in.
 * - If last active was yesterday, increment streak
 * - If last active was today, no change
 * - If last active was before yesterday, reset to 1
 */
async function updateStreak(userId) {
  const user = await User.findById(userId);
  if (!user) return null;

  const today = getDateOnly(new Date());
  const lastActive = user.lastActiveDate ? getDateOnly(user.lastActiveDate) : null;

  let newStreak = 1;

  if (lastActive) {
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (lastActive.getTime() === today.getTime()) {
      // Already checked in today, no change
      return {
        currentStreak: user.currentStreak,
        longestStreak: user.longestStreak,
        alreadyCheckedIn: true,
      };
    } else if (lastActive.getTime() === yesterday.getTime()) {
      // Consecutive day
      newStreak = user.currentStreak + 1;
    }
    // else: gap — reset to 1
  }

  const longestStreak = Math.max(user.longestStreak, newStreak);

  await User.findByIdAndUpdate(userId, {
    currentStreak: newStreak,
    longestStreak,
    lastActiveDate: today,
  });

  // Log the streak
  await StreakLog.findOneAndUpdate(
    { userId, date: today },
    { userId, date: today, active: true },
    { upsert: true }
  );

  return { currentStreak: newStreak, longestStreak, alreadyCheckedIn: false };
}

/**
 * Get streak history for heatmap (last N days).
 */
async function getStreakHistory(userId, days = 30) {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);
  startDate.setHours(0, 0, 0, 0);

  const logs = await StreakLog.find({
    userId,
    date: { $gte: startDate },
  }).sort({ date: 1 });

  return logs;
}

function getDateOnly(date) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

module.exports = { updateStreak, getStreakHistory };
