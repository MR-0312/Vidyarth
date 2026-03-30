const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator');
const auth = require('../middleware/auth');
const upload = require('../middleware/upload');
const { BookQueries, UserQueries, ReviewQueries, ChapterQueries } = require('../db/queries');
const { uploadFile, deleteFile } = require('../services/storageService');
const { parseChapters } = require('../services/ebookParserService');
const LoggingService = require('../services/loggingService');

// Helper: derive file format from file extension
function getFileFormat(fileName) {
  const lower = fileName.toLowerCase();
  if (lower.endsWith('.epub')) return 'epub';
  if (lower.endsWith('.mobi')) return 'mobi';
  if (lower.endsWith('.azw3')) return 'azw3';
  return null;
}

// @route   GET api/books
// @desc    Get all books with pagination and optional category filter
// @access  Public
router.get('/', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const category = req.query.category;

    // Log category filter activity if user is authenticated
    if (category && req.user?.id) {
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

    const filters = {};
    if (category) {
      filters.category = category;
    }

    const { books, total } = await BookQueries.getAll(page, limit, filters);

    res.json({
      books,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      totalBooks: total
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: 'Server Error' });
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
    if (!req.files || !req.files['cover'] || !req.files['ebook']) {
      return res.status(400).json({ error: 'Cover image and e-book file are required' });
    }

    const fileFormat = getFileFormat(req.files['ebook'][0].originalname);
    if (!fileFormat) {
      return res.status(400).json({ error: 'Unsupported ebook file format. Only EPUB, MOBI, and AZW3 are allowed.' });
    }

    // Upload cover image to Supabase Storage
    const coverUrl = await uploadFile(req.files['cover'][0].buffer, req.files['cover'][0].originalname, 'cover');

    // Upload ebook to Supabase Storage
    const ebookUrl = await uploadFile(req.files['ebook'][0].buffer, req.files['ebook'][0].originalname, 'ebook');

    // Create book in database
    const newBook = await BookQueries.create({
      title,
      author,
      description,
      categories,
      cover_image: coverUrl,
      ebook_file: ebookUrl,
      file_format: fileFormat,
      user_id: req.user.id,
      status: 'pending'
    });

    // Parse chapters from the uploaded ebook
    let chapters = [];
    let chapterCount = 0;
    try {
      chapters = await parseChapters(req.files['ebook'][0].buffer, fileFormat);
      
      if (chapters.length > 0) {
        // Add book_id to each chapter
        const chaptersWithBookId = chapters.map(ch => ({
          ...ch,
          book_id: newBook.id
        }));

        // Save chapters to database
        await ChapterQueries.createBulk(chaptersWithBookId);
        chapterCount = chapters.length;
        console.log(`Successfully parsed ${chapterCount} chapters for book: ${title}`);
      }
    } catch (parseErr) {
      console.error('Error parsing chapters:', parseErr);
      // If chapter parsing fails, continue without chapters
      // This is not a critical error
    }

    // Log ADD_BOOK activity
    try {
      await LoggingService.logActivity(req.user.id, 'ADD_BOOK', {
        bookId: newBook.id,
        chapterCount,
        ipAddress: req.headers['x-forwarded-for']?.split(',')[0] || req.connection.remoteAddress,
        userAgent: req.headers['user-agent'],
      });
    } catch (logErr) {
      console.error('Error logging add book:', logErr);
    }

    res.json({
      msg: 'Book uploaded successfully',
      book: newBook,
      chaptersExtracted: chapterCount
    });

  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: 'Server Error' });
  }
});

