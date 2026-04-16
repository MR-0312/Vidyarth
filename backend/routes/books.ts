import express, { Request, Response, Router } from 'express';
import { check, validationResult } from 'express-validator';
import authMiddleware from '../middleware/auth';
import upload from '../middleware/upload';
import { BookQueries } from '../db/queries';
import { uploadFile, deleteFile } from '../services/storageService';
import { parseChapters } from '../services/ebookParserService';
import LoggingService from '../services/loggingService';

const router: Router = express.Router();

// Helper: derive file format from file extension
function getFileFormat(fileName: string): string | null {
  const lower = fileName.toLowerCase();
  if (lower.endsWith('.epub')) return 'epub';
  if (lower.endsWith('.mobi')) return 'mobi';
  if (lower.endsWith('.azw3')) return 'azw3';
  return null;
}

// @route   GET api/books
// @desc    Get all approved books with pagination and optional category filter
// @access  Public
router.get('/', async (req: Request, res: Response): Promise<void> => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const category = req.query.category as string;

    // Log category filter activity if user is authenticated
    if (category && (req as any).user?.id) {
      try {
        await LoggingService.logActivity((req as any).user.id, 'FILTER_CATEGORY', {
          category,
          ipAddress: (req.headers['x-forwarded-for'] as string)?.split(',')[0] || req.connection.remoteAddress as string,
          userAgent: req.headers['user-agent'] as string,
        });
      } catch (logErr) {
        console.error('Error logging category filter:', logErr);
      }
    }

    // Always filter for approved books only (not pending or rejected)
    const filters: any = { status: 'approved' };
    if (category) filters.category = category;

    const { books, total } = await BookQueries.getAll(page, limit, filters);

    res.json({
      books,
      currentPage: page,
      totalPages: Math.ceil((total || 0) / limit),
      totalBooks: total
    });
  } catch (err) {
    console.error((err as Error).message);
    res.status(500).json({ msg: 'Server Error' });
  }
});

// @route   GET api/books/:bookId
// @desc    Get a single book by ID (only if approved, or user is the contributor/admin)
// @access  Public
router.get('/:bookId', async (req: Request, res: Response): Promise<void> => {
  try {
    const book = await BookQueries.findById(req.params.bookId);
    if (!book) {
      res.status(404).json({ msg: 'Book not found' });
      return;
    }

    // Check if user has access to this book
    const userId = (req as any).user?.id;
    const userRole = (req as any).user?.role;
    const isContributor = book.user_id === userId;
    const isAdmin = userRole === 'admin';
    const isApproved = book.status === 'approved';

    // Only allow access if: approved OR (user is contributor) OR (user is admin)
    if (!isApproved && !isContributor && !isAdmin) {
      res.status(404).json({ msg: 'Book not found' });
      return;
    }

    // Log VIEW_BOOK activity if user is authenticated
    if (userId) {
      try {
        await LoggingService.logActivity(userId, 'VIEW_BOOK', {
          bookId: req.params.bookId,
          ipAddress: (req.headers['x-forwarded-for'] as string)?.split(',')[0] || req.connection.remoteAddress as string,
          userAgent: req.headers['user-agent'] as string,
        });
      } catch (logErr) {
        console.error('Error logging view book:', logErr);
      }
    }

    res.json(book);
  } catch (err) {
    console.error((err as Error).message);
    res.status(500).json({ msg: 'Server Error' });
  }
});

// @route   POST api/books
// @desc    Add a new book
// @access  Private
router.post(
  '/',
  authMiddleware(),
  upload.fields([
    { name: 'cover', maxCount: 1 },
    { name: 'ebook', maxCount: 1 }
  ]),
  [
    check('title', 'Title is required').not().isEmpty(),
    check('author', 'Author is required').not().isEmpty(),
    check('description', 'Description is required').not().isEmpty(),
    check('categories', 'At least one category is required').isArray({ min: 1 }),
  ],
  async (req: Request, res: Response): Promise<void> => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ errors: errors.array() });
      return;
    }

    const { title, author, description, categories } = req.body;

    try {
      const files = req.files as any;
      if (!files || !files['cover'] || !files['ebook']) {
        res.status(400).json({ error: 'Cover image and e-book file are required' });
        return;
      }

      const fileFormat = getFileFormat(files['ebook'][0].originalname);
      if (!fileFormat) {
        res.status(400).json({ error: 'Unsupported ebook file format. Only EPUB, MOBI, and AZW3 are allowed.' });
        return;
      }

      // Upload cover image to Supabase Storage
      const coverUrl = await uploadFile(files['cover'][0].buffer, files['cover'][0].originalname, 'cover');

      // Upload ebook to Supabase Storage
      const ebookUrl = await uploadFile(files['ebook'][0].buffer, files['ebook'][0].originalname, 'ebook');

      // Create book in database
      const newBook = await BookQueries.create({
        title,
        author,
        description,
        categories: Array.isArray(categories) ? categories : [categories],
        cover_image: coverUrl,
        ebook_file: ebookUrl,
        file_format: fileFormat,
        user_id: (req as any).user.id,
        status: 'pending'
      });

      // Parse chapters from the uploaded ebook
      let chapterCount = 0;
      try {
        const chapters = await parseChapters(files['ebook'][0].buffer, fileFormat);
        chapterCount = chapters.length;
        console.log(`Successfully parsed ${chapterCount} chapters for book: ${title}`);
      } catch (parseErr) {
        console.error('Error parsing chapters:', parseErr);
      }

      // Log ADD_BOOK activity
      try {
        await LoggingService.logActivity((req as any).user.id, 'ADD_BOOK', {
          bookId: newBook.id,
          sessionId: '',
          deviceType: 'WEB',
          ipAddress: (req.headers['x-forwarded-for'] as string)?.split(',')[0] || req.connection.remoteAddress as string,
          userAgent: req.headers['user-agent'] as string,
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
      console.error((err as Error).message);
      res.status(500).json({ msg: 'Server Error' });
    }
  }
);

// @route   DELETE api/books/:bookId
// @desc    Delete a book
// @access  Private
router.delete('/:bookId', authMiddleware(), async (req: Request, res: Response): Promise<void> => {
  try {
    const book = await BookQueries.findById(req.params.bookId);
    if (!book) {
      res.status(404).json({ msg: 'Book not found' });
      return;
    }

    // Delete associated files
    if (book.cover_image) await deleteFile(book.cover_image, 'cover');
    if (book.ebook_file) await deleteFile(book.ebook_file, 'ebook');

    // Delete book from database
    await BookQueries.delete(req.params.bookId);

    res.json({ msg: 'Book deleted successfully' });
  } catch (err) {
    console.error((err as Error).message);
    res.status(500).json({ msg: 'Server Error' });
  }
});

export default router;
