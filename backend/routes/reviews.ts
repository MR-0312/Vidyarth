import express, { Request, Response, Router } from 'express';
import { check, validationResult } from 'express-validator';
import authMiddleware from '../middleware/auth';
import { ReviewQueries, BookQueries } from '../db/queries';
import LoggingService from '../services/loggingService';

const router: Router = express.Router();

// @route   POST api/reviews/:bookId
// @desc    Add a review for a book
// @access  Private
router.post(
  '/:bookId',
  authMiddleware(),
  [
    check('rating', 'Rating is required').isInt({ min: 1, max: 5 }),
    check('comment', 'Comment is required').not().isEmpty()
  ],
  async (req: Request, res: Response): Promise<void> => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ errors: errors.array() });
      return;
    }

    try {
      const book = await BookQueries.findById(req.params.bookId);
      if (!book) {
        res.status(404).json({ msg: 'Book not found' });
        return;
      }

      // Check if user already reviewed this book
      const existingReview = await ReviewQueries.findOne(req.user.id, req.params.bookId);
      if (existingReview) {
        res.status(400).json({ msg: 'You have already reviewed this book' });
        return;
      }

      const review = await ReviewQueries.create({
        user_id: req.user.id,
        book_id: req.params.bookId,
        rating: req.body.rating,
        content: req.body.comment
      });

      // Log WRITE_REVIEW and RATE_BOOK activities
      try {
        await Promise.all([
          LoggingService.logActivity(req.user.id, 'WRITE_REVIEW', {
            bookId: req.params.bookId,
            reviewContent: req.body.comment,
            ipAddress: (req.headers['x-forwarded-for'] as string)?.split(',')[0] || req.connection.remoteAddress as string,
            userAgent: req.headers['user-agent'] as string,
          }),
          LoggingService.logActivity(req.user.id, 'RATE_BOOK', {
            bookId: req.params.bookId,
            rating: req.body.rating,
            ipAddress: (req.headers['x-forwarded-for'] as string)?.split(',')[0] || req.connection.remoteAddress as string,
            userAgent: req.headers['user-agent'] as string,
          })
        ]);
      } catch (logErr) {
        console.error('Error logging review:', logErr);
      }

      res.json(review);
    } catch (err) {
      console.error((err as Error).message);
      res.status(500).json({ msg: 'Server Error' });
    }
  }
);

// @route   GET api/reviews/:bookId
// @desc    Get all reviews for a book
// @access  Public
router.get('/:bookId', async (req: Request, res: Response): Promise<void> => {
  try {
    const reviews = await ReviewQueries.getByBookId(req.params.bookId);

    // Log VIEW_REVIEWS activity if user is authenticated
    if (req.user?.id) {
      try {
        await LoggingService.logActivity(req.user.id, 'VIEW_REVIEWS', {
          bookId: req.params.bookId,
          ipAddress: (req.headers['x-forwarded-for'] as string)?.split(',')[0] || req.connection.remoteAddress as string,
          userAgent: req.headers['user-agent'] as string,
        });
      } catch (logErr) {
        console.error('Error logging view reviews:', logErr);
      }
    }

    res.json(reviews);
  } catch (err) {
    console.error((err as Error).message);
    res.status(500).json({ msg: 'Server Error' });
  }
});

export default router;
