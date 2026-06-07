const express = require('express');
const {
  summarizeNotes,
  getSavedNotes,
  deleteNote
} = require('../controllers/notesController');
const { protect } = require('../middleware/authMiddleware');
const checkAiLimit = require('../middleware/aiLimitMiddleware');
const upload = require('../middleware/uploadMiddleware');

const router = express.Router();

// Apply auth gate on all endpoints
router.use(protect);

// Summarize endpoint (supports single file upload under form-key 'file' and checking AI daily limit)
router.post('/summarize', upload.single('file'), checkAiLimit, summarizeNotes);

// Saved summaries CRUD endpoints
router.get('/', getSavedNotes);
router.delete('/:id', deleteNote);

module.exports = router;
