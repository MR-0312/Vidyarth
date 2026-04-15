import express, { Request, Response, Router } from 'express';
import adminMiddleware from '../middleware/admin';
import { BookQueries, UserQueries } from '../db/queries';
import LoggingService from '../services/loggingService';
import { deleteFile } from '../services/storageService';

const router: Router = express.Router();

// ==================== BOOK MANAGEMENT ====================

/**
 * GET /api/admin/books/pending
 * Get all pending books awaiting admin approval
 */
router.get('/books/pending', adminMiddleware(), async (req: Request, res: Response): Promise<void> => {
  try {
    const { books, total } = await BookQueries.getAll(1, 100, { status: 'pending' });
    
    // Log admin action
    await LoggingService.logActivity(req.user.id, 'ADMIN_VIEW_PENDING_BOOKS', {
      ipAddress: (req.headers['x-forwarded-for'] as string)?.split(',')[0] || req.connection.remoteAddress as string,
      count: books.length,
    } as any);

    res.json({
      books,
      total,
      msg: 'Pending books retrieved successfully'
    });
  } catch (err) {
    console.error((err as Error).message);
    res.status(500).json({ msg: 'Server error' });
  }
});

/**
 * PATCH /api/admin/books/:id
 * Edit book details (title, description, categories, etc.)
 */
router.patch('/books/:id', adminMiddleware(), async (req: Request, res: Response): Promise<void> => {
  try {
    const { title, description, categories, author } = req.body;
    const bookId = req.params.id;

    // Find book
    const book = await BookQueries.findById(bookId);
    if (!book) {
      res.status(404).json({ msg: 'Book not found' });
      return;
    }

    // Prepare updates
    const updates: any = {};
    if (title) updates.title = title;
    if (description) updates.description = description;
    if (categories) updates.categories = categories;
    if (author) updates.author = author;

    // Update book
    const updatedBook = await BookQueries.update(bookId, updates);

    // Log admin action
    await LoggingService.logActivity(req.user.id, 'ADMIN_EDIT_BOOK', {
      bookId,
      changes: Object.keys(updates),
      ipAddress: (req.headers['x-forwarded-for'] as string)?.split(',')[0] || req.connection.remoteAddress as string,
    } as any);

    res.json({
      msg: 'Book updated successfully',
      book: updatedBook
    });
  } catch (err) {
    console.error((err as Error).message);
    res.status(500).json({ msg: 'Server error' });
  }
});

/**
 * PUT /api/admin/books/:id/approve
 * Approve a pending book
 */
router.put('/books/:id/approve', adminMiddleware(), async (req: Request, res: Response): Promise<void> => {
  try {
    const bookId = req.params.id;
    const { reason } = req.body; // Optional approval reason

    // Find book
    const book = await BookQueries.findById(bookId);
    if (!book) {
      res.status(404).json({ msg: 'Book not found' });
      return;
    }

    // Check if already approved
    if (book.status === 'approved') {
      res.status(400).json({ msg: 'Book is already approved' });
      return;
    }

    // Update book status
    const updatedBook = await BookQueries.update(bookId, { status: 'approved' });

    // Log admin action
    await LoggingService.logActivity(req.user.id, 'ADMIN_APPROVE_BOOK', {
      bookId,
      bookTitle: book.title,
      reason: reason || 'No reason provided',
      ipAddress: (req.headers['x-forwarded-for'] as string)?.split(',')[0] || req.connection.remoteAddress as string,
    } as any);

    res.json({
      msg: 'Book approved successfully',
      book: updatedBook
    });
  } catch (err) {
    console.error((err as Error).message);
    res.status(500).json({ msg: 'Server error' });
  }
});

/**
 * PUT /api/admin/books/:id/reject
 * Reject a pending book
 */
router.put('/books/:id/reject', adminMiddleware(), async (req: Request, res: Response): Promise<void> => {
  try {
    const bookId = req.params.id;
    const { reason } = req.body; // Rejection reason (required)

    if (!reason) {
      res.status(400).json({ msg: 'Rejection reason is required' });
      return;
    }

    // Find book
    const book = await BookQueries.findById(bookId);
    if (!book) {
      res.status(404).json({ msg: 'Book not found' });
      return;
    }

    // Check if already rejected
    if (book.status === 'rejected') {
      res.status(400).json({ msg: 'Book is already rejected' });
      return;
    }

    // Update book status
    const updatedBook = await BookQueries.update(bookId, { status: 'rejected' });

    // Log admin action
    await LoggingService.logActivity(req.user.id, 'ADMIN_REJECT_BOOK', {
      bookId,
      bookTitle: book.title,
      reason,
      ipAddress: (req.headers['x-forwarded-for'] as string)?.split(',')[0] || req.connection.remoteAddress as string,
    } as any);

    res.json({
      msg: 'Book rejected successfully',
      book: updatedBook
    });
  } catch (err) {
    console.error((err as Error).message);
    res.status(500).json({ msg: 'Server error' });
  }
});

