const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  message: {
    type: String,
    required: [true, 'Notification message is required'],
    maxlength: [500, 'Message cannot exceed 500 characters']
  },
  type: {
    type: String,
    enum: ['booking', 'nudge', 'admin', 'crisis', 'forum', 'resource', 'general'],
    required: true
  },
  isRead: {
    type: Boolean,
    default: false
  },
  readAt: Date,
  // Additional data for different notification types
  metadata: {
    bookingId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Booking'
    },
    postId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ForumPost'
    },
    resourceId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Resource'
    },
    actionUrl: String, // URL to navigate to when notification is clicked
    priority: {
      type: String,
      enum: ['low', 'medium', 'high', 'urgent'],
      default: 'medium'
    }
  },
  // For scheduled notifications
  scheduledFor: Date,
  isDelivered: {
    type: Boolean,
    default: false
  },
  deliveredAt: Date,
  // For recurring notifications
  isRecurring: {
    type: Boolean,
    default: false
  },
  recurrencePattern: {
    type: String,
    enum: ['daily', 'weekly', 'monthly']
  }
}, {
  timestamps: true
});

// Index for efficient querying
notificationSchema.index({ user: 1, createdAt: -1 });
notificationSchema.index({ user: 1, isRead: 1 });
notificationSchema.index({ type: 1, createdAt: -1 });
notificationSchema.index({ scheduledFor: 1, isDelivered: 1 });

// Mark notification as read
notificationSchema.methods.markAsRead = function() {
  this.isRead = true;
  this.readAt = new Date();
  return this.save();
};

// Mark notification as delivered
notificationSchema.methods.markAsDelivered = function() {
  this.isDelivered = true;
  this.deliveredAt = new Date();
  return this.save();
};

module.exports = mongoose.model('Notification', notificationSchema);
