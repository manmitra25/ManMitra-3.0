const mongoose = require('mongoose');

const collegeSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'College name is required'],
    unique: true,
    trim: true
  },
  code: {
    type: String,
    unique: true,
    uppercase: true,
    trim: true
  },
  location: {
    city: String,
    state: String,
    country: {
      type: String,
      default: 'India'
    }
  },
  metadata: {
    region: {
      type: String,
      enum: ['Jammu', 'Kashmir', 'Ladakh', 'Other']
    },
    languageDefaults: [{
      type: String,
      enum: ['en', 'hi', 'ur']
    }],
    type: {
      type: String,
      enum: ['University', 'College', 'Institute', 'Technical'],
      default: 'College'
    }
  },
  contact: {
    email: String,
    phone: String,
    website: String
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Index for efficient querying
collegeSchema.index({ name: 1 });
collegeSchema.index({ 'location.state': 1 });
collegeSchema.index({ 'metadata.region': 1 });

module.exports = mongoose.model('College', collegeSchema);
