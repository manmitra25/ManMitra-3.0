const Booking = require('../../models/booking.model');
const BookingHold = require('../../models/bookingHold.model');
const User = require('../../models/user.model');
const CounselorDetails = require('../../models/counselorDetails.model');
const AuditEvent = require('../../models/auditEvent.model');
const Notification = require('../../models/notification.model');
const { sendNotification } = require('../../services/websocket.service');
const config = require('../../config');

// Create a new booking
const createBooking = async (req, res) => {
  try {
    const { counselorId, startTime, endTime, userNotes, sessionType = 'video' } = req.body;
    const studentId = req.user._id;

    // Validate required fields
    if (!counselorId || !startTime || !endTime) {
      return res.status(400).json({
        success: false,
        message: 'Counselor ID, start time, and end time are required.'
      });
    }

    // Parse dates
    const start = new Date(startTime);
    const end = new Date(endTime);

    // Validate dates
    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return res.status(400).json({
        success: false,
        message: 'Invalid date format.'
      });
    }

    // Validate booking is in the future
    if (start <= new Date()) {
      return res.status(400).json({
        success: false,
        message: 'Booking must be scheduled for a future time.'
      });
    }

    // Validate counselor exists and is active
    const counselor = await User.findOne({ 
      _id: counselorId, 
      role: 'counselor', 
      isActive: true 
    }).populate('college');

    if (!counselor) {
      return res.status(404).json({
        success: false,
        message: 'Counselor not found or inactive.'
      });
    }

    // Check counselor availability
    const counselorDetails = await CounselorDetails.findOne({ user: counselorId });
    if (!counselorDetails || !counselorDetails.isAvailable) {
      return res.status(400).json({
        success: false,
        message: 'Counselor is not available for bookings.'
      });
    }

    // Check for existing bookings at the same time
    const existingBooking = await Booking.findOne({
      counselor: counselorId,
      startTime: { $lt: end },
      endTime: { $gt: start },
      status: { $in: ['confirmed', 'completed'] }
    });

    if (existingBooking) {
      return res.status(400).json({
        success: false,
        message: 'Time slot is already booked.'
      });
    }

    // Check for existing holds at the same time
    const existingHold = await BookingHold.findOne({
      counselor: counselorId,
      startTime: { $lt: end },
      endTime: { $gt: start }
    });

    if (existingHold) {
      return res.status(400).json({
        success: false,
        message: 'Time slot is temporarily reserved. Please try again.'
      });
    }

    // Create booking
    const booking = new Booking({
      student: studentId,
      counselor: counselorId,
      startTime: start,
      endTime: end,
      userNotes: userNotes || '',
      sessionType: sessionType
    });

    await booking.save();

    // Update counselor session stats
    counselorDetails.sessionStats.totalSessions += 1;
    await counselorDetails.save();

    // Log booking event
    await AuditEvent.create({
      eventType: 'booking_created',
      userId: studentId,
      description: `Student booked session with counselor`,
      metadata: {
        bookingId: booking._id,
        counselorId: counselorId,
        startTime: start,
        endTime: end,
        sessionType: sessionType
      },
      source: 'api'
    });

    // Create notifications
    const studentNotification = new Notification({
      user: studentId,
      message: `Your session with ${counselorDetails.fullName} has been confirmed for ${start.toLocaleDateString()} at ${start.toLocaleTimeString()}.`,
      type: 'booking',
      metadata: {
        bookingId: booking._id,
        actionUrl: `/student/booking/${booking._id}`
      }
    });

    const counselorNotification = new Notification({
      user: counselorId,
      message: `New session booked with student for ${start.toLocaleDateString()} at ${start.toLocaleTimeString()}.`,
      type: 'booking',
      metadata: {
        bookingId: booking._id,
        actionUrl: `/counselor/booking/${booking._id}`
      }
    });

    await Promise.all([
      studentNotification.save(),
      counselorNotification.save()
    ]);

    // Send real-time notifications
    sendNotification(studentId, {
      type: 'booking',
      message: 'Your session has been confirmed!',
      metadata: {
        bookingId: booking._id,
        counselorName: counselorDetails.fullName,
        startTime: start
      }
    });

    sendNotification(counselorId, {
      type: 'booking',
      message: 'You have a new session booking!',
      metadata: {
        bookingId: booking._id,
        startTime: start
      }
    });

    // Populate booking data for response
    await booking.populate([
      { path: 'student', select: 'email profile college' },
      { path: 'counselor', select: 'email college' }
    ]);

    res.status(201).json({
      success: true,
      message: 'Booking created successfully.',
      data: {
        booking: {
          id: booking._id,
          startTime: booking.startTime,
          endTime: booking.endTime,
          status: booking.status,
          sessionType: booking.sessionType,
          userNotes: booking.userNotes,
          counselor: {
            id: counselor._id,
            name: counselorDetails.fullName,
            email: counselor.email,
            specializations: counselorDetails.specializations
          },
          duration: booking.duration
        }
      }
    });

  } catch (error) {
    console.error('Create booking error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while creating booking.'
    });
  }
};

