const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator');
const upload = require('../middleware/upload');
const Contribution = require('../models/Contribution');
const Book = require('../models/Book');
const LoggingService = require('../services/loggingService');

// Helper: derive file format from uploaded ebook path
function getFileFormat(filePath) {
  const lower = filePath.toLowerCase();
  if (lower.endsWith('.pdf')) return 'pdf';
  if (lower.endsWith('.epub')) return 'epub';
  return null;
}

// @route   POST api/contributions
// @desc    Submit a file contribution (anonymous)
// @access  Public
router.post(
  '/',
  upload.fields([
    { name: 'cover', maxCount: 1 },
    { name: 'ebook', maxCount: 1 }
  ]),
  [
    check('title', 'Title is required').not().isEmpty(),
    check('author', 'Author is required').not().isEmpty(),
    check('description', 'Description is required').not().isEmpty(),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      // Verify files were uploaded
      if (!req.files || !req.files.cover || !req.files.ebook) {
        return res.status(400).json({ error: 'Both cover image and ebook file are required' });
      }

      const { title, author, description, categories } = req.body;

      // Validate categories
      if (!categories || (Array.isArray(categories) && categories.length === 0) || (!Array.isArray(categories) && !categories)) {
        return res.status(400).json({ error: 'At least one category is required' });
      }

      // Determine file format from the uploaded ebook
      const ebookPath = req.files.ebook[0].path;
      const fileFormat = getFileFormat(ebookPath);
      if (!fileFormat) {
        return res.status(400).json({ error: 'Unsupported ebook file format. Only PDF and EPUB are allowed.' });
      }

      // Step 1: Check if a book with this title and author already exists
      let existingBook = await Book.findOne({ 
        title: title.trim(),
        author: author.trim()
      });

      let book;

      if (existingBook) {
        // Book already exists - reuse existing book
        book = existingBook;
      } else {
        // Step 2: Create new book in Books collection
        const newBook = new Book({
          title,
          author,
          description,
          categories: Array.isArray(categories) ? categories : [categories],
          coverImage: req.files.cover[0].path,
          eBookFile: ebookPath,
          fileFormat,
          status: 'pending'
        });

        book = await newBook.save();
      }

      // Step 3: Create contribution record linking to the book
      const newContribution = new Contribution({
        bookId: book._id,
        userId: null
      });

      const contribution = await newContribution.save();

      // Step 4: Populate book data for response
      await contribution.populate('bookId');

      // Log CONTRIBUTE activity (anonymous user)
      try {
        await LoggingService.logActivity('anonymous', 'CONTRIBUTE', {
          metadata: {
            title: book.title,
            author: book.author,
            bookId: book._id,
            contributionId: contribution._id
          }
        });
      } catch (logErr) {
        console.error('Error logging contribution:', logErr);
      }

      res.json({
        message: 'Thank you for your contribution!',
        contribution: {
          id: contribution._id,
          bookId: book._id,
          title: book.title,
          author: book.author
        }
      });
    } catch (err) {
      console.error('Contribution error:', err);
      res.status(500).json({ error: 'Server Error: ' + err.message });
    }
  }
);

// @route   GET api/contributions
// @desc    Get all contributions with book details
// @access  Public
router.get('/', async (req, res) => {
  try {
    const contributions = await Contribution.find()
      .populate('bookId')
      .sort({ date: -1 });
    res.json(contributions);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Server Error' });
  }
});

// @route   GET api/contributions/count
// @desc    Get total contributions count
// @access  Public
router.get('/count', async (req, res) => {
  try {
    const count = await Contribution.countDocuments();
    res.json({ totalContributions: count });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Server Error' });
  }
});

module.exports = router;
