const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
  question: {
    type: String,
    required: true
  },
  options: {
    type: [String],
    required: true
  },
  correctAnswer: {
    type: String,
    required: true
  },
  explanation: {
    type: String,
    default: ''
  },
  type: {
    type: String,
    enum: ['MCQ', 'TRUE_FALSE', 'SHORT'],
    default: 'MCQ'
  }
});

const quizSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    title: {
      type: String,
      required: true
    },
    topic: {
      type: String,
      required: true
    },
    difficulty: {
      type: String,
      enum: ['easy', 'medium', 'hard'],
      required: true
    },
    questions: {
      type: [questionSchema],
      required: true
    },
    score: {
      type: Number,
      default: 0
    },
    totalQuestions: {
      type: Number,
      required: true
    },
    completed: {
      type: Boolean,
      default: false
    }
  },
  {
    timestamps: true
  }
);

const Quiz = mongoose.model('Quiz', quizSchema);
module.exports = Quiz;
