const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Stats = require('../models/Stats');
const StudyPlan = require('../models/StudyPlan');
const Note = require('../models/Note');
const Quiz = require('../models/Quiz');
const asyncHandler = require('../utils/asyncHandler');

// Helper function to generate JWT Token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '30d'
  });
};

/**
 * @desc    Register a new user & auto-seed demo data for presentation
 * @route   POST /api/auth/register
 * @access  Public
 */
const registerUser = asyncHandler(async (req, res) => {
  const { username, email, password } = req.body;

  if (!username || !email || !password) {
    res.status(400);
    throw new Error('Please fill in all registration fields');
  }

  // Check if username already exists
  const usernameExists = await User.findOne({ username });
  if (usernameExists) {
    res.status(400);
    throw new Error('Username is already taken');
  }

  // Check if email already exists
  const emailExists = await User.findOne({ email });
  if (emailExists) {
    res.status(400);
    throw new Error('An account with this email already exists');
  }

  // Create User with gamification fields pre-configured for a polished first impression
  const user = await User.create({
    username,
    email,
    password,
    xpPoints: 750, // Starts at 750 XP
    level: 2,       // Pre-leveled to 2
    completedSessions: 14,
    badges: ['Novice Scholar', 'Focus Champion', 'Quiz Whiz', 'Streak Master']
  });

  if (user) {
    // ==========================================
    // 🚀 AUTO-SEED DEMO DATA FOR HACKATHON DEMO
    // ==========================================
    
    // 1. Seed 7 Days of Study & Focus Analytics Stats (for graphs)
    const statsSeed = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(today.getDate() - i);
      
      // Vary study minutes and focus minutes daily
      let studyMins = 0;
      let focusMins = 0;
      let quizzes = 0;
      let avgScore = 0;

      if (i === 6) { studyMins = 80; focusMins = 50; quizzes = 1; avgScore = 80; }
      else if (i === 5) { studyMins = 95; focusMins = 60; quizzes = 0; avgScore = 0; }
      else if (i === 4) { studyMins = 120; focusMins = 75; quizzes = 2; avgScore = 85; }
      else if (i === 3) { studyMins = 45; focusMins = 25; quizzes = 1; avgScore = 90; }
      else if (i === 2) { studyMins = 110; focusMins = 75; quizzes = 1; avgScore = 100; }
      else if (i === 1) { studyMins = 130; focusMins = 90; quizzes = 2; avgScore = 95; }
      else if (i === 0) { studyMins = 45; focusMins = 25; quizzes = 0; avgScore = 0; } // Today is in-progress

      statsSeed.push({
        user: user._id,
        date,
        studyMinutes: studyMins,
        focusMinutes: focusMins,
        quizzesTaken: quizzes,
        averageQuizScore: avgScore
      });
    }
    await Stats.insertMany(statsSeed);

    // 2. Seed a Sample Study Plan
    const targetExamDate = new Date();
    targetExamDate.setDate(today.getDate() + 10); // Exam in 10 days

    await StudyPlan.create({
      user: user._id,
      subjects: ['Web Programming', 'Database Systems', 'Algorithms'],
      examDate: targetExamDate,
      dailyHours: 3,
      schedule: [
        {
          day: 1,
          subject: 'Algorithms',
          topic: 'Time Complexity & Big O notation',
          duration: 2,
          tasks: ['Watch reference video', 'Write sample problems in JS'],
          completedTasks: ['Watch reference video']
        },
        {
          day: 2,
          subject: 'Database Systems',
          topic: 'SQL Normalization (1NF, 2NF, 3NF)',
          duration: 3,
          tasks: ['Read chapter 4 notes', 'Practice relational schema layout'],
          completedTasks: []
        },
        {
          day: 3,
          subject: 'Web Programming',
          topic: 'React Hook Lifecycles & State Management',
          duration: 2,
          tasks: ['Build dummy application using useEffect', 'Read state updater rules'],
          completedTasks: []
        }
      ],
      revisionPlan: [
        {
          subject: 'Algorithms',
          topics: ['Divide and Conquer', 'Binary Searches'],
          suggestedDate: new Date(today.getTime() + 86400000 * 3)
        }
      ],
      priorityTopics: [
        { subject: 'Algorithms', topic: 'Recursion Depth Limits', priority: 'High' },
        { subject: 'Database Systems', topic: 'Indexing Efficiency', priority: 'Medium' }
      ]
    });

    // 3. Seed a Sample Saved Note Summary
    await Note.create({
      user: user._id,
      title: 'Neural Networks Basics',
      originalLength: 3200,
      summary: `### Neural Networks Overview
An artificial neural network (ANN) is an information processing paradigm inspired by biological brain models. 

#### Core Layers:
1. **Input Layer**: Receives raw attributes.
2. **Hidden Layers**: Extracts features using weights and activation functions.
3. **Output Layer**: Yields final decision/classification.

#### Activation Functions:
- **Sigmoid**: Compresses output into \`[0, 1]\` scale.
- **ReLU**: Replaces negative gradients with zero (\`f(x) = max(0, x)\`).`,
      keyPoints: [
        'Hidden layers automatically discover hierarchical representation structures.',
        'Backpropagation uses gradient descent to optimize layer weights.',
        'ReLU activation function helps mitigate the vanishing gradient problem.'
      ],
      flashcards: [
        {
          question: 'What is the purpose of an activation function in NN?',
          answer: 'To introduce non-linearities into the network, enabling it to learn complex mapping boundaries.'
        },
        {
          question: 'What does ReLU stand for?',
          answer: 'Rectified Linear Unit.'
        }
      ]
    });

    // 4. Seed a Sample Completed Quiz History
    await Quiz.create({
      user: user._id,
      title: 'Data Structures MCQ Practice',
      difficulty: 'medium',
      score: 4,
      totalQuestions: 5,
      questions: [
        { question: 'Which data structure follows FIFO?', options: ['Queue', 'Stack', 'Tree', 'Graph'], answer: 'Queue' },
        { question: 'What is the search time complexity of a hash table in average case?', options: ['O(1)', 'O(log n)', 'O(n)', 'O(n^2)'], answer: 'O(1)' },
        { question: 'Which of the following is linear?', options: ['Linked List', 'Binary Tree', 'Heap', 'Trie'], answer: 'Linked List' },
        { question: 'In a stack, push operation adds items to:', options: ['Top', 'Bottom', 'Middle', 'Random'], answer: 'Top' },
        { question: 'A binary tree node can have at most how many children?', options: ['2', '1', '3', 'Unlimited'], answer: '2' }
      ],
      userAnswers: ['Queue', 'O(1)', 'Linked List', 'Bottom', '2'] // Got 4 correct, index 3 is wrong
    });

    // Send JWT response
    res.status(201).json({
      success: true,
      message: 'Account registered and demo portfolio seeded successfully',
      token: generateToken(user._id),
      user: {
        _id: user._id,
        username: user.username,
        email: user.email,
        xpPoints: user.xpPoints,
        level: user.level,
        completedSessions: user.completedSessions,
        badges: user.badges,
        dailyAiRequests: user.dailyAiRequests,
        subscriptionType: user.subscriptionType
      }
    });
  } else {
    res.status(400);
    throw new Error('Invalid user details submitted');
  }
});

