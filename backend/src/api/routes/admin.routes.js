const express = require('express');
const router = express.Router();
const {
  createCounselor,
  getCounselors,
  getCounselor,
  updateCounselor,
  deleteCounselor,
  getAnalytics,
  getColleges
} = require('../controllers/admin.controller');
const { authenticate } = require('../middlewares/auth.middleware');
const { requireAdmin, requireSuperAdmin } = require('../middlewares/role.middleware');

// All admin routes require authentication
router.use(authenticate);

// Counselor management routes
router.post('/counselors', requireAdmin, createCounselor);
router.get('/counselors', requireAdmin, getCounselors);
router.get('/counselors/:id', requireAdmin, getCounselor);
router.put('/counselors/:id', requireAdmin, updateCounselor);
router.delete('/counselors/:id', requireAdmin, deleteCounselor);

// Analytics routes
router.get('/analytics', requireAdmin, getAnalytics);

// College management routes (admin can view, super_admin can manage)
router.get('/colleges', requireAdmin, getColleges);

module.exports = router;
