const mongoose = require('mongoose');

const quizAttemptSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    quiz: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Quiz',
      required: true
    },
    selectedAnswers: {
      type: [String],
      required: true
    },
    score: {
      type: Number,
      required: true
    },
    weakTopics: {
      type: [String],
      default: []
    },
    submittedAt: {
      type: Date,
      default: Date.now
    }
  },
  {
    timestamps: true
  }
);

const QuizAttempt = mongoose.model('QuizAttempt', quizAttemptSchema);
module.exports = QuizAttempt;
