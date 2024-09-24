const express = require('express');
const router = express.Router();
const Book = require('../models/Book');
const User = require('../models/User');
const auth = require('../middleware/auth');
const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({ storage: storage });

// Add a new book (admin only)
router.post('/', [auth, upload.fields([{ name: 'coverImage', maxCount: 1 }, { name: 'bookFile', maxCount: 1 }])], async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user.isAdmin) return res.status(403).json({ msg: 'Not authorized' });

    const { title, author, genre, description } = req.body;
    const coverImage = req.files['coverImage'] ? `/uploads/${req.files['coverImage'][0].filename}` : null;
    const fileUrl = req.files['bookFile'] ? `/uploads/${req.files['bookFile'][0].filename}` : null;

    const newBook = new Book({
      title,
      author,
      genre: genre.split(',').map(g => g.trim()),
      description,
      coverImage,
      fileUrl
    });

    const book = await newBook.save();
    res.json(book);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// ... (other routes remain the same)

module.exports = router;