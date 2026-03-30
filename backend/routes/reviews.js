const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator');
const auth = require('../middleware/auth');
const { ReviewQueries, BookQueries } = require('../db/queries');
const LoggingService = require('../services/loggingService');

// @route   POST api/reviews/:bookId
// @desc    Add a review for a book
// @access  Private
router.post('/:bookId', [auth(), [
  check('rating', 'Rating is required').isInt({ min: 1, max: 5 }),
  check('comment', 'Comment is required').not().isEmpty()
]], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const book = await BookQueries.findById(req.params.bookId);
    if (!book) {
      return res.status(404).json({ msg: 'Book not found' });
    }

    // Check if user already reviewed this book
    const existingReview = await ReviewQueries.findOne(req.user.id, req.params.bookId);
    if (existingReview) {
      return res.status(400).json({ msg: 'You have already reviewed this book' });
    }

    const review = await ReviewQueries.create({
      user_id: req.user.id,
      book_id: req.params.bookId,
      rating: req.body.rating,
      comment: req.body.comment
    });

    // Log WRITE_REVIEW and RATE_BOOK activities
    try {
      await Promise.all([
        LoggingService.logActivity(req.user.id, 'WRITE_REVIEW', {
          bookId: req.params.bookId,
          reviewContent: req.body.comment,
          ipAddress: req.headers['x-forwarded-for']?.split(',')[0] || req.connection.remoteAddress,
          userAgent: req.headers['user-agent'],
        }),
        LoggingService.logActivity(req.user.id, 'RATE_BOOK', {
          bookId: req.params.bookId,
          rating: req.body.rating,
          ipAddress: req.headers['x-forwarded-for']?.split(',')[0] || req.connection.remoteAddress,
          userAgent: req.headers['user-agent'],
        })
      ]);
    } catch (logErr) {
      console.error('Error logging review:', logErr);
    }

    res.json(review);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: 'Server Error' });
  }
});

// @route   GET api/reviews/:bookId
// @desc    Get all reviews for a book
// @access  Public
router.get('/:bookId', async (req, res) => {
  try {
    const reviews = await ReviewQueries.getByBookId(req.params.bookId);

    // Log VIEW_REVIEWS activity if user is authenticated
    if (req.user?.id) {
      try {
        await LoggingService.logActivity(req.user.id, 'VIEW_REVIEWS', {
          bookId: req.params.bookId,
          ipAddress: req.headers['x-forwarded-for']?.split(',')[0] || req.connection.remoteAddress,
          userAgent: req.headers['user-agent'],
        });
      } catch (logErr) {
        console.error('Error logging view reviews:', logErr);
      }
    }

    res.json(reviews);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: 'Server Error' });
  }
});

module.exports = router;