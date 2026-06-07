const mongoose = require('mongoose');

const statsSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    // Truncated date to YYYY-MM-DD at 00:00:00 for indexing simplicity
    date: {
      type: Date,
      required: true
    },
    studyMinutes: {
      type: Number,
      default: 0
    },
    focusMinutes: {
      type: Number,
      default: 0
    },
    quizzesTaken: {
      type: Number,
      default: 0
    },
    averageQuizScore: {
      type: Number,
      default: 0
    }
  },
  {
    timestamps: true
  }
);

// Compound index to quickly fetch/update user stats per individual calendar date
statsSchema.index({ user: 1, date: 1 }, { unique: true });

const Stats = mongoose.model('Stats', statsSchema);
module.exports = Stats;
