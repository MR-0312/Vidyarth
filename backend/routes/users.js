const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator');
const auth = require('../middleware/auth');
const upload = require('../middleware/upload');
const { UserQueries } = require('../db/queries');
const { uploadFile, deleteFile } = require('../services/storageService');
const LoggingService = require('../services/loggingService');
const tokenBlacklist = require('../services/tokenBlacklist');


// Note: Register and login functionality is handled in auth.js route
// These endpoints are deprecated

// @route   GET api/users/me
// @desc    Get current user
// @access  Private
router.get('/me', auth, async (req, res) => {
  try {
    const user = await UserQueries.getUserProfile(req.user.id);
    res.json(user);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: 'Server Error' });
  }
});

// @route   GET api/users/:userId
// @desc    Get user profile by ID
// @access  Public
router.get('/:userId', async (req, res) => {
  try {
    const user = await UserQueries.getUserProfile(req.params.userId);
    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }
    res.json(user);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: 'Server Error' });
  }
});

// @route   PUT api/users/profile
// @desc    Update user profile
// @access  Private
router.put('/profile', [auth, 
  upload.single('profilePicture'),
  [
    check('bio', 'Bio is required').not().isEmpty(),
    check('preferredCategories', 'Preferred categories must be an array').isArray()
  ]
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { bio, preferredCategories } = req.body;

  try {
    let user = await UserQueries.findById(req.user.id);

    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }

    const updateData = {
      bio,
      preferred_categories: preferredCategories
    };

    if (req.file) {
      // Delete old profile picture if exists
      if (user.profile_picture && user.profile_picture !== 'default-profile.jpg') {
        await deleteFile(user.profile_picture, 'cover');
      }
      const profilePicUrl = await uploadFile(req.file.buffer, req.file.originalname, 'cover');
      updateData.profile_picture = profilePicUrl;
    }

    const updatedUser = await UserQueries.update(req.user.id, updateData);

    // Log UPDATE_PROFILE activity
    try {
      await LoggingService.logActivity(req.user.id, 'UPDATE_PROFILE', {
        ipAddress: req.headers['x-forwarded-for']?.split(',')[0] || req.connection.remoteAddress,
        userAgent: req.headers['user-agent'],
      });
    } catch (logErr) {
      console.error('Error logging profile update:', logErr);
    }

    res.json(updatedUser);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: 'Server Error' });
  }
});

// @route   POST api/users/logout
// @desc    Logout user
// @access  Private
router.post('/logout', auth, async (req, res) => {
  try {
    // Blacklist the token to prevent reuse
    const token = req.token;
    if (token) {
      // 1 hour expiration (3600 seconds) - tokens auto-remove from blacklist after expiration
      tokenBlacklist.addToBlacklist(token, 3600);
    }

    // Log LOGOUT activity
    try {
      await LoggingService.logActivity(req.user.id, 'LOGOUT', {
        ipAddress: req.headers['x-forwarded-for']?.split(',')[0] || req.connection.remoteAddress,
        userAgent: req.headers['user-agent'],
      });
    } catch (logErr) {
      console.error('Error logging logout activity:', logErr);
    }

    res.json({ msg: 'Logged out successfully' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;