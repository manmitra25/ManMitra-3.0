const express = require('express');
const router = express.Router();
const { 
  detectCrisis,
  getCrisisAlerts,
  handleCrisisAlert,
  escalateCrisis,
  getCrisisResources,
  createCrisisAlert
} = require('../controllers/crisis.controller');
const { authenticate, optionalAuth } = require('../middlewares/auth.middleware');
const { requireAdmin, requireCounselor, requireAdminOrCounselor } = require('../middlewares/role.middleware');

// Public routes
router.get('/resources', getCrisisResources);

// Protected routes
router.use(authenticate);

// Crisis detection (can be called by any authenticated user)
router.post('/detect', detectCrisis);

// Admin and counselor routes
router.get('/alerts', requireAdminOrCounselor, getCrisisAlerts);
router.put('/alerts/:alertId/handle', requireAdminOrCounselor, handleCrisisAlert);
router.put('/alerts/:alertId/escalate', requireAdminOrCounselor, escalateCrisis);

// Admin only routes
router.post('/alerts', requireAdmin, createCrisisAlert);

module.exports = router;
