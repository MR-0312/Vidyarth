import express, { Request, Response, Router } from 'express';
import authMiddleware from '../middleware/auth';
import LoggingService from '../services/loggingService';

const router: Router = express.Router();

/**
 * GET /api/analytics/activities
 * Get paginated user activities
 */
router.get('/activities', authMiddleware(), async (req: Request, res: Response): Promise<void> => {
  try {
    const activities = await LoggingService.getUserActivities(req.user.id, 50);

    res.json({
      success: true,
      data: activities,
    });
  } catch (error) {
    res.status(500).json({ success: false, error: (error as Error).message });
  }
});

/**
 * GET /api/analytics/dashboard
 * Get complete analytics dashboard summary
 */
router.get('/dashboard', authMiddleware(), async (req: Request, res: Response): Promise<void> => {
  try {
    const activities = await LoggingService.getUserActivities(req.user.id, 50);

    res.json({
      success: true,
      data: {
        recentActivities: activities,
        totalActivities: activities.length,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, error: (error as Error).message });
  }
});

export default router;
