const mongoose = require('mongoose');

const ContributionSchema = new mongoose.Schema({
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
  categories: [{
    type: String,
    required: true
  }],
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
  // Anonymous tracking - only count, no user information
  contributionCount: {
    type: Number,
    default: 1
  },
  // Status: pending (awaiting admin approval), approved, rejected
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

module.exports = mongoose.model('Contribution', ContributionSchema);
