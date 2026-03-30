const jwt = require('jsonwebtoken');
const tokenBlacklist = require('../services/tokenBlacklist');

/**
 * Authentication middleware (flexible)
 * @param {boolean} isRequired - If true, requires valid token; if false, token is optional
 * @returns {function} Express middleware function
 */
module.exports = function(isRequired = true) {
  return function(req, res, next) {
    // Get token from header
    const token = req.header('x-auth-token');

    // Check if no token
    if (!token) {
      if (isRequired) {
        return res.status(401).json({ msg: 'No token, authorization denied' });
      }
      // Optional auth: continue without token
      return next();
    }

    // Check if token is blacklisted (revoked)
    if (tokenBlacklist.isBlacklisted(token)) {
      if (isRequired) {
        return res.status(401).json({ msg: 'Token has been revoked. Please login again.' });
      }
      // Optional auth: treat blacklisted token as no token
      console.warn('Blacklisted token attempted to be used');
      return next();
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = decoded.user;
      req.token = token; // Store token for use in logout
      next();
    } catch (err) {
      if (isRequired) {
        return res.status(401).json({ msg: 'Token is not valid' });
      }
      // Optional auth: invalid token, continue anyway
      console.warn('Invalid token provided:', err.message);
      next();
    }
  };
};