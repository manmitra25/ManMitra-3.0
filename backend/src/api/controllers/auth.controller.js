const User = require('../../models/user.model');
const College = require('../../models/college.model');
const { generateToken, generateRefreshToken, logAuthEvent } = require('../middlewares/auth.middleware');
const AuditEvent = require('../../models/auditEvent.model');

// Student registration
const signup = async (req, res) => {
  try {
    const { email, password, firstName, lastName, collegeId, phoneNumber, gender } = req.body;

    // Validate required fields
    if (!email || !password || !firstName || !lastName || !collegeId) {
      return res.status(400).json({
        success: false,
        message: 'All required fields must be provided.'
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

    // Verify college exists
    const college = await College.findById(collegeId);
    if (!college) {
      return res.status(400).json({
        success: false,
        message: 'Invalid college selected.'
      });
    }

    // Create new user
    const user = new User({
      email: email.toLowerCase(),
      password,
      role: 'student',
      college: collegeId,
      profile: {
        firstName,
        lastName,
        phoneNumber,
        gender
      }
    });

    await user.save();

    // Generate tokens
    const token = generateToken(user._id);
    const refreshToken = generateRefreshToken(user._id);

    // Log registration event
    await logAuthEvent('user_signup', user._id, req, {
      collegeId,
      collegeName: college.name
    });

    res.status(201).json({
      success: true,
      message: 'User registered successfully.',
      data: {
        user: {
          id: user._id,
          email: user.email,
          role: user.role,
          profile: user.profile,
          college: {
            id: college._id,
            name: college.name
          }
        },
        token,
        refreshToken
      }
    });

  } catch (error) {
    console.error('Signup error:', error);
    
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Email already exists.'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Server error during registration.'
    });
  }
};

// Student login
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required.'
      });
    }

    // Find user by email
    const user = await User.findOne({ email: email.toLowerCase() })
      .populate('college', 'name code location')
      .select('+password');

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.'
      });
    }

    // Check if account is active
    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Account is deactivated. Please contact support.'
      });
    }

    // Verify password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.'
      });
    }

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    // Generate tokens
    const token = generateToken(user._id);
    const refreshToken = generateRefreshToken(user._id);

    // Log login event
    await logAuthEvent('user_login', user._id, req);

    res.json({
      success: true,
      message: 'Login successful.',
      data: {
        user: {
          id: user._id,
          email: user.email,
          role: user.role,
          profile: user.profile,
          college: user.college,
          preferences: user.preferences,
          lastLogin: user.lastLogin
        },
        token,
        refreshToken
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during login.'
    });
  }
};

// Admin/Counselor login
const adminLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required.'
      });
    }

    // Find user by email (admin, counselor, or super_admin roles)
    const user = await User.findOne({ 
      email: email.toLowerCase(),
      role: { $in: ['admin', 'counselor', 'super_admin'] }
    })
      .populate('college', 'name code location')
      .select('+password');

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials or insufficient permissions.'
      });
    }

    // Check if account is active
    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Account is deactivated. Please contact system administrator.'
      });
    }

    // Verify password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials or insufficient permissions.'
      });
    }

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    // Generate tokens
    const token = generateToken(user._id);
    const refreshToken = generateRefreshToken(user._id);

    // Log admin login event
    await logAuthEvent('user_login', user._id, req, {
      loginType: 'admin'
    });

    res.json({
      success: true,
      message: 'Admin login successful.',
      data: {
        user: {
          id: user._id,
          email: user.email,
          role: user.role,
          profile: user.profile,
          college: user.college,
          preferences: user.preferences,
          lastLogin: user.lastLogin
        },
        token,
        refreshToken
      }
    });

  } catch (error) {
    console.error('Admin login error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during admin login.'
    });
  }
};

// Refresh token
const refreshToken = async (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(401).json({
        success: false,
        message: 'Refresh token is required.'
      });
    }

    // Verify refresh token
    const jwt = require('jsonwebtoken');
    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET);

    if (decoded.type !== 'refresh') {
      return res.status(401).json({
        success: false,
        message: 'Invalid refresh token.'
      });
    }

    // Find user
    const user = await User.findById(decoded.userId);
    if (!user || !user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'User not found or inactive.'
      });
    }

    // Generate new tokens
    const newToken = generateToken(user._id);
    const newRefreshToken = generateRefreshToken(user._id);

    res.json({
      success: true,
      message: 'Token refreshed successfully.',
      data: {
        token: newToken,
        refreshToken: newRefreshToken
      }
    });

  } catch (error) {
    console.error('Token refresh error:', error);
    
    if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Invalid or expired refresh token.'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Server error during token refresh.'
    });
  }
};

// Logout
const logout = async (req, res) => {
  try {
    // Log logout event
    if (req.user) {
      await logAuthEvent('user_logout', req.user._id, req);
    }

    res.json({
      success: true,
      message: 'Logout successful.'
    });

  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during logout.'
    });
  }
};

// Get current user profile
const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .populate('college', 'name code location')
      .select('-password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found.'
      });
    }

    res.json({
      success: true,
      data: {
        user
      }
    });

  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching profile.'
    });
  }
};

// Update user profile
const updateProfile = async (req, res) => {
  try {
    const { firstName, lastName, phoneNumber, gender, preferences } = req.body;
    const userId = req.user._id;

    const updateData = {};
    
    if (firstName !== undefined) updateData['profile.firstName'] = firstName;
    if (lastName !== undefined) updateData['profile.lastName'] = lastName;
    if (phoneNumber !== undefined) updateData['profile.phoneNumber'] = phoneNumber;
    if (gender !== undefined) updateData['profile.gender'] = gender;
    if (preferences !== undefined) updateData.preferences = preferences;

    const user = await User.findByIdAndUpdate(
      userId,
      updateData,
      { new: true, runValidators: true }
    )
      .populate('college', 'name code location')
      .select('-password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found.'
      });
    }

    res.json({
      success: true,
      message: 'Profile updated successfully.',
      data: {
        user
      }
    });

  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating profile.'
    });
  }
};

module.exports = {
  signup,
  login,
  adminLogin,
  refreshToken,
  logout,
  getProfile,
  updateProfile
};
