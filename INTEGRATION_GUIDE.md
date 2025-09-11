# ManMitra 3.0 Backend-Frontend Integration Guide

## Overview

The ManMitra 3.0 backend is now fully integrated with the frontend requirements. This guide provides a comprehensive mapping of frontend features to backend APIs and services.

## 🏗️ Architecture Summary

### Backend Services
- **Node.js/Express (Port 5000)**: Main API server handling authentication, business logic, real-time features
- **FastAPI/Python (Port 8000)**: AI specialist service for Bestie chat and content moderation
- **MongoDB**: Primary database for all application data
- **Socket.io**: Real-time communication for chat, notifications, and booking updates

### Frontend Integration Points
- **React PWA**: Single-page application with role-based dashboards
- **Service Worker**: Offline support and caching
- **WebSocket Client**: Real-time updates and notifications

## 📋 Complete Feature Mapping

### 1. Authentication System ✅

#### Frontend Components
- `AuthProvider.tsx` - Context for user authentication
- `LoginModal.tsx` - Login/signup forms with role selection

#### Backend APIs
```
POST /api/auth/signup          # Student registration
POST /api/auth/login           # Student login
POST /api/auth/admin/login     # Admin/Counselor login
POST /api/auth/refresh         # Token refresh
POST /api/auth/logout          # Logout
GET  /api/auth/profile         # Get user profile
PUT  /api/auth/profile         # Update profile
```

#### Data Models
- `User` - Basic user information and roles
- `UserProfile` - Extended profile with privacy settings

### 2. Bestie AI Chat System ✅

#### Frontend Components
- `BestieChat.tsx` - Basic chat interface
- `EnhancedBestieChat.tsx` - Advanced chat with voice, agents
- `CrisisManagement.tsx` - Crisis detection and escalation

#### Backend APIs
```
POST /api/chat/start-session           # Start new chat session
POST /api/chat/send-message           # Send message to Bestie
GET  /api/chat/sessions/:id/messages  # Get session messages
GET  /api/chat/sessions               # Get user's chat sessions
PUT  /api/chat/sessions/:id/end       # End session with consent
GET  /api/chat/sessions/:id/summary   # Get session summary
```

#### FastAPI AI Service
```
POST /api/chat/ask          # Process message through multi-agent system
POST /api/chat/summarize    # Generate privacy-preserving summaries
POST /api/moderation/scan-post  # Content moderation
```

#### Key Features
- **Anonymous Chat**: 5-message limit without login
- **Multi-Agent System**: Listener, Screener, Tone, Crisis agents
- **Crisis Detection**: Deterministic rules + AI analysis
- **Real-time Updates**: WebSocket notifications
- **Offline Support**: Cached responses and sync

### 3. Mental Health Assessments ✅

#### Frontend Components
- `DailyMoodCheck.tsx` - PHQ-9/GAD-7 assessments
- Mood tracking and progress visualization

#### Backend APIs
```
GET  /api/mood/phq9/questions     # Get PHQ-9 questions (multilingual)
GET  /api/mood/gad7/questions     # Get GAD-7 questions (multilingual)
POST /api/mood/phq9/submit        # Submit PHQ-9 assessment
POST /api/mood/gad7/submit        # Submit GAD-7 assessment
GET  /api/mood/history            # Get assessment history
GET  /api/mood/trends             # Get mood trends and analytics
PUT  /api/mood/:id/consent        # Update sharing consent
```

#### Data Models
- `MoodEntry` - PHQ-9/GAD-7 results with scoring
- Privacy controls for counselor sharing

### 4. Counselor Booking System ✅

#### Frontend Components
- `CounselorBookings.tsx` - Booking interface with calendar
- `CounselorDashboard.tsx` - Counselor schedule and session management

#### Backend APIs
```
GET  /api/counselors              # List available counselors
GET  /api/counselors/:id          # Get counselor details
GET  /api/counselors/:id/availability  # Get available slots
POST /api/bookings                # Create booking
GET  /api/bookings                # Get user's bookings
GET  /api/bookings/:id            # Get booking details
PUT  /api/bookings/:id/cancel     # Cancel booking
PUT  /api/bookings/:id/complete   # Complete session
POST /api/bookings/hold           # Temporarily hold slot
```

#### Real-time Features
- **Slot Locking**: 5-minute holds during booking
- **Live Updates**: Real-time availability updates
- **Notifications**: Booking confirmations and reminders

### 5. Peer Support Forum ✅

#### Frontend Components
- `PeerSupportForum.tsx` - Forum with posts, comments, reactions
- `ForumModeration.tsx` - Admin moderation interface

#### Backend APIs
```
GET  /api/forum/posts             # Get forum posts (paginated)
POST /api/forum/posts             # Create new post
GET  /api/forum/posts/:id         # Get post with comments
POST /api/forum/posts/:id/like    # Toggle post like
POST /api/forum/comments          # Add comment
PUT  /api/forum/posts/:id/moderate  # Moderate post (admin)
```

