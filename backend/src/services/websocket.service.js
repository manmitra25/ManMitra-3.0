const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');
const User = require('../models/user.model');
const config = require('../config');
const AuditEvent = require('../models/auditEvent.model');

let io;
const connectedUsers = new Map(); // userId -> socket
const anonymousSessions = new Map(); // sessionId -> { messageCount, startTime, lastActivity }

// Initialize WebSocket server
const initializeWebSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: config.CORS_ORIGINS,
      methods: ['GET', 'POST'],
      credentials: true
    }
  });

  io.on('connection', handleConnection);
  
  console.log('🔌 WebSocket server initialized');
};

// Handle new connections
const handleConnection = async (socket) => {
  console.log(`🔌 New socket connection: ${socket.id}`);
  
  try {
    // Extract token from handshake
    const token = socket.handshake.auth?.token || socket.handshake.headers?.authorization?.replace('Bearer ', '');
    
    if (token) {
      // Authenticated user
      const decoded = jwt.verify(token, config.JWT_SECRET);
      const user = await User.findById(decoded.userId).select('-password');
      
      if (user && user.isActive) {
        socket.userId = user._id.toString();
        socket.userRole = user.role;
        socket.isAuthenticated = true;
        
        // Store connection
        connectedUsers.set(user._id.toString(), socket);
        
        // Join user-specific room
        socket.join(`user_${user._id}`);
        
        // Join role-based rooms
        socket.join(`role_${user.role}`);
        
        // Join college room if applicable
        if (user.college) {
          socket.join(`college_${user.college}`);
        }
        
        console.log(`✅ Authenticated user connected: ${user.email} (${user.role})`);
        
        // Send connection confirmation
        socket.emit('connected', {
          type: 'success',
          message: 'Connected successfully',
          user: {
            id: user._id,
            email: user.email,
            role: user.role
          }
        });
        
        // Log connection event
        await logSocketEvent('chat_session_start', user._id, socket, {
          connectionType: 'authenticated'
        });
        
      } else {
        // Invalid token
        socket.emit('error', {
          type: 'auth_error',
          message: 'Invalid authentication'
        });
        socket.disconnect();
        return;
      }
    } else {
      // Anonymous user
      socket.isAuthenticated = false;
      socket.sessionId = generateSessionId();
      socket.messageCount = 0;
      socket.startTime = new Date();
      
      // Initialize anonymous session
      anonymousSessions.set(socket.sessionId, {
        messageCount: 0,
        startTime: socket.startTime,
        lastActivity: new Date()
      });
      
      console.log(`👤 Anonymous user connected: ${socket.sessionId}`);
      
      // Send connection confirmation
      socket.emit('connected', {
        type: 'anonymous',
        message: 'Connected as anonymous user',
        sessionId: socket.sessionId,
        messageLimit: config.ANONYMOUS_CHAT_LIMIT
      });
    }
    
    // Set up event handlers
    setupEventHandlers(socket);
    
    // Set up session timeout for anonymous users
    if (!socket.isAuthenticated) {
      setupSessionTimeout(socket);
    }
    
  } catch (error) {
    console.error('Connection error:', error);
    socket.emit('error', {
      type: 'connection_error',
      message: 'Connection failed'
    });
    socket.disconnect();
  }
};

// Set up event handlers for a socket
const setupEventHandlers = (socket) => {
  // Chat message handler
  socket.on('chat-message', (data) => handleChatMessage(socket, data));
  
  // Booking updates handler
  socket.on('booking-update', (data) => handleBookingUpdate(socket, data));
  
  // Typing indicators
  socket.on('typing-start', (data) => handleTypingStart(socket, data));
  socket.on('typing-stop', (data) => handleTypingStop(socket, data));
  
  // Disconnect handler
  socket.on('disconnect', () => handleDisconnect(socket));
  
  // Error handler
  socket.on('error', (error) => {
    console.error(`Socket error for ${socket.id}:`, error);
  });
};

// Handle chat messages
const handleChatMessage = async (socket, data) => {
  try {
    const { message, history = [], topic } = data;
    
    if (!message || typeof message !== 'string') {
      socket.emit('error', {
        type: 'validation_error',
        message: 'Invalid message format'
      });
      return;
    }
    
    // Check anonymous user limits
    if (!socket.isAuthenticated) {
      const session = anonymousSessions.get(socket.sessionId);
      if (session && session.messageCount >= config.ANONYMOUS_CHAT_LIMIT) {
        socket.emit('login-required', {
          type: 'limit_reached',
          message: 'Anonymous chat limit reached. Please sign in to continue.',
          messageCount: session.messageCount,
          limit: config.ANONYMOUS_CHAT_LIMIT
        });
        return;
      }
      
      // Update session
      session.messageCount += 1;
      session.lastActivity = new Date();
    }
    
    // Update socket message count
    socket.messageCount = (socket.messageCount || 0) + 1;
    
    // Send message to AI service (this will be implemented when we create the FastAPI service)
    // For now, we'll emit a placeholder response
    socket.emit('bestie-response', {
      type: 'chat',
      message: 'Hello! I\'m Bestie, your mental health companion. How can I help you today?',
      timestamp: new Date().toISOString(),
      messageId: socket.messageCount
    });
    
    // Log chat event
    if (socket.isAuthenticated) {
      await logSocketEvent('chat_message', socket.userId, socket, {
        messageLength: message.length,
        topic: topic
      });
    }
    
  } catch (error) {
    console.error('Chat message error:', error);
    socket.emit('error', {
      type: 'chat_error',
      message: 'Failed to process message'
    });
  }
};

