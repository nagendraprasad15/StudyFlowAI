const User = require('../models/User');
const asyncHandler = require('../utils/asyncHandler');

/**
 * Middleware to check and enforce AI generation limits for users.
 * Free tier users are limited to 20 requests per rolling calendar day.
 */
const checkAiLimit = asyncHandler(async (req, res, next) => {
  // Enforce auth pre-requisite
  if (!req.user || !req.user._id) {
    res.status(401);
    throw new Error('User authentication required before applying AI limit filters');
  }

  const user = await User.findById(req.user._id);
  if (!user) {
    res.status(404);
    throw new Error('User account not found');
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0); // Start of today

  const lastReset = user.lastRequestReset ? new Date(user.lastRequestReset) : new Date(0);
  lastReset.setHours(0, 0, 0, 0);

  // Check if we need to reset the daily count (new calendar day)
  if (today.getTime() > lastReset.getTime()) {
    user.dailyAiRequests = 0;
    user.lastRequestReset = new Date();
  }

  const LIMIT_FREE = 20;

  if (user.subscriptionType === 'free' && user.dailyAiRequests >= LIMIT_FREE) {
    res.status(429);
    return res.status(429).json({
      success: false,
      message: `You have reached your daily limit of ${LIMIT_FREE} AI generations. Please try again tomorrow!`,
      limitReached: true
    });
  }

  // Increment usage count and save
  user.dailyAiRequests += 1;
  await user.save();

  // Attach updated user limits to request for client consumption if needed
  req.aiRequestsToday = user.dailyAiRequests;
  req.aiLimitTotal = user.subscriptionType === 'free' ? LIMIT_FREE : Infinity;

  next();
});

module.exports = checkAiLimit;
