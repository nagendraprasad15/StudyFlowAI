const Stats = require('../models/Stats');
const User = require('../models/User');
const QuizAttempt = require('../models/QuizAttempt');
const Note = require('../models/Note');
const StudyPlan = require('../models/StudyPlan');
const asyncHandler = require('../utils/asyncHandler');

/**
 * @desc    Get aggregated dashboard analytics and stats
 * @route   GET /api/stats/dashboard
 * @access  Private
 */
const getDashboardStats = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  // 1. Fetch User profile metrics
  const user = await User.findById(userId).select('xpPoints level completedSessions badges username email createdAt');

  // 2. Fetch last 7 days of daily progress stats
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const statsList = await Stats.find({
    user: userId,
    date: { $gte: new Date(today.getTime() - 7 * 86400000) }
  }).sort({ date: 1 });

  // Map into Recharts compatible format (Mon, Tue, Wed...)
  const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const weeklyHoursData = statsList.map((stat) => {
    const dayName = daysOfWeek[new Date(stat.date).getDay()];
    return {
      name: dayName,
      Study: stat.studyMinutes,
      Focus: stat.focusMinutes
    };
  });

  // 3. Fetch Quiz attempt history (last 8 attempts) to plot line graphs
  const attempts = await QuizAttempt.find({ user: userId })
    .populate('quiz')
    .sort({ submittedAt: 1 })
    .limit(8);

  const quizScoresData = attempts.map((att, idx) => {
    const totalQ = att.quiz?.totalQuestions || 5;
    const accuracy = Math.round((att.score / totalQ) * 100);
    return {
      name: att.quiz?.title ? att.quiz.title.substring(0, 8) + '...' : `Quiz ${idx + 1}`,
      Score: accuracy
    };
  });

  // 4. Calculate total metrics
  const totalQuizzesAttempted = await QuizAttempt.countDocuments({ user: userId });
  
  // Calculate average accuracy
  let avgAccuracy = 0;
  if (totalQuizzesAttempted > 0) {
    const allAttempts = await QuizAttempt.find({ user: userId });
    const accuracySum = allAttempts.reduce((sum, att) => {
      const totalQ = att.quiz?.totalQuestions || 5;
      return sum + ((att.score / totalQ) * 100);
    }, 0);
    avgAccuracy = Math.round(accuracySum / totalQuizzesAttempted);
  }

  // 5. Gather weak topics from attempts
  const allAttempts = await QuizAttempt.find({ user: userId }).select('weakTopics');
  const weakTopicsMap = {};
  allAttempts.forEach(att => {
    (att.weakTopics || []).forEach(topic => {
      weakTopicsMap[topic] = (weakTopicsMap[topic] || 0) + 1;
    });
  });

  const sortedWeakTopics = Object.entries(weakTopicsMap)
    .sort((a, b) => b[1] - a[1]) // Sort descending
    .slice(0, 3)
    .map(entry => entry[0]);

  // 6. Notes count
  const notesCount = await Note.countDocuments({ user: userId });

  // 7. Active Study Plan overview
  const activePlan = await StudyPlan.findOne({ user: userId, isActive: true });

  // 8. Calculate Study Streak
  // Look at daily stats records sorted descending to see consecutive days
  const activeDaysList = await Stats.find({ user: userId, studyMinutes: { $gt: 0 } })
    .sort({ date: -1 })
    .select('date');

  let streak = 0;
  if (activeDaysList.length > 0) {
    const checkDate = new Date(today);
    
    // Check if user studied today or yesterday
    const firstActiveDate = new Date(activeDaysList[0].date);
    firstActiveDate.setHours(0, 0, 0, 0);

    const diffTimeToday = Math.abs(checkDate - firstActiveDate);
    const diffDaysToday = Math.ceil(diffTimeToday / (1000 * 60 * 60 * 24));

    if (diffDaysToday <= 1) {
      streak = 1;
      let prevDate = firstActiveDate;

      for (let i = 1; i < activeDaysList.length; i++) {
        const nextDate = new Date(activeDaysList[i].date);
        nextDate.setHours(0, 0, 0, 0);
        
        const diff = Math.abs(prevDate - nextDate);
        const diffDays = Math.ceil(diff / (1000 * 60 * 60 * 24));

        if (diffDays === 1) {
          streak += 1;
          prevDate = nextDate;
        } else if (diffDays > 1) {
          break; // Streak broken
        }
      }
    }
  }

  // 9. Compile Recent activities
  const recentActivities = [];
  const recentAttempts = await QuizAttempt.find({ user: userId })
    .populate('quiz')
    .sort({ submittedAt: -1 })
    .limit(3);

  recentAttempts.forEach(att => {
    const totalQ = att.quiz?.totalQuestions || 5;
    const accuracy = Math.round((att.score / totalQ) * 100);
    recentActivities.push({
      type: 'quiz',
      title: `Completed quiz "${att.quiz?.title || 'Practice'}"`,
      detail: `Scored ${accuracy}% (${att.score}/${totalQ} correct)`,
      timestamp: att.submittedAt
    });
  });

  const recentNotes = await Note.find({ user: userId })
    .sort({ createdAt: -1 })
    .limit(2);

  recentNotes.forEach(note => {
    let noteTitle = 'Lecture Summary';
    const headingMatch = note.summary.match(/#+\s+(.*)/);
    if (headingMatch && headingMatch[1]) {
      noteTitle = headingMatch[1].trim();
    }
    recentActivities.push({
      type: 'note',
      title: `Generated summary for "${noteTitle}"`,
      detail: `Summary saved in workspace database`,
      timestamp: note.createdAt
    });
  });

  // Sort activities chronologically
  recentActivities.sort((a, b) => b.timestamp - a.timestamp);

  res.json({
    success: true,
    user: {
      username: user.username,
      xpPoints: user.xpPoints,
      level: user.level,
      completedSessions: user.completedSessions,
      badges: user.badges
    },
    analytics: {
      weeklyHoursData: weeklyHoursData.length > 0 ? weeklyHoursData : [
        { name: 'Mon', Study: 0, Focus: 0 },
        { name: 'Tue', Study: 0, Focus: 0 },
        { name: 'Wed', Study: 0, Focus: 0 },
        { name: 'Thu', Study: 0, Focus: 0 },
        { name: 'Fri', Study: 0, Focus: 0 },
        { name: 'Sat', Study: 0, Focus: 0 },
        { name: 'Sun', Study: 0, Focus: 0 }
      ],
      quizScoresData: quizScoresData.length > 0 ? quizScoresData : [
        { name: 'No Quizzes', Score: 0 }
      ],
      streak: streak || 1,
      totalQuizzesAttempted,
      averageQuizScore: avgAccuracy || 80,
      weakTopics: sortedWeakTopics.length > 0 ? sortedWeakTopics : ['None identified yet'],
      notesCount,
      activePlan: activePlan || null,
      recentActivities: recentActivities.slice(0, 4)
    }
  });
});

module.exports = {
  getDashboardStats
};
