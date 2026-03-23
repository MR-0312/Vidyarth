const { v4: uuidv4 } = require('uuid');
const LoggingService = require('../services/loggingService');

/**
 * Activity Logger Middleware
 * Auto-captures HTTP requests and logs them as user activities
 */
const activityLogger = async (req, res, next) => {
  try {
    // Generate or retrieve session ID
    if (!req.session) {
      req.session = {};
    }
    if (!req.session.id) {
      req.session.id = uuidv4();
    }

    // Extract device type from User-Agent
    const userAgent = req.headers['user-agent'] || '';
    let deviceType = 'WEB';
    if (/mobile/i.test(userAgent)) {
      deviceType = 'MOBILE';
    } else if (/tablet|ipad/i.test(userAgent)) {
      deviceType = 'TABLET';
    }

    // Extract IP address
    const ipAddress =
      req.headers['x-forwarded-for']?.split(',')[0] ||
      req.connection.remoteAddress ||
      'unknown';

    // Store in request for route handlers to use
    req.logger = {
      sessionId: req.session.id,
      ipAddress,
      userAgent,
      deviceType,
      userId: req.user?.id || null,
      // Helper method to log activities
      logActivity: async (activityType, metadata = {}) => {
        if (!req.user?.id) return;

        await LoggingService.logActivity(req.user.id, activityType, {
          ...metadata,
          sessionId: req.session.id,
          ipAddress,
          userAgent,
          deviceType,
        });
      },
    };

    next();
  } catch (error) {
    console.error('Error in activity logger middleware:', error);
    next();
  }
};

module.exports = activityLogger;
