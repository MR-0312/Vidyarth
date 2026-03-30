const jwt = require('jsonwebtoken');
const tokenBlacklist = require('../services/tokenBlacklist');

module.exports = function(req, res, next) {
  // Get token from header
  const token = req.header('x-auth-token');

  // Check if no token
  if (!token) {
    return res.status(401).json({ msg: 'No token, authorization denied' });
  }

  // Check if token is blacklisted (revoked)
  if (tokenBlacklist.isBlacklisted(token)) {
    return res.status(401).json({ msg: 'Token has been revoked. Please login again.' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded.user;
    req.token = token; // Store token for use in logout
    next();
  } catch (err) {
    res.status(401).json({ msg: 'Token is not valid' });
  }
};