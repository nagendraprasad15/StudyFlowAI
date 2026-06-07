const Note = require('../models/Note');
const { summarizeNotesAI } = require('../services/aiService');
const asyncHandler = require('../utils/asyncHandler');
const pdfParse = require('pdf-parse');

/**
 * @desc    Generate AI notes summary & flashcards and save to DB
 * @route   POST /api/notes/summarize
 * @access  Private
 */
const summarizeNotes = asyncHandler(async (req, res) => {
  let originalText = '';
  let summaryType = 'text';
  let filename = '';

  // Check if a file was uploaded
  if (req.file) {
    filename = req.file.originalname;
    
    if (req.file.mimetype === 'application/pdf') {
      try {
        const parsedPdf = await pdfParse(req.file.buffer);
        originalText = parsedPdf.text;
        summaryType = 'pdf';
      } catch (pdfError) {
        res.status(400);
        throw new Error(`Failed to parse PDF document: ${pdfError.message}`);
      }
    } else {
      // Text file
      originalText = req.file.buffer.toString('utf-8');
      summaryType = 'text';
    }
  } else {
    // Paste text mode
    originalText = req.body.originalText;
    summaryType = req.body.summaryType || 'text';
  }

  if (!originalText || !originalText.trim()) {
    res.status(400);
    throw new Error('Please provide text content or upload a document file to summarize');
  }

  // Call Gemini service to compile summary & flashcards
  const aiResult = await summarizeNotesAI(originalText);

  // Set title
  let title = filename ? filename.replace('.pdf', '') : 'Notes Summary';
  if (!filename) {
    const headingMatch = aiResult.summary.match(/#+\s+(.*)/);
    if (headingMatch && headingMatch[1]) {
      title = headingMatch[1].trim();
    } else {
      title = originalText.substring(0, 30).trim() + '...';
    }
  }

  // Save summary to MongoDB
  const note = await Note.create({
    originalText,
    summary: aiResult.summary,
    flashcards: aiResult.flashcards || [],
    summaryType,
    user: req.user._id
  });

  res.status(201).json({
    success: true,
    message: 'Summary generated and saved successfully',
    title,
    note
  });
});

/**
 * @desc    Get all saved notes/summaries for the logged-in user
 * @route   GET /api/notes
 * @access  Private
 */
const getSavedNotes = asyncHandler(async (req, res) => {
  const notes = await Note.find({ user: req.user._id }).sort({ createdAt: -1 });

  res.json({
    success: true,
    count: notes.length,
    notes
  });
});

/**
 * @desc    Delete a saved note summary
 * @route   DELETE /api/notes/:id
 * @access  Private
 */
const deleteNote = asyncHandler(async (req, res) => {
  const note = await Note.findOne({ _id: req.params.id, user: req.user._id });

  if (!note) {
    res.status(404);
    throw new Error('Note summary not found or unauthorized');
  }

  await note.deleteOne();

  res.json({
    success: true,
    message: 'Note summary deleted successfully'
  });
});

module.exports = {
  summarizeNotes,
  getSavedNotes,
  deleteNote
};
