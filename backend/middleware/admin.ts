import { Request, Response, NextFunction } from 'express';
import authMiddleware from './auth';
import LoggingService from '../services/loggingService';

/**
 * Admin authorization middleware
 * Ensures user is authenticated AND has admin role
 */
export default function adminMiddleware() {
  return function(req: Request, res: Response, next: NextFunction): void {
    // First apply auth middleware
    authMiddleware(true)(req, res, () => {
      // Check if user has admin role
      if (!req.user || req.user.role !== 'admin') {
        // Log unauthorized admin access attempt
        try {
          if (req.user?.id) {
            LoggingService.logActivity(req.user.id, 'ADMIN_ACCESS_DENIED', {
              ipAddress: (req.headers['x-forwarded-for'] as string)?.split(',')[0] || req.connection.remoteAddress as string,
              endpoint: req.path,
              method: req.method,
              userRole: req.user.role,
            } as any).catch(err => console.error('Error logging admin access denial:', err));
          }
        } catch (logErr) {
          console.error('Error logging admin access denial:', logErr);
        }

        res.status(403).json({ msg: 'Access denied. Admin privileges required.' });
        return;
      }

      // User is authenticated and is admin
      next();
    });
  };
}
