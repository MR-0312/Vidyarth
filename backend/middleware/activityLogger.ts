import { Request, Response, NextFunction } from 'express';
import { v4 as uuidv4 } from 'uuid';
import LoggingService from '../services/loggingService';

// Extend Express Request with logger and session properties
declare global {
  namespace Express {
    interface Request {
      logger?: LoggerData;
      session: { id: string };
    }
  }
}

interface LoggerData {
  sessionId: string;
  ipAddress: string;
  userAgent: string;
  deviceType: string;
  userId: string | null;
  logActivity: (activityType: string, metadata?: Record<string, any>) => Promise<void>;
}

/**
 * Activity Logger Middleware
 * Auto-captures HTTP requests and logs them as user activities
 */
const activityLogger = async (req: Request, _res: Response, next: NextFunction): Promise<void> => {
  try {
    // Generate or retrieve session ID
    if (!req.session) {
      req.session = {} as any;
    }
    if (!req.session!.id) {
      req.session!.id = uuidv4();
    }

    // Extract device type from User-Agent
    const userAgent = req.headers['user-agent'] || '';
    let deviceType = 'WEB';
    if (/mobile/i.test(userAgent)) {
      deviceType = 'MOBILE';
    } else if (/tablet|ipad/i.test(userAgent)) {
      deviceType = 'TABLET';
    }

    // Extract IP address
    const ipAddress =
      (req.headers['x-forwarded-for'] as string)?.split(',')[0] ||
      req.connection.remoteAddress ||
      'unknown';

    // Store in request for route handlers to use
    req.logger = {
      sessionId: req.session!.id,
      ipAddress,
      userAgent,
      deviceType,
      userId: (req as any).user?.id || null,
      // Helper method to log activities
      logActivity: async (activityType: string, metadata: Record<string, any> = {}) => {
        if (!(req as any).user?.id) return;

        await LoggingService.logActivity((req as any).user.id, activityType, {
          ...metadata,
          sessionId: req.session!.id,
          ipAddress,
          userAgent,
          deviceType,
        });
      },
    };

    next();
  } catch (error) {
    console.error('Error in activity logger middleware:', error);
    next();
  }
};

export default activityLogger;