// Get user's bookings
const getMyBookings = async (req, res) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;
    const userId = req.user._id;
    const userRole = req.user.role;

    // Build query based on user role
    let query = {};
    if (userRole === 'student') {
      query.student = userId;
    } else if (userRole === 'counselor') {
      query.counselor = userId;
    } else {
      // Admin can see all bookings
      query = {};
    }

    // Add status filter if provided
    if (status) {
      query.status = status;
    }

    // Get bookings with pagination
    const bookings = await Booking.find(query)
      .populate([
        { 
          path: 'student', 
          select: 'email profile college',
          populate: { path: 'college', select: 'name' }
        },
        { 
          path: 'counselor', 
          select: 'email college',
          populate: { path: 'college', select: 'name' }
        }
      ])
      .sort({ startTime: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    // Get total count
    const total = await Booking.countDocuments(query);

    res.json({
      success: true,
      data: {
        bookings,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(total / limit),
          totalBookings: total,
          hasNextPage: page * limit < total,
          hasPrevPage: page > 1
        }
      }
    });

  } catch (error) {
    console.error('Get bookings error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching bookings.'
    });
  }
};

// Get single booking
const getBooking = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;
    const userRole = req.user.role;

    const booking = await Booking.findById(id)
      .populate([
        { 
          path: 'student', 
          select: 'email profile college',
          populate: { path: 'college', select: 'name' }
        },
        { 
          path: 'counselor', 
          select: 'email college',
          populate: { path: 'college', select: 'name' }
        }
      ]);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found.'
      });
    }

    // Check if user has access to this booking
    if (userRole === 'student' && booking.student._id.toString() !== userId.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Access denied.'
      });
    }

    if (userRole === 'counselor' && booking.counselor._id.toString() !== userId.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Access denied.'
      });
    }

    res.json({
      success: true,
      data: {
        booking
      }
    });

  } catch (error) {
    console.error('Get booking error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching booking.'
    });
  }
};

// Cancel booking
const cancelBooking = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;
    const userId = req.user._id;
    const userRole = req.user.role;

    const booking = await Booking.findById(id)
      .populate('student counselor');

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found.'
      });
    }

    // Check if user can cancel this booking
    const canCancel = (userRole === 'student' && booking.student._id.toString() === userId.toString()) ||
                     (userRole === 'counselor' && booking.counselor._id.toString() === userId.toString()) ||
                     ['admin', 'super_admin'].includes(userRole);

    if (!canCancel) {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to cancel this booking.'
      });
    }

    // Check if booking can be cancelled
    if (booking.status !== 'confirmed') {
      return res.status(400).json({
        success: false,
        message: 'Only confirmed bookings can be cancelled.'
      });
    }

    // Check if booking is too close to start time (less than 2 hours)
    const twoHoursFromNow = new Date(Date.now() + 2 * 60 * 60 * 1000);
    if (booking.startTime <= twoHoursFromNow) {
      return res.status(400).json({
        success: false,
        message: 'Bookings cannot be cancelled less than 2 hours before the session.'
      });
    }

    // Update booking status
    booking.status = 'cancelled';
    booking.cancelledBy = userId;
    booking.cancellationReason = reason || 'No reason provided';
    await booking.save();

    // Update counselor session stats
    const counselorDetails = await CounselorDetails.findOne({ user: booking.counselor._id });
    if (counselorDetails) {
      counselorDetails.sessionStats.cancelledSessions += 1;
      await counselorDetails.save();
    }

    // Log cancellation event
    await AuditEvent.create({
      eventType: 'booking_cancelled',
      userId: userId,
      description: `Booking cancelled by ${userRole}`,
      metadata: {
        bookingId: booking._id,
        cancelledBy: userId,
        reason: reason
      },
      source: 'api'
    });

    // Create notifications
    const notifications = [
      new Notification({
        user: booking.student._id,
        message: `Your session scheduled for ${booking.startTime.toLocaleDateString()} has been cancelled.`,
        type: 'booking',
        metadata: {
          bookingId: booking._id,
          actionUrl: `/student/bookings`
        }
      }),
      new Notification({
        user: booking.counselor._id,
        message: `Session scheduled for ${booking.startTime.toLocaleDateString()} has been cancelled.`,
        type: 'booking',
        metadata: {
          bookingId: booking._id,
          actionUrl: `/counselor/bookings`
        }
      })
    ];

    await Notification.insertMany(notifications);

    // Send real-time notifications
    sendNotification(booking.student._id, {
      type: 'booking',
      message: 'Your session has been cancelled.',
      metadata: {
        bookingId: booking._id,
        startTime: booking.startTime
      }
    });

    sendNotification(booking.counselor._id, {
      type: 'booking',
      message: 'A session has been cancelled.',
      metadata: {
        bookingId: booking._id,
        startTime: booking.startTime
      }
    });

    res.json({
      success: true,
      message: 'Booking cancelled successfully.'
    });

  } catch (error) {
    console.error('Cancel booking error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while cancelling booking.'
    });
  }
};

// Complete booking (counselor only)
const completeBooking = async (req, res) => {
  try {
    const { id } = req.params;
    const { counselorNotes, rating } = req.body;
    const userId = req.user._id;

    // Only counselors can complete bookings
    if (req.user.role !== 'counselor') {
      return res.status(403).json({
        success: false,
        message: 'Only counselors can complete bookings.'
      });
    }

    const booking = await Booking.findById(id);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found.'
      });
    }

    // Check if counselor owns this booking
    if (booking.counselor.toString() !== userId.toString()) {
      return res.status(403).json({
        success: false,
        message: 'You can only complete your own bookings.'
      });
    }

    // Check if booking is confirmed and in the past
    if (booking.status !== 'confirmed') {
      return res.status(400).json({
        success: false,
        message: 'Only confirmed bookings can be completed.'
      });
    }

    if (booking.startTime > new Date()) {
      return res.status(400).json({
        success: false,
        message: 'Cannot complete future bookings.'
      });
    }

    // Update booking
    booking.status = 'completed';
    if (counselorNotes) booking.counselorNotes = counselorNotes;
    if (rating) booking.rating.counselorRating = rating;
    await booking.save();

    // Update counselor session stats
    const counselorDetails = await CounselorDetails.findOne({ user: userId });
    if (counselorDetails) {
      counselorDetails.sessionStats.completedSessions += 1;
      await counselorDetails.save();
    }

    // Log completion event
    await AuditEvent.create({
      eventType: 'booking_completed',
      userId: userId,
      description: `Booking completed by counselor`,
      metadata: {
        bookingId: booking._id,
        rating: rating
      },
      source: 'api'
    });

    res.json({
      success: true,
      message: 'Booking completed successfully.'
    });

  } catch (error) {
    console.error('Complete booking error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while completing booking.'
    });
  }
};

// Hold a time slot temporarily
const holdTimeSlot = async (req, res) => {
  try {
    const { counselorId, startTime, endTime } = req.body;
    const studentSessionId = req.user._id || `anon_${Date.now()}`;

    // Validate input
    if (!counselorId || !startTime || !endTime) {
      return res.status(400).json({
        success: false,
        message: 'Counselor ID, start time, and end time are required.'
      });
    }

    const start = new Date(startTime);
    const end = new Date(endTime);

    // Check for existing bookings or holds
    const [existingBooking, existingHold] = await Promise.all([
      Booking.findOne({
        counselor: counselorId,
        startTime: { $lt: end },
        endTime: { $gt: start },
        status: { $in: ['confirmed', 'completed'] }
      }),
      BookingHold.findOne({
        counselor: counselorId,
        startTime: { $lt: end },
        endTime: { $gt: start }
      })
    ]);

    if (existingBooking || existingHold) {
      return res.status(400).json({
        success: false,
        message: 'Time slot is not available.'
      });
    }

    // Create hold
    const hold = new BookingHold({
      counselor: counselorId,
      startTime: start,
      endTime: end,
      studentSessionId: studentSessionId,
      expiresAt: new Date(Date.now() + config.BOOKING_HOLD_DURATION)
    });

    await hold.save();

    res.json({
      success: true,
      message: 'Time slot held successfully.',
      data: {
        holdId: hold._id,
        expiresAt: hold.expiresAt
      }
    });

  } catch (error) {
    console.error('Hold time slot error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while holding time slot.'
    });
  }
};

module.exports = {
  createBooking,
  getMyBookings,
  getBooking,
  cancelBooking,
  completeBooking,
  holdTimeSlot
};
