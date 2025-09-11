const express = require('express');
const router = express.Router();
const {
  createPost,
  getPosts,
  getPost,
  createComment,
  togglePostLike,
  moderatePost
} = require('../controllers/forum.controller');
const { authenticate, optionalAuth } = require('../middlewares/auth.middleware');
const { requireStudentOrCounselor } = require('../middlewares/role.middleware');

// Public routes (no authentication required for reading)
router.get('/posts', optionalAuth, getPosts);
router.get('/posts/:id', optionalAuth, getPost);

// Protected routes (authentication required)
router.use(authenticate);

// Post management routes
router.post('/posts', requireStudentOrCounselor, createPost);
router.post('/posts/:id/like', requireStudentOrCounselor, togglePostLike);

// Comment routes
router.post('/comments', requireStudentOrCounselor, createComment);

// Moderation routes (admin/counselor only)
router.put('/posts/:id/moderate', moderatePost);

module.exports = router;