// Handle booking updates
const handleBookingUpdate = async (socket, data) => {
  try {
    // This will be implemented when we create the booking system
    console.log('Booking update received:', data);
    
  } catch (error) {
    console.error('Booking update error:', error);
  }
};

// Handle typing start
const handleTypingStart = (socket, data) => {
  if (socket.isAuthenticated) {
    socket.to(`user_${socket.userId}`).emit('user-typing', {
      userId: socket.userId,
      isTyping: true
    });
  }
};

// Handle typing stop
const handleTypingStop = (socket, data) => {
  if (socket.isAuthenticated) {
    socket.to(`user_${socket.userId}`).emit('user-typing', {
      userId: socket.userId,
      isTyping: false
    });
  }
};

// Handle disconnection
const handleDisconnect = async (socket) => {
  console.log(`🔌 Socket disconnected: ${socket.id}`);
  
  try {
    if (socket.isAuthenticated && socket.userId) {
      // Remove from connected users
      connectedUsers.delete(socket.userId);
      
      // Log session end
      await logSocketEvent('chat_session_end', socket.userId, socket, {
        messageCount: socket.messageCount || 0,
        sessionDuration: Date.now() - socket.startTime
      });
      
      console.log(`👤 User disconnected: ${socket.userId}`);
      
    } else if (socket.sessionId) {
      // Clean up anonymous session
      anonymousSessions.delete(socket.sessionId);
      console.log(`👤 Anonymous session ended: ${socket.sessionId}`);
    }
    
  } catch (error) {
    console.error('Disconnect handler error:', error);
  }
};

// Set up session timeout for anonymous users
const setupSessionTimeout = (socket) => {
  const timeoutId = setTimeout(() => {
    if (socket.connected) {
      socket.emit('session-timeout', {
        type: 'timeout',
        message: 'Session expired. Please refresh to continue.',
        duration: config.CHAT_SESSION_TIMEOUT
      });
      socket.disconnect();
    }
  }, config.CHAT_SESSION_TIMEOUT);
  
  // Clear timeout if socket disconnects
  socket.on('disconnect', () => {
    clearTimeout(timeoutId);
  });
};

// Send notification to user
const sendNotification = (userId, notification) => {
  const socket = connectedUsers.get(userId);
  if (socket) {
    socket.emit('notification', notification);
    return true;
  }
  return false;
};

// Send notification to all users with a specific role
const sendNotificationToRole = (role, notification) => {
  io.to(`role_${role}`).emit('notification', notification);
};

// Send notification to all users in a college
const sendNotificationToCollege = (collegeId, notification) => {
  io.to(`college_${collegeId}`).emit('notification', notification);
};

// Broadcast to all connected users
const broadcast = (event, data) => {
  io.emit(event, data);
};

// Get connected users count
const getConnectedUsersCount = () => {
  return {
    authenticated: connectedUsers.size,
    anonymous: anonymousSessions.size,
    total: io.engine.clientsCount
  };
};

// Generate session ID for anonymous users
const generateSessionId = () => {
  return 'anon_' + Math.random().toString(36).substr(2, 9) + '_' + Date.now();
};

// Log socket events
const logSocketEvent = async (eventType, userId, socket, metadata = {}) => {
  try {
    await AuditEvent.create({
      eventType,
      userId,
      description: `WebSocket ${eventType}`,
      metadata: {
        socketId: socket.id,
        ipAddress: socket.handshake.address,
        userAgent: socket.handshake.headers['user-agent'],
        ...metadata
      },
      source: 'websocket'
    });
  } catch (error) {
    console.error('Failed to log socket event:', error);
  }
};

// Cleanup old anonymous sessions
const cleanupAnonymousSessions = () => {
  const now = Date.now();
  const timeout = config.CHAT_SESSION_TIMEOUT;
  
  for (const [sessionId, session] of anonymousSessions.entries()) {
    if (now - session.lastActivity.getTime() > timeout) {
      anonymousSessions.delete(sessionId);
    }
  }
};

// Run cleanup every 5 minutes
setInterval(cleanupAnonymousSessions, 5 * 60 * 1000);

module.exports = {
  initializeWebSocket,
  sendNotification,
  sendNotificationToRole,
  sendNotificationToCollege,
  broadcast,
  getConnectedUsersCount,
  io: () => io
};
