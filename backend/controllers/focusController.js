const User = require('../models/User');
const Stats = require('../models/Stats');
const asyncHandler = require('../utils/asyncHandler');

/**
 * @desc    Log a completed Pomodoro focus session, award XP, update stats
 * @route   POST /api/focus/log-session
 * @access  Private
 */
const logFocusSession = asyncHandler(async (req, res) => {
  const { duration } = req.body; // duration in minutes (e.g. 25)

  if (!duration || typeof duration !== 'number' || duration <= 0) {
    res.status(400);
    throw new Error('Please provide a valid session duration in minutes');
  }

  // 1. Update User Profile gamification stats
  const user = await User.findById(req.user._id);
  if (!user) {
    res.status(404);
    throw new Error('User account not found');
  }

  // Award 50 XP per work block completion
  const xpGained = 50;
  user.xpPoints += xpGained;
  user.completedSessions += 1;

  // Level progression check (500 XP threshold)
  const nextLevelThreshold = user.level * 500;
  let levelUp = false;
  if (user.xpPoints >= nextLevelThreshold) {
    user.level += 1;
    levelUp = true;
    // Award Elite Scholar badge on level 3
    if (user.level === 3 && !user.badges.includes('Elite Scholar')) {
      user.badges.push('Elite Scholar');
    }
  }

  // Award Focus Champion badge if they completed 10 focus sessions
  if (user.completedSessions >= 10 && !user.badges.includes('Focus Champion')) {
    user.badges.push('Focus Champion');
  }

  await user.save();

  // 2. Log Daily study and focus time metrics
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  let stats = await Stats.findOne({ user: req.user._id, date: today });
  if (!stats) {
    stats = new Stats({
      user: req.user._id,
      date: today,
      studyMinutes: 0,
      focusMinutes: 0,
      quizzesTaken: 0,
      averageQuizScore: 0
    });
  }

  stats.focusMinutes += duration;
  stats.studyMinutes += duration; // Add focus minutes into total study duration too
  await stats.save();

  res.json({
    success: true,
    message: 'Focus session logged successfully',
    xpGained,
    levelUp,
    level: user.level,
    xpPoints: user.xpPoints,
    completedSessions: user.completedSessions,
    badges: user.badges
  });
});

module.exports = {
  logFocusSession
};
