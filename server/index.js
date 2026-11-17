const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const connectDB = require('./config/db');
const env = require('./config/env');
const errorHandler = require('./middleware/errorHandler');
const { apiLimiter } = require('./middleware/rateLimiter');
const { migrateCanonicalSlugs } = require('./utils/migrateSlugs');

// Route imports
const authRoutes = require('./routes/auth');
const pathRoutes = require('./routes/paths');
const activityRoutes = require('./routes/activity');
const communityRoutes = require('./routes/community');

const app = express();

// Security
app.use(helmet());
app.use(cors({
  origin: (origin, callback) => {
    const list = [
      'https://futureera.vercel.app',
      'http://localhost:5173',
      'http://localhost:3000',
      'http://127.0.0.1:5173',
    ];
    if (process.env.CLIENT_URL) {
      process.env.CLIENT_URL.split(',').forEach((u) => {
        const t = u.trim();
        if (t && !list.includes(t)) list.push(t);
      });
    }
    if (!origin || list.includes(origin)) {
      return callback(null, true);
    }
    return callback(new Error(`Origin ${origin} not allowed by CORS`));
  },
  credentials: true,
}));

// Body parsing
app.use(express.json({ limit: '10kb' }));
app.use(cookieParser());

// General rate limit
//app.use('/api', apiLimiter);

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/paths', pathRoutes);
app.use('/api/activity', activityRoutes);
app.use('/api/community', communityRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ message: 'Route not found.' });
});

// Centralized error handler
app.use(errorHandler);

// Start server
const start = async () => {
  await connectDB();
  try {
    await migrateCanonicalSlugs();
  } catch (err) {
    console.warn('[Server Startup] Warning during canonical slug migration:', err.message);
  }
  app.listen(env.PORT, () => {
    console.log(`🚀 FutureEra server running on port ${env.PORT} (${env.NODE_ENV})`);
  });
};

start();
