import jwt from 'jsonwebtoken';
import Student from '../models/student-model.js';
import Volunteer from '../models/Volunteers-model.js';

// Protect routes - verify JWT
export const protect = async (req, res, next) => {
  try {
    let token;
    
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }
    
    if (!token) {
      return res.status(401).json({ message: 'Not authorized to access this route' });
    }
    
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = await Student.findById(decoded.id).select('-password');
      
      if (!req.user) {
        return res.status(401).json({ message: 'Not authorized to access this route' });
      }
      
      next();
    } catch (error) {
      return res.status(401).json({ message: 'Not authorized to access this route' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Volunteer protection middleware
export const volunteerProtect = async (req, res, next) => {
  try {
    const volunteer = await Volunteer.findOne({ email: req.user.email });
    
    if (!volunteer) {
      return res.status(403).json({ message: 'Not authorized as a volunteer' });
    }
    
    req.user.volunteerId = volunteer._id;
    next();
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
