const express = require('express');
const router = express.Router();
const {
  signup,
  login,
  adminLogin,
  refreshToken,
  logout,
  getProfile,
  updateProfile
} = require('../controllers/auth.controller');
const { authenticate, authRateLimit } = require('../middlewares/auth.middleware');

// Public routes (no authentication required)
router.post('/signup', authRateLimit(3, 15 * 60 * 1000), signup); // 3 attempts per 15 minutes
router.post('/login', authRateLimit(5, 15 * 60 * 1000), login); // 5 attempts per 15 minutes
router.post('/admin/login', authRateLimit(5, 15 * 60 * 1000), adminLogin); // 5 attempts per 15 minutes
router.post('/refresh', refreshToken);

// Protected routes (authentication required)
router.post('/logout', authenticate, logout);
router.get('/profile', authenticate, getProfile);
router.put('/profile', authenticate, updateProfile);

module.exports = router;
