require("dotenv").config();
const express = require("express");
const cors = require("cors");
const path = require("path");

// Validate environment variables
const requiredEnvVars = ['SUPABASE_URL', 'SUPABASE_SERVICE_ROLE_KEY', 'JWT_SECRET'];
const missingEnvVars = requiredEnvVars.filter(envVar => !process.env[envVar]);
if (missingEnvVars.length > 0) {
  console.error(`Missing required environment variables: ${missingEnvVars.join(', ')}`);
  process.exit(1);
}

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(require("./middleware/activityLogger"));

// Initialize Supabase and ensure buckets exist
const { ensureBucketsExist } = require('./services/storageService');
const { supabase } = require('./db/queries');

// Start server after Supabase is properly initialized
async function initializeApp() {
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

function startServer() {

  // Routes
  app.use("/api/auth", require("./routes/auth"));
  app.use("/api/users", require("./routes/users"));
  app.use("/api/books", require("./routes/books"));
  app.use("/api/favorites", require("./routes/favorites"));
  app.use("/api/reviews", require("./routes/reviews"));
  app.use("/api/analytics", require("./routes/analytics"));
  app.use("/api/contributions", require("./routes/contributions"));
  app.use("/api", require("./routes/translation"));

  // Health check endpoint
  app.get('/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  // Error handling middleware
  app.use((err, req, res, next) => {
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
