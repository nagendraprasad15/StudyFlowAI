const ChatSession = require('../models/ChatSession');
const Note = require('../models/Note');
const { getTutorResponse } = require('../services/ai/tutorChatService');
const { retrieveRelevantContext } = require('../services/ai/retrievalService');
const asyncHandler = require('../utils/asyncHandler');

/**
 * @desc    Send a message to AI Tutor, query notes chunks semantically if attached
 * @route   POST /api/chat/message
 * @access  Private
 */
const sendMessageToTutor = asyncHandler(async (req, res) => {
  const { message, sessionId, noteId } = req.body;

  if (!message || !message.trim()) {
    res.status(400);
    throw new Error('Please enter a chat message');
  }

  let session = null;
  let activeNoteId = noteId;

  // 1. Fetch or create ChatSession
  if (sessionId) {
    session = await ChatSession.findOne({ _id: sessionId, user: req.user._id });
    if (!session) {
      res.status(404);
      throw new Error('Chat session not found');
    }
    if (session.relatedNote) {
      activeNoteId = session.relatedNote;
    }
  } else {
    // Determine a default title from user message
    const title = message.substring(0, 30).trim() + (message.length > 30 ? '...' : '');
    
    session = new ChatSession({
      user: req.user._id,
      title,
      messages: [],
      relatedNote: noteId || null
    });
  }

  // 2. Perform semantic RAG context extraction if Note context is active
  let contextContext = '';
  if (activeNoteId) {
    const note = await Note.findOne({ _id: activeNoteId, user: req.user._id });
    if (note) {
      contextContext = await retrieveRelevantContext(message, note.originalText, 3);
    }
  }

  // 3. Call AI Service to get explanations
  const tutorReply = await getTutorResponse(message, session.messages, contextContext);

  // 4. Append message blocks to session history
  session.messages.push({
    role: 'user',
    content: message,
    timestamp: new Date()
  });

  session.messages.push({
    role: 'assistant',
    content: tutorReply,
    timestamp: new Date()
  });

  // Save session details
  const savedSession = await session.save();

  res.json({
    success: true,
    response: tutorReply,
    session: savedSession
  });
});

/**
 * @desc    Get message logs history for a specific session
 * @route   GET /api/chat/history/:sessionId
 * @access  Private
 */
const getChatSessionHistory = asyncHandler(async (req, res) => {
  const session = await ChatSession.findOne({
    _id: req.params.sessionId,
    user: req.user._id
  });

  if (!session) {
    res.status(404);
    throw new Error('Chat session logs not found');
  }

  res.json({
    success: true,
    messages: session.messages,
    session
  });
});

/**
 * @desc    Get all chat session logs for the user (for sidebar navigation listing)
 * @route   GET /api/chat/history
 * @access  Private
 */
const getAllChatSessions = asyncHandler(async (req, res) => {
  const sessions = await ChatSession.find({ user: req.user._id })
    .select('_id title relatedNote createdAt updatedAt')
    .sort({ updatedAt: -1 });

  res.json({
    success: true,
    count: sessions.length,
    sessions
  });
});

module.exports = {
  sendMessageToTutor,
  getChatSessionHistory,
  getAllChatSessions
};
