const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const connectDB = require('./config/db');
const env = require('./config/env');
const errorHandler = require('./middleware/errorHandler');
const { apiLimiter } = require('./middleware/rateLimiter');

// Route imports
const authRoutes = require('./routes/auth');
const pathRoutes = require('./routes/paths');
const activityRoutes = require('./routes/activity');
const communityRoutes = require('./routes/community');

const app = express();

// Security
app.use(helmet());
app.use(cors({
  origin: env.CLIENT_URL,
  credentials: true,
}));

// Body parsing
app.use(express.json({ limit: '10kb' }));
app.use(cookieParser());

// General rate limit
app.use('/api', apiLimiter);

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
  app.listen(env.PORT, () => {
    console.log(`🚀 FutureEra server running on port ${env.PORT} (${env.NODE_ENV})`);
  });
};

start();
