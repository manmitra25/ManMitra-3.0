const express = require('express');
const router = express.Router();
const { 
  getNotifications, 
  markAsRead, 
  markAllAsRead, 
  deleteNotification,
  updatePreferences,
  sendNotificationToUser,
  getNotificationStats
} = require('../controllers/notification.controller');
const { authenticate } = require('../middlewares/auth.middleware');
const { requireAdmin } = require('../middlewares/role.middleware');

// All routes require authentication
router.use(authenticate);

// User routes
router.get('/', getNotifications);
router.get('/stats', getNotificationStats);
router.put('/:notificationId/read', markAsRead);
router.put('/read-all', markAllAsRead);
router.delete('/:notificationId', deleteNotification);
router.put('/preferences', updatePreferences);

// Admin routes
router.post('/send', requireAdmin, sendNotificationToUser);

module.exports = router;