// @route   GET api/books/:id
// @desc    Get book by ID
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const book = await BookQueries.findById(req.params.id);
    
    if (!book) {
      return res.status(404).json({ msg: 'Book not found' });
    }

    // Get reviews for this book
    const reviews = await ReviewQueries.getByBookId(req.params.id);
    
    // Get average rating
    const { average, count } = await ReviewQueries.getAverageRating(req.params.id);

    // Log VIEW_BOOK activity if user is authenticated
    if (req.user?.id) {
      try {
        await LoggingService.logActivity(req.user.id, 'VIEW_BOOK', {
          bookId: book.id,
          ipAddress: req.headers['x-forwarded-for']?.split(',')[0] || req.connection.remoteAddress,
          userAgent: req.headers['user-agent'],
        });
      } catch (logErr) {
        console.error('Error logging book view:', logErr);
      }
    }

    res.json({
      ...book,
      reviews,
      averageRating: average,
      totalReviews: count
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: 'Server Error' });
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
    let book = await BookQueries.findById(req.params.id);

    if (!book) {
      return res.status(404).json({ msg: 'Book not found' });
    }

    // Prepare update data
    const updateData = {
      title,
      author,
      description,
      categories
    };

    // Handle cover image upload if provided
    if (req.files && req.files['cover']) {
      // Delete old cover if it exists
      if (book.cover_image) {
        await deleteFile(book.cover_image, 'cover');
      }
      const newCoverUrl = await uploadFile(req.files['cover'][0].buffer, req.files['cover'][0].originalname, 'cover');
      updateData.cover_image = newCoverUrl;
    }

    // Handle ebook upload if provided
    if (req.files && req.files['ebook']) {
      const fileFormat = getFileFormat(req.files['ebook'][0].originalname);
      if (!fileFormat) {
        return res.status(400).json({ error: 'Unsupported ebook file format. Only EPUB, MOBI, and AZW3 are allowed.' });
      }
      // Delete old ebook if it exists
      if (book.ebook_file) {
        await deleteFile(book.ebook_file, 'ebook');
      }
      const newEbookUrl = await uploadFile(req.files['ebook'][0].buffer, req.files['ebook'][0].originalname, 'ebook');
      updateData.ebook_file = newEbookUrl;
      updateData.file_format = fileFormat;
    }

    // Update book in database
    const updatedBook = await BookQueries.update(req.params.id, updateData);

    // Log UPDATE_BOOK activity
    try {
      await LoggingService.logActivity(req.user.id, 'UPDATE_BOOK', {
        bookId: req.params.id,
        ipAddress: req.headers['x-forwarded-for']?.split(',')[0] || req.connection.remoteAddress,
        userAgent: req.headers['user-agent'],
      });
    } catch (logErr) {
      console.error('Error logging update book:', logErr);
    }

  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: 'Server Error' });
  }
});

// @route   DELETE api/books/:id
// @desc    Delete a book
// @access  Private
router.delete('/:id', auth(), async (req, res) => {
  try {
    const book = await BookQueries.findById(req.params.id);

    if (!book) {
      return res.status(404).json({ msg: 'Book not found' });
    }

    // Delete files from Supabase Storage
    if (book.cover_image) {
      await deleteFile(book.cover_image, 'cover');
    }
    if (book.ebook_file) {
      await deleteFile(book.ebook_file, 'ebook');
    }

    // Delete book from database
    await BookQueries.delete(req.params.id);

    // Log DELETE_BOOK activity
    try {
      await LoggingService.logActivity(req.user.id, 'DELETE_BOOK', {
        bookId: req.params.id,
        ipAddress: req.headers['x-forwarded-for']?.split(',')[0] || req.connection.remoteAddress,
        userAgent: req.headers['user-agent'],
      });
    } catch (logErr) {
      console.error('Error logging delete book:', logErr);
    }

    res.json({ msg: 'Book removed' });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: 'Server Error' });
  }
});

