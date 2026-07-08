const express = require('express');
const { body } = require('express-validator');
const rateLimit = require('express-rate-limit');
const validate = require('../middleware/validate');
const { protect } = require('../middleware/auth');
const {
  register, login, refresh, logout,
  forgotPassword, resetPassword, verifyEmail, getMe,
} = require('../controllers/authController');

const router = express.Router();

const authLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 20 });

router.post(
  '/register',
  authLimiter,
  [
    body('name').trim().notEmpty().withMessage('Name is required'),
    body('email').isEmail().withMessage('Valid email is required'),
    body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters'),
  ],
  validate,
  register
);

router.post(
  '/login',
  authLimiter,
  [body('email').isEmail(), body('password').notEmpty()],
  validate,
  login
);

router.post('/refresh', refresh);
router.post('/logout', logout);
router.post('/forgot-password', authLimiter, [body('email').isEmail()], validate, forgotPassword);
router.post(
  '/reset-password/:token',
  [body('password').isLength({ min: 8 })],
  validate,
  resetPassword
);
router.post('/verify-email/:token', verifyEmail);
router.get('/me', protect, getMe);

module.exports = router;
