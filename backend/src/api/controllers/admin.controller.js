const User = require('../../models/user.model');
const CounselorDetails = require('../../models/counselorDetails.model');
const College = require('../../models/college.model');
const AuditEvent = require('../../models/auditEvent.model');
const { generateToken, logAuthEvent } = require('../middlewares/auth.middleware');
const { sendNotification } = require('../../services/websocket.service');

// Create a new counselor
const createCounselor = async (req, res) => {
  try {
    const {
      email,
      password,
      fullName,
      specializations,
      bio,
      profilePicture,
      availability,
      isDayShift,
      isNightShift,
      languages,
      credentials,
      collegeId
    } = req.body;

    // Validate required fields
    if (!email || !password || !fullName || !specializations || !Array.isArray(specializations)) {
      return res.status(400).json({
        success: false,
        message: 'Email, password, full name, and specializations are required.'
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User with this email already exists.'
      });
    }

    // Verify college exists (if provided)
    let college = null;
    if (collegeId) {
      college = await College.findById(collegeId);
      if (!college) {
        return res.status(400).json({
          success: false,
          message: 'Invalid college selected.'
        });
      }
    }

    // Create counselor user
    const counselorUser = new User({
      email: email.toLowerCase(),
      password,
      role: 'counselor',
      college: collegeId || null,
      isVerified: true // Auto-verify counselors created by admin
    });

    await counselorUser.save();

    // Create counselor details
    const counselorDetails = new CounselorDetails({
      user: counselorUser._id,
      fullName,
      specializations,
      bio: bio || '',
      profilePicture: profilePicture || '',
      availability: availability || {
        monday: [], tuesday: [], wednesday: [], thursday: [],
        friday: [], saturday: [], sunday: []
      },
      isDayShift: isDayShift !== undefined ? isDayShift : true,
      isNightShift: isNightShift !== undefined ? isNightShift : false,
      languages: languages || ['en'],
      credentials: credentials || {}
    });

    await counselorDetails.save();

    // Generate login token for counselor
    const token = generateToken(counselorUser._id);

    // Log admin action
    await AuditEvent.create({
      eventType: 'counselor_created',
      userId: req.user._id,
      description: `Admin created counselor account for ${email}`,
      metadata: {
        counselorId: counselorUser._id,
        counselorEmail: email,
        specializations: specializations,
        collegeId: collegeId
      },
      source: 'api'
    });

    // Send notification to counselor (if they have an active session)
    sendNotification(counselorUser._id, {
      type: 'admin',
      message: 'Your counselor account has been created. You can now log in.',
      metadata: {
        actionUrl: '/counselor/dashboard'
      }
    });

    res.status(201).json({
      success: true,
      message: 'Counselor created successfully.',
      data: {
        counselor: {
          id: counselorUser._id,
          email: counselorUser.email,
          role: counselorUser.role,
          isVerified: counselorUser.isVerified,
          details: {
            fullName: counselorDetails.fullName,
            specializations: counselorDetails.specializations,
            isAvailable: counselorDetails.isAvailable
          },
          college: college ? {
            id: college._id,
            name: college.name
          } : null
        },
        loginToken: token // Admin can share this with counselor
      }
    });

  } catch (error) {
    console.error('Create counselor error:', error);
    
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Email already exists.'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Server error while creating counselor.'
    });
  }
};

