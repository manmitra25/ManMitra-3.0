const express = require('express');
const router = express.Router();
const { 
  getOverviewStats,
  getUsageTrends,
  getMoodTrends,
  getCounselorStats,
  getCrisisStats,
  exportAnalytics
} = require('../controllers/analytics.controller');
const { authenticate } = require('../middlewares/auth.middleware');
const { requireAdmin } = require('../middlewares/role.middleware');

// All analytics routes require admin authentication
router.use(authenticate);
router.use(requireAdmin);

// Analytics endpoints
router.get('/overview', getOverviewStats);
router.get('/usage-trends', getUsageTrends);
router.get('/mood-trends', getMoodTrends);
router.get('/counselor-stats', getCounselorStats);
router.get('/crisis-stats', getCrisisStats);
router.post('/export', exportAnalytics);

module.exports = router;
