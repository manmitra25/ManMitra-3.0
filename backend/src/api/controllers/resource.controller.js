const Resource = require('../../models/resource.model');
const User = require('../../models/user.model');
const AuditEvent = require('../../models/auditEvent.model');
const { sendNotification } = require('../../services/websocket.service');

/**
 * Get all resources with filtering
 */
const getResources = async (req, res) => {
  try {
    const { 
      category, 
      type, 
      language = 'en', 
      difficulty,
      offline,
      page = 1, 
      limit = 20,
      search 
    } = req.query;

    // Build filter object
    const filter = { isActive: true };
    
    if (category) {
      filter.category = { $regex: category, $options: 'i' };
    }
    
    if (type) {
      filter.type = type;
    }
    
    if (difficulty) {
      filter.difficultyLevel = difficulty;
    }
    
    if (offline === 'true') {
      filter.offlineAvailable = true;
    }

    // Build search query
    if (search) {
      filter.$or = [
        { 'title.en': { $regex: search, $options: 'i' } },
        { 'title.hi': { $regex: search, $options: 'i' } },
        { 'title.ur': { $regex: search, $options: 'i' } },
        { 'description.en': { $regex: search, $options: 'i' } },
        { 'description.hi': { $regex: search, $options: 'i' } },
        { 'description.ur': { $regex: search, $options: 'i' } },
        { tags: { $regex: search, $options: 'i' } }
      ];
    }

    const skip = (page - 1) * limit;
    
    const [resources, total] = await Promise.all([
      Resource.find(filter)
        .select({
          title: 1,
          description: 1,
          type: 1,
          category: 1,
          difficultyLevel: 1,
          estimatedDuration: 1,
          tags: 1,
          mediaUrls: 1,
          usageCount: 1,
          rating: 1,
          isFeatured: 1,
          offlineAvailable: 1,
          culturalAdaptation: 1
        })
        .sort({ isFeatured: -1, usageCount: -1, createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      
      Resource.countDocuments(filter)
    ]);

    // Localize content based on language
    const localizedResources = resources.map(resource => ({
      ...resource.toObject(),
      title: resource.title[language] || resource.title.en,
      description: resource.description[language] || resource.description.en,
      content: resource.content ? (resource.content[language] || resource.content.en) : undefined
    }));

    res.json({
      success: true,
      data: {
        resources: localizedResources,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(total / limit),
          totalResources: total,
          hasNext: page * limit < total,
          hasPrev: page > 1
        }
      }
    });

  } catch (error) {
    console.error('Error fetching resources:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch resources',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Get specific resource by ID
 */
const getResource = async (req, res) => {
  try {
    const { id } = req.params;
    const { language = 'en' } = req.query;

    const resource = await Resource.findById(id);
    
    if (!resource || !resource.isActive) {
      return res.status(404).json({
        success: false,
        message: 'Resource not found'
      });
    }

    // Increment usage count
    await Resource.findByIdAndUpdate(id, { $inc: { usageCount: 1 } });

    // Localize content
    const localizedResource = {
      ...resource.toObject(),
      title: resource.title[language] || resource.title.en,
      description: resource.description[language] || resource.description.en,
      content: resource.content[language] || resource.content.en
    };

    // Log resource access
    if (req.user) {
      await AuditEvent.create({
        eventType: 'resource_access',
        userId: req.user.id,
        metadata: {
          resourceId: id,
          resourceType: resource.type,
          language: language
        },
        severity: 'info'
      });
    }

    res.json({
      success: true,
      data: localizedResource
    });

  } catch (error) {
    console.error('Error fetching resource:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch resource',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Get resource categories
 */
const getCategories = async (req, res) => {
  try {
    const { language = 'en' } = req.query;

    const categories = await Resource.aggregate([
      { $match: { isActive: true } },
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    // Map categories with translations
    const categoryMap = {
      'cbt': { en: 'Cognitive Behavioral Therapy', hi: 'संज्ञानात्मक व्यवहार चिकित्सा', ur: 'علمی رویے کی تھراپی' },
      'mindfulness': { en: 'Mindfulness & Meditation', hi: 'सचेतनता और ध्यान', ur: 'ذہنی آگاہی اور مراقبہ' },
      'stress_management': { en: 'Stress Management', hi: 'तनाव प्रबंधन', ur: 'تناؤ کا انتظام' },
      'anxiety_relief': { en: 'Anxiety Relief', hi: 'चिंता राहत', ur: 'اضطراب سے نجات' },
      'depression_support': { en: 'Depression Support', hi: 'अवसाद सहायता', ur: 'ڈپریشن کی مدد' },
      'academic_stress': { en: 'Academic Stress', hi: 'शैक्षणिक तनाव', ur: 'تعلیمی دباؤ' },
      'relationships': { en: 'Relationships', hi: 'रिश्ते', ur: 'تعلقات' },
      'self_care': { en: 'Self Care', hi: 'आत्म देखभाल', ur: 'خود کی دیکھ بھال' },
      'crisis_support': { en: 'Crisis Support', hi: 'संकट सहायता', ur: 'بحران کی مدد' }
    };

    const localizedCategories = categories.map(cat => ({
      id: cat._id,
      name: categoryMap[cat._id] ? categoryMap[cat._id][language] || categoryMap[cat._id].en : cat._id,
      count: cat.count
    }));

    res.json({
      success: true,
      data: localizedCategories
    });

  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch categories',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Add resource to favorites (requires authentication)
 */
const addToFavorites = async (req, res) => {
  try {
    const { resourceId } = req.body;
    const userId = req.user.id;

    // Check if resource exists
    const resource = await Resource.findById(resourceId);
    if (!resource) {
      return res.status(404).json({
        success: false,
        message: 'Resource not found'
      });
    }

    // Add to user's favorites (this would require a UserFavorites model)
    // For now, we'll just log the action
    await AuditEvent.create({
      eventType: 'resource_favorite',
      userId: userId,
      metadata: {
        resourceId: resourceId,
        resourceType: resource.type
      },
      severity: 'info'
    });

    res.json({
      success: true,
      message: 'Resource added to favorites'
    });

  } catch (error) {
    console.error('Error adding to favorites:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to add to favorites',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Track resource usage
 */
const trackUsage = async (req, res) => {
  try {
    const { resourceId, interactionType, duration, completionPercentage, rating, feedback } = req.body;
    const userId = req.user?.id; // Optional for anonymous usage

    // Validate interaction type
    const validTypes = ['view', 'complete', 'favorite', 'share', 'download'];
    if (!validTypes.includes(interactionType)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid interaction type'
      });
    }

    // Create usage record (would require a ResourceInteraction model)
    await AuditEvent.create({
      eventType: 'resource_interaction',
      userId: userId,
      metadata: {
        resourceId: resourceId,
        interactionType: interactionType,
        duration: duration,
        completionPercentage: completionPercentage,
        rating: rating,
        feedback: feedback,
        timestamp: new Date()
      },
      severity: 'info'
    });

    // Update resource usage count
    await Resource.findByIdAndUpdate(resourceId, { $inc: { usageCount: 1 } });

    res.json({
      success: true,
      message: 'Usage tracked successfully'
    });

  } catch (error) {
    console.error('Error tracking usage:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to track usage',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Get featured resources
 */
const getFeaturedResources = async (req, res) => {
  try {
    const { language = 'en' } = req.query;
    const limit = parseInt(req.query.limit) || 6;

    const resources = await Resource.find({
      isActive: true,
      isFeatured: true
    })
    .select({
      title: 1,
      description: 1,
      type: 1,
      category: 1,
      difficultyLevel: 1,
      estimatedDuration: 1,
      tags: 1,
      mediaUrls: 1,
      usageCount: 1,
      rating: 1,
      culturalAdaptation: 1
    })
    .sort({ usageCount: -1, createdAt: -1 })
    .limit(limit);

    // Localize content
    const localizedResources = resources.map(resource => ({
      ...resource.toObject(),
      title: resource.title[language] || resource.title.en,
      description: resource.description[language] || resource.description.en
    }));

    res.json({
      success: true,
      data: localizedResources
    });

  } catch (error) {
    console.error('Error fetching featured resources:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch featured resources',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

module.exports = {
  getResources,
  getResource,
  getCategories,
  addToFavorites,
  trackUsage,
  getFeaturedResources
};
