const express = require('express');
const { logFocusSession } = require('../controllers/focusController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

// Apply auth protection
router.post('/log-session', protect, logFocusSession);

module.exports = router;
