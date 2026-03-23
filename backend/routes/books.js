const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator');
const auth = require('../middleware/auth');
const upload = require('../middleware/upload');
const Book = require('../models/Book');
const User = require('../models/User');
const LoggingService = require('../services/loggingService');

// @route   GET api/books
// @desc    Get all books with pagination and optional category filter
// @access  Public
router.get('/', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const startIndex = (page - 1) * limit;
    const category = req.query.category;

    let query = {};
    if (category) {
      query.categories = category;
      
      // Log category filter activity if user is authenticated
      if (req.user?.id) {
        try {
          await LoggingService.logActivity(req.user.id, 'FILTER_CATEGORY', {
            category,
            ipAddress: req.headers['x-forwarded-for']?.split(',')[0] || req.connection.remoteAddress,
            userAgent: req.headers['user-agent'],
          });
        } catch (logErr) {
          console.error('Error logging category filter:', logErr);
        }
      }
    }

    const total = await Book.countDocuments(query);
    const books = await Book.find(query)
      .sort({ date: -1 })
      .limit(limit)
      .skip(startIndex);

    res.json({
      books,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      totalBooks: total
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   POST api/books
// @desc    Add a new book
// @access  Private
router.post('/', [auth, upload.fields([
  { name: 'cover', maxCount: 1 },
  { name: 'ebook', maxCount: 1 }
])], [
  check('title', 'Title is required').not().isEmpty(),
  check('author', 'Author is required').not().isEmpty(),
  check('description', 'Description is required').not().isEmpty(),
  check('categories', 'At least one category is required').isArray({ min: 1 }),
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { title, author, description, categories } = req.body;

  try {
    const newBook = new Book({
      title,
      author,
      description,
      categories,
      coverImage: req.files['cover'][0].path,
      eBookFile: req.files['ebook'][0].path
    });

    const book = await newBook.save();
    res.json(book);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   GET api/books/:id
// @desc    Get book by ID
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const book = await Book.findById(req.params.id);
    
    if (!book) {
      return res.status(404).json({ msg: 'Book not found' });
    }

    // Log VIEW_BOOK activity if user is authenticated
    if (req.user?.id) {
      try {
        await LoggingService.logActivity(req.user.id, 'VIEW_BOOK', {
          bookId: book._id,
          ipAddress: req.headers['x-forwarded-for']?.split(',')[0] || req.connection.remoteAddress,
          userAgent: req.headers['user-agent'],
        });
      } catch (logErr) {
        console.error('Error logging book view:', logErr);
      }
    }

    res.json(book);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Book not found' });
    }
    res.status(500).send('Server Error');
  }
});

// @route   PUT api/books/:id
// @desc    Update a book
// @access  Private
router.put('/:id', [auth, upload.fields([
  { name: 'cover', maxCount: 1 },
  { name: 'ebook', maxCount: 1 }
])], [
  check('title', 'Title is required').not().isEmpty(),
  check('author', 'Author is required').not().isEmpty(),
  check('description', 'Description is required').not().isEmpty(),
  check('categories', 'At least one category is required').isArray({ min: 1 }),
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { title, author, description, categories } = req.body;

  try {
    let book = await Book.findById(req.params.id);

    if (!book) {
      return res.status(404).json({ msg: 'Book not found' });
    }

    book.title = title;
    book.author = author;
    book.description = description;
    book.categories = categories;

    if (req.files['cover']) {
      book.coverImage = req.files['cover'][0].path;
    }
    if (req.files['ebook']) {
      book.eBookFile = req.files['ebook'][0].path;
    }

    await book.save();

    res.json(book);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   DELETE api/books/:id
// @desc    Delete a book
// @access  Private
router.delete('/:id', auth, async (req, res) => {
  try {
    const book = await Book.findById(req.params.id);

    if (!book) {
      return res.status(404).json({ msg: 'Book not found' });
    }

    await book.remove();

    res.json({ msg: 'Book removed' });
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Book not found' });
    }
    res.status(500).send('Server Error');
  }
});

// @route   GET api/books/search
// @desc    Search for books
// @access  Public
router.get('/search', async (req, res) => {
  try {
    const { query, page = 1, limit = 10, category } = req.query;
    const startIndex = (page - 1) * limit;

    let searchQuery = {
      $or: [
        { title: { $regex: query, $options: 'i' } },
        { author: { $regex: query, $options: 'i' } },
        { description: { $regex: query, $options: 'i' } }
      ]
    };

    if (category) {
      searchQuery.categories = category;
    }

    // Log SEARCH activity if user is authenticated
    if (req.user?.id && query) {
      try {
        await LoggingService.logActivity(req.user.id, 'SEARCH', {
          searchQuery: query,
          category,
          ipAddress: req.headers['x-forwarded-for']?.split(',')[0] || req.connection.remoteAddress,
          userAgent: req.headers['user-agent'],
        });
      } catch (logErr) {
        console.error('Error logging search:', logErr);
      }
    }

    const total = await Book.countDocuments(searchQuery);

    const books = await Book.find(searchQuery)
      .sort({ date: -1 })
      .limit(parseInt(limit))
      .skip(startIndex);

    res.json({
      books,
      currentPage: parseInt(page),
      totalPages: Math.ceil(total / limit),
      totalBooks: total
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   GET api/books/recommend
// @desc    Get book recommendations based on user preferences
// @access  Private
router.get('/recommend', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    
    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }

    const recommendedBooks = await Book.find({
      categories: { $in: user.preferredCategories }
    })
    .sort({ averageRating: -1 })
    .limit(10);

    res.json(recommendedBooks);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;