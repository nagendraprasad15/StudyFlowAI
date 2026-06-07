const Quiz = require('../models/Quiz');
const QuizAttempt = require('../models/QuizAttempt');
const Note = require('../models/Note');
const User = require('../models/User');
const Stats = require('../models/Stats');
const { generateQuizAI } = require('../services/ai/quizGeneratorService');
const asyncHandler = require('../utils/asyncHandler');

/**
 * @desc    Generate a new AI Quiz and save metadata to DB
 * @route   POST /api/quiz/generate
 * @access  Private
 */
const generateQuiz = asyncHandler(async (req, res) => {
  const { topic, difficulty, numberOfQuestions, noteId } = req.body;
  if (numberOfQuestions > 20) {
  res.status(400);
  throw new Error('Maximum 20 questions allowed');
}

if (topic.length > 100) {
  res.status(400);
  throw new Error('Topic too long');
}

  if (!topic || !topic.trim()) {
    res.status(400);
    throw new Error('Please enter a quiz topic');
  }

  let notesText = '';
  if (noteId) {
    const note = await Note.findOne({ _id: noteId, user: req.user._id });
    if (note) {
      notesText = note.originalText;
    }
  }

  console.log(
  `Generating quiz: ${topic} | ${difficulty} | ${numberOfQuestions}`
);

const existingQuiz = await Quiz.findOne({
  user: req.user._id,
  topic,
  difficulty,
  completed: false
}).sort({ createdAt: -1 });


if (existingQuiz) {
  return res.json({
    success: true,
    message: 'Cached quiz loaded',
    quiz: existingQuiz
  });
}

  // Call AI Service
  let quizData;

try {

  quizData = await generateQuizAI(
    topic,
    difficulty || 'medium',
    numberOfQuestions || 5,
    notesText
  );

} catch (error) {

  console.error(
    'Quiz AI generation failed:',
    error.message
  );

  res.status(500);

  throw new Error(
    error.message || 'AI quiz generation failed'
  );
}

if (
  !quizData ||
  !quizData.questions ||
  !Array.isArray(quizData.questions)
) {
  res.status(500);
  throw new Error('Invalid AI quiz response');
}

  // Save the Quiz to MongoDB
  const quiz = await Quiz.create({
    user: req.user._id,
    title: quizData.title,
    topic,
    difficulty: difficulty || 'medium',
    questions: quizData.questions,
    totalQuestions: quizData.questions.length,
    score: 0,
    completed: false
  });

  res.status(201).json({
    success: true,
    message: 'Quiz generated successfully',
    quiz
  });
});

/**
 * @desc    Submit quiz answers, compute grades, allocate XP, log stats
 * @route   POST /api/quiz/submit
 * @access  Private
 */
const submitQuiz = asyncHandler(async (req, res) => {
  const { quizId, selectedAnswers } = req.body;

  if (!quizId || !selectedAnswers || !Array.isArray(selectedAnswers)) {
    res.status(400);
    throw new Error('Invalid quiz submission payload');
  }

  const quiz = await Quiz.findOne({ _id: quizId, user: req.user._id });
  if (!quiz) {
    res.status(404);
    throw new Error('Quiz not found or unauthorized');
  }

  let score = 0;
  const weakTopics = [];

  // Evaluate answers
  quiz.questions.forEach((q, idx) => {
    const userAnswer = selectedAnswers[idx];
    const isCorrect = userAnswer === q.correctAnswer;
    
    if (isCorrect) {
      score += 1;
    } else {
      // Mark topic as weak topic if wrong
      const topicName = quiz.topic;
      if (!weakTopics.includes(topicName)) {
        weakTopics.push(topicName);
      }
    }
  });

  // Create Quiz Attempt log
  const attempt = await QuizAttempt.create({
    user: req.user._id,
    quiz: quizId,
    selectedAnswers,
    score,
    weakTopics,
    submittedAt: new Date()
  });

  // Update original Quiz document status
  quiz.score = score;
  quiz.completed = true;
  await quiz.save();

  // Gamification updates: allocate user XP (30 XP per correct MCQ)
  const user = await User.findById(req.user._id);
  if (user) {
    const xpPointsGained = score * 30;
    user.xpPoints += xpPointsGained;
    
    // Level up check (500 XP threshold per level)
    const nextLevelThreshold = user.level * 500;
    if (user.xpPoints >= nextLevelThreshold) {
      user.level += 1;
      // Award Level Master badge if not already unlocked
      if (!user.badges.includes('Academic Elite')) {
        user.badges.push('Academic Elite');
      }
    }
    
    // Award Quiz Master badge
    if (score === quiz.totalQuestions && !user.badges.includes('Subject Master')) {
      user.badges.push('Subject Master');
    }

    await user.save();
  }

  // Update Daily Progress Stats (for charts)
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

  const prevScoreSum = stats.quizzesTaken * stats.averageQuizScore;
  stats.quizzesTaken += 1;
  // Recalculate average score percentage
  const currentPercentage = (score / quiz.totalQuestions) * 100;
  stats.averageQuizScore = Math.round((prevScoreSum + currentPercentage) / stats.quizzesTaken);
  await stats.save();

  res.json({
    success: true,
    message: 'Quiz graded successfully',
    score,
    totalQuestions: quiz.totalQuestions,
    xpGained: score * 30,
    attempt
  });
});

/**
 * @desc    Get user's generated quizzes list
 * @route   GET /api/quiz
 * @access  Private
 */
const getQuizzes = asyncHandler(async (req, res) => {
  const quizzes = await Quiz.find({ user: req.user._id }).sort({ createdAt: -1 });

  res.json({
    success: true,
    count: quizzes.length,
    quizzes
  });
});

/**
 * @desc    Get user's complete quiz attempt history log
 * @route   GET /api/quiz/history
 * @access  Private
 */
const getQuizHistory = asyncHandler(async (req, res) => {
  const attempts = await QuizAttempt.find({ user: req.user._id })
    .populate('quiz')
    .sort({ submittedAt: -1 });

  res.json({
    success: true,
    count: attempts.length,
    attempts
  });
});

/**
 * @desc    Get quiz details by ID
 * @route   GET /api/quiz/:id
 * @access  Private
 */
const getQuizById = asyncHandler(async (req, res) => {
  const quiz = await Quiz.findOne({ _id: req.params.id, user: req.user._id });

  if (!quiz) {
    res.status(404);
    throw new Error('Quiz practice page not found or unauthorized');
  }

  res.json({
    success: true,
    quiz
  });
});

module.exports = {
  generateQuiz,
  submitQuiz,
  getQuizzes,
  getQuizHistory,
  getQuizById
};