/**
 * DELETE /api/admin/books/:id
 * Delete a book and its associated files
 */
router.delete('/books/:id', adminMiddleware(), async (req: Request, res: Response): Promise<void> => {
  try {
    const bookId = req.params.id;

    // Find book
    const book = await BookQueries.findById(bookId);
    if (!book) {
      res.status(404).json({ msg: 'Book not found' });
      return;
    }

    // Delete associated files from storage
    try {
      if (book.cover_image) {
        await deleteFile('book-covers', book.cover_image);
      }
      if (book.ebook_file) {
        await deleteFile('ebooks', book.ebook_file);
      }
    } catch (storageErr) {
      console.error('Error deleting book files:', storageErr);
      // Continue with database deletion even if files fail
    }

    // Delete book from database
    await BookQueries.delete(bookId);

    // Log admin action
    await LoggingService.logActivity(req.user.id, 'ADMIN_DELETE_BOOK', {
      bookId,
      bookTitle: book.title,
      author: book.author,
      ipAddress: (req.headers['x-forwarded-for'] as string)?.split(',')[0] || req.connection.remoteAddress as string,
    } as any);

    res.json({ msg: 'Book deleted successfully' });
  } catch (err) {
    console.error((err as Error).message);
    res.status(500).json({ msg: 'Server error' });
  }
});

// ==================== USER MANAGEMENT ====================

/**
 * PATCH /api/admin/users/:id/role
 * Change user role (promote/demote users)
 */
router.patch('/users/:id/role', adminMiddleware(), async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.params.id;
    const { role } = req.body;

    // Validate role
    if (!['user', 'admin'].includes(role)) {
      res.status(400).json({ msg: 'Invalid role. Must be "user" or "admin"' });
      return;
    }

    // Prevent demoting self
    if (userId === req.user.id && role !== 'admin') {
      res.status(400).json({ msg: 'Cannot demote yourself from admin role' });
      return;
    }

    // Find user
    const user = await UserQueries.findById(userId);
    if (!user) {
      res.status(404).json({ msg: 'User not found' });
      return;
    }

    // Update user role
    const updatedUser = await UserQueries.update(userId, { role });

    // Log admin action
    await LoggingService.logActivity(req.user.id, 'ADMIN_CHANGE_USER_ROLE', {
      targetUserId: userId,
      targetUsername: user.username,
      newRole: role,
      previousRole: user.role,
      ipAddress: (req.headers['x-forwarded-for'] as string)?.split(',')[0] || req.connection.remoteAddress as string,
    } as any);

    res.json({
      msg: 'User role updated successfully',
      user: {
        id: updatedUser.id,
        username: updatedUser.username,
        email: updatedUser.email,
        role: updatedUser.role
      }
    });
  } catch (err) {
    console.error((err as Error).message);
    res.status(500).json({ msg: 'Server error' });
  }
});

// ==================== ANALYTICS & STATISTICS ====================

/**
 * GET /api/admin/stats
 * Get dashboard statistics
 */
router.get('/stats', adminMiddleware(), async (req: Request, res: Response): Promise<void> => {
  try {
    // Get books statistics
    const { total: totalApproved } = await BookQueries.getAll(1, 1000, { status: 'approved' });
    const { total: totalPending } = await BookQueries.getAll(1, 1000, { status: 'pending' });
    const { total: totalRejected } = await BookQueries.getAll(1, 1000, { status: 'rejected' });

    // Log admin action
    await LoggingService.logActivity(req.user.id, 'ADMIN_VIEW_STATS', {
      ipAddress: (req.headers['x-forwarded-for'] as string)?.split(',')[0] || req.connection.remoteAddress as string,
    });

    res.json({
      stats: {
        books: {
          approved: totalApproved || 0,
          pending: totalPending || 0,
          rejected: totalRejected || 0,
          total: (totalApproved || 0) + (totalPending || 0) + (totalRejected || 0)
        },
        lastUpdated: new Date().toISOString()
      }
    });
  } catch (err) {
    console.error((err as Error).message);
    res.status(500).json({ msg: 'Server error' });
  }
});

export default router;
