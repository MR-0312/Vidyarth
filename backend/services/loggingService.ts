import { ActivityQueries } from '../db/queries';

interface ActivityMetadata {
  sessionId?: string;
  ipAddress?: string;
  userAgent?: string;
  location?: string;
  deviceType?: string;
  bookId?: string;
  searchQuery?: string;
  category?: string;
  rating?: number;
  reviewContent?: string;
  duration?: number;
  readingProgress?: number;
}

class LoggingService {
  /**
   * Log a user activity
   */
  static async logActivity(userId: string, activityType: string, data: ActivityMetadata = {}): Promise<any> {
    try {
      const metadata: ActivityMetadata = {
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
  static async getUserActivities(userId: string, limit: number = 50): Promise<any[]> {
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
  static async getActivitiesByType(activityType: string, limit: number = 100): Promise<any[]> {
    try {
      const activities = await ActivityQueries.getByType(activityType, limit);
      return activities;
    } catch (error) {
      console.error('Error fetching activities by type:', error);
      throw error;
    }
  }
}

export default LoggingService;
