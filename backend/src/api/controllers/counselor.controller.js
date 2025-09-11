const User = require('../../models/user.model');
const CounselorDetails = require('../../models/counselorDetails.model');
const Booking = require('../../models/booking.model');
const AuditEvent = require('../../models/auditEvent.model');

/**
 * Get all available counselors
 */
const getCounselors = async (req, res) => {
  try {
    const { 
      specialization, 
      language, 
      available, 
      dayShift, 
      nightShift,
      page = 1, 
      limit = 20 
    } = req.query;

    // Build filter for counselor details
    const filter = { isActive: true };
    
    if (specialization) {
      filter.specializations = { $in: [new RegExp(specialization, 'i')] };
    }
    
    if (language) {
      filter.languages = { $in: [language] };
    }
    
    if (dayShift === 'true') {
      filter.isDayShift = true;
    }
    
    if (nightShift === 'true') {
      filter.isNightShift = true;
    }

    const skip = (page - 1) * limit;

    const [counselors, total] = await Promise.all([
      CounselorDetails.find(filter)
        .populate('user', 'name email')
        .select({
          user: 1,
          fullName: 1,
          specializations: 1,
          bio: 1,
          profilePicture: 1,
          availability: 1,
          isDayShift: 1,
          isNightShift: 1,
          languages: 1,
          rating: 1,
          totalSessions: 1
        })
        .sort({ rating: -1, totalSessions: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      
      CounselorDetails.countDocuments(filter)
    ]);

    // Add availability status if requested
    let counselorsWithAvailability = counselors;
    if (available === 'true') {
      counselorsWithAvailability = await Promise.all(
        counselors.map(async (counselor) => {
          const today = new Date();
          const tomorrow = new Date(today.getTime() + 24 * 60 * 60 * 1000);
          
          const hasBookings = await Booking.countDocuments({
            counselor: counselor.user._id,
            startTime: { $gte: today, $lt: tomorrow },
            status: { $in: ['confirmed', 'scheduled'] }
          });

          return {
            ...counselor.toObject(),
            hasAvailableSlots: hasBookings < 8 // Assuming max 8 slots per day
          };
        })
      );
    }

    res.json({
      success: true,
      data: {
        counselors: counselorsWithAvailability,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(total / limit),
          totalCounselors: total,
          hasNext: page * limit < total,
          hasPrev: page > 1
        }
      }
    });

  } catch (error) {
    console.error('Error fetching counselors:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch counselors',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Get counselor details by ID
 */
const getCounselor = async (req, res) => {
  try {
    const { id } = req.params;

    const counselor = await CounselorDetails.findOne({ user: id, isActive: true })
      .populate('user', 'name email')
      .populate('college', 'name location');

    if (!counselor) {
      return res.status(404).json({
        success: false,
        message: 'Counselor not found'
      });
    }

    // Get recent session statistics
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const [recentSessions, totalSessions, avgRating] = await Promise.all([
      Booking.countDocuments({
        counselor: id,
        createdAt: { $gte: thirtyDaysAgo },
        status: 'completed'
      }),
      Booking.countDocuments({
        counselor: id,
        status: 'completed'
      }),
      Booking.aggregate([
        { $match: { counselor: id, status: 'completed' } },
        { $group: { _id: null, avgRating: { $avg: '$rating' } } }
      ])
    ]);

    res.json({
      success: true,
      data: {
        counselor: {
          ...counselor.toObject(),
          statistics: {
            recentSessions,
            totalSessions,
            averageRating: avgRating[0]?.avgRating || 0,
            responseRate: 95 // TODO: Calculate actual response rate
          }
        }
      }
    });

  } catch (error) {
    console.error('Error fetching counselor:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch counselor details',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Get counselor availability
 */
const getCounselorAvailability = async (req, res) => {
  try {
    const { id } = req.params;
    const { startDate, endDate } = req.query;

    const counselor = await CounselorDetails.findOne({ user: id, isActive: true });
    if (!counselor) {
      return res.status(404).json({
        success: false,
        message: 'Counselor not found'
      });
    }

    // Set date range
    const start = startDate ? new Date(startDate) : new Date();
    const end = endDate ? new Date(endDate) : new Date(start.getTime() + 7 * 24 * 60 * 60 * 1000);

    // Get existing bookings
    const bookings = await Booking.find({
      counselor: id,
      startTime: { $gte: start, $lte: end },
      status: { $in: ['confirmed', 'scheduled'] }
    }).select({
      startTime: 1,
      endTime: 1,
      status: 1
    });

    // Generate available slots based on counselor's schedule
    const availableSlots = [];
    const currentDate = new Date(start);

    while (currentDate <= end) {
      const dayOfWeek = currentDate.toLocaleDateString('en-US', { weekday: 'lowercase' });
      const daySchedule = counselor.availability.find(slot => slot.day === dayOfWeek);

      if (daySchedule) {
        for (const timeSlot of daySchedule.slots) {
          const slotStart = new Date(currentDate);
          const [hours, minutes] = timeSlot.split(':');
          slotStart.setHours(parseInt(hours), parseInt(minutes), 0, 0);

          const slotEnd = new Date(slotStart.getTime() + 50 * 60 * 1000); // 50-minute sessions

          // Check if slot is not booked
          const isBooked = bookings.some(booking => {
            const bookingStart = new Date(booking.startTime);
            const bookingEnd = new Date(booking.endTime);
            return (slotStart >= bookingStart && slotStart < bookingEnd) ||
                   (slotEnd > bookingStart && slotEnd <= bookingEnd) ||
                   (slotStart <= bookingStart && slotEnd >= bookingEnd);
          });

          if (!isBooked && slotStart > new Date()) {
            availableSlots.push({
              startTime: slotStart.toISOString(),
              endTime: slotEnd.toISOString(),
              duration: 50,
              available: true
            });
          }
        }
      }

      currentDate.setDate(currentDate.getDate() + 1);
    }

    res.json({
      success: true,
      data: {
        counselorId: id,
        counselorName: counselor.fullName,
        availableSlots: availableSlots,
        period: {
          startDate: start.toISOString(),
          endDate: end.toISOString()
        },
        totalSlots: availableSlots.length
      }
    });

  } catch (error) {
    console.error('Error fetching counselor availability:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch counselor availability',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Get counselor specializations
 */
const getSpecializations = async (req, res) => {
  try {
    const specializations = await CounselorDetails.aggregate([
      { $match: { isActive: true } },
      { $unwind: '$specializations' },
      { $group: { _id: '$specializations', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    const specializationList = specializations.map(spec => ({
      name: spec._id,
      count: spec.count
    }));

    res.json({
      success: true,
      data: {
        specializations: specializationList,
        total: specializations.length
      }
    });

  } catch (error) {
    console.error('Error fetching specializations:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch specializations',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Update counselor profile (counselor only)
 */
const updateProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const { 
      fullName, 
      specializations, 
      bio, 
      profilePicture, 
      availability,
      isDayShift,
      isNightShift,
      languages
    } = req.body;

    const counselor = await CounselorDetails.findOne({ user: userId });
    if (!counselor) {
      return res.status(404).json({
        success: false,
        message: 'Counselor profile not found'
      });
    }

    // Update counselor details
    const updateData = {};
    if (fullName !== undefined) updateData.fullName = fullName;
    if (specializations !== undefined) updateData.specializations = specializations;
    if (bio !== undefined) updateData.bio = bio;
    if (profilePicture !== undefined) updateData.profilePicture = profilePicture;
    if (availability !== undefined) updateData.availability = availability;
    if (isDayShift !== undefined) updateData.isDayShift = isDayShift;
    if (isNightShift !== undefined) updateData.isNightShift = isNightShift;
    if (languages !== undefined) updateData.languages = languages;

    updateData.updatedAt = new Date();

    const updatedCounselor = await CounselorDetails.findByIdAndUpdate(
      counselor._id,
      updateData,
      { new: true, runValidators: true }
    );

    // Log profile update
    await AuditEvent.create({
      eventType: 'counselor_profile_updated',
      userId: userId,
      metadata: {
        updatedFields: Object.keys(updateData),
        counselorId: counselor._id
      },
      severity: 'info'
    });

    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: {
        counselor: updatedCounselor
      }
    });

  } catch (error) {
    console.error('Error updating counselor profile:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update profile',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Get counselor dashboard data
 */
const getCounselorDashboard = async (req, res) => {
  try {
    const userId = req.user.id;
    const counselorId = userId;

    // Get counselor details
    const counselor = await CounselorDetails.findOne({ user: counselorId });
    if (!counselor) {
      return res.status(404).json({
        success: false,
        message: 'Counselor profile not found'
      });
    }

    // Get recent bookings
    const today = new Date();
    const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);

    const [
      upcomingBookings,
      recentBookings,
      totalSessions,
      weeklyStats,
      monthlyStats
    ] = await Promise.all([
      Booking.find({
        counselor: counselorId,
        startTime: { $gte: today },
        status: { $in: ['confirmed', 'scheduled'] }
      })
      .populate('student', 'name email')
      .sort({ startTime: 1 })
      .limit(10),

      Booking.find({
        counselor: counselorId,
        createdAt: { $gte: weekAgo },
        status: 'completed'
      })
      .populate('student', 'name email')
      .sort({ createdAt: -1 })
      .limit(5),

      Booking.countDocuments({
        counselor: counselorId,
        status: 'completed'
      }),

      Booking.aggregate([
        {
          $match: {
            counselor: counselorId,
            createdAt: { $gte: weekAgo }
          }
        },
        {
          $group: {
            _id: null,
            completedSessions: { $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] } },
            cancelledSessions: { $sum: { $cond: [{ $eq: ['$status', 'cancelled'] }, 1, 0] } },
            avgRating: { $avg: '$rating' }
          }
        }
      ]),

      Booking.aggregate([
        {
          $match: {
            counselor: counselorId,
            createdAt: {
              $gte: new Date(today.getFullYear(), today.getMonth(), 1)
            }
          }
        },
        {
          $group: {
            _id: null,
            completedSessions: { $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] } },
            totalBookings: { $sum: 1 }
          }
        }
      ])
    ]);

    res.json({
      success: true,
      data: {
        counselor: {
          id: counselor._id,
          name: counselor.fullName,
          specializations: counselor.specializations,
          rating: counselor.rating,
          totalSessions: counselor.totalSessions
        },
        upcomingBookings: upcomingBookings,
        recentBookings: recentBookings,
        statistics: {
          totalSessions,
          weeklyCompleted: weeklyStats[0]?.completedSessions || 0,
          weeklyCancelled: weeklyStats[0]?.cancelledSessions || 0,
          weeklyRating: weeklyStats[0]?.avgRating || 0,
          monthlyCompleted: monthlyStats[0]?.completedSessions || 0,
          monthlyTotal: monthlyStats[0]?.totalBookings || 0
        }
      }
    });

  } catch (error) {
    console.error('Error fetching counselor dashboard:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch counselor dashboard',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

module.exports = {
  getCounselors,
  getCounselor,
  getCounselorAvailability,
  getSpecializations,
  updateProfile,
  getCounselorDashboard
};
