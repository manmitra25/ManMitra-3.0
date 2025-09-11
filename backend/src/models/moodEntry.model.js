const mongoose = require('mongoose');

const moodEntrySchema = new mongoose.Schema({
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  testType: {
    type: String,
    enum: ['PHQ-9', 'GAD-7', 'General Mood'],
    required: true
  },
  scores: [{
    questionNumber: Number,
    score: {
      type: Number,
      min: 0,
      max: 3 // PHQ-9 and GAD-7 both use 0-3 scale
    },
    questionText: String
  }],
  totalScore: {
    type: Number,
    required: true,
    min: 0
  },
  riskLevel: {
    type: String,
    enum: ['low', 'moderate', 'high', 'severe'],
    required: true
  },
  assessmentDate: {
    type: Date,
    default: Date.now
  },
  notes: {
    type: String,
    maxlength: [500, 'Notes cannot exceed 500 characters']
  },
  // Consent flags for sharing with counselor
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
  // For anonymous assessments (before login)
  isAnonymous: {
    type: Boolean,
    default: false
  },
  sessionId: {
    type: String // For anonymous users
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
moodEntrySchema.index({ student: 1, assessmentDate: -1 });
moodEntrySchema.index({ testType: 1, riskLevel: 1 });
moodEntrySchema.index({ isAnonymous: 1 });

// Set TTL for anonymous entries (7 days)
moodEntrySchema.pre('save', function(next) {
  if (this.isAnonymous && !this.expiresAt) {
    this.expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days
  }
  next();
});

// Virtual for interpretation
moodEntrySchema.virtual('interpretation').get(function() {
  if (this.testType === 'PHQ-9') {
    if (this.totalScore <= 4) return 'Minimal depression';
    if (this.totalScore <= 9) return 'Mild depression';
    if (this.totalScore <= 14) return 'Moderate depression';
    if (this.totalScore <= 19) return 'Moderately severe depression';
    return 'Severe depression';
  } else if (this.testType === 'GAD-7') {
    if (this.totalScore <= 4) return 'Minimal anxiety';
    if (this.totalScore <= 9) return 'Mild anxiety';
    if (this.totalScore <= 14) return 'Moderate anxiety';
    return 'Severe anxiety';
  }
  return 'Assessment completed';
});

module.exports = mongoose.model('MoodEntry', moodEntrySchema);
