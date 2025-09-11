const ChatSummary = require('../../models/chatSummary.model');
const User = require('../../models/user.model');
const AuditEvent = require('../../models/auditEvent.model');
const { sendNotification } = require('../../services/websocket.service');
const axios = require('axios');
const config = require('../../config');

/**
 * Start a new chat session
 */
const startSession = async (req, res) => {
  try {
    const userId = req.user?.id; // Optional for anonymous sessions
    const { topic, language = 'en', isAnonymous = false } = req.body;

    // Map frontend topic values to backend enum values
    const topicMapping = {
      'academic': 'Academic Stress',
      'anxiety': 'Anxiety',
      'depression': 'Depression',
      'relationships': 'Relationships',
      'self-improvement': 'Self Improvement',
      'career': 'Career',
      'family': 'Family Issues',
      'sleep': 'Sleep Problems',
      'general': 'General Support',
      'crisis': 'Crisis Support'
    };

    const mappedTopic = topicMapping[topic] || 'General Support';

    // Generate session ID
    const sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // Create session summary
    const chatSummary = new ChatSummary({
      student: userId || undefined, // Use userId for student field, undefined if anonymous
      sessionId: sessionId,
      topic: mappedTopic,
      language: language,
      topics: [mappedTopic],
      isAnonymous: isAnonymous || !userId,
      messageCount: 0,
      status: 'active',
      startedAt: new Date()
    });

    await chatSummary.save();

    // Log session start
    await AuditEvent.create({
      eventType: 'chat_session_start',
      userId: userId,
      sessionId: sessionId,
      description: `Chat session started with topic: ${mappedTopic}`,
      metadata: {
        chatSessionId: sessionId,
        topic: topic,
        language: language,
        isAnonymous: isAnonymous
      },
      severity: 'info',
      source: 'web'
    });

    res.json({
      success: true,
      message: 'Chat session started',
      data: {
        sessionId: sessionId,
        topic: topic,
        language: language,
        isAnonymous: isAnonymous,
        startedAt: chatSummary.startedAt
      }
    });

  } catch (error) {
    console.error('Error starting chat session:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to start chat session',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Send message to Bestie AI
 */
const sendMessage = async (req, res) => {
  try {
    const { sessionId, message, language = 'en' } = req.body;
    const userId = req.user?.id;

    // Find chat session
    const chatSession = await ChatSummary.findOne({ sessionId: sessionId });
    if (!chatSession) {
      return res.status(404).json({
        success: false,
        message: 'Chat session not found'
      });
    }

    // Check anonymous message limit
    if (chatSession.isAnonymous && chatSession.messageCount >= 5) {
      return res.status(400).json({
        success: false,
        message: 'Anonymous message limit reached. Please sign up to continue.',
        requiresLogin: true
      });
    }

    // Call FastAPI AI service
    console.log(`Calling FastAPI service at: ${config.AI_SERVICE_URL}/api/chat/ask`);
    console.log('Request payload:', {
      message: message,
      history: chatSession.messages || [],
      user_id: userId,
      locale: language,
      session_id: sessionId
    });

    const aiResponse = await axios.post(`${config.AI_SERVICE_URL}/api/chat/ask`, {
      message: message,
      history: chatSession.messages || [],
      user_id: userId,
      locale: language,
      session_id: sessionId
    }, {
      timeout: config.AI_SERVICE_TIMEOUT || 30000,
      headers: {
        'Content-Type': 'application/json'
      }
    });

    console.log('FastAPI response:', aiResponse.data);

    // Update session with new messages
    const newMessages = [
      ...(chatSession.messages || []),
      {
        role: 'user',
        content: message,
        timestamp: new Date()
      },
      {
        role: 'assistant',
        content: aiResponse.data.response,
        timestamp: new Date(),
        agent: aiResponse.data.agent || 'listener'
      }
    ];

    chatSession.messages = newMessages;
    chatSession.messageCount = newMessages.filter(m => m.role === 'user').length;
    chatSession.lastMessageAt = new Date();

    // Check for crisis detection
    if (aiResponse.data.crisis_detected) {
      chatSession.crisisDetected = true;
      chatSession.crisisLevel = aiResponse.data.crisis_level || 'medium';
      
      // Send crisis notification
      if (userId) {
        await sendNotification(userId, {
          type: 'crisis_detected',
          title: 'Crisis Support Available',
          message: 'We detected that you might need additional support. Help is available.',
          priority: 'high'
        });
      }
    }

    await chatSession.save();

    // Log message sent - using generic eventType since chat_message_sent is not in enum
    // Will log as chat_session_start event with message metadata
    await AuditEvent.create({
      eventType: 'chat_session_start', // Using available enum value
      userId: userId,
      sessionId: sessionId,
      description: `Chat message sent in session ${sessionId}${aiResponse.data.crisis_detected ? ' - Crisis detected' : ''}`,
      metadata: {
        chatSessionId: sessionId,
        messageLength: message.length,
        crisisDetected: aiResponse.data.crisis_detected || false,
        riskLevel: aiResponse.data.crisis_level
      },
      severity: aiResponse.data.crisis_detected ? 'critical' : 'info',
      source: 'web'
    });

    res.json({
      success: true,
      data: {
        response: aiResponse.data.response,
        agent: aiResponse.data.agent,
        crisisDetected: aiResponse.data.crisis_detected || false,
        crisisLevel: aiResponse.data.crisis_level,
        messageCount: chatSession.messageCount,
        requiresLogin: chatSession.isAnonymous && chatSession.messageCount >= 5
      }
    });

  } catch (error) {
    console.error('Error sending message:', error);
    
    // Handle AI service errors
    if (error.response?.status === 503) {
      return res.status(503).json({
        success: false,
        message: 'AI service temporarily unavailable. Please try again later.',
        offline: true
      });
    }

    res.status(500).json({
      success: false,
      message: 'Failed to send message',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Get chat session messages
 */
const getSessionMessages = async (req, res) => {
  try {
    const { sessionId } = req.params;
    const userId = req.user?.id;

    const chatSession = await ChatSummary.findOne({ sessionId: sessionId });
    if (!chatSession) {
      return res.status(404).json({
        success: false,
        message: 'Chat session not found'
      });
    }

    // Check access permissions
    if (chatSession.userId && chatSession.userId !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    res.json({
      success: true,
      data: {
        sessionId: sessionId,
        topic: chatSession.topic,
        language: chatSession.language,
        messages: chatSession.messages || [],
        messageCount: chatSession.messageCount,
        startedAt: chatSession.startedAt,
        lastMessageAt: chatSession.lastMessageAt,
        status: chatSession.status,
        crisisDetected: chatSession.crisisDetected,
        crisisLevel: chatSession.crisisLevel
      }
    });

  } catch (error) {
    console.error('Error fetching session messages:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch session messages',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Get user's chat sessions
 */
const getUserSessions = async (req, res) => {
  try {
    const userId = req.user.id;
    const { page = 1, limit = 10, topic } = req.query;

    const filter = { userId: userId };
    if (topic) {
      filter.topic = { $regex: topic, $options: 'i' };
    }

    const skip = (page - 1) * limit;

    const [sessions, total] = await Promise.all([
      ChatSummary.find(filter)
        .select({
          sessionId: 1,
          topic: 1,
          language: 1,
          messageCount: 1,
          startedAt: 1,
          lastMessageAt: 1,
          status: 1,
          crisisDetected: 1,
          crisisLevel: 1,
          summary: 1
        })
        .sort({ lastMessageAt: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      
      ChatSummary.countDocuments(filter)
    ]);

    res.json({
      success: true,
      data: {
        sessions: sessions,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(total / limit),
          totalSessions: total,
          hasNext: page * limit < total,
          hasPrev: page > 1
        }
      }
    });

  } catch (error) {
    console.error('Error fetching user sessions:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch chat sessions',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * End chat session
 */
const endSession = async (req, res) => {
  try {
    const { sessionId } = req.params;
    const userId = req.user?.id;
    const { consentToStore, consentToShareWithCounselor, feedback } = req.body;

    const chatSession = await ChatSummary.findOne({ sessionId: sessionId });
    if (!chatSession) {
      return res.status(404).json({
        success: false,
        message: 'Chat session not found'
      });
    }

    // Check access permissions
    if (chatSession.userId && chatSession.userId !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    // Update session
    chatSession.status = 'ended';
    chatSession.endedAt = new Date();
    chatSession.consentToStore = consentToStore || false;
    chatSession.consentToShareWithCounselor = consentToShareWithCounselor || false;
    chatSession.feedback = feedback;

    // Generate summary if consent given
    if (consentToStore && chatSession.messages && chatSession.messages.length > 0) {
      try {
        // Call FastAPI to generate summary
        const summaryResponse = await axios.post(`${config.AI_SERVICE_URL}/api/chat/summarize`, {
          messages: chatSession.messages,
          session_id: sessionId,
          topic: chatSession.topic
        });
        
        chatSession.summary = summaryResponse.data.summary;
      } catch (error) {
        console.error('Error generating summary:', error);
        // Continue without summary
      }
    }

    await chatSession.save();

    // Log session end
    await AuditEvent.create({
      eventType: 'chat_session_end',
      userId: userId,
      sessionId: sessionId,
      description: `Chat session ended with ${chatSession.messageCount} messages`,
      metadata: {
        chatSessionId: sessionId,
        messageCount: chatSession.messageCount,
        duration: chatSession.endedAt - chatSession.startedAt,
        consentToStore: consentToStore,
        consentToShareWithCounselor: consentToShareWithCounselor,
        riskLevel: chatSession.crisisDetected ? chatSession.crisisLevel : 'low'
      },
      severity: 'info',
      source: 'web'
    });

    res.json({
      success: true,
      message: 'Chat session ended',
      data: {
        sessionId: sessionId,
        endedAt: chatSession.endedAt,
        summary: chatSession.summary,
        messageCount: chatSession.messageCount
      }
    });

  } catch (error) {
    console.error('Error ending chat session:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to end chat session',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Get chat session summary
 */
const getSessionSummary = async (req, res) => {
  try {
    const { sessionId } = req.params;
    const userId = req.user.id;

    const chatSession = await ChatSummary.findOne({ 
      sessionId: sessionId,
      userId: userId 
    });

    if (!chatSession) {
      return res.status(404).json({
        success: false,
        message: 'Chat session not found'
      });
    }

    res.json({
      success: true,
      data: {
        sessionId: sessionId,
        topic: chatSession.topic,
        summary: chatSession.summary,
        startedAt: chatSession.startedAt,
        endedAt: chatSession.endedAt,
        messageCount: chatSession.messageCount,
        crisisDetected: chatSession.crisisDetected,
        crisisLevel: chatSession.crisisLevel,
        consentToShareWithCounselor: chatSession.consentToShareWithCounselor
      }
    });

  } catch (error) {
    console.error('Error fetching session summary:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch session summary',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

module.exports = {
  startSession,
  sendMessage,
  getSessionMessages,
  getUserSessions,
  endSession,
  getSessionSummary
};
