const mongoose = require('mongoose');

const resourceSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Resource title is required'],
    trim: true
  },
  type: {
    type: String,
    enum: ['video', 'book', 'article', 'audio', 'exercise', 'meditation'],
    required: true
  },
  url: {
    type: String,
    required: [true, 'Resource URL is required'],
    validate: {
      validator: function(v) {
        return /^https?:\/\/.+/.test(v);
      },
      message: 'Resource URL must be a valid URL'
    }
  },
  description: {
    type: String,
    required: [true, 'Resource description is required'],
    maxlength: [500, 'Description cannot exceed 500 characters']
  },
  languages: [{
    type: String,
    enum: ['en', 'hi', 'ur'],
    default: ['en']
  }],
  tags: [{
    type: String,
    enum: [
      'Anxiety', 'Depression', 'Stress Management', 'Mindfulness',
      'Breathing Exercises', 'Sleep', 'Academic Stress', 'Relationships',
      'Self Care', 'Crisis Support', 'Meditation', 'CBT Techniques'
    ]
  }],
  targetAudience: {
    type: String,
    enum: ['students', 'general', 'crisis', 'all'],
    default: 'students'
  },
  duration: {
    type: Number, // in minutes
    min: 0
  },
  difficulty: {
    type: String,
    enum: ['beginner', 'intermediate', 'advanced'],
    default: 'beginner'
  },
  offlineAvailable: {
    type: Boolean,
    default: false
  },
  fileSize: {
    type: Number // in bytes, for offline resources
  },
  thumbnail: {
    type: String,
    validate: {
      validator: function(v) {
        return !v || /^https?:\/\/.+\.(jpg|jpeg|png|gif|webp)$/i.test(v);
      },
      message: 'Thumbnail must be a valid image URL'
    }
  },
  views: {
    type: Number,
    default: 0
  },
  downloads: {
    type: Number,
    default: 0
  },
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
  isActive: {
    type: Boolean,
    default: true
  },
  isFeatured: {
    type: Boolean,
    default: false
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
});

// Index for efficient querying
resourceSchema.index({ type: 1, isActive: 1 });
resourceSchema.index({ tags: 1 });
resourceSchema.index({ languages: 1 });
resourceSchema.index({ targetAudience: 1 });
resourceSchema.index({ isFeatured: 1, createdAt: -1 });

// Increment view count
resourceSchema.methods.incrementView = function() {
  this.views += 1;
  return this.save();
};

// Increment download count
resourceSchema.methods.incrementDownload = function() {
  this.downloads += 1;
  return this.save();
};

module.exports = mongoose.model('Resource', resourceSchema);
