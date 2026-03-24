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

      let contributionType = 'new';
      let book;

      if (existingBook) {
        // Book already exists - this is a duplicate contribution
        contributionType = 'duplicate';
        book = existingBook;
        // Optionally increment contributor count for duplicates
        // existingBook.contributorCount += 1;
        // await existingBook.save();
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
          status: 'pending'  // Book starts as pending until contribution is approved
        });

        book = await newBook.save();
      }

      // Step 3: Create contribution record linking to the book
      const ipAddress = req.headers['x-forwarded-for']?.split(',')[0] || req.connection.remoteAddress;
      const userAgent = req.headers['user-agent'];

      const newContribution = new Contribution({
        bookId: book._id,
        userId: null,  // Anonymous contribution
        contributionType,
        ipAddress,
        userAgent,
        status: 'pending'
      });

      const contribution = await newContribution.save();

      // Step 4: Populate book data for response
      await contribution.populate('bookId');

      // Log CONTRIBUTE activity (anonymous user)
      try {
        await LoggingService.logActivity('anonymous', 'CONTRIBUTE', {
          ipAddress,
          userAgent,
          metadata: {
            title: book.title,
            author: book.author,
            bookId: book._id,
            contributionId: contribution._id,
            contributionType
          }
        });
      } catch (logErr) {
        console.error('Error logging contribution:', logErr);
      }

      res.json({
        message: 'Thank you for your contribution! Our team will review it shortly.',
        contribution: {
          id: contribution._id,
          bookId: book._id,
          title: book.title,
          author: book.author,
          status: contribution.status,
          contributionType
        }
      });
    } catch (err) {
      console.error('Contribution error:', err);
      res.status(500).json({ error: 'Server Error: ' + err.message });
    }
  }
);

// @route   GET api/contributions/count
// @desc    Get total approved books from contributions
// @access  Public
router.get('/count', async (req, res) => {
  try {
    const count = await Contribution.countDocuments({ status: 'approved' });
    res.json({ totalContributions: count });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Server Error' });
  }
});

// @route   GET api/contributions/pending
// @desc    Get all pending contributions with book details (admin view)
// @access  Private (admin only)
router.get('/pending', async (req, res) => {
  try {
    const contributions = await Contribution.find({ status: 'pending' })
      .populate('bookId')
      .sort({ date: -1 });
    res.json(contributions);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Server Error' });
  }
});

// @route   GET api/contributions/approved
// @desc    Get all approved contributions with book details (admin view)
// @access  Private (admin only)
router.get('/approved', async (req, res) => {
  try {
    const contributions = await Contribution.find({ status: 'approved' })
      .populate('bookId')
      .sort({ date: -1 });
    res.json(contributions);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Server Error' });
  }
});

// @route   PUT api/contributions/:id/approve
// @desc    Approve a contribution and update book status
// @access  Private (admin only)
router.put('/:id/approve', async (req, res) => {
  try {
    const contribution = await Contribution.findById(req.params.id).populate('bookId');

    if (!contribution) {
      return res.status(404).json({ msg: 'Contribution not found' });
    }

    // Update contribution status
    contribution.status = 'approved';
    contribution.resolvedAt = new Date();
    await contribution.save();

    // Update book status to approved
    if (contribution.bookId) {
      contribution.bookId.status = 'approved';
      await contribution.bookId.save();
    }

    res.json({
      message: 'Contribution approved and book published',
      contribution
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Server Error' });
  }
});

// @route   PUT api/contributions/:id/reject
// @desc    Reject a contribution
// @access  Private (admin only)
router.put('/:id/reject', [
  check('reason', 'Rejection reason is required').not().isEmpty()
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const contribution = await Contribution.findById(req.params.id).populate('bookId');

    if (!contribution) {
      return res.status(404).json({ msg: 'Contribution not found' });
    }

    // Update contribution status
    contribution.status = 'rejected';
    contribution.adminNotes = req.body.reason;
    contribution.resolvedAt = new Date();
    await contribution.save();

    // Update book status to rejected
    if (contribution.bookId) {
      contribution.bookId.status = 'rejected';
      await contribution.bookId.save();
    }

    res.json({
      message: 'Contribution rejected',
      contribution
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Server Error' });
  }
});

module.exports = router;
