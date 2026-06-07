const mongoose = require('mongoose');

const noteSchema = new mongoose.Schema(
  {
    originalText: {
      type: String,
      required: [true, 'Original source text is required'],
    },
    summary: {
      type: String,
      required: [true, 'AI Summary content is required'],
    },
    flashcards: [
      {
        question: { type: String, required: true },
        answer: { type: String, required: true }
      }
    ],
    summaryType: {
      type: String,
      enum: ['text', 'pdf'],
      default: 'text'
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    }
  },
  {
    timestamps: true
  }
);

const Note = mongoose.model('Note', noteSchema);
module.exports = Note;
