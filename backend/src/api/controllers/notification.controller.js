const Notification = require('../../models/notification.model');
const User = require('../../models/user.model');
const { sendNotification } = require('../../services/websocket.service');

/**
 * Get user's notifications
 */
const getNotifications = async (req, res) => {
  try {
    const userId = req.user.id;
    const { page = 1, limit = 20, unreadOnly = false } = req.query;

    const filter = { userId: userId };
    if (unreadOnly === 'true') {
      filter.isRead = false;
    }

    const skip = (page - 1) * limit;

    const [notifications, total] = await Promise.all([
      Notification.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      
      Notification.countDocuments(filter)
    ]);

    res.json({
      success: true,
      data: {
        notifications: notifications,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(total / limit),
          totalNotifications: total,
          hasNext: page * limit < total,
          hasPrev: page > 1
        }
      }
    });

  } catch (error) {
    console.error('Error fetching notifications:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch notifications',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Mark notification as read
 */
const markAsRead = async (req, res) => {
  try {
    const { notificationId } = req.params;
    const userId = req.user.id;

    const notification = await Notification.findOne({
      _id: notificationId,
      userId: userId
    });

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: 'Notification not found'
      });
    }

    notification.isRead = true;
    notification.readAt = new Date();
    await notification.save();

    res.json({
      success: true,
      message: 'Notification marked as read'
    });

  } catch (error) {
    console.error('Error marking notification as read:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to mark notification as read',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Mark all notifications as read
 */
const markAllAsRead = async (req, res) => {
  try {
    const userId = req.user.id;

    await Notification.updateMany(
      { userId: userId, isRead: false },
      { isRead: true, readAt: new Date() }
    );

    res.json({
      success: true,
      message: 'All notifications marked as read'
    });

  } catch (error) {
    console.error('Error marking all notifications as read:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to mark all notifications as read',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Delete notification
 */
const deleteNotification = async (req, res) => {
  try {
    const { notificationId } = req.params;
    const userId = req.user.id;

    const notification = await Notification.findOneAndDelete({
      _id: notificationId,
      userId: userId
    });

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: 'Notification not found'
      });
    }

    res.json({
      success: true,
      message: 'Notification deleted'
    });

  } catch (error) {
    console.error('Error deleting notification:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete notification',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Update notification preferences
 */
const updatePreferences = async (req, res) => {
  try {
    const userId = req.user.id;
    const { preferences } = req.body;

    // Validate preferences
    const validTypes = ['booking_reminder', 'crisis_follow_up', 'assessment_reminder', 'general'];
    for (const type of Object.keys(preferences)) {
      if (!validTypes.includes(type)) {
        return res.status(400).json({
          success: false,
          message: `Invalid notification type: ${type}`
        });
      }
    }

    // Update user preferences (this would be stored in user model)
    const user = await User.findById(userId);
    if (!user.preferences) {
      user.preferences = {};
    }
    user.preferences.notificationTypes = preferences;
    await user.save();

    res.json({
      success: true,
      message: 'Notification preferences updated',
      data: { preferences }
    });

  } catch (error) {
    console.error('Error updating notification preferences:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update notification preferences',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Send notification (admin only)
 */
const sendNotificationToUser = async (req, res) => {
  try {
    const { userIds, type, title, message, priority = 'medium', actionUrl } = req.body;

    if (!userIds || !Array.isArray(userIds) || userIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'User IDs are required'
      });
    }

    const notifications = [];
    for (const userId of userIds) {
      const notification = new Notification({
        userId: userId,
        type: type,
        title: title,
        message: message,
        priority: priority,
        actionUrl: actionUrl,
        isRead: false
      });
      notifications.push(notification);
    }

    await Notification.insertMany(notifications);

    // Send real-time notifications
    for (const userId of userIds) {
      await sendNotification(userId, {
        type: type,
        title: title,
        message: message,
        priority: priority,
        actionUrl: actionUrl
      });
    }

    res.json({
      success: true,
      message: `Notifications sent to ${userIds.length} users`,
      data: { sentCount: userIds.length }
    });

  } catch (error) {
    console.error('Error sending notifications:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send notifications',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Get notification statistics
 */
const getNotificationStats = async (req, res) => {
  try {
    const userId = req.user.id;

    const [total, unread, byType] = await Promise.all([
      Notification.countDocuments({ userId: userId }),
      Notification.countDocuments({ userId: userId, isRead: false }),
      Notification.aggregate([
        { $match: { userId: userId } },
        { $group: { _id: '$type', count: { $sum: 1 } } },
        { $sort: { count: -1 } }
      ])
    ]);

    res.json({
      success: true,
      data: {
        total: total,
        unread: unread,
        byType: byType
      }
    });

  } catch (error) {
    console.error('Error fetching notification stats:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch notification statistics',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

module.exports = {
  getNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  updatePreferences,
  sendNotificationToUser,
  getNotificationStats
};
