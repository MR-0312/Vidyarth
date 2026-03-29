const { ActivityQueries } = require('../db/queries');

class LoggingService {
  /**
   * Log a user activity
   */
  static async logActivity(userId, activityType, data = {}) {
    try {
      const metadata = {
        sessionId: data.sessionId,
        ipAddress: data.ipAddress,
        userAgent: data.userAgent,
        location: data.location,
        deviceType: data.deviceType || 'WEB',
        bookId: data.bookId,
        searchQuery: data.searchQuery,
        category: data.category,
        rating: data.rating,
        reviewContent: data.reviewContent,
        duration: data.duration,
        readingProgress: data.readingProgress,
      };

      const activity = await ActivityQueries.log(userId, activityType, metadata);
      return activity;
    } catch (error) {
      console.error('Error logging activity:', error);
      throw error;
    }
  }

  /**
   * Get user activities
   */
  static async getUserActivities(userId, limit = 50) {
    try {
      const activities = await ActivityQueries.getByUserId(userId, limit);
      return activities;
    } catch (error) {
      console.error('Error fetching user activities:', error);
      throw error;
    }
  }

  /**
   * Get activities by type
   */
  static async getActivitiesByType(activityType, limit = 100) {
    try {
      const activities = await ActivityQueries.getByType(activityType, limit);
      return activities;
    } catch (error) {
      console.error('Error fetching activities by type:', error);
      throw error;
    }
  }
}

module.exports = LoggingService;
