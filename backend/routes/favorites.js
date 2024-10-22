const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const User = require('../models/User');
const Book = require('../models/Book');

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
    res.json(user.favorites);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;