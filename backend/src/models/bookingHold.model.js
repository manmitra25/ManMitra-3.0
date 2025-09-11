const mongoose = require('mongoose');

const bookingHoldSchema = new mongoose.Schema({
  counselor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  startTime: {
    type: Date,
    required: true
  },
  endTime: {
    type: Date,
    required: true
  },
  studentSessionId: {
    type: String,
    required: true // For anonymous users, use session ID
  },
  expiresAt: {
    type: Date,
    required: true,
    index: { expireAfterSeconds: 0 } // TTL index
  }
}, {
  timestamps: true
});

// Compound index for efficient querying
bookingHoldSchema.index({ counselor: 1, startTime: 1, endTime: 1 });

module.exports = mongoose.model('BookingHold', bookingHoldSchema);
