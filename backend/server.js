const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const dotenv = require('dotenv');

// Load environment variables first
dotenv.config();

const validateEnv = require('./config/validateEnv');
// Execute validation before booting
validateEnv();

const connectDB = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const plannerRoutes = require('./routes/plannerRoutes');
const notesRoutes = require('./routes/notesRoutes');
const quizRoutes = require('./routes/quizRoutes');
const chatRoutes = require('./routes/chatRoutes');
const statsRoutes = require('./routes/statsRoutes');
const focusRoutes = require('./routes/focusRoutes');
const errorHandler = require('./middleware/errorMiddleware');

// Initialize database connection
connectDB();

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Set HTTP security headers
app.use(helmet());

// Log HTTP requests
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined'));
}

// Setup CORS with standard parameters
app.use(
  cors({
    origin: '*', // Allow all origins for initial hackathon prototyping ease
    credentials: true
  })
);

// Body Parsers with comfortable upload payload limit
app.use(express.json({ limit: '20mb' }));
app.use(express.urlencoded({ limit: '20mb', extended: true }));

// Rate limiting to prevent API abuse (150 requests per 15 mins)
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 150,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again after 15 minutes.'
  }
});
app.use('/api', apiLimiter);

const limiter = rateLimit({
   windowMs: 15 * 60 * 1000,
   max: 100,
   message: {
      success: false,
      message: 'Too many requests. Please wait.'
   }
});

app.use('/api', limiter);

// Base route test API
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'StudyFlow AI Backend API is active',
    timestamp: new Date()
  });
});

// Map API Routes
app.use('/api/auth', authRoutes);
app.use('/api/planner', plannerRoutes);
app.use('/api/notes', notesRoutes);
app.use('/api/quiz', quizRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/stats', statsRoutes);
app.use('/api/focus', focusRoutes);

// Fallback handling for undefined routes
app.use('*', (req, res, next) => {
  res.status(404);
  next(new Error(`API Route not found: [${req.method}] ${req.originalUrl}`));
});

// Global Error Handler Middleware (MUST be declared after all other route mappings)
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, () => {
  console.log(
    `🚀 StudyFlow AI Server running in ${
      process.env.NODE_ENV || 'development'
    } mode on port ${PORT}`
  );
});

// Handling unhandled promise rejections gracefully
process.on('unhandledRejection', (err, promise) => {
  console.error(`❌ Unhandled Promise Rejection: ${err.message}`);
  // Close server & exit process
  server.close(() => process.exit(1));
});
