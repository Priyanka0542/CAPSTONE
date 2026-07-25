const router = require('express').Router();
const authController = require('../controllers/authController');
const { validate } = require('../middleware/validate');
const { authLimiter } = require('../middleware/rateLimiter');
const auth = require('../middleware/auth');
const {
  signupSchema,
  loginSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
} = require('../validators/authValidators');

// Rate limit all auth routes
router.use(authLimiter);

router.post('/signup', validate(signupSchema), authController.signup);
router.post('/login', validate(loginSchema), authController.login);
router.post('/refresh', authController.refresh);
router.post('/logout', authController.logout);
router.post('/forgot-password', validate(forgotPasswordSchema), authController.forgotPassword);
router.post('/reset-password', validate(resetPasswordSchema), authController.resetPassword);
router.get('/me', auth, authController.getMe);

module.exports = router;
