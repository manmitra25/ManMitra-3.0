const express = require('express');
const router = express.Router();
const {
  createBooking,
  getMyBookings,
  getBooking,
  cancelBooking,
  completeBooking,
  holdTimeSlot
} = require('../controllers/booking.controller');
const { authenticate, optionalAuth } = require('../middlewares/auth.middleware');
const { requireStudentOrCounselor } = require('../middlewares/role.middleware');

// Protected routes (authentication required)
router.use(authenticate);

// Booking management routes
router.post('/', requireStudentOrCounselor, createBooking);
router.get('/', requireStudentOrCounselor, getMyBookings);
router.get('/:id', requireStudentOrCounselor, getBooking);
router.put('/:id/cancel', requireStudentOrCounselor, cancelBooking);
router.put('/:id/complete', requireStudentOrCounselor, completeBooking);

// Time slot holding (available for anonymous users too)
router.post('/hold', optionalAuth, holdTimeSlot);

module.exports = router;
