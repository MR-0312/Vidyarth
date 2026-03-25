const mongoose = require('mongoose');

const BookSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  author: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  coverImage: {
    type: String,
    required: true
  },
  eBookFile: {
    type: String,
    required: true
  },
  fileFormat: {
    type: String,
    enum: ['pdf', 'epub'],
    required: true
  },
  categories: [{
    type: String,
    required: true
  }],
  averageRating: {
    type: Number,
    default: 0
  },
  totalRatings: {
    type: Number,
    default: 0
  },
  // Track how many contributions led to this book
  // (useful for giving credit to multiple contributors)
  contributorCount: {
    type: Number,
    default: 1
  },
  // Track the original contributor (user who first submitted this book)
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  },
  date: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Book', BookSchema);