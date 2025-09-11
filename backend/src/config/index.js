require('dotenv').config();

const config = {
  // Server configuration
  PORT: process.env.PORT || 5000,
  NODE_ENV: process.env.NODE_ENV || 'development',
  
  // Database configuration
  MONGO_URI: process.env.MONGO_URI || 'mongodb://localhost:27017/manmitra',
  
  // JWT configuration
  JWT_SECRET: process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production',
  JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET,
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '24h',
  JWT_REFRESH_EXPIRES_IN: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
  
  // CORS configuration
  CORS_ORIGINS: process.env.CORS_ORIGINS ? process.env.CORS_ORIGINS.split(',') : ['http://localhost:3000', 'http://localhost:5173'],
  
  // AI Service configuration
  AI_SERVICE_URL: process.env.AI_SERVICE_URL || 'http://localhost:8000',
  AI_SERVICE_TIMEOUT: parseInt(process.env.AI_SERVICE_TIMEOUT) || 30000,
  
  // Redis configuration (optional)
  REDIS_URL: process.env.REDIS_URL || null,
  REDIS_HOST: process.env.REDIS_HOST || 'localhost',
  REDIS_PORT: parseInt(process.env.REDIS_PORT) || 6379,
  REDIS_PASSWORD: process.env.REDIS_PASSWORD || null,
  
  // Rate limiting configuration
  RATE_LIMIT_WINDOW_MS: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 900000, // 15 minutes
  RATE_LIMIT_MAX_REQUESTS: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100,
  
  // Chat configuration
  ANONYMOUS_CHAT_LIMIT: parseInt(process.env.ANONYMOUS_CHAT_LIMIT) || 5,
  CHAT_SESSION_TIMEOUT: parseInt(process.env.CHAT_SESSION_TIMEOUT) || 3600000, // 1 hour
  DAILY_CHAT_LIMIT: parseInt(process.env.DAILY_CHAT_LIMIT) || 50,
  
  // Booking configuration
  BOOKING_HOLD_DURATION: parseInt(process.env.BOOKING_HOLD_DURATION) || 300000, // 5 minutes
  MIN_BOOKING_DURATION: parseInt(process.env.MIN_BOOKING_DURATION) || 30, // minutes
  MAX_BOOKING_DURATION: parseInt(process.env.MAX_BOOKING_DURATION) || 120, // minutes
  
  // File upload configuration
  MAX_FILE_SIZE: parseInt(process.env.MAX_FILE_SIZE) || 10485760, // 10MB
  ALLOWED_FILE_TYPES: process.env.ALLOWED_FILE_TYPES ? process.env.ALLOWED_FILE_TYPES.split(',') : ['jpg', 'jpeg', 'png', 'pdf', 'doc', 'docx'],
  
  // Email configuration (for future use)
  SMTP_HOST: process.env.SMTP_HOST || null,
  SMTP_PORT: parseInt(process.env.SMTP_PORT) || 587,
  SMTP_USER: process.env.SMTP_USER || null,
  SMTP_PASS: process.env.SMTP_PASS || null,
  FROM_EMAIL: process.env.FROM_EMAIL || 'noreply@manmitra.app',
  
  // SMS configuration (for future use)
  SMS_API_KEY: process.env.SMS_API_KEY || null,
  SMS_API_SECRET: process.env.SMS_API_SECRET || null,
  
  // Analytics configuration
  ANALYTICS_RETENTION_DAYS: parseInt(process.env.ANALYTICS_RETENTION_DAYS) || 365,
  K_ANONYMITY_THRESHOLD: parseInt(process.env.K_ANONYMITY_THRESHOLD) || 5,
  
  // Security configuration
  BCRYPT_ROUNDS: parseInt(process.env.BCRYPT_ROUNDS) || 12,
  SESSION_SECRET: process.env.SESSION_SECRET || 'your-session-secret-change-in-production',
  
  // Feature flags
  FEATURES: {
    ENABLE_ANONYMOUS_CHAT: process.env.ENABLE_ANONYMOUS_CHAT !== 'false',
    ENABLE_FORUM: process.env.ENABLE_FORUM !== 'false',
    ENABLE_BOOKING: process.env.ENABLE_BOOKING !== 'false',
    ENABLE_ANALYTICS: process.env.ENABLE_ANALYTICS !== 'false',
    ENABLE_NOTIFICATIONS: process.env.ENABLE_NOTIFICATIONS !== 'false',
    ENABLE_OFFLINE_MODE: process.env.ENABLE_OFFLINE_MODE !== 'false'
  },
  
  // Logging configuration
  LOG_LEVEL: process.env.LOG_LEVEL || 'info',
  LOG_FILE: process.env.LOG_FILE || null,
  
  // Backup configuration
  BACKUP_SCHEDULE: process.env.BACKUP_SCHEDULE || '0 2 * * *', // Daily at 2 AM
  BACKUP_RETENTION_DAYS: parseInt(process.env.BACKUP_RETENTION_DAYS) || 30
};

// Validation
const requiredEnvVars = ['JWT_SECRET', 'MONGO_URI'];
const missingEnvVars = requiredEnvVars.filter(envVar => !process.env[envVar]);

if (missingEnvVars.length > 0) {
  console.warn(`Warning: Missing required environment variables: ${missingEnvVars.join(', ')}`);
  if (config.NODE_ENV === 'production') {
    console.error('Fatal: Required environment variables missing in production!');
    process.exit(1);
  }
}

// Development-specific configurations
if (config.NODE_ENV === 'development') {
  config.CORS_ORIGINS.push('http://localhost:3001', 'http://127.0.0.1:3000');
}

module.exports = config;
