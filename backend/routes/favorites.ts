import express, { Request, Response, Router } from 'express';
import authMiddleware from '../middleware/auth';
import { BookQueries, FavoriteQueries } from '../db/queries';
import LoggingService from '../services/loggingService';

const router: Router = express.Router();

// @route   POST api/favorites/:bookId
// @desc    Add a book to user's favorites
// @access  Private
router.post('/:bookId', authMiddleware(), async (req: Request, res: Response): Promise<void> => {
  try {
    const book = await BookQueries.findById(req.params.bookId);
    if (!book) {
      res.status(404).json({ msg: 'Book not found' });
      return;
    }

    // Check if already favorited
    const isFav = await FavoriteQueries.isFavorited(req.user.id, req.params.bookId);
    if (isFav) {
      res.status(400).json({ msg: 'Book already in favorites' });
      return;
    }

    await FavoriteQueries.add(req.user.id, req.params.bookId);

    // Log ADD_FAVORITE activity
    try {
      await LoggingService.logActivity(req.user.id, 'ADD_FAVORITE', {
        bookId: req.params.bookId,
        ipAddress: (req.headers['x-forwarded-for'] as string)?.split(',')[0] || req.connection.remoteAddress as string,
        userAgent: req.headers['user-agent'] as string,
      });
    } catch (logErr) {
      console.error('Error logging add favorite:', logErr);
    }

    const favorites = await FavoriteQueries.getByUserId(req.user.id);
    res.json(favorites);
  } catch (err) {
    console.error((err as Error).message);
    res.status(500).json({ msg: 'Server Error' });
  }
});

// @route   DELETE api/favorites/:bookId
// @desc    Remove a book from user's favorites
// @access  Private
router.delete('/:bookId', authMiddleware(), async (req: Request, res: Response): Promise<void> => {
  try {
    await FavoriteQueries.remove(req.user.id, req.params.bookId);

    // Log REMOVE_FAVORITE activity
    try {
      await LoggingService.logActivity(req.user.id, 'REMOVE_FAVORITE', {
        bookId: req.params.bookId,
        ipAddress: (req.headers['x-forwarded-for'] as string)?.split(',')[0] || req.connection.remoteAddress as string,
        userAgent: req.headers['user-agent'] as string,
      });
    } catch (logErr) {
      console.error('Error logging remove favorite:', logErr);
    }

    const favorites = await FavoriteQueries.getByUserId(req.user.id);
    res.json(favorites);
  } catch (err) {
    console.error((err as Error).message);
    res.status(500).json({ msg: 'Server Error' });
  }
});

// @route   GET api/favorites
// @desc    Get user's favorite books
// @access  Private
router.get('/', authMiddleware(), async (req: Request, res: Response): Promise<void> => {
  try {
    const favorites = await FavoriteQueries.getByUserId(req.user.id);
    
    // Log GET_FAVORITES activity
    try {
      await LoggingService.logActivity(req.user.id, 'GET_FAVORITES', {
        ipAddress: (req.headers['x-forwarded-for'] as string)?.split(',')[0] || req.connection.remoteAddress as string,
        userAgent: req.headers['user-agent'] as string,
      });
    } catch (logErr) {
      console.error('Error logging get favorites:', logErr);
    }
    
    res.json(favorites);
  } catch (err) {
    console.error((err as Error).message);
    res.status(500).json({ msg: 'Server Error' });
  }
});

export default router;
