import express, { Request, Response, Router } from 'express';
import jwt from 'jsonwebtoken';
import { UserQueries } from '../db/queries';
import authMiddleware from '../middleware/auth';
import LoggingService from '../services/loggingService';
import { v4 as uuidv4 } from 'uuid';

const router: Router = express.Router();

router.post('/register', async (req: Request, res: Response): Promise<void> => {
  try {
    const { username, email, password } = req.body;
    
    // Check if user already exists
    const existingUser = await UserQueries.findByEmail(email);
    if (existingUser) {
      res.status(400).json({ msg: 'User already exists' });
      return;
    }

    // Create new user
    const user = await UserQueries.create({ username, email, password });

    const payload = { user: { id: user.id } };
    jwt.sign(payload, process.env.JWT_SECRET || '', { expiresIn: '1h' }, (err: any, token: any) => {
      if (err) throw err;
      res.json({ token, userId: user.id });
    });
  } catch (err) {
    console.error((err as Error).message);
    res.status(500).json({ msg: 'Server error' });
  }
});

router.post('/login', async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;
    
    // Find user by email
    const user = await UserQueries.findByEmail(email);
    if (!user) {
      res.status(400).json({ msg: 'Invalid credentials' });
      return;
    }

    // Compare password
    const isMatch = await UserQueries.comparePassword(user.id!, password);
    if (!isMatch) {
      res.status(400).json({ msg: 'Invalid credentials' });
      return;
    }

    const payload = { user: { id: user.id } };
    jwt.sign(payload, process.env.JWT_SECRET || '', { expiresIn: '1h' }, async (err: any, token: any) => {
      if (err) throw err;
      
      // Log login activity
      try {
        await LoggingService.logActivity(user.id!, 'LOGIN', {
          sessionId: uuidv4(),
          ipAddress: (req.headers['x-forwarded-for'] as string)?.split(',')[0] || req.connection.remoteAddress as string,
          userAgent: req.headers['user-agent'] as string,
          deviceType: /mobile/i.test(req.headers['user-agent'] || '') ? 'MOBILE' : 'WEB',
        });
      } catch (logErr) {
        console.error('Error logging login activity:', logErr);
      }
      
      res.json({ token, userId: user.id });
    });
  } catch (err) {
    console.error((err as Error).message);
    res.status(500).json({ msg: 'Server error' });
  }
});

router.get('/user', authMiddleware(), async (req: Request, res: Response): Promise<void> => {
  try {
    const user = await UserQueries.getUserProfile(req.user.id);
    if (!user) {
      res.status(404).json({ msg: 'User not found' });
      return;
    }
    res.json(user);
  } catch (err) {
    console.error((err as Error).message);
    res.status(500).json({ msg: 'Server error' });
  }
});

export default router;
