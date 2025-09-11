const mongoose = require('mongoose');

const counselorDetailsSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  fullName: {
    type: String,
    required: [true, 'Full name is required'],
    trim: true
  },
  specializations: [{
    type: String,
    enum: [
      'Anxiety', 'Depression', 'Academic Stress', 'Relationship Issues',
      'Career Guidance', 'Addiction', 'Trauma', 'LGBTQIA+ Support',
      'Self Improvement', 'Sexual Wellness', 'Abuse & Discrimination',
      'Psychological Disorders', 'General Counseling'
    ]
  }],
  bio: {
    type: String,
    maxlength: [500, 'Bio cannot exceed 500 characters']
  },
  profilePicture: {
    type: String,
    validate: {
      validator: function(v) {
        return !v || /^https?:\/\/.+\.(jpg|jpeg|png|gif|webp)$/i.test(v);
      },
      message: 'Profile picture must be a valid image URL'
    }
  },
  credentials: {
    degree: String,
    license: String,
    yearsOfExperience: {
      type: Number,
      min: 0,
      max: 50
    },
    certifications: [String]
  },
  availability: {
    // Default weekly availability template
    monday: [String], // e.g., ["09:00", "10:00", "11:00"]
    tuesday: [String],
    wednesday: [String],
    thursday: [String],
    friday: [String],
    saturday: [String],
    sunday: [String]
  },
  isDayShift: {
    type: Boolean,
    default: true
  },
  isNightShift: {
    type: Boolean,
    default: false
  },
  languages: [{
    type: String,
    enum: ['en', 'hi', 'ur'],
    default: ['en']
  }],
  rating: {
    average: {
      type: Number,
      default: 0,
      min: 0,
      max: 5
    },
    count: {
      type: Number,
      default: 0
    }
  },
  sessionStats: {
    totalSessions: { type: Number, default: 0 },
    completedSessions: { type: Number, default: 0 },
    cancelledSessions: { type: Number, default: 0 }
  },
  isAvailable: {
    type: Boolean,
    default: true
  },
  consultationFee: {
    type: Number,
    min: 0,
    default: 0 // Free for students
  }
}, {
  timestamps: true
});

// Index for efficient querying
counselorDetailsSchema.index({ user: 1 });
counselorDetailsSchema.index({ specializations: 1 });
counselorDetailsSchema.index({ isAvailable: 1 });

// Virtual for total rating
counselorDetailsSchema.virtual('totalRating').get(function() {
  return this.rating.count;
});

module.exports = mongoose.model('CounselorDetails', counselorDetailsSchema);
