const mongoose = require('mongoose');

const auditEventSchema = new mongoose.Schema({
  eventType: {
    type: String,
    enum: [
      'user_login', 'user_logout', 'user_signup', 'user_deleted',
      'counselor_created', 'counselor_updated', 'counselor_deleted',
      'booking_created', 'booking_cancelled', 'booking_completed',
      'crisis_escalation', 'helpline_shown', 'emergency_contact',
      'chat_session_start', 'chat_session_end', 'chat_summary_created',
      'forum_post_created', 'forum_post_moderated', 'forum_post_deleted',
      'resource_accessed', 'mood_assessment_submitted',
      'nudge_sent', 'nudge_responded', 'admin_action'
    ],
    required: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  // Anonymous session identifier for non-logged-in users
  sessionId: String,
  // Severity level
  severity: {
    type: String,
    enum: ['info', 'warn', 'error', 'critical'],
    default: 'info'
  },
  // Event description
  description: {
    type: String,
    required: true,
    maxlength: [500, 'Description cannot exceed 500 characters']
  },
  // Metadata for different event types
  metadata: {
    ipAddress: String,
    userAgent: String,
    location: {
      country: String,
      region: String,
      city: String
    },
    // Event-specific data
    bookingId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Booking'
    },
    counselorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    postId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ForumPost'
    },
    resourceId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Resource'
    },
    chatSessionId: String,
    riskLevel: String,
    escalationReason: String,
    adminAction: String
  },
  // Source of the event
  source: {
    type: String,
    enum: ['web', 'mobile', 'api', 'admin_panel', 'system'],
    default: 'web'
  },
  // College context for analytics
  collegeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'College'
  },
  // Anonymization flag
  isAnonymized: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Index for efficient querying and analytics
auditEventSchema.index({ eventType: 1, createdAt: -1 });
auditEventSchema.index({ userId: 1, createdAt: -1 });
auditEventSchema.index({ severity: 1, createdAt: -1 });
auditEventSchema.index({ collegeId: 1, createdAt: -1 });
auditEventSchema.index({ createdAt: -1 }); // For time-based queries

// TTL index for automatic cleanup (keep audit logs for 2 years)
auditEventSchema.index({ createdAt: 1 }, { expireAfterSeconds: 63072000 }); // 2 years

module.exports = mongoose.model('AuditEvent', auditEventSchema);
