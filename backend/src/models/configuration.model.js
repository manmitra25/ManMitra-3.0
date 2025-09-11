const mongoose = require('mongoose');

const configurationSchema = new mongoose.Schema({
  key: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  value: {
    type: mongoose.Schema.Types.Mixed,
    required: true
  },
  type: {
    type: String,
    enum: ['string', 'number', 'boolean', 'array', 'object'],
    required: true
  },
  category: {
    type: String,
    enum: [
      'crisis_support', 'helplines', 'chat_settings', 'booking_settings',
      'forum_settings', 'notification_settings', 'analytics_settings',
      'system_settings', 'feature_flags'
    ],
    required: true
  },
  description: {
    type: String,
    required: true,
    maxlength: [500, 'Description cannot exceed 500 characters']
  },
  isPublic: {
    type: Boolean,
    default: false // Whether this config can be accessed by frontend
  },
  isActive: {
    type: Boolean,
    default: true
  },
  // For configurations that need environment-specific values
  environment: {
    type: String,
    enum: ['development', 'staging', 'production', 'all'],
    default: 'all'
  },
  // Validation rules
  validation: {
    min: Number,
    max: Number,
    pattern: String,
    required: Boolean
  },
  // Audit trail
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  lastModifiedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  // Version history
  version: {
    type: Number,
    default: 1
  },
  previousValues: [{
    value: mongoose.Schema.Types.Mixed,
    changedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    changedAt: {
      type: Date,
      default: Date.now
    },
    reason: String
  }]
}, {
  timestamps: true
});

// Index for efficient querying
configurationSchema.index({ key: 1 });
configurationSchema.index({ category: 1, isActive: 1 });
configurationSchema.index({ isPublic: 1, environment: 1 });

// Pre-save middleware to track changes
configurationSchema.pre('save', function(next) {
  if (this.isModified('value') && !this.isNew) {
    // Store previous value in history
    this.previousValues.push({
      value: this.previousValues[this.previousValues.length - 1]?.value || this.value,
      changedBy: this.lastModifiedBy,
      changedAt: new Date(),
      reason: 'Configuration updated'
    });
    
    // Increment version
    this.version += 1;
  }
  next();
});

module.exports = mongoose.model('Configuration', configurationSchema);
