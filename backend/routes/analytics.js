const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const LoggingService = require('../services/loggingService');

/**
 * GET /api/analytics/dashboard
 * Get complete analytics dashboard summary
 */
router.get('/dashboard', auth(), async (req, res) => {
  try {
    const days = parseInt(req.query.days) || 30;

    const [activities, engagement, readingBehavior, searchPatterns] =
      await Promise.all([
        LoggingService.getUserActivities(req.user.id, 1, 50),
        LoggingService.getEngagementScore(req.user.id, days),
        LoggingService.getReadingBehavior(req.user.id, days),
        LoggingService.getSearchPatterns(req.user.id, 10, days),
      ]);

    res.json({
      success: true,
      data: {
        summary: {
          totalActivities: engagement.totalActivities,
          activeLoginDays: engagement.activeLoginDays,
          engagementScore: engagement.engagementScore,
          interactionCount: engagement.interactionCount,
        },
        recentActivities: activities.activities.slice(0, 10),
        readingBehavior,
        searchPatterns,
        period: { days, startDate: engagement.period.startDate },
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * GET /api/analytics/activities
 * Get paginated user activities
 */
router.get('/activities', auth(), async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const types = req.query.types ? req.query.types.split(',') : null;

    const result = await LoggingService.getUserActivities(
      req.user.id,
      page,
      limit,
      types
    );

    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * GET /api/analytics/reading-behavior
 * Get reading analytics and statistics
 */
router.get('/reading-behavior', auth(), async (req, res) => {
  try {
    const days = parseInt(req.query.days) || 30;

    const result = await LoggingService.getReadingBehavior(req.user.id, days);

    res.json({
      success: true,
      data: {
        readingBehavior: result,
        period: { days },
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * GET /api/analytics/engagement
 * Get user engagement score and metrics
 */
router.get('/engagement', auth(), async (req, res) => {
  try {
    const days = parseInt(req.query.days) || 30;

    const result = await LoggingService.getEngagementScore(req.user.id, days);

    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * GET /api/analytics/most-viewed-books
 * Get most viewed books platform-wide (or by user)
 */
router.get('/most-viewed-books', auth(), async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    const days = parseInt(req.query.days) || 30;

    const result = await LoggingService.getMostViewedBooks(limit, days);

    res.json({
      success: true,
      data: {
        mostViewedBooks: result,
        period: { days },
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * GET /api/analytics/search-patterns
 * Get user's search patterns and queries
 */
router.get('/search-patterns', auth(), async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 20;
    const days = parseInt(req.query.days) || 30;

    const result = await LoggingService.getSearchPatterns(
      req.user.id,
      limit,
      days
    );

    res.json({
      success: true,
      data: {
        searchPatterns: result,
        period: { days },
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * GET /api/analytics/categories
 * Get popular categories platform-wide
 */
router.get('/categories', auth(), async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    const days = parseInt(req.query.days) || 30;

    const result = await LoggingService.getPopularCategories(limit, days);

    res.json({
      success: true,
      data: {
        popularCategories: result,
        period: { days },
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * GET /api/analytics/activity-frequency
 * Get activity frequency timeline
 */
router.get('/activity-frequency', auth(), async (req, res) => {
  try {
    const days = parseInt(req.query.days) || 7;

    const result = await LoggingService.getActivityFrequency(req.user.id, days);

    res.json({
      success: true,
      data: {
        activityFrequency: result,
        period: { days },
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * GET /api/analytics/session/:sessionId
 * Get all activities in a specific session
 */
router.get('/session/:sessionId', auth(), async (req, res) => {
  try {
    const UserActivity = require('../models/UserActivity');

    const activities = await UserActivity.find({
      userId: req.user.id,
      sessionId: req.params.sessionId,
    }).sort({ timestamp: -1 });

    res.json({
      success: true,
      data: {
        sessionId: req.params.sessionId,
        activities,
        count: activities.length,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;