/**
 * @desc    Authenticate user & retrieve token
 * @route   POST /api/auth/login
 * @access  Public
 */
const loginUser = asyncHandler(async (req, res) => {
  console.log("BODY RECEIVED:", req.body);
  const { emailOrUsername, password } = req.body;

  if (!emailOrUsername || !password) {
    res.status(400);
    throw new Error('Please enter email/username and password');
  }

  // Find user by either email or username matching
  const user = await User.findOne({
    $or: [{ email: emailOrUsername.toLowerCase() }, { username: emailOrUsername }]
  });

  if (user && (await user.matchPassword(password))) {
    res.json({
      success: true,
      message: 'Login successful',
      token: generateToken(user._id),
      user: {
        _id: user._id,
        username: user.username,
        email: user.email,
        xpPoints: user.xpPoints,
        level: user.level,
        completedSessions: user.completedSessions,
        badges: user.badges,
        dailyAiRequests: user.dailyAiRequests,
        subscriptionType: user.subscriptionType
      }
    });
  } else {
    res.status(401);
    throw new Error('Invalid credentials. Check your email/username and password.');
  }
});

/**
 * @desc    Get current user profile details
 * @route   GET /api/auth/profile
 * @access  Private
 */
const getUserProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);

  if (user) {
    res.json({
      success: true,
      user: {
        _id: user._id,
        username: user.username,
        email: user.email,
        xpPoints: user.xpPoints,
        level: user.level,
        completedSessions: user.completedSessions,
        badges: user.badges,
        dailyAiRequests: user.dailyAiRequests,
        subscriptionType: user.subscriptionType
      }
    });
  } else {
    res.status(404);
    throw new Error('User profile database record not found');
  }
});

module.exports = {
  registerUser,
  loginUser,
  getUserProfile
};
