import 'dotenv/config';
import express, { Express, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import rateLimit from 'express-rate-limit';

// Validate environment variables
const requiredEnvVars = ['SUPABASE_URL', 'SUPABASE_SERVICE_ROLE_KEY', 'JWT_SECRET'];
const missingEnvVars = requiredEnvVars.filter(envVar => !process.env[envVar]);
if (missingEnvVars.length > 0) {
  console.error(`Missing required environment variables: ${missingEnvVars.join(', ')}`);
  process.exit(1);
}

const app: Express = express();

// CORS — allow origins from env variable.
// In development, fall back to the default Vite dev server origin.
// In production, CORS_ORIGIN must be set to avoid permissive access.
if (process.env.NODE_ENV === 'production' && !process.env.CORS_ORIGIN) {
  console.error(
    'CORS_ORIGIN environment variable is not set in production. ' +
    'Set it to a comma-separated list of allowed origins, e.g.: ' +
    'CORS_ORIGIN=https://your-app.vercel.app,https://your-custom-domain.com'
  );
  process.exit(1);
}

const corsOrigins = process.env.CORS_ORIGIN
  ? process.env.CORS_ORIGIN.split(',').map((o) => o.trim())
  : ['http://localhost:5173'];

// Middleware
app.use(cors({ origin: corsOrigins, credentials: true }));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));
app.use('/api', rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false
}));

// Import activity logger
import activityLogger from './middleware/activityLogger';
app.use(activityLogger);

// Initialize Supabase and ensure buckets exist
import supabase from './db/supabase';
import { ensureBucketsExist } from './services/storageService';

// Import routes
import authRoutes from './routes/auth';
import githubRoutes from './routes/github';
import usersRoutes from './routes/users';
import booksRoutes from './routes/books';
import favoritesRoutes from './routes/favorites';
import reviewsRoutes from './routes/reviews';
import analyticsRoutes from './routes/analytics';
import contributionsRoutes from './routes/contributions';
import translationRoutes from './routes/translation';
import adminRoutes from './routes/admin';

// Start server after Supabase is properly initialized
async function initializeApp(): Promise<void> {
  try {
    // Verify Supabase connection
    await supabase.auth.getSession();
    console.log('✓ Supabase connected successfully');
    
    // Ensure storage buckets exist and are ready
    await ensureBucketsExist();
    console.log('✓ Storage buckets verified and ready');
    
    // Start the server
    startServer();
  } catch (err) {
    console.error('Fatal error during initialization:', err);
    process.exit(1);
  }
}

function startServer(): void {
  // Routes
  app.use('/api/auth', authRoutes);
  app.use('/api/oauth/github', githubRoutes);
  app.use('/api/users', usersRoutes);
  app.use('/api/books', booksRoutes);
  app.use('/api/favorites', favoritesRoutes);
  app.use('/api/reviews', reviewsRoutes);
  app.use('/api/analytics', analyticsRoutes);
  app.use('/api/contributions', contributionsRoutes);
  app.use('/api', translationRoutes);
  app.use('/api/admin', adminRoutes);

  // Health check endpoint
  app.get('/health', (_req: Request, res: Response) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  // Error handling middleware
  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    console.error(err.stack);
    res.status(err.status || 500).json({ 
      error: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong!'
    });
  });

  const PORT = process.env.PORT || 8080;

  app.listen(PORT, () => console.log(`✓ Server running on port ${PORT}`));
}

// Initialize app on startup
initializeApp();

export default app;
