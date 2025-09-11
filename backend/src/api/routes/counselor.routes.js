const express = require('express');
const router = express.Router();
const { 
  getCounselors,
  getCounselor,
  getCounselorAvailability,
  getSpecializations,
  updateProfile,
  getCounselorDashboard
} = require('../controllers/counselor.controller');
const { authenticate, optionalAuth } = require('../middlewares/auth.middleware');
const { requireCounselor } = require('../middlewares/role.middleware');

// Public routes
router.get('/', optionalAuth, getCounselors);
router.get('/specializations', getSpecializations);
router.get('/:id', optionalAuth, getCounselor);
router.get('/:id/availability', optionalAuth, getCounselorAvailability);

// Counselor-only routes
router.use(authenticate);
router.use(requireCounselor);

router.get('/dashboard/data', getCounselorDashboard);
router.put('/profile', updateProfile);

module.exports = router;
