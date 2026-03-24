const mongoose = require('mongoose');

const ContributionSchema = new mongoose.Schema({
  // Reference to the Book that was contributed
  bookId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Book',
    required: true
  },
  
  // User who made the contribution (null for anonymous)
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  
  // Type of contribution: 'new' for new book submission, 'duplicate' if book already exists
  contributionType: {
    type: String,
    enum: ['new', 'duplicate'],
    default: 'new'
  },
  
  // IP address and user agent for anonymous tracking
  ipAddress: {
    type: String,
    default: null
  },
  userAgent: {
    type: String,
    default: null
  },
  
  // Status: pending (awaiting admin approval), approved, rejected
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  },
  
  // Admin notes or rejection reason
  adminNotes: {
    type: String,
    default: null
  },
  
  // Timestamp of contribution
  date: {
    type: Date,
    default: Date.now
  },
  
  // When the contribution was approved/rejected (if applicable)
  resolvedAt: {
    type: Date,
    default: null
  }
});

module.exports = mongoose.model('Contribution', ContributionSchema);