#### AI Moderation
- **Auto-moderation**: FastAPI service scans all content
- **Human Review**: Admin dashboard for flagged content
- **Multilingual**: Supports English, Hindi, Urdu

### 6. Resource Hub ✅

#### Frontend Components
- `ResourcesHub.tsx` - Categorized mental health resources

#### Backend APIs
```
GET  /api/resources               # Get resources (filtered)
GET  /api/resources/categories    # Get resource categories
GET  /api/resources/featured      # Get featured resources
GET  /api/resources/:id           # Get specific resource
POST /api/resources/favorite      # Add to favorites
POST /api/resources/track-usage   # Track usage analytics
```

#### Features
- **Multilingual Content**: English, Hindi, Urdu support
- **Offline Availability**: Cached resources for offline use
- **Cultural Adaptation**: J&K specific content
- **Usage Tracking**: Analytics for resource effectiveness

### 7. Notification System ✅

#### Frontend Integration
- Real-time notifications via WebSocket
- In-app notification center
- Push notifications (PWA)

#### Backend APIs
```
GET  /api/notifications           # Get user notifications
PUT  /api/notifications/:id/read  # Mark as read
PUT  /api/notifications/read-all  # Mark all as read
DELETE /api/notifications/:id     # Delete notification
PUT  /api/notifications/preferences  # Update preferences
POST /api/notifications/send      # Send notification (admin)
GET  /api/notifications/stats     # Get notification stats
```

### 8. Admin Dashboard ✅

#### Frontend Components
- `AdminDashboard.tsx` - Analytics and system management
- `ComprehensiveAdminDashboard.tsx` - Advanced admin features

#### Backend APIs
```
POST /api/admin/counselors        # Create counselor account
GET  /api/admin/counselors        # List all counselors
GET  /api/admin/counselors/:id    # Get counselor details
PUT  /api/admin/counselors/:id    # Update counselor
DELETE /api/admin/counselors/:id  # Delete counselor
GET  /api/admin/analytics         # Get platform analytics
GET  /api/admin/colleges          # List colleges
```

## 🔄 Real-time Communication

### WebSocket Events

#### Chat Events
```javascript
// Client → Server
socket.emit('chat-message', {
  sessionId: 'session_123',
  message: 'Hello Bestie',
  language: 'en'
});

// Server → Client
socket.on('bestie-response', {
  response: 'Hi there! How are you feeling today?',
  agent: 'listener',
  crisisDetected: false
});

socket.on('crisis-alert', {
  severity: 'high',
  resources: ['helpline_numbers'],
  counselorAvailable: true
});

socket.on('request-login', {
  message: 'Please sign up to continue chatting',
  anonymousMessagesLeft: 0
});
```

#### Booking Events
```javascript
// Real-time booking updates
socket.on('booking-created', {
  bookingId: 'booking_123',
  counselorId: 'counselor_456',
  startTime: '2024-01-15T10:00:00Z'
});

socket.on('slot-locked', {
  counselorId: 'counselor_456',
  timeSlot: '10:00-11:00',
  lockedUntil: '2024-01-15T09:35:00Z'
});

socket.on('slot-released', {
  counselorId: 'counselor_456',
  timeSlot: '10:00-11:00'
});
```

#### Notification Events
```javascript
socket.on('new-notification', {
  id: 'notif_123',
  type: 'booking_reminder',
  title: 'Session Reminder',
  message: 'Your counseling session starts in 30 minutes',
  priority: 'medium',
  actionUrl: '/bookings/booking_123'
});
```

## 🌐 Offline Support

### Service Worker Integration
The frontend service worker caches:
- API responses for critical endpoints
- Static resources (images, CSS, JS)
- Offline fallback responses

### Backend Offline Handling
```javascript
// Offline API responses
if (url.pathname.includes('/chat/')) {
  return new Response(JSON.stringify({
    message: 'Bestie is temporarily offline. Please try again when connected.',
    type: 'offline',
    offline: true,
    suggestions: ['Practice breathing exercises', 'Try meditation']
  }));
}
```

## 🔒 Security & Privacy

### Authentication Flow
1. **JWT Tokens**: Access token (7 days) + Refresh token (30 days)
2. **Role-based Access**: Student, Counselor, Admin, Super Admin
3. **Anonymous Access**: Limited chat without registration

### Privacy Controls
- **Consent Management**: Granular privacy settings
- **Data Anonymization**: Analytics use k-anonymity
- **Crisis Escalation**: Emergency access without login
- **Data Retention**: TTL for anonymous sessions

### Crisis Management
- **Deterministic Rules**: Immediate detection of high-risk keywords
- **AI Analysis**: Sentiment and context analysis
- **Escalation Protocol**: Admin notifications + helpline integration
- **Audit Logging**: All crisis events logged

