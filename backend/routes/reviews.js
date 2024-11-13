const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator');
const auth = require('../middleware/auth');
const Review = require('../models/Review');
const Book = require('../models/Book');

// @route   POST api/reviews/:bookId
// @desc    Add a review for a book
// @access  Private
router.post('/:bookId', [auth, [
  check('rating', 'Rating is required').isInt({ min: 1, max: 5 }),
  check('comment', 'Comment is required').not().isEmpty()
]], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const book = await Book.findById(req.params.bookId);
    if (!book) {
      return res.status(404).json({ msg: 'Book not found' });
    }

    const newReview = new Review({
      user: req.user.id,
      book: req.params.bookId,
      rating: req.body.rating,
      comment: req.body.comment
    });

    const review = await newReview.save();

    res.json(review);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   GET api/reviews/:bookId
// @desc    Get all reviews for a book
// @access  Public
router.get('/:bookId', async (req, res) => {
  try {
    const reviews = await Review.find({ book: req.params.bookId })
      .populate('user', ['username'])
      .sort({ date: -1 });

    res.json(reviews);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;