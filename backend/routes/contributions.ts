import express, { Request, Response, Router } from 'express';
import { check, validationResult } from 'express-validator';
import upload from '../middleware/upload';
import authMiddleware from '../middleware/auth';
import { ContributionQueries, BookQueries } from '../db/queries';
import { uploadFile } from '../services/storageService';
import LoggingService from '../services/loggingService';

const router: Router = express.Router();

// Helper: derive file format from file name
function getFileFormat(fileName: string): string | null {
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
  authMiddleware(false),
  upload.fields([
    { name: 'cover', maxCount: 1 },
    { name: 'ebook', maxCount: 1 }
  ]),
  [
    check('title', 'Title is required').not().isEmpty(),
    check('author', 'Author is required').not().isEmpty(),
    check('description', 'Description is required').not().isEmpty(),
  ],
  async (req: Request, res: Response): Promise<void> => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ errors: errors.array() });
      return;
    }

    try {
      // Verify files were uploaded
      const files = req.files as any;
      if (!files || !files.cover || !files.ebook) {
        res.status(400).json({ error: 'Both cover image and ebook file are required' });
        return;
      }

      const { title, author, description, categories } = req.body;

      // Validate categories
      if (!categories || (Array.isArray(categories) && categories.length === 0) || (!Array.isArray(categories) && !categories)) {
        res.status(400).json({ error: 'At least one category is required' });
        return;
      }

      // Check if this is an anonymous upload
      // trackAsContribution=false means upload was anonymous/no contribution record
      const trackAsContribution = req.body.trackAsContribution === 'true' || req.body.trackAsContribution === true;
      const fileFormat = getFileFormat(files.ebook[0].originalname);
      
      if (!fileFormat) {
        res.status(400).json({ error: 'Unsupported ebook file format. Only EPUB, MOBI, and AZW3 are allowed.' });
        return;
      }

      // Upload cover image to Supabase Storage
      const coverUrl = await uploadFile(files.cover[0].buffer, files.cover[0].originalname, 'cover');

      // Upload ebook to Supabase Storage
      const ebookUrl = await uploadFile(files.ebook[0].buffer, files.ebook[0].originalname, 'ebook');

      // Create new book in database with explicit status='pending'
      // For anonymous uploads (trackAsContribution=false), ensure user_id is not set
      const newBook = await BookQueries.create({
        title,
        author,
        description,
        categories: Array.isArray(categories) ? categories : [categories],
        cover_image: coverUrl,
        ebook_file: ebookUrl,
        file_format: fileFormat,
        user_id: trackAsContribution && req.user?.id ? req.user.id : undefined,
        status: 'pending'  // ALWAYS set to pending - requires admin approval
      });

      // Create contribution record only if tracked (non-anonymous)
      let contribution = null;
      if (trackAsContribution && req.user?.id) {
        contribution = await ContributionQueries.create(newBook.id!, req.user.id);

        // Log CONTRIBUTE activity
        try {
          await LoggingService.logActivity(req.user.id, 'CONTRIBUTE', {
            bookId: newBook.id,
            sessionId: '',
            deviceType: 'WEB'
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
      res.status(500).json({ error: 'Server Error: ' + (err as Error).message });
    }
  }
);

// @route   GET api/contributions/me
// @desc    Get contributions by the authenticated user
// @access  Private
router.get('/me', authMiddleware(true), async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user?.id) {
      res.status(401).json({ msg: 'User not authenticated' });
      return;
    }

    const contributions = await ContributionQueries.getByUserId(req.user.id);
    res.json(contributions);
  } catch (err) {
    console.error((err as Error).message);
    res.status(500).json({ msg: 'Server Error' });
  }
});

// @route   GET api/contributions/user/:userId
// @desc    Get contributions by a specific user
// @access  Public
router.get('/user/:userId', async (req: Request, res: Response): Promise<void> => {
  try {
    const contributions = await ContributionQueries.getByUserId(req.params.userId);
    res.json(contributions);
  } catch (err) {
    console.error((err as Error).message);
    res.status(500).json({ msg: 'Server Error' });
  }
});

export default router;
