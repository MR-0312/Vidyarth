const mongoose = require('mongoose');

const userActivitySchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
      index: true,
    },
    activityType: {
      type: String,
      enum: [
        'LOGIN',
        'LOGOUT',
        'VIEW_BOOK',
        'READ_BOOK',
        'ADD_FAVORITE',
        'REMOVE_FAVORITE',
        'RATE_BOOK',
        'WRITE_REVIEW',
        'SEARCH',
        'FILTER_CATEGORY',
        'UPDATE_PROFILE',
        'DOWNLOAD_BOOK',
        'CONTRIBUTE',
      ],
      required: true,
      index: true,
    },
    bookId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Book',
      index: true,
    },
    sessionId: {
      type: String,
      index: true,
    },
    ipAddress: String,
    userAgent: String,
    location: {
      country: String,
      city: String,
      coordinates: {
        latitude: Number,
        longitude: Number,
      },
    },
    deviceType: {
      type: String,
      enum: ['WEB', 'MOBILE', 'TABLET'],
      default: 'WEB',
    },
    metadata: {
      searchQuery: String,
      category: String,
      rating: Number,
      reviewContent: String,
      duration: Number, // in seconds
      readingProgress: Number, // percentage
    },
    timestamp: {
      type: Date,
      default: Date.now,
      index: true,
    },
  },
  { timestamps: true }
);

// TTL index - auto-delete after 90 days
userActivitySchema.index({ createdAt: 1 }, { expireAfterSeconds: 7776000 });

// Compound indexes for common queries
userActivitySchema.index({ userId: 1, timestamp: -1 });
userActivitySchema.index({ activityType: 1, timestamp: -1 });
userActivitySchema.index({ sessionId: 1, timestamp: -1 });

module.exports = mongoose.model('UserActivity', userActivitySchema);
