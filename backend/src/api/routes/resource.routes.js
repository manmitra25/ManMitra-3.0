const express = require('express');
const router = express.Router();
const { 
  getResources, 
  getResource, 
  getCategories, 
  addToFavorites, 
  trackUsage,
  getFeaturedResources 
} = require('../controllers/resource.controller');
const { authenticate, optionalAuth } = require('../middlewares/auth.middleware');

// Public routes
router.get('/', optionalAuth, getResources);
router.get('/categories', getCategories);
router.get('/featured', getFeaturedResources);
router.get('/:id', optionalAuth, getResource);

// Protected routes (require authentication)
router.use(authenticate);

router.post('/favorite', addToFavorites);
router.post('/track-usage', trackUsage);

module.exports = router;
