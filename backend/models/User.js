const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: [true, 'Username is required'],
      unique: true,
      trim: true,
      minlength: [3, 'Username must be at least 3 characters long']
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      trim: true,
      lowercase: true,
      match: [
        /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
        'Please enter a valid email address'
      ]
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [6, 'Password must be at least 6 characters long']
    },
    // Gamification & Progress
    xpPoints: {
      type: Number,
      default: 0
    },
    level: {
      type: Number,
      default: 1
    },
    completedSessions: {
      type: Number,
      default: 0
    },
    badges: {
      type: [String],
      default: ['Novice Scholar']
    },
    // AI Usage Control
    dailyAiRequests: {
      type: Number,
      default: 0
    },
    lastRequestReset: {
      type: Date,
      default: Date.now
    },
    subscriptionType: {
      type: String,
      enum: ['free', 'premium'],
      default: 'free'
    }
  },
  {
    timestamps: true
  }
);

// Encrypt password before saving User document
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    return next();
  }

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Compare password helper method
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.model('User', userSchema);
module.exports = User;