// Get all counselors
const getCounselors = async (req, res) => {
  try {
    const { page = 1, limit = 10, search, specialization, isAvailable, college } = req.query;
    
    // Build query
    const query = {};
    
    if (search) {
      query.$or = [
        { email: { $regex: search, $options: 'i' } },
        { 'details.fullName': { $regex: search, $options: 'i' } }
      ];
    }
    
    if (specialization) {
      query['details.specializations'] = { $in: [specialization] };
    }
    
    if (isAvailable !== undefined) {
      query['details.isAvailable'] = isAvailable === 'true';
    }
    
    if (college) {
      query.college = college;
    }

    // Get counselors with pagination
    const counselors = await User.find({ role: 'counselor', ...query })
      .populate('college', 'name code location')
      .populate({
        path: 'counselorDetails',
        select: 'fullName specializations bio profilePicture isAvailable rating sessionStats'
      })
      .select('-password')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    // Get total count
    const total = await User.countDocuments({ role: 'counselor', ...query });

    res.json({
      success: true,
      data: {
        counselors,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(total / limit),
          totalCounselors: total,
          hasNextPage: page * limit < total,
          hasPrevPage: page > 1
        }
      }
    });

  } catch (error) {
    console.error('Get counselors error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching counselors.'
    });
  }
};

// Get single counselor
const getCounselor = async (req, res) => {
  try {
    const { id } = req.params;

    const counselor = await User.findById(id)
      .populate('college', 'name code location')
      .populate({
        path: 'counselorDetails',
        select: 'fullName specializations bio profilePicture availability isDayShift isNightShift languages credentials rating sessionStats'
      })
      .select('-password');

    if (!counselor || counselor.role !== 'counselor') {
      return res.status(404).json({
        success: false,
        message: 'Counselor not found.'
      });
    }

    res.json({
      success: true,
      data: {
        counselor
      }
    });

  } catch (error) {
    console.error('Get counselor error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching counselor.'
    });
  }
};

// Update counselor
const updateCounselor = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    // Find counselor
    const counselor = await User.findById(id);
    if (!counselor || counselor.role !== 'counselor') {
      return res.status(404).json({
        success: false,
        message: 'Counselor not found.'
      });
    }

    // Update user data
    if (updateData.email && updateData.email !== counselor.email) {
      const existingUser = await User.findOne({ email: updateData.email.toLowerCase() });
      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: 'Email already exists.'
        });
      }
      counselor.email = updateData.email.toLowerCase();
    }

    if (updateData.password) {
      counselor.password = updateData.password;
    }

    if (updateData.collegeId !== undefined) {
      if (updateData.collegeId) {
        const college = await College.findById(updateData.collegeId);
        if (!college) {
          return res.status(400).json({
            success: false,
            message: 'Invalid college selected.'
          });
        }
      }
      counselor.college = updateData.collegeId;
    }

    if (updateData.isActive !== undefined) {
      counselor.isActive = updateData.isActive;
    }

    await counselor.save();

    // Update counselor details
    const counselorDetails = await CounselorDetails.findOne({ user: id });
    if (counselorDetails) {
      const allowedUpdates = [
        'fullName', 'specializations', 'bio', 'profilePicture',
        'availability', 'isDayShift', 'isNightShift', 'languages',
        'credentials', 'isAvailable'
      ];

      for (const field of allowedUpdates) {
        if (updateData[field] !== undefined) {
          counselorDetails[field] = updateData[field];
        }
      }

      await counselorDetails.save();
    }

    // Log admin action
    await AuditEvent.create({
      eventType: 'counselor_updated',
      userId: req.user._id,
      description: `Admin updated counselor account for ${counselor.email}`,
      metadata: {
        counselorId: counselor._id,
        updatedFields: Object.keys(updateData)
      },
      source: 'api'
    });

    // Send notification to counselor
    sendNotification(counselor._id, {
      type: 'admin',
      message: 'Your counselor profile has been updated by an administrator.',
      metadata: {
        actionUrl: '/counselor/profile'
      }
    });

    res.json({
      success: true,
      message: 'Counselor updated successfully.'
    });

  } catch (error) {
    console.error('Update counselor error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating counselor.'
    });
  }
};

