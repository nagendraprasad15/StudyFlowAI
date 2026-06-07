const express = require('express');
const { getDashboardStats } = require('../controllers/statsController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

// Apply auth protection
router.get('/dashboard', protect, getDashboardStats);

module.exports = router;
