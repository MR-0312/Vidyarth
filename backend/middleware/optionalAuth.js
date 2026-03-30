const jwt = require('jsonwebtoken');
const tokenBlacklist = require('../services/tokenBlacklist');

/**
 * Optional authentication middleware
 * Processes the token if present, but doesn't fail if missing
 * Useful for public endpoints that can optionally track authenticated users
 */
module.exports = function(req, res, next) {
  // Get token from header
  const token = req.header('x-auth-token');

  // If no token, continue without authentication
  if (!token) {
    return next();
  }

  // Check if token is blacklisted (revoked)
  if (tokenBlacklist.isBlacklisted(token)) {
    // Treat blacklisted token as if no token was provided
    console.warn('Blacklisted token attempted to be used');
    return next();
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded.user;
    next();
  } catch (err) {
    // Token is invalid, but continue anyway (optional auth)
    console.warn('Invalid token provided:', err.message);
    next();
  }
};
