const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  role: {
    type: String,
    enum: ['user', 'assistant'],
    required: true
  },
  content: {
    type: String,
    required: true
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
});

const chatSessionSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    title: {
      type: String,
      required: true,
      default: 'New Chat Session'
    },
    messages: {
      type: [messageSchema],
      default: []
    },
    relatedNote: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Note',
      default: null
    }
  },
  {
    timestamps: true
  }
);

const ChatSession = mongoose.model('ChatSession', chatSessionSchema);
module.exports = ChatSession;
