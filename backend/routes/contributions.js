const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator');
const upload = require('../middleware/upload');
const Contribution = require('../models/Contribution');
const LoggingService = require('../services/loggingService');

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
      const fileFormat = ebookPath.toLowerCase().endsWith('.pdf') ? 'pdf' : 'epub';

      const newContribution = new Contribution({
        title,
        author,
        description,
        categories: Array.isArray(categories) ? categories : [categories],
        coverImage: req.files.cover[0].path,
        eBookFile: ebookPath,
        fileFormat,
        status: 'pending'
      });

      const contribution = await newContribution.save();

      // Log CONTRIBUTE activity (anonymous user)
      try {
        await LoggingService.logActivity('anonymous', 'CONTRIBUTE', {
          ipAddress: req.headers['x-forwarded-for']?.split(',')[0] || req.connection.remoteAddress,
          userAgent: req.headers['user-agent'],
          metadata: {
            title: contribution.title,
            author: contribution.author,
            contributionId: contribution._id
          }
        });
      } catch (logErr) {
        console.error('Error logging contribution:', logErr);
      }

      res.json({
        message: 'Thank you for your contribution! Our team will review it shortly.',
        contribution: {
          id: contribution._id,
          title: contribution.title,
          status: contribution.status
        }
      });
    } catch (err) {
      console.error('Contribution error:', err);
      res.status(500).json({ error: 'Server Error: ' + err.message });
    }
  }
);

// @route   GET api/contributions/count
// @desc    Get total contributions count
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

// @route   GET api/contributions/approved
// @desc    Get all approved contributions (admin view)
// @access  Private (admin only)
router.get('/approved', async (req, res) => {
  try {
    const contributions = await Contribution.find({ status: 'approved' })
      .sort({ date: -1 });
    res.json(contributions);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Server Error' });
  }
});

module.exports = router;
