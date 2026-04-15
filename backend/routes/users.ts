import express, { Request, Response, Router } from 'express';
import { check, validationResult } from 'express-validator';
import authMiddleware from '../middleware/auth';
import upload from '../middleware/upload';
import { UserQueries } from '../db/queries';
import { uploadFile, deleteFile } from '../services/storageService';
import LoggingService from '../services/loggingService';
import tokenBlacklist from '../services/tokenBlacklist';

const router: Router = express.Router();

// @route   GET api/users/me
// @desc    Get current user
// @access  Private
router.get('/me', authMiddleware(), async (req: Request, res: Response): Promise<void> => {
  try {
    const user = await UserQueries.getUserProfile(req.user.id);
    res.json(user);
  } catch (err) {
    console.error((err as Error).message);
    res.status(500).json({ msg: 'Server Error' });
  }
});

// @route   GET api/users/:userId
// @desc    Get user profile by ID
// @access  Public
router.get('/:userId', async (req: Request, res: Response): Promise<void> => {
  try {
    const user = await UserQueries.getUserProfile(req.params.userId);
    if (!user) {
      res.status(404).json({ msg: 'User not found' });
      return;
    }
    res.json(user);
  } catch (err) {
    console.error((err as Error).message);
    res.status(500).json({ msg: 'Server Error' });
  }
});

// @route   PUT api/users/profile
// @desc    Update user profile
// @access  Private
router.put(
  '/profile',
  authMiddleware(),
  upload.single('profilePicture'),
  [
    check('bio', 'Bio is required').not().isEmpty(),
    check('preferredCategories', 'Preferred categories must be an array').isArray()
  ],
  async (req: Request, res: Response): Promise<void> => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ errors: errors.array() });
      return;
    }

    const { bio, preferredCategories } = req.body;

    try {
      let user = await UserQueries.findById(req.user.id);

      if (!user) {
        res.status(404).json({ msg: 'User not found' });
        return;
      }

      const updateData: any = {
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
          ipAddress: (req.headers['x-forwarded-for'] as string)?.split(',')[0] || req.connection.remoteAddress as string,
          userAgent: req.headers['user-agent'] as string,
        });
      } catch (logErr) {
        console.error('Error logging profile update:', logErr);
      }

      res.json(updatedUser);
    } catch (err) {
      console.error((err as Error).message);
      res.status(500).json({ msg: 'Server Error' });
    }
  }
);

// @route   POST api/users/logout
// @desc    Logout user (revoke token)
// @access  Private
router.post('/logout', authMiddleware(), async (req: Request, res: Response): Promise<void> => {
  try {
    if (req.token) {
      tokenBlacklist.addToBlacklist(req.token, 3600); // Token valid for 1 hour
    }
    res.json({ msg: 'Logged out successfully' });
  } catch (err) {
    console.error((err as Error).message);
    res.status(500).json({ msg: 'Server Error' });
  }
});

export default router;
