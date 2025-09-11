const ForumPost = require('../../models/forumPost.model');
const ForumComment = require('../../models/forumComment.model');
const User = require('../../models/user.model');
const AuditEvent = require('../../models/auditEvent.model');
const axios = require('axios');
const config = require('../../config');

// Create a new forum post
const createPost = async (req, res) => {
  try {
    const { title, content, category, isAnonymous = false, tags = [] } = req.body;
    const userId = req.user._id;

    // Validate required fields
    if (!title || !content || !category) {
      return res.status(400).json({
        success: false,
        message: 'Title, content, and category are required.'
      });
    }

    // Validate content length
    if (content.length > 2000) {
      return res.status(400).json({
        success: false,
        message: 'Post content cannot exceed 2000 characters.'
      });
    }

    // Moderate content using AI service
    try {
      const moderationResponse = await axios.post(`${config.AI_SERVICE_URL}/api/moderation/scan-post`, {
        text: content
      }, {
        timeout: config.AI_SERVICE_TIMEOUT
      });

      const moderationResult = moderationResponse.data;

      // If content is blocked, reject the post
      if (moderationResult.decision === 'block') {
        return res.status(400).json({
          success: false,
          message: 'Your post contains inappropriate content and cannot be published.',
          moderationReason: moderationResult.reason
        });
      }

      // If content needs review, set status to under_review
      const postStatus = moderationResult.decision === 'review' ? 'under_review' : 'visible';

      // Create the post
      const post = new ForumPost({
        author: userId,
        title: title.trim(),
        content: content.trim(),
        category,
        isAnonymous,
        status: postStatus,
        tags,
        language: req.user.preferences?.language || 'en',
        moderation: {
          decision: moderationResult.decision,
          reason: moderationResult.reason,
          aiConfidence: moderationResult.confidence
        }
      });

      await post.save();

      // Log post creation
      await AuditEvent.create({
        eventType: 'forum_post_created',
        userId: userId,
        description: `User created forum post in category: ${category}`,
        metadata: {
          postId: post._id,
          category: category,
          isAnonymous: isAnonymous,
          moderationDecision: moderationResult.decision,
          moderationConfidence: moderationResult.confidence
        },
        source: 'api'
      });

      // Populate author info if not anonymous
      if (!isAnonymous) {
        await post.populate('author', 'profile firstName lastName');
      }

      res.status(201).json({
        success: true,
        message: postStatus === 'under_review' 
          ? 'Your post has been submitted for review and will be published once approved.'
          : 'Post created successfully.',
        data: {
          post: {
            id: post._id,
            title: post.title,
            content: post.content,
            category: post.category,
            isAnonymous: post.isAnonymous,
            status: post.status,
            tags: post.tags,
            createdAt: post.createdAt,
            author: isAnonymous ? null : post.author
          }
        }
      });

    } catch (moderationError) {
      console.error('Moderation service error:', moderationError);
      
      // If moderation service is down, allow post but mark for review
      const post = new ForumPost({
        author: userId,
        title: title.trim(),
        content: content.trim(),
        category,
        isAnonymous,
        status: 'under_review',
        tags,
        language: req.user.preferences?.language || 'en',
        moderation: {
          decision: 'pending',
          reason: 'Moderation service unavailable - manual review required'
        }
      });

      await post.save();

      res.status(201).json({
        success: true,
        message: 'Your post has been submitted and will be reviewed before publishing.',
        data: {
          post: {
            id: post._id,
            title: post.title,
            content: post.content,
            category: post.category,
            isAnonymous: post.isAnonymous,
            status: post.status,
            tags: post.tags,
            createdAt: post.createdAt,
            author: isAnonymous ? null : post.author
          }
        }
      });
    }

  } catch (error) {
    console.error('Create post error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while creating post.'
    });
  }
};

