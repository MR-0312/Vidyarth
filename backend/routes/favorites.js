const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const User = require('../models/User');
const Book = require('../models/Book');
const LoggingService = require('../services/loggingService');

// @route   POST api/favorites/:bookId
// @desc    Add a book to user's favorites
// @access  Private
router.post('/:bookId', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    const book = await Book.findById(req.params.bookId);

    if (!book) {
      return res.status(404).json({ msg: 'Book not found' });
    }

    if (user.favorites.includes(book._id)) {
      return res.status(400).json({ msg: 'Book already in favorites' });
    }

    user.favorites.push(book._id);
    await user.save();

    // Log ADD_FAVORITE activity
    try {
      await LoggingService.logActivity(req.user.id, 'ADD_FAVORITE', {
        bookId: book._id,
        ipAddress: req.headers['x-forwarded-for']?.split(',')[0] || req.connection.remoteAddress,
        userAgent: req.headers['user-agent'],
      });
    } catch (logErr) {
      console.error('Error logging add favorite:', logErr);
    }

    res.json(user.favorites);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   DELETE api/favorites/:bookId
// @desc    Remove a book from user's favorites
// @access  Private
router.delete('/:bookId', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    user.favorites = user.favorites.filter(
      (bookId) => bookId.toString() !== req.params.bookId
    );

    await user.save();

    // Log REMOVE_FAVORITE activity
    try {
      await LoggingService.logActivity(req.user.id, 'REMOVE_FAVORITE', {
        bookId: req.params.bookId,
        ipAddress: req.headers['x-forwarded-for']?.split(',')[0] || req.connection.remoteAddress,
        userAgent: req.headers['user-agent'],
      });
    } catch (logErr) {
      console.error('Error logging remove favorite:', logErr);
    }

    res.json(user.favorites);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   GET api/favorites
// @desc    Get user's favorite books
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).populate('favorites');
    
    // Log GET_FAVORITES activity
    try {
      await LoggingService.logActivity(req.user.id, 'GET_FAVORITES', {
        ipAddress: req.headers['x-forwarded-for']?.split(',')[0] || req.connection.remoteAddress,
        userAgent: req.headers['user-agent'],
      });
    } catch (logErr) {
      console.error('Error logging get favorites:', logErr);
    }
    
    res.json(user.favorites);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;