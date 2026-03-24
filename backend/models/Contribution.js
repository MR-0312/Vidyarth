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
  
  // Timestamp of contribution
  date: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Contribution', ContributionSchema);
