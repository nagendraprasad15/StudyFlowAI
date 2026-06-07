const jwt = require('jsonwebtoken');
const User = require('../models/User');
const asyncHandler = require('../utils/asyncHandler');

/**
 * Middleware to verify JWT authentication token in Request Headers.
 * Attaches logged-in User document to req.user object.
 */
const protect = asyncHandler(async (req, res, next) => {
  let token;

  // Retrieve token from Authorization header (Bearer token)
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      token = req.headers.authorization.split(' ')[1];

      // Decode token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Find user in DB (exclude hashed password from object)
      req.user = await User.findById(decoded.id).select('-password');
      
      if (!req.user) {
        res.status(401);
        throw new Error('Authorized user not found in database');
      }

      return next();
    } catch (error) {
      console.error('❌ JWT Verification Error:', error.message);
      res.status(401);
      throw new Error('Access denied. Invalid or expired token');
    }
  }

  if (!token) {
    res.status(401);
    throw new Error('Access denied. No authentication token provided');
  }
});

module.exports = { protect };
