const mongoose = require('mongoose');

const forumPostSchema = new mongoose.Schema({
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  content: {
    type: String,
    required: [true, 'Post content is required'],
    maxlength: [2000, 'Post content cannot exceed 2000 characters']
  },
  title: {
    type: String,
    required: [true, 'Post title is required'],
    trim: true,
    maxlength: [200, 'Title cannot exceed 200 characters']
  },
  category: {
    type: String,
    enum: [
      'Academic Stress', 'Anxiety', 'Depression', 'Relationships',
      'Self Improvement', 'Career Guidance', 'Family Issues', 'General Support',
      'Success Stories', 'Resources', 'Other'
    ],
    default: 'General Support'
  },
  isAnonymous: {
    type: Boolean,
    default: false
  },
  status: {
    type: String,
    enum: ['visible', 'hidden', 'flagged', 'under_review'],
    default: 'visible'
  },
  comments: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ForumComment'
  }],
  likes: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    likedAt: {
      type: Date,
      default: Date.now
    }
  }],
  language: {
    type: String,
    enum: ['en', 'hi', 'ur'],
    default: 'en'
  },
  tags: [String],
  // Moderation metadata
  moderation: {
    decision: {
      type: String,
      enum: ['allow', 'block', 'pending'],
      default: 'pending'
    },
    reason: String,
    moderatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    moderatedAt: Date,
    aiConfidence: Number // 0-1 confidence score from AI moderation
  },
  // Engagement metrics
  viewCount: {
    type: Number,
    default: 0
  },
  commentCount: {
    type: Number,
    default: 0
  },
  likeCount: {
    type: Number,
    default: 0
  },
  // For featured posts
  isFeatured: {
    type: Boolean,
    default: false
  },
  featuredUntil: Date,
  // For pinned posts by moderators
  isPinned: {
    type: Boolean,
    default: false
  },
  pinnedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

// Index for efficient querying
forumPostSchema.index({ status: 1, createdAt: -1 });
forumPostSchema.index({ category: 1, createdAt: -1 });
forumPostSchema.index({ author: 1, createdAt: -1 });
forumPostSchema.index({ language: 1 });
forumPostSchema.index({ isFeatured: 1, createdAt: -1 });
forumPostSchema.index({ isPinned: 1, createdAt: -1 });

// Virtual for like count
forumPostSchema.virtual('totalLikes').get(function() {
  return this.likes.length;
});

// Virtual for comment count
forumPostSchema.virtual('totalComments').get(function() {
  return this.comments.length;
});

// Update comment count when comments are added/removed
forumPostSchema.methods.updateCommentCount = function() {
  this.commentCount = this.comments.length;
  return this.save();
};

// Update like count when likes are added/removed
forumPostSchema.methods.updateLikeCount = function() {
  this.likeCount = this.likes.length;
  return this.save();
};

// Increment view count
forumPostSchema.methods.incrementView = function() {
  this.viewCount += 1;
  return this.save();
};

// Ensure virtual fields are serialized
forumPostSchema.set('toJSON', { virtuals: true });

module.exports = mongoose.model('ForumPost', forumPostSchema);
