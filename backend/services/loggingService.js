const UserActivity = require('../models/UserActivity');

class LoggingService {
  /**
   * Log a user activity
   */
  static async logActivity(userId, activityType, data = {}) {
    try {
      const activity = new UserActivity({
        userId,
        activityType,
        bookId: data.bookId,
        sessionId: data.sessionId,
        ipAddress: data.ipAddress,
        userAgent: data.userAgent,
        location: data.location,
        deviceType: data.deviceType || 'WEB',
        metadata: {
          searchQuery: data.searchQuery,
          category: data.category,
          rating: data.rating,
          reviewContent: data.reviewContent,
          duration: data.duration,
          readingProgress: data.readingProgress,
        },
      });

      await activity.save();
      return activity;
    } catch (error) {
      console.error('Error logging activity:', error);
      throw error;
    }
  }

  /**
   * Get user activities with pagination
   */
  static async getUserActivities(userId, page = 1, limit = 50, activityTypes = null) {
    try {
      const skip = (page - 1) * limit;
      const query = { userId };

      if (activityTypes && activityTypes.length > 0) {
        query.activityType = { $in: activityTypes };
      }

      const activities = await UserActivity.find(query)
        .sort({ timestamp: -1 })
        .skip(skip)
        .limit(limit)
        .lean();

      const total = await UserActivity.countDocuments(query);

      return {
        activities,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
      };
    } catch (error) {
      console.error('Error fetching user activities:', error);
      throw error;
    }
  }

  /**
   * Get activities by type
   */
  static async getActivitiesByType(userId, activityType, limit = 100) {
    try {
      const activities = await UserActivity.find({
        userId,
        activityType,
      })
        .sort({ timestamp: -1 })
        .limit(limit)
        .lean();

      return activities;
    } catch (error) {
      console.error('Error fetching activities by type:', error);
      throw error;
    }
  }

  /**
   * Get activity frequency (grouped by day)
   */
  static async getActivityFrequency(userId, days = 7) {
    try {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      const result = await UserActivity.aggregate([
        {
          $match: {
            userId: require('mongoose').Types.ObjectId(userId),
            timestamp: { $gte: startDate },
          },
        },
        {
          $group: {
            _id: {
              $dateToString: { format: '%Y-%m-%d', date: '$timestamp' },
            },
            count: { $sum: 1 },
          },
        },
        {
          $sort: { _id: 1 },
        },
      ]);

      return result;
    } catch (error) {
      console.error('Error calculating activity frequency:', error);
      throw error;
    }
  }

  /**
   * Get most viewed books
   */
  static async getMostViewedBooks(limit = 10, days = 30) {
    try {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      const result = await UserActivity.aggregate([
        {
          $match: {
            activityType: 'VIEW_BOOK',
            bookId: { $exists: true },
            timestamp: { $gte: startDate },
          },
        },
        {
          $group: {
            _id: '$bookId',
            viewCount: { $sum: 1 },
            uniqueUsers: { $addToSet: '$userId' },
          },
        },
        {
          $sort: { viewCount: -1 },
        },
        {
          $limit: limit,
        },
        {
          $lookup: {
            from: 'books',
            localField: '_id',
            foreignField: '_id',
            as: 'bookDetails',
          },
        },
      ]);

      return result;
    } catch (error) {
      console.error('Error fetching most viewed books:', error);
      throw error;
    }
  }

  /**
   * Get reading behavior analytics
   */
  static async getReadingBehavior(userId, days = 30) {
    try {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      const result = await UserActivity.aggregate([
        {
          $match: {
            userId: require('mongoose').Types.ObjectId(userId),
            activityType: { $in: ['READ_BOOK', 'VIEW_BOOK'] },
            timestamp: { $gte: startDate },
          },
        },
        {
          $group: {
            _id: '$activityType',
            count: { $sum: 1 },
            totalDuration: { $sum: '$metadata.duration' },
            avgDuration: { $avg: '$metadata.duration' },
            uniqueBooks: { $addToSet: '$bookId' },
          },
        },
      ]);

      return result;
    } catch (error) {
      console.error('Error fetching reading behavior:', error);
      throw error;
    }
  }

  /**
   * Get search patterns
   */
  static async getSearchPatterns(userId, limit = 20, days = 30) {
    try {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      const result = await UserActivity.aggregate([
        {
          $match: {
            userId: require('mongoose').Types.ObjectId(userId),
            activityType: 'SEARCH',
            'metadata.searchQuery': { $exists: true },
            timestamp: { $gte: startDate },
          },
        },
        {
          $group: {
            _id: '$metadata.searchQuery',
            count: { $sum: 1 },
            lastSearched: { $max: '$timestamp' },
          },
        },
        {
          $sort: { count: -1 },
        },
        {
          $limit: limit,
        },
      ]);

      return result;
    } catch (error) {
      console.error('Error fetching search patterns:', error);
      throw error;
    }
  }

  /**
   * Calculate engagement score for a user
   */
  static async getEngagementScore(userId, days = 30) {
    try {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      const activities = await UserActivity.find({
        userId,
        timestamp: { $gte: startDate },
      });

      const loginDays = new Set(
        activities
          .filter((a) => a.activityType === 'LOGIN')
          .map((a) => a.timestamp.toISOString().split('T')[0])
      ).size;

      const interactionActivities = [
        'ADD_FAVORITE',
        'WRITE_REVIEW',
        'RATE_BOOK',
      ];
      const interactionCount = activities.filter((a) =>
        interactionActivities.includes(a.activityType)
      ).length;

      const totalActivities = activities.length;

      // Engagement score formula: (total * 2 + loginDays * 5 + interactions * 10) / 5
      const engagementScore = Math.min(
        100,
        (totalActivities * 2 + loginDays * 5 + interactionCount * 10) / 5
      );

      return {
        engagementScore: Math.round(engagementScore),
        totalActivities,
        activeLoginDays: loginDays,
        interactionCount,
        period: { days, startDate },
      };
    } catch (error) {
      console.error('Error calculating engagement score:', error);
      throw error;
    }
  }

  /**
   * Get popular categories
   */
  static async getPopularCategories(limit = 10, days = 30) {
    try {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      const result = await UserActivity.aggregate([
        {
          $match: {
            'metadata.category': { $exists: true },
            timestamp: { $gte: startDate },
          },
        },
        {
          $group: {
            _id: '$metadata.category',
            count: { $sum: 1 },
            uniqueUsers: { $addToSet: '$userId' },
          },
        },
        {
          $sort: { count: -1 },
        },
        {
          $limit: limit,
        },
      ]);

      return result;
    } catch (error) {
      console.error('Error fetching popular categories:', error);
      throw error;
    }
  }
}

module.exports = LoggingService;
