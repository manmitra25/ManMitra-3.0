const mongoose = require('mongoose');

const chatSummarySchema = new mongoose.Schema({
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: function() {
      return !this.isAnonymous; // Only required if not anonymous
    }
  },
  summary: {
    type: String,
    required: false, // Summary can be generated later
    maxlength: [1000, 'Summary cannot exceed 1000 characters']
  },
  sessionDate: {
    type: Date,
    default: Date.now
  },
  messageCount: {
    type: Number,
    default: 0
  },
  sessionDuration: {
    type: Number, // in minutes
    default: 0
  },
  topics: [{
    type: String,
    enum: [
      'Academic Stress', 'Anxiety', 'Depression', 'Relationships',
      'Self Improvement', 'Career', 'Family Issues', 'Sleep Problems',
      'General Support', 'Crisis Support'
    ]
  }],
  // Consent management
  consentToStore: {
    type: Boolean,
    default: false
  },
  consentToShareWithCounselor: {
    type: Boolean,
    default: false
  },
  sharedWithCounselors: [{
    counselor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    sharedAt: {
      type: Date,
      default: Date.now
    }
  }],
  // For anonymous sessions
  isAnonymous: {
    type: Boolean,
    default: false
  },
  sessionId: {
    type: String, // For anonymous users
    required: true,
    unique: true
  },
  // Session details
  topic: {
    type: String,
    default: 'General Support'
  },
  language: {
    type: String,
    enum: ['en', 'hi', 'ur'],
    default: 'en'
  },
  status: {
    type: String,
    enum: ['active', 'ended', 'paused'],
    default: 'active'
  },
  startedAt: {
    type: Date,
    default: Date.now
  },
  endedAt: {
    type: Date
  },
  lastMessageAt: {
    type: Date
  },
  // Crisis detection
  crisisDetected: {
    type: Boolean,
    default: false
  },
  crisisLevel: {
    type: String,
    enum: ['low', 'medium', 'high'],
    default: 'low'
  },
  // Messages array
  messages: [{
    role: {
      type: String,
      enum: ['user', 'assistant'],
      required: true
    },
    content: {
      type: String,
      required: true
    },
    timestamp: {
      type: Date,
      default: Date.now
    },
    agent: {
      type: String,
      default: 'listener'
    }
  }],
  // User feedback
  feedback: {
    type: String
  },
  // AI-generated insights
  insights: {
    riskIndicators: [String],
    suggestedActions: [String],
    followUpNeeded: {
      type: Boolean,
      default: false
    }
  },
  // TTL for anonymous entries
  expiresAt: {
    type: Date,
    index: { expireAfterSeconds: 0 } // TTL index for anonymous entries
  }
}, {
  timestamps: true
});

// Index for efficient querying
chatSummarySchema.index({ student: 1, sessionDate: -1 });
chatSummarySchema.index({ isAnonymous: 1 });
chatSummarySchema.index({ topics: 1 });

// Set TTL for anonymous entries (30 days)
chatSummarySchema.pre('save', function(next) {
  if (this.isAnonymous && !this.expiresAt) {
    this.expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days
  }
  next();
});

module.exports = mongoose.model('ChatSummary', chatSummarySchema);
