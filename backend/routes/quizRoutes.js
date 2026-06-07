const express = require('express');
const {
  generateQuiz,
  submitQuiz,
  getQuizzes,
  getQuizHistory,
  getQuizById
} = require('../controllers/quizController');
const { protect } = require('../middleware/authMiddleware');
const checkAiLimit = require('../middleware/aiLimitMiddleware');

const router = express.Router();

// Apply auth protection on all quiz endpoints
router.use(protect);

router.post('/generate', checkAiLimit, generateQuiz);
router.post('/submit', submitQuiz);
router.get('/', getQuizzes);
router.get('/history', getQuizHistory);
router.get('/:id', getQuizById);

module.exports = router;
