import express, { Request, Response, Router } from 'express';
import axios from 'axios';
import jwt from 'jsonwebtoken';
import { UserQueries } from '../db/queries';
import LoggingService from '../services/loggingService';
import { v4 as uuidv4 } from 'uuid';

const router: Router = express.Router();

// GitHub OAuth configuration
const GITHUB_CLIENT_ID = process.env.GITHUB_CLIENT_ID;
const GITHUB_CLIENT_SECRET = process.env.GITHUB_CLIENT_SECRET;
const GITHUB_REDIRECT_URI = process.env.GITHUB_REDIRECT_URI || 'http://localhost:5173/oauth/github/callback';

// Step 1: Redirect user to GitHub for authorization
router.get('/authorize', (_req: Request, res: Response): void => {
  if (!GITHUB_CLIENT_ID) {
    res.status(500).json({ msg: 'GitHub OAuth not configured' });
    return;
  }

  const githubAuthUrl = `https://github.com/login/oauth/authorize?client_id=${GITHUB_CLIENT_ID}&redirect_uri=${encodeURIComponent(GITHUB_REDIRECT_URI)}&scope=user:email`;
  res.json({ authUrl: githubAuthUrl });
});

// Debug: Check OAuth config
router.get('/debug', (_req: Request, res: Response): void => {
  res.json({
    GITHUB_CLIENT_ID: GITHUB_CLIENT_ID ? GITHUB_CLIENT_ID.substring(0, 10) + '...' : 'NOT SET',
    GITHUB_CLIENT_SECRET: GITHUB_CLIENT_SECRET ? 'SET' : 'NOT SET',
    GITHUB_REDIRECT_URI: GITHUB_REDIRECT_URI,
    authUrl: `https://github.com/login/oauth/authorize?client_id=${GITHUB_CLIENT_ID}&redirect_uri=${encodeURIComponent(GITHUB_REDIRECT_URI)}&scope=user:email`
  });
});

// Step 2: Handle GitHub callback
router.post('/callback', async (req: Request, res: Response): Promise<void> => {
  try {
    const { code } = req.body;

    if (!code) {
      res.status(400).json({ msg: 'Authorization code is required' });
      return;
    }

    if (!GITHUB_CLIENT_ID || !GITHUB_CLIENT_SECRET) {
      res.status(500).json({ msg: 'GitHub OAuth not configured. Missing CLIENT_ID or CLIENT_SECRET.' });
      return;
    }

    // Exchange code for access token
    let tokenResponse;
    try {
      tokenResponse = await axios.post(
        'https://github.com/login/oauth/access_token',
        {
          client_id: GITHUB_CLIENT_ID,
          client_secret: GITHUB_CLIENT_SECRET,
          code,
          redirect_uri: GITHUB_REDIRECT_URI,
        },
        {
          headers: {
            Accept: 'application/json',
          },
        }
      );
    } catch (tokenErr: any) {
      console.error('GitHub token exchange error:', tokenErr.response?.data || tokenErr.message);
      res.status(401).json({ 
        msg: 'Failed to exchange authorization code for access token',
        details: tokenErr.response?.data?.error_description || tokenErr.message
      });
      return;
    }

    const { access_token, error, error_description } = tokenResponse.data;

    if (error || !access_token) {
      console.error('GitHub token error:', { error, error_description, response: tokenResponse.data });
      res.status(401).json({ 
        msg: 'Failed to get GitHub access token', 
        error,
        details: error_description || 'No access token returned'
      });
      return;
    }

    // Get user profile from GitHub
    let userResponse;
    try {
      userResponse = await axios.get('https://api.github.com/user', {
        headers: {
          Authorization: `token ${access_token}`,
          Accept: 'application/vnd.github.v3+json',
        },
      });
    } catch (userErr: any) {
      console.error('GitHub user fetch error:', {
        status: userErr.response?.status,
        data: userErr.response?.data,
        message: userErr.message
      });
      res.status(401).json({ 
        msg: 'Failed to fetch GitHub user profile',
        details: userErr.response?.data?.message || userErr.message
      });
      return;
    }

    const githubUser = userResponse.data;

    // Get user email from GitHub
    let userEmail = githubUser.email;
    if (!userEmail) {
      const emailResponse = await axios.get('https://api.github.com/user/emails', {
        headers: {
          Authorization: `Bearer ${access_token}`,
          Accept: 'application/vnd.github.v3+json',
        },
      });

      const primaryEmail = emailResponse.data.find((e: any) => e.primary);
      userEmail = primaryEmail?.email || `${githubUser.login}@github.local`;
    }

    // Create or update user
    const user = await UserQueries.createOrUpdateOAuthUser({
      username: githubUser.login,
      email: userEmail,
      github_id: githubUser.id.toString(),
      github_username: githubUser.login,
      profile_picture: githubUser.avatar_url,
    });

    // Generate JWT token
    const payload = { user: { id: user.id, role: user.role || 'user' } };
    jwt.sign(
      payload,
      process.env.JWT_SECRET || '',
      { expiresIn: '1h' },
      async (err: any, token: any) => {
        if (err) {
          res.status(500).json({ msg: 'Failed to generate token' });
          return;
        }

        // Log login activity
        try {
          await LoggingService.logActivity(user.id!, 'LOGIN', {
            sessionId: uuidv4(),
            ipAddress: (req.headers['x-forwarded-for'] as string)?.split(',')[0] || req.connection.remoteAddress as string,
            userAgent: req.headers['user-agent'] as string,
            deviceType: /mobile/i.test(req.headers['user-agent'] || '') ? 'MOBILE' : 'WEB',
            oauthProvider: 'github',
          } as any);
        } catch (logErr) {
          console.error('Error logging GitHub login activity:', logErr);
        }

        res.json({
          token,
          userId: user.id,
          role: user.role || 'user',
          user: {
            id: user.id,
            username: user.username,
            email: user.email,
            profile_picture: user.profile_picture,
            role: user.role || 'user',
          },
        });
      }
    );
  } catch (err) {
    console.error('GitHub OAuth callback error:', err);
    res.status(500).json({ msg: 'OAuth callback failed', error: (err as Error).message });
  }
});

export default router;