// Get forum posts
const getPosts = async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      category, 
      search, 
      sortBy = 'createdAt', 
      sortOrder = 'desc',
      status = 'visible'
    } = req.query;

    // Build query
    const query = { status: status };
    
    if (category) {
      query.category = category;
    }
    
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { content: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search, 'i')] } }
      ];
    }

    // Build sort object
    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    // Get posts with pagination
    const posts = await ForumPost.find(query)
      .populate('author', 'profile firstName lastName')
      .sort(sort)
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .select('title content category isAnonymous status tags createdAt viewCount commentCount likeCount author');

    // Get total count
    const total = await ForumPost.countDocuments(query);

    // Increment view count for each post
    await ForumPost.updateMany(
      { _id: { $in: posts.map(p => p._id) } },
      { $inc: { viewCount: 1 } }
    );

    res.json({
      success: true,
      data: {
        posts,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(total / limit),
          totalPosts: total,
          hasNextPage: page * limit < total,
          hasPrevPage: page > 1
        }
      }
    });

  } catch (error) {
    console.error('Get posts error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching posts.'
    });
  }
};

// Get single post
const getPost = async (req, res) => {
  try {
    const { id } = req.params;

    const post = await ForumPost.findById(id)
      .populate('author', 'profile firstName lastName')
      .populate({
        path: 'comments',
        populate: {
          path: 'author',
          select: 'profile firstName lastName'
        },
        options: { sort: { createdAt: 1 } }
      });

    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found.'
      });
    }

    // Only show visible posts to non-admin users
    if (post.status !== 'visible' && !['admin', 'super_admin'].includes(req.user?.role)) {
      return res.status(404).json({
        success: false,
        message: 'Post not found.'
      });
    }

    // Increment view count
    await ForumPost.findByIdAndUpdate(id, { $inc: { viewCount: 1 } });

    res.json({
      success: true,
      data: {
        post
      }
    });

  } catch (error) {
    console.error('Get post error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching post.'
    });
  }
};

// Create comment
const createComment = async (req, res) => {
  try {
    const { postId, content, isAnonymous = false, parentComment } = req.body;
    const userId = req.user._id;

    // Validate required fields
    if (!postId || !content) {
      return res.status(400).json({
        success: false,
        message: 'Post ID and content are required.'
      });
    }

    // Validate content length
    if (content.length > 500) {
      return res.status(400).json({
        success: false,
        message: 'Comment content cannot exceed 500 characters.'
      });
    }

    // Check if post exists
    const post = await ForumPost.findById(postId);
    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found.'
      });
    }

    // Moderate comment content
    try {
      const moderationResponse = await axios.post(`${config.AI_SERVICE_URL}/api/moderation/scan-post`, {
        text: content
      }, {
        timeout: config.AI_SERVICE_TIMEOUT
      });

      const moderationResult = moderationResponse.data;

      if (moderationResult.decision === 'block') {
        return res.status(400).json({
          success: false,
          message: 'Your comment contains inappropriate content and cannot be published.',
          moderationReason: moderationResult.reason
        });
      }

      const commentStatus = moderationResult.decision === 'review' ? 'under_review' : 'visible';

      // Create comment
      const comment = new ForumComment({
        author: userId,
        post: postId,
        content: content.trim(),
        isAnonymous,
        parentComment: parentComment || null,
        status: commentStatus,
        moderation: {
          decision: moderationResult.decision,
          reason: moderationResult.reason
        }
      });

      await comment.save();

      // Add comment to post
      post.comments.push(comment._id);
      await post.save();

      // Update comment count
      await ForumPost.findByIdAndUpdate(postId, { $inc: { commentCount: 1 } });

      // Log comment creation
      await AuditEvent.create({
        eventType: 'forum_comment_created',
        userId: userId,
        description: `User created comment on post`,
        metadata: {
          postId: postId,
          commentId: comment._id,
          isAnonymous: isAnonymous,
          moderationDecision: moderationResult.decision
        },
        source: 'api'
      });

      // Populate author info if not anonymous
      if (!isAnonymous) {
        await comment.populate('author', 'profile firstName lastName');
      }

      res.status(201).json({
        success: true,
        message: commentStatus === 'under_review' 
          ? 'Your comment has been submitted for review.'
          : 'Comment created successfully.',
        data: {
          comment: {
            id: comment._id,
            content: comment.content,
            isAnonymous: comment.isAnonymous,
            status: comment.status,
            createdAt: comment.createdAt,
            author: isAnonymous ? null : comment.author
          }
        }
      });

    } catch (moderationError) {
      console.error('Comment moderation error:', moderationError);
      
      // Create comment with review status if moderation fails
      const comment = new ForumComment({
        author: userId,
        post: postId,
        content: content.trim(),
        isAnonymous,
        parentComment: parentComment || null,
        status: 'under_review',
        moderation: {
          decision: 'pending',
          reason: 'Moderation service unavailable'
        }
      });

      await comment.save();
      post.comments.push(comment._id);
      await post.save();

      res.status(201).json({
        success: true,
        message: 'Your comment has been submitted and will be reviewed.',
        data: {
          comment: {
            id: comment._id,
            content: comment.content,
            isAnonymous: comment.isAnonymous,
            status: comment.status,
            createdAt: comment.createdAt,
            author: isAnonymous ? null : comment.author
          }
        }
      });
    }

  } catch (error) {
    console.error('Create comment error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while creating comment.'
    });
  }
};