## 📊 Analytics & Monitoring

### Event Tracking
```javascript
// Analytics events logged
{
  eventType: 'chat_session_started',
  userId: 'user_123',
  metadata: {
    sessionId: 'session_456',
    topic: 'academic_stress',
    isAnonymous: false
  },
  severity: 'info'
}
```

### Performance Monitoring
- API response times
- WebSocket connection health
- Database query performance
- AI service latency

## 🚀 Deployment Checklist

### Environment Setup
1. **Backend (.env)**:
   ```env
   PORT=5000
   MONGO_URI=mongodb://localhost:27017/manmitra
   JWT_SECRET=your-secret-key
   AI_SERVICE_URL=http://localhost:8000/api
   ```

2. **FastAPI (.env)**:
   ```env
   GEMINI_API_KEY=your-gemini-key
   ENVIRONMENT=development
   CORS_ORIGINS=http://localhost:3000,http://localhost:5173
   ```

### Database Indexes
```javascript
// Critical indexes for performance
db.users.createIndex({ email: 1 }, { unique: true })
db.chatsummaries.createIndex({ sessionId: 1 })
db.bookings.createIndex({ counselorId: 1, startTime: 1 })
db.moodentries.createIndex({ userId: 1, assessmentDate: -1 })
```

### Service Startup
```bash
# Terminal 1: MongoDB
mongod

# Terminal 2: Backend (Node.js)
cd backend
npm start

# Terminal 3: FastAPI
cd fast_api
python -m uvicorn app.main:app --reload --port 8000

# Terminal 4: Frontend
cd frontend
npm run dev
```

## 🧪 Testing Integration

### API Testing
```bash
# Test chat endpoint
curl -X POST http://localhost:8000/api/chat/ask \
  -H "Content-Type: application/json" \
  -d '{"message": "Hello Bestie", "history": []}'

# Test booking creation
curl -X POST http://localhost:5000/api/bookings \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"counselorId": "counselor_123", "startTime": "2024-01-15T10:00:00Z"}'
```

### WebSocket Testing
```javascript
// Test WebSocket connection
const socket = io('http://localhost:5000');
socket.emit('join-room', { userId: 'test_user' });
socket.on('connected', () => console.log('Connected!'));
```

## 📈 Performance Optimization

### Caching Strategy
- **Redis**: Session data, rate limiting
- **CDN**: Static assets, images
- **Browser Cache**: API responses, resources

### Database Optimization
- **Connection Pooling**: MongoDB connection management
- **Query Optimization**: Efficient aggregation pipelines
- **Indexing**: Strategic indexes for common queries

## 🔧 Maintenance & Monitoring

### Health Checks
```bash
# Backend health
curl http://localhost:5000/health

# FastAPI health
curl http://localhost:8000/api/chat/health
```

### Logging
- **Structured Logs**: JSON format for easy parsing
- **Error Tracking**: Centralized error monitoring
- **Audit Trails**: All critical actions logged

## 🎯 Next Steps

### Remaining Implementation
1. **Analytics Dashboard**: Advanced reporting features
2. **Crisis Management**: Enhanced escalation workflows
3. **Configuration API**: Dynamic system settings
4. **Video Calling**: WebRTC integration for sessions

### Production Considerations
1. **Load Balancing**: Multiple backend instances
2. **Database Scaling**: MongoDB replica sets
3. **CDN Setup**: Global content delivery
4. **Monitoring**: Comprehensive observability

## 📞 Support & Troubleshooting

### Common Issues
1. **WebSocket Connection**: Check CORS and firewall settings
2. **AI Service Timeout**: Verify Gemini API key and quotas
3. **Database Connection**: Ensure MongoDB is running
4. **Authentication**: Verify JWT secrets match

### Debug Mode
```bash
# Enable debug logging
NODE_ENV=development npm start

# FastAPI debug mode
ENVIRONMENT=development python -m uvicorn app.main:app --reload --log-level debug
```

---

## ✅ Integration Status

- ✅ **Authentication System** - Fully integrated
- ✅ **Bestie AI Chat** - Fully integrated with multi-agent system
- ✅ **Mental Health Assessments** - PHQ-9/GAD-7 with analytics
- ✅ **Counselor Booking** - Real-time availability and notifications
- ✅ **Peer Support Forum** - AI moderation and community features
- ✅ **Resource Hub** - Multilingual content with offline support
- ✅ **Notification System** - Real-time and push notifications
- ✅ **Admin Dashboard** - Counselor management and analytics
- 🔄 **Analytics Dashboard** - Basic analytics implemented, advanced features pending
- 🔄 **Crisis Management** - Core features implemented, advanced workflows pending
- 🔄 **Configuration API** - Basic config implemented, dynamic settings pending

The ManMitra 3.0 backend is now **production-ready** for core mental health support features, with comprehensive integration supporting all frontend requirements for a scalable, privacy-first mental health platform.
