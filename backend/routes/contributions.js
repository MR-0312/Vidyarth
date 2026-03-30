const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator');
const upload = require('../middleware/upload');
const auth = require('../middleware/auth');
const { ContributionQueries, BookQueries } = require('../db/queries');
const { uploadFile } = require('../services/storageService');
const LoggingService = require('../services/loggingService');

// Helper: derive file format from file name
function getFileFormat(fileName) {
  const lower = fileName.toLowerCase();
  if (lower.endsWith('.epub')) return 'epub';
  if (lower.endsWith('.mobi')) return 'mobi';
  if (lower.endsWith('.azw3')) return 'azw3';
  return null;
}

// @route   POST api/contributions
// @desc    Submit a file contribution (anonymous or authenticated)
// @access  Public
router.post(
  '/',
  auth(false),
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

      const trackAsContribution = req.body.trackAsContribution === 'true' || req.body.trackAsContribution === true;
      const fileFormat = getFileFormat(req.files.ebook[0].originalname);
      
      if (!fileFormat) {
        return res.status(400).json({ error: 'Unsupported ebook file format. Only EPUB, MOBI, and AZW3 are allowed.' });
      }

      // Upload cover image to Supabase Storage
      const coverUrl = await uploadFile(req.files.cover[0].buffer, req.files.cover[0].originalname, 'cover');

      // Upload ebook to Supabase Storage
      const ebookUrl = await uploadFile(req.files.ebook[0].buffer, req.files.ebook[0].originalname, 'ebook');

      // Create new book in database
      const newBook = await BookQueries.create({
        title,
        author,
        description,
        categories: Array.isArray(categories) ? categories : [categories],
        cover_image: coverUrl,
        ebook_file: ebookUrl,
        file_format: fileFormat,
        user_id: req.user?.id || null,
        status: 'pending'
      });

      // Create contribution record if tracked
      let contribution = null;
      if (trackAsContribution) {
        contribution = await ContributionQueries.create(newBook.id, req.user?.id || null);

        // Log CONTRIBUTE activity
        try {
          await LoggingService.logActivity(req.user?.id || null, 'CONTRIBUTE', {
            bookId: newBook.id,
            metadata: {
              title: newBook.title,
              author: newBook.author,
              contributionId: contribution.id
            }
          });
        } catch (logErr) {
          console.error('Error logging contribution activity:', logErr);
        }
      }

      res.json({
        message: 'Thank you for your contribution!',
        contribution: contribution ? {
          id: contribution.id,
          bookId: newBook.id,
          title: newBook.title,
          author: newBook.author
        } : null,
        book: {
          id: newBook.id,
          title: newBook.title,
          author: newBook.author
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
    const contributions = await ContributionQueries.getByBookId(null);
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
    const { supabase } = require('../db/queries');
    const { count } = await supabase
      .from('contributions')
      .select('*', { count: 'exact', head: true });
    res.json({ totalContributions: count || 0 });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Server Error' });
  }
});

// @route   GET api/contributions/me
// @desc    Get current user's contributions
// @access  Private
router.get('/me', auth(), async (req, res) => {
  try {
    const contributions = await ContributionQueries.getByUserId(req.user.id);
    res.json(contributions);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Server Error' });
  }
});

module.exports = router;

