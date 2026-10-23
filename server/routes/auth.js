const router = require('express').Router();
const authController = require('../controllers/authController');
const { validate } = require('../middleware/validate');
const { authLimiter, refreshLimiter } = require('../middleware/rateLimiter');
const auth = require('../middleware/auth');
const {
  signupSchema,
  loginSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
} = require('../validators/authValidators');

// Credential endpoints protected by authLimiter against brute-force attacks
router.post('/signup', authLimiter, validate(signupSchema), authController.signup);
router.post('/login', authLimiter, validate(loginSchema), authController.login);
router.post('/forgot-password', authLimiter, validate(forgotPasswordSchema), authController.forgotPassword);
router.post('/reset-password', authLimiter, validate(resetPasswordSchema), authController.resetPassword);

// Token refresh protected by refreshLimiter
router.post('/refresh', refreshLimiter, authController.refresh);

// Session termination and profile access (not brute-force targets)
router.post('/logout', authController.logout);
router.get('/me', auth, authController.getMe);

module.exports = router;

