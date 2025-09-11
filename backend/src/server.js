const express = require('express');
const http = require('http');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const config = require('./config');
const { initializeWebSocket } = require('./services/websocket.service');

// Load environment variables
dotenv.config();

// Connect to database
connectDB();

const app = express();

// Middlewares
app.use(cors({
  origin: config.CORS_ORIGINS,
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Request logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// API Routes
app.get('/', (req, res) => {
  res.json({
    message: 'ManMitra API is running...',
    version: '1.0.0',
    environment: config.NODE_ENV,
    timestamp: new Date().toISOString()
  });
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// API Routes
app.use('/api/auth', require('./api/routes/auth.routes'));
app.use('/api/admin', require('./api/routes/admin.routes'));
app.use('/api/bookings', require('./api/routes/booking.routes'));
app.use('/api/forum', require('./api/routes/forum.routes'));
app.use('/api/resources', require('./api/routes/resource.routes'));
app.use('/api/mood', require('./api/routes/mood.routes'));
app.use('/api/notifications', require('./api/routes/notification.routes'));
app.use('/api/chat', require('./api/routes/chat.routes'));
app.use('/api/analytics', require('./api/routes/analytics.routes'));
app.use('/api/crisis', require('./api/routes/crisis.routes'));
app.use('/api/config', require('./api/routes/config.routes'));
app.use('/api/counselors', require('./api/routes/counselor.routes'));

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'ManMitra API Server is running',
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: '3.0.0'
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'API endpoint not found'
  });
});

// Global error handler
app.use((error, req, res, next) => {
  console.error('Global error handler:', error);
  
  res.status(error.status || 500).json({
    success: false,
    message: error.message || 'Internal server error',
    ...(config.NODE_ENV === 'development' && { stack: error.stack })
  });
});

const server = http.createServer(app);

// Initialize WebSocket
initializeWebSocket(server);

const PORT = config.PORT;

server.listen(PORT, () => {
  console.log(`🚀 ManMitra API Server running on port ${PORT}`);
  console.log(`🌍 Environment: ${config.NODE_ENV}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
});