// Like/unlike post
const togglePostLike = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    const post = await ForumPost.findById(id);
    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found.'
      });
    }

    // Check if user already liked the post
    const existingLike = post.likes.find(like => like.user.toString() === userId.toString());

    if (existingLike) {
      // Remove like
      post.likes = post.likes.filter(like => like.user.toString() !== userId.toString());
      await post.save();
      await post.updateLikeCount();

      res.json({
        success: true,
        message: 'Post unliked.',
        data: {
          liked: false,
          likeCount: post.likeCount
        }
      });
    } else {
      // Add like
      post.likes.push({ user: userId });
      await post.save();
      await post.updateLikeCount();

      res.json({
        success: true,
        message: 'Post liked.',
        data: {
          liked: true,
          likeCount: post.likeCount
        }
      });
    }

  } catch (error) {
    console.error('Toggle post like error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating post like.'
    });
  }
};

// Moderate post (admin/moderator only)
const moderatePost = async (req, res) => {
  try {
    const { id } = req.params;
    const { action, reason } = req.body;
    const userId = req.user._id;

    // Only admins and counselors can moderate
    if (!['admin', 'counselor', 'super_admin'].includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Insufficient permissions for moderation.'
      });
    }

    const post = await ForumPost.findById(id);
    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found.'
      });
    }

    // Update post status based on action
    let newStatus = post.status;
    switch (action) {
      case 'approve':
        newStatus = 'visible';
        break;
      case 'hide':
        newStatus = 'hidden';
        break;
      case 'flag':
        newStatus = 'flagged';
        break;
      default:
        return res.status(400).json({
          success: false,
          message: 'Invalid moderation action.'
        });
    }

    // Update moderation metadata
    post.moderation.decision = action === 'approve' ? 'allow' : 'block';
    post.moderation.reason = reason || `Moderated by ${req.user.role}`;
    post.moderation.moderatedBy = userId;
    post.moderation.moderatedAt = new Date();
    post.status = newStatus;

    await post.save();

    // Log moderation action
    await AuditEvent.create({
      eventType: 'forum_post_moderated',
      userId: userId,
      description: `Post moderated: ${action}`,
      metadata: {
        postId: post._id,
        action: action,
        reason: reason,
        previousStatus: post.status,
        newStatus: newStatus
      },
      source: 'api'
    });

    res.json({
      success: true,
      message: `Post ${action}d successfully.`,
      data: {
        postId: post._id,
        status: newStatus,
        moderationAction: action
      }
    });

  } catch (error) {
    console.error('Moderate post error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while moderating post.'
    });
  }
};

module.exports = {
  createPost,
  getPosts,
  getPost,
  createComment,
  togglePostLike,
  moderatePost
};
