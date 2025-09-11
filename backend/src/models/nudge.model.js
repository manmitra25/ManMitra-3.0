const mongoose = require('mongoose');

const nudgeSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  type: {
    type: String,
    enum: ['check-in', 'journaling', 'resource', 'mood', 'breathing', 'meditation', 'exercise'],
    required: true
  },
  title: {
    type: String,
    required: true,
    maxlength: [100, 'Title cannot exceed 100 characters']
  },
  message: {
    type: String,
    required: true,
    maxlength: [300, 'Message cannot exceed 300 characters']
  },
  // Scheduling information
  schedule: {
    frequency: {
      type: String,
      enum: ['once', 'daily', 'weekly', 'monthly'],
      default: 'once'
    },
    time: String, // e.g., "09:00" for daily nudges
    daysOfWeek: [Number], // 0-6 for weekly nudges
    dayOfMonth: Number, // 1-31 for monthly nudges
    isActive: {
      type: Boolean,
      default: true
    }
  },
  // Delivery tracking
  deliveredAt: [Date],
  lastDeliveredAt: Date,
  nextScheduledAt: Date,
  // User consent and preferences
  consentGiven: {
    type: Boolean,
    default: false
  },
  userResponse: [{
    response: String,
    respondedAt: {
      type: Date,
      default: Date.now
    }
  }],
  // Nudge content and actions
  actionUrl: String, // URL to navigate to when nudge is clicked
  resourceId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Resource'
  },
  // Metadata
  category: {
    type: String,
    enum: ['wellness', 'mental_health', 'academic', 'social', 'self_care'],
    default: 'wellness'
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high'],
    default: 'medium'
  },
  language: {
    type: String,
    enum: ['en', 'hi', 'ur'],
    default: 'en'
  }
}, {
  timestamps: true
});

// Index for efficient querying
nudgeSchema.index({ user: 1, 'schedule.isActive': 1 });
nudgeSchema.index({ nextScheduledAt: 1 });
nudgeSchema.index({ type: 1, category: 1 });

// Calculate next scheduled time
nudgeSchema.methods.calculateNextScheduled = function() {
  const now = new Date();
  
  if (this.schedule.frequency === 'once') {
    return null; // One-time nudges don't need rescheduling
  }
  
  if (this.schedule.frequency === 'daily') {
    const next = new Date();
    const [hours, minutes] = this.schedule.time.split(':');
    next.setHours(parseInt(hours), parseInt(minutes), 0, 0);
    
    if (next <= now) {
      next.setDate(next.getDate() + 1);
    }
    
    return next;
  }
  
  if (this.schedule.frequency === 'weekly') {
    const next = new Date();
    const [hours, minutes] = this.schedule.time.split(':');
    next.setHours(parseInt(hours), parseInt(minutes), 0, 0);
    
    // Find next occurrence of any of the specified days
    let daysToAdd = 0;
    for (let i = 0; i < 7; i++) {
      const checkDay = (next.getDay() + i) % 7;
      if (this.schedule.daysOfWeek.includes(checkDay)) {
        daysToAdd = i;
        break;
      }
    }
    
    next.setDate(next.getDate() + daysToAdd);
    return next;
  }
  
  return null;
};

// Mark as delivered
nudgeSchema.methods.markDelivered = function() {
  this.deliveredAt.push(new Date());
  this.lastDeliveredAt = new Date();
  this.nextScheduledAt = this.calculateNextScheduled();
  return this.save();
};

module.exports = mongoose.model('Nudge', nudgeSchema);
