const express = require('express');
const router = express.Router();
const { 
  startSession, 
  sendMessage, 
  getSessionMessages, 
  getUserSessions,
  endSession,
  getSessionSummary
} = require('../controllers/chat.controller');
const { authenticate, optionalAuth } = require('../middlewares/auth.middleware');

// Public routes (for anonymous chat)
router.post('/start-session', optionalAuth, startSession);
router.post('/send-message', optionalAuth, sendMessage);
router.get('/sessions/:sessionId/messages', optionalAuth, getSessionMessages);

// Protected routes (require authentication)
router.use(authenticate);

router.get('/sessions', getUserSessions);
router.get('/sessions/:sessionId/summary', getSessionSummary);
router.put('/sessions/:sessionId/end', endSession);

module.exports = router;