// Delete counselor
const deleteCounselor = async (req, res) => {
  try {
    const { id } = req.params;

    const counselor = await User.findById(id);
    if (!counselor || counselor.role !== 'counselor') {
      return res.status(404).json({
        success: false,
        message: 'Counselor not found.'
      });
    }

    // Check for active bookings
    const Booking = require('../../models/booking.model');
    const activeBookings = await Booking.find({
      counselor: id,
      status: { $in: ['confirmed', 'completed'] },
      startTime: { $gte: new Date() }
    });

    if (activeBookings.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete counselor with active or future bookings.'
      });
    }

    // Soft delete - deactivate instead of hard delete
    counselor.isActive = false;
    await counselor.save();

    // Deactivate counselor details
    const counselorDetails = await CounselorDetails.findOne({ user: id });
    if (counselorDetails) {
      counselorDetails.isAvailable = false;
      await counselorDetails.save();
    }

    // Log admin action
    await AuditEvent.create({
      eventType: 'counselor_deleted',
      userId: req.user._id,
      description: `Admin deactivated counselor account for ${counselor.email}`,
      metadata: {
        counselorId: counselor._id,
        counselorEmail: counselor.email
      },
      source: 'api'
    });

    res.json({
      success: true,
      message: 'Counselor deactivated successfully.'
    });

  } catch (error) {
    console.error('Delete counselor error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while deleting counselor.'
    });
  }
};

// Get admin analytics
const getAnalytics = async (req, res) => {
  try {
    const { collegeId, startDate, endDate } = req.query;
    
    // Build date filter
    const dateFilter = {};
    if (startDate || endDate) {
      dateFilter.createdAt = {};
      if (startDate) dateFilter.createdAt.$gte = new Date(startDate);
      if (endDate) dateFilter.createdAt.$lte = new Date(endDate);
    }

    // Build college filter
    const collegeFilter = collegeId ? { college: collegeId } : {};

    // Get user statistics
    const userStats = await User.aggregate([
      { $match: { ...collegeFilter, ...dateFilter } },
      {
        $group: {
          _id: '$role',
          count: { $sum: 1 },
          active: { $sum: { $cond: ['$isActive', 1, 0] } }
        }
      }
    ]);

    // Get booking statistics
    const Booking = require('../../models/booking.model');
    const bookingStats = await Booking.aggregate([
      { $match: { ...dateFilter } },
      {
        $lookup: {
          from: 'users',
          localField: 'counselor',
          foreignField: '_id',
          as: 'counselorData'
        }
      },
      { $match: { 'counselorData.college': collegeId ? collegeId : { $exists: true } } },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    // Get mood assessment statistics
    const MoodEntry = require('../../models/moodEntry.model');
    const moodStats = await MoodEntry.aggregate([
      { $match: { ...dateFilter } },
      {
        $lookup: {
          from: 'users',
          localField: 'student',
          foreignField: '_id',
          as: 'studentData'
        }
      },
      { $match: { 'studentData.college': collegeId ? collegeId : { $exists: true } } },
      {
        $group: {
          _id: { testType: '$testType', riskLevel: '$riskLevel' },
          count: { $sum: 1 }
        }
      }
    ]);

    // Get crisis escalation statistics
    const crisisStats = await AuditEvent.aggregate([
      { 
        $match: { 
          eventType: 'crisis_escalation',
          ...dateFilter
        } 
      },
      {
        $group: {
          _id: '$metadata.severity',
          count: { $sum: 1 }
        }
      }
    ]);

    res.json({
      success: true,
      data: {
        users: userStats,
        bookings: bookingStats,
        moodAssessments: moodStats,
        crisisEscalations: crisisStats,
        period: {
          startDate,
          endDate
        },
        college: collegeId
      }
    });

  } catch (error) {
    console.error('Get analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching analytics.'
    });
  }
};

// Get colleges for admin
const getColleges = async (req, res) => {
  try {
    const colleges = await College.find({ isActive: true })
      .select('name code location metadata')
      .sort({ name: 1 });

    res.json({
      success: true,
      data: {
        colleges
      }
    });

  } catch (error) {
    console.error('Get colleges error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching colleges.'
    });
  }
};

module.exports = {
  createCounselor,
  getCounselors,
  getCounselor,
  updateCounselor,
  deleteCounselor,
  getAnalytics,
  getColleges
};