// @route   GET api/books/search
// @desc    Search for books
// @access  Public
router.get('/search', async (req, res) => {
  try {
    const { query, page = 1, limit = 10, category } = req.query;

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

    // Note: Full-text search would require a more sophisticated implementation
    // For now, we'll fetch all approved books and filter on the application side
    // In production, use Supabase full-text search or PostgreSQL search capabilities
    const filters = { status: 'approved' };
    if (category) {
      filters.category = category;
    }

    const { books, total } = await BookQueries.getAll(parseInt(page), parseInt(limit), filters);

    // Filter by search query (basic search)
    const searchedBooks = query ? books.filter(book =>
      book.title.toLowerCase().includes(query.toLowerCase()) ||
      book.author.toLowerCase().includes(query.toLowerCase()) ||
      book.description.toLowerCase().includes(query.toLowerCase())
    ) : books;

    res.json({
      books: searchedBooks,
      currentPage: parseInt(page),
      totalPages: Math.ceil(total / limit),
      totalBooks: searchedBooks.length
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: 'Server Error' });
  }
});

// ==================== CHAPTER ROUTES ====================

// @route   GET api/books/:bookId/chapters
// @desc    Get all chapters for a book
// @access  Public
router.get('/:bookId/chapters', async (req, res) => {
  try {
    const { bookId } = req.params;
    
    // Verify book exists
    const book = await BookQueries.findById(bookId);
    if (!book) {
      return res.status(404).json({ msg: 'Book not found' });
    }

    const chapters = await ChapterQueries.getByBookId(bookId);
    res.json(chapters);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: 'Server Error' });
  }
});

// @route   POST api/books/:bookId/chapters
// @desc    Add chapters to a book
// @access  Private
router.post('/:bookId/chapters', [auth, check('chapters', 'Chapters array is required').isArray()], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { bookId } = req.params;
    const { chapters } = req.body;

    // Verify book exists and user has permission
    const book = await BookQueries.findById(bookId);
    if (!book) {
      return res.status(404).json({ msg: 'Book not found' });
    }

    // Check if user is the book owner
    if (book.user_id !== req.user.id) {
      return res.status(403).json({ msg: 'Not authorized to add chapters to this book' });
    }

    // Delete existing chapters for this book
    await ChapterQueries.deleteByBookId(bookId);

    // Create new chapters
    const chaptersWithBookId = chapters.map(ch => ({
      ...ch,
      book_id: bookId
    }));

    const createdChapters = await ChapterQueries.createBulk(chaptersWithBookId);
    res.json(createdChapters);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: 'Server Error' });
  }
});

// @route   PUT api/books/:bookId/chapters/:chapterId
// @desc    Update a chapter
// @access  Private
router.put('/:bookId/chapters/:chapterId', [auth, 
  check('title', 'Title is required').not().isEmpty(),
  check('chapter_number', 'Chapter number is required').isInt()
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { bookId, chapterId } = req.params;
    const { title, chapter_number, start_page, end_page } = req.body;

    // Verify book exists and user has permission
    const book = await BookQueries.findById(bookId);
    if (!book) {
      return res.status(404).json({ msg: 'Book not found' });
    }

    if (book.user_id !== req.user.id) {
      return res.status(403).json({ msg: 'Not authorized to update chapters' });
    }

    const updatedChapter = await ChapterQueries.update(chapterId, {
      title,
      chapter_number,
      start_page,
      end_page
    });

    res.json(updatedChapter);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: 'Server Error' });
  }
});

// @route   DELETE api/books/:bookId/chapters/:chapterId
// @desc    Delete a chapter
// @access  Private
router.delete('/:bookId/chapters/:chapterId', auth, async (req, res) => {
  try {
    const { bookId, chapterId } = req.params;

    // Verify book exists and user has permission
    const book = await BookQueries.findById(bookId);
    if (!book) {
      return res.status(404).json({ msg: 'Book not found' });
    }

    if (book.user_id !== req.user.id) {
      return res.status(403).json({ msg: 'Not authorized to delete chapters' });
    }

    await ChapterQueries.delete(chapterId);
    res.json({ msg: 'Chapter deleted' });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: 'Server Error' });
  }
});

module.exports = router;