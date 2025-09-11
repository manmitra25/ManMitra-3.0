const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  counselor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  startTime: {
    type: Date,
    required: [true, 'Start time is required']
  },
  endTime: {
    type: Date,
    required: [true, 'End time is required']
  },
  status: {
    type: String,
    enum: ['confirmed', 'completed', 'cancelled', 'no_show'],
    default: 'confirmed'
  },
  userNotes: {
    type: String,
    maxlength: [500, 'Notes cannot exceed 500 characters']
  },
  counselorNotes: {
    type: String,
    maxlength: [1000, 'Counselor notes cannot exceed 1000 characters']
  },
  sessionType: {
    type: String,
    enum: ['video', 'audio', 'chat', 'in_person'],
    default: 'video'
  },
  meetingLink: {
    type: String,
    validate: {
      validator: function(v) {
        return !v || /^https?:\/\/.+/.test(v);
      },
      message: 'Meeting link must be a valid URL'
    }
  },
  rating: {
    studentRating: {
      type: Number,
      min: 1,
      max: 5
    },
    counselorRating: {
      type: Number,
      min: 1,
      max: 5
    }
  },
  feedback: {
    studentFeedback: String,
    counselorFeedback: String
  },
  cancelledBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  cancellationReason: String,
  rescheduledFrom: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Booking'
  },
  rescheduledTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Booking'
  }
}, {
  timestamps: true
});

// Compound unique index to prevent double booking
bookingSchema.index({ counselor: 1, startTime: 1, endTime: 1 }, { unique: true });

// Index for efficient querying
bookingSchema.index({ student: 1, startTime: 1 });
bookingSchema.index({ counselor: 1, startTime: 1 });
bookingSchema.index({ status: 1 });

// Virtual for duration
bookingSchema.virtual('duration').get(function() {
  return Math.round((this.endTime - this.startTime) / (1000 * 60)); // in minutes
});

// Ensure virtual fields are serialized
bookingSchema.set('toJSON', { virtuals: true });

// Pre-save middleware to validate time slots
bookingSchema.pre('save', function(next) {
  if (this.startTime >= this.endTime) {
    return next(new Error('End time must be after start time'));
  }
  
  // Ensure booking is at least 30 minutes and not more than 120 minutes
  const duration = (this.endTime - this.startTime) / (1000 * 60);
  if (duration < 30 || duration > 120) {
    return next(new Error('Booking duration must be between 30 and 120 minutes'));
  }
  
  next();
});

module.exports = mongoose.model('Booking', bookingSchema);
