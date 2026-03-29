const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const { UserQueries } = require('../db/queries');
const auth = require('../middleware/auth');
const LoggingService = require('../services/loggingService');
const { v4: uuidv4 } = require('uuid');

router.post('/register', async (req, res) => {
  try {
    const { username, email, password } = req.body;
    
    // Check if user already exists
    const existingUser = await UserQueries.findByEmail(email);
    if (existingUser) {
      return res.status(400).json({ msg: 'User already exists' });
    }

    // Create new user
    const user = await UserQueries.create({ username, email, password });

    const payload = { user: { id: user.id } };
    jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' }, (err, token) => {
      if (err) throw err;
      res.json({ token, userId: user.id });
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: 'Server error' });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Find user by email
    const user = await UserQueries.findByEmail(email);
    if (!user) {
      return res.status(400).json({ msg: 'Invalid credentials' });
    }

    // Compare password
    const isMatch = await UserQueries.comparePassword(user.id, password);
    if (!isMatch) {
      return res.status(400).json({ msg: 'Invalid credentials' });
    }

    const payload = { user: { id: user.id } };
    jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' }, async (err, token) => {
      if (err) throw err;
      
      // Log login activity
      try {
        await LoggingService.logActivity(user.id, 'LOGIN', {
          sessionId: uuidv4(),
          ipAddress: req.headers['x-forwarded-for']?.split(',')[0] || req.connection.remoteAddress,
          userAgent: req.headers['user-agent'],
          deviceType: /mobile/i.test(req.headers['user-agent'] || '') ? 'MOBILE' : 'WEB',
        });
      } catch (logErr) {
        console.error('Error logging login activity:', logErr);
      }
      
      res.json({ token, userId: user.id });
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: 'Server error' });
  }
});

router.get('/user', auth, async (req, res) => {
  try {
    const user = await UserQueries.getUserProfile(req.user.id);
    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }
    res.json(user);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: 'Server error' });
  }
});

module.exports = router;