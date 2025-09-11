const express = require('express');
const router = express.Router();
const { 
  getAppSettings,
  updateAppSettings,
  getFeatureFlags,
  updateFeatureFlags,
  getEmergencyContacts,
  updateEmergencyContacts,
  setMaintenanceMode,
  getSystemHealth
} = require('../controllers/config.controller');
const { authenticate, optionalAuth } = require('../middlewares/auth.middleware');
const { requireAdmin } = require('../middlewares/role.middleware');

// Public routes (only public settings)
router.get('/app-settings', optionalAuth, getAppSettings);
router.get('/features', getFeatureFlags);
router.get('/emergency-contacts', getEmergencyContacts);
router.get('/health', getSystemHealth);

// Admin only routes
router.use(authenticate);
router.use(requireAdmin);

router.put('/app-settings', updateAppSettings);
router.put('/features', updateFeatureFlags);
router.put('/emergency-contacts', updateEmergencyContacts);
router.put('/maintenance', setMaintenanceMode);

module.exports = router;
