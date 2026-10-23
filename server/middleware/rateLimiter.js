const rateLimit = require('express-rate-limit');

// Rate limiter for credential/auth endpoints (login, signup, password reset)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20, // 20 requests per window
  handler: (req, res) => {
    const retryAfter = req.rateLimit ? Math.ceil((req.rateLimit.resetTime - Date.now()) / 1000) : 900;
    res.status(429).json({
      message: 'Too many attempts. Please wait before trying again.',
      retryAfter: Math.max(1, retryAfter),
    });
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Dedicated limiter for token refresh (prevents session refresh starvation during normal testing)
const refreshLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 60, // 60 requests per window
  handler: (req, res) => {
    const retryAfter = req.rateLimit ? Math.ceil((req.rateLimit.resetTime - Date.now()) / 1000) : 900;
    res.status(429).json({
      message: 'Too many attempts. Please wait before trying again.',
      retryAfter: Math.max(1, retryAfter),
    });
  },
  standardHeaders: true,
  legacyHeaders: false,
});

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: {
    message: 'Too many requests, please try again later.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

module.exports = { authLimiter, refreshLimiter, apiLimiter };

