/**
 * Centralized Error Handling Middleware for Express.
 * Catches errors thrown inside routes and formats consistent API error payloads.
 */
const errorHandler = (err, req, res, next) => {
  let statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  let message = err.message;

  // Handle specific Mongoose validation or cast errors
  if (err.name === 'ValidationError') {
    statusCode = 400;
    message = Object.values(err.errors).map((val) => val.message).join(', ');
  } else if (err.name === 'CastError') {
    statusCode = 400;
    message = `Resource not found with id of ${err.value}`;
  } else if (err.code === 11000) {
    statusCode = 400;
    message = 'Duplicate field value entered';
  }

  console.error(`❌ Error Logger: [${req.method}] ${req.url} - Status ${statusCode} - Message: ${message}`);
  if (process.env.NODE_ENV !== 'production' && err.stack) {
    console.error(err.stack);
  }

  res.status(statusCode).json({
    success: false,
    message: message || 'An unexpected server error occurred',
    stack: process.env.NODE_ENV === 'production' ? null : err.stack
  });
};

module.exports = errorHandler;
