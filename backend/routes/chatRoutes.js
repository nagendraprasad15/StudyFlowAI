const express = require('express');
const {
  sendMessageToTutor,
  getChatSessionHistory,
  getAllChatSessions
} = require('../controllers/chatController');
const { protect } = require('../middleware/authMiddleware');
const checkAiLimit = require('../middleware/aiLimitMiddleware');

const router = express.Router();

// Apply auth protection on all chat endpoints
router.use(protect);

router.post('/message', checkAiLimit, sendMessageToTutor);
router.get('/history', getAllChatSessions);
router.get('/history/:sessionId', getChatSessionHistory);

module.exports = router;
