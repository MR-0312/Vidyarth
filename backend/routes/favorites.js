const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { BookQueries, FavoriteQueries } = require('../db/queries');
const LoggingService = require('../services/loggingService');

// @route   POST api/favorites/:bookId
// @desc    Add a book to user's favorites
// @access  Private
router.post('/:bookId', auth, async (req, res) => {
  try {
    const book = await BookQueries.findById(req.params.bookId);
    if (!book) {
      return res.status(404).json({ msg: 'Book not found' });
    }

    // Check if already favorited
    const isFav = await FavoriteQueries.isFavorited(req.user.id, req.params.bookId);
    if (isFav) {
      return res.status(400).json({ msg: 'Book already in favorites' });
    }

    await FavoriteQueries.add(req.user.id, req.params.bookId);

    // Log ADD_FAVORITE activity
    try {
      await LoggingService.logActivity(req.user.id, 'ADD_FAVORITE', {
        bookId: req.params.bookId,
        ipAddress: req.headers['x-forwarded-for']?.split(',')[0] || req.connection.remoteAddress,
        userAgent: req.headers['user-agent'],
      });
    } catch (logErr) {
      console.error('Error logging add favorite:', logErr);
    }

    const favorites = await FavoriteQueries.getByUserId(req.user.id);
    res.json(favorites);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: 'Server Error' });
  }
});

// @route   DELETE api/favorites/:bookId
// @desc    Remove a book from user's favorites
// @access  Private
router.delete('/:bookId', auth, async (req, res) => {
  try {
    await FavoriteQueries.remove(req.user.id, req.params.bookId);

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

    const favorites = await FavoriteQueries.getByUserId(req.user.id);
    res.json(favorites);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: 'Server Error' });
  }
});

// @route   GET api/favorites
// @desc    Get user's favorite books
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    const favorites = await FavoriteQueries.getByUserId(req.user.id);
    
    // Log GET_FAVORITES activity
    try {
      await LoggingService.logActivity(req.user.id, 'GET_FAVORITES', {
        ipAddress: req.headers['x-forwarded-for']?.split(',')[0] || req.connection.remoteAddress,
        userAgent: req.headers['user-agent'],
      });
    } catch (logErr) {
      console.error('Error logging get favorites:', logErr);
    }
    
    res.json(favorites);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: 'Server Error' });
  }
});

module.exports = router;