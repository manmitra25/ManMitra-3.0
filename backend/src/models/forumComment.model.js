const mongoose = require('mongoose');

const forumCommentSchema = new mongoose.Schema({
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  post: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ForumPost',
    required: true
  },
  content: {
    type: String,
    required: [true, 'Comment content is required'],
    maxlength: [500, 'Comment content cannot exceed 500 characters']
  },
  isAnonymous: {
    type: Boolean,
    default: false
  },
  status: {
    type: String,
    enum: ['visible', 'hidden', 'flagged'],
    default: 'visible'
  },
  parentComment: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ForumComment' // For nested replies
  },
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
    moderatedAt: Date
  },
  // Engagement metrics
  likeCount: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Index for efficient querying
forumCommentSchema.index({ post: 1, createdAt: 1 });
forumCommentSchema.index({ author: 1, createdAt: -1 });
forumCommentSchema.index({ status: 1 });

// Virtual for like count
forumCommentSchema.virtual('totalLikes').get(function() {
  return this.likes.length;
});

// Update like count when likes are added/removed
forumCommentSchema.methods.updateLikeCount = function() {
  this.likeCount = this.likes.length;
  return this.save();
};

// Ensure virtual fields are serialized
forumCommentSchema.set('toJSON', { virtuals: true });

module.exports = mongoose.model('ForumComment', forumCommentSchema);
