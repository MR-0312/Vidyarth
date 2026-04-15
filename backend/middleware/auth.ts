import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import tokenBlacklist from '../services/tokenBlacklist';

// Extend Express Request with user property
declare global {
  namespace Express {
    interface Request {
      user?: any;
      token?: string;
    }
  }
}

/**
 * Authentication middleware (flexible)
 * @param {boolean} isRequired - If true, requires valid token; if false, token is optional
 * @returns {function} Express middleware function
 */
export default function authMiddleware(isRequired: boolean = true) {
  return function(req: Request, res: Response, next: NextFunction): void {
    // Get token from header
    const token = req.header('x-auth-token');

    // Check if no token
    if (!token) {
      if (isRequired) {
        res.status(401).json({ msg: 'No token, authorization denied' });
        return;
      }
      // Optional auth: continue without token
      next();
      return;
    }

    // Check if token is blacklisted (revoked)
    if (tokenBlacklist.isBlacklisted(token)) {
      if (isRequired) {
        res.status(401).json({ msg: 'Token has been revoked. Please login again.' });
        return;
      }
      // Optional auth: treat blacklisted token as no token
      console.warn('Blacklisted token attempted to be used');
      next();
      return;
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || '') as any;
      req.user = decoded.user;
      req.token = token; // Store token for use in logout
      next();
    } catch (err) {
      if (isRequired) {
        res.status(401).json({ msg: 'Token is not valid' });
        return;
      }
      // Optional auth: invalid token, continue anyway
      console.warn('Invalid token provided:', (err as Error).message);
      next();
    }
  };
}
