const mongoose = require('mongoose');

const studyPlanSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    subjects: {
      type: [String],
      required: true
    },
    examDate: {
      type: Date,
      required: true
    },
    dailyHours: {
      type: Number,
      required: true,
      min: 1,
      max: 24
    },
    // Array of schedule days containing: { day, subject, topic, duration, tasks, completedTasks }
    schedule: {
      type: Array,
      default: []
    },
    // Array of revision recommendations
    revisionPlan: {
      type: Array,
      default: []
    },
    // Priority lists of critical subjects / modules
    priorityTopics: {
      type: Array,
      default: []
    },
    isActive: {
      type: Boolean,
      default: true
    }
  },
  {
    timestamps: true
  }
);

const StudyPlan = mongoose.model('StudyPlan', studyPlanSchema);
module.exports = StudyPlan;
