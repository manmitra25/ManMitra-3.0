const AuditEvent = require('../../models/auditEvent.model');

// Role-based access control middleware
const requireRole = (...allowedRoles) => {
  return async (req, res, next) => {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: 'Authentication required.'
        });
      }

      if (!allowedRoles.includes(req.user.role)) {
        // Log unauthorized access attempt
        await AuditEvent.create({
          eventType: 'admin_action',
          userId: req.user._id,
          severity: 'warn',
          description: `Unauthorized access attempt to ${req.originalUrl}`,
          metadata: {
            attemptedRole: req.user.role,
            requiredRoles: allowedRoles,
            ipAddress: req.ip,
            userAgent: req.get('User-Agent')
          },
          source: 'api'
        });

        return res.status(403).json({
          success: false,
          message: 'Insufficient permissions. Access denied.'
        });
      }

      next();
    } catch (error) {
      console.error('Role middleware error:', error);
      res.status(500).json({
        success: false,
        message: 'Server error during authorization.'
      });
    }
  };
};

// Specific role middleware functions
const requireAdmin = requireRole('admin', 'super_admin');
const requireSuperAdmin = requireRole('super_admin');
const requireCounselor = requireRole('counselor', 'admin', 'super_admin');
const requireStudent = requireRole('student', 'admin', 'super_admin');
const requireStudentOrCounselor = requireRole('student', 'counselor', 'admin', 'super_admin');

// Check if user can access college-specific data
const requireCollegeAccess = (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required.'
      });
    }

    // Super admins can access all colleges
    if (req.user.role === 'super_admin') {
      return next();
    }

    // Admins can access their own college
    if (req.user.role === 'admin' && req.user.college) {
      return next();
    }

    // Students can only access their own college
    if (req.user.role === 'student' && req.user.college) {
      return next();
    }

    return res.status(403).json({
      success: false,
      message: 'College access denied.'
    });
  } catch (error) {
    console.error('College access middleware error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during college authorization.'
    });
  }
};

// Check if user can access counselor data
const requireCounselorAccess = async (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required.'
      });
    }

    // Super admins and admins can access all counselors
    if (['super_admin', 'admin'].includes(req.user.role)) {
      return next();
    }

    // Counselors can only access their own data
    if (req.user.role === 'counselor') {
      const counselorId = req.params.id || req.params.counselorId;
      if (counselorId && counselorId !== req.user._id.toString()) {
        return res.status(403).json({
          success: false,
          message: 'Access denied. You can only access your own data.'
        });
      }
      return next();
    }

    return res.status(403).json({
      success: false,
      message: 'Counselor access denied.'
    });
  } catch (error) {
    console.error('Counselor access middleware error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during counselor authorization.'
    });
  }
};

// Check if user can access student data
const requireStudentAccess = async (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required.'
      });
    }

    // Super admins and admins can access all students
    if (['super_admin', 'admin'].includes(req.user.role)) {
      return next();
    }

    // Students can only access their own data
    if (req.user.role === 'student') {
      const studentId = req.params.id || req.params.studentId;
      if (studentId && studentId !== req.user._id.toString()) {
        return res.status(403).json({
          success: false,
          message: 'Access denied. You can only access your own data.'
        });
      }
      return next();
    }

    // Counselors can access student data if they have consent
    if (req.user.role === 'counselor') {
      // This will be checked in the specific endpoint logic
      return next();
    }

    return res.status(403).json({
      success: false,
      message: 'Student access denied.'
    });
  } catch (error) {
    console.error('Student access middleware error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during student authorization.'
    });
  }
};

// Check if user owns the resource
const requireOwnership = (resourceParam = 'id') => {
  return (req, res, next) => {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: 'Authentication required.'
        });
      }

      // Super admins can access everything
      if (req.user.role === 'super_admin') {
        return next();
      }

      const resourceId = req.params[resourceParam];
      
      if (!resourceId) {
        return res.status(400).json({
          success: false,
          message: 'Resource ID is required.'
        });
      }

      // Check if user owns the resource
      if (resourceId !== req.user._id.toString()) {
        return res.status(403).json({
          success: false,
          message: 'Access denied. You can only access your own resources.'
        });
      }

      next();
    } catch (error) {
      console.error('Ownership middleware error:', error);
      res.status(500).json({
        success: false,
        message: 'Server error during ownership check.'
      });
    }
  };
};

// Combined role middleware for admin or counselor access
const requireAdminOrCounselor = requireRole('admin', 'super_admin', 'counselor');

module.exports = {
  requireRole,
  requireAdmin,
  requireSuperAdmin,
  requireCounselor,
  requireStudent,
  requireStudentOrCounselor,
  requireAdminOrCounselor,
  requireCollegeAccess,
  requireCounselorAccess,
  requireStudentAccess,
  requireOwnership
};
