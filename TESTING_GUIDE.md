# ManMitra 3.0 Integration Testing Guide

## 🎯 Overview

This guide will help you test the complete integration between ManMitra's frontend and backend services to ensure everything is working correctly.

## 🚀 Quick Start

### 1. Prerequisites Check

Before starting, ensure you have:
- ✅ Node.js 18+ installed
- ✅ Python 3.8+ installed
- ✅ MongoDB Atlas connection (configured in backend/.env)
- ✅ Gemini API key (for FastAPI/.env)

### 2. Install Dependencies

```bash
# Frontend dependencies
cd frontend
npm install

# Backend dependencies
cd ../backend
npm install

# FastAPI dependencies (activate virtual environment first)
cd ../fast_api
pip install -r requirements.txt
```

### 3. Configure API Keys

1. **Gemini API Key**: Get from [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Update `fast_api/.env`:
   ```env
   GEMINI_API_KEY=your-actual-gemini-api-key-here
   ```

### 4. Start Services

Run the startup script:
```powershell
.\start-services.ps1
```

Or start manually in separate terminals:
```bash
# Terminal 1: FastAPI
cd fast_api
python -m uvicorn app.main:app --reload --port 8000

# Terminal 2: Node.js Backend
cd backend
npm run dev

# Terminal 3: React Frontend
cd frontend
npm run dev
```

## 🧪 Testing Checklist

### ✅ Service Health Checks

| Service | URL | Expected Response |
|---------|-----|-------------------|
| FastAPI | http://localhost:8000 | `{"message": "ManMitra AI Service is running"}` |
| Backend | http://localhost:5000/health | `{"status": "healthy"}` |
| Frontend | http://localhost:5173 | ManMitra landing page |

### ✅ Authentication System

#### Test User Registration
1. Go to http://localhost:5173
2. Click "Student" role card
3. Click "Sign Up" in the login modal
4. Fill out the form:
   - **Name**: Test Student
   - **Email**: test.student@example.com
   - **Password**: TestPassword123
   - **Institution**: Test University
5. ✅ **Expected**: Success message, automatic login, redirect to dashboard

#### Test User Login
1. Click "Login" instead
2. Use credentials from registration
3. ✅ **Expected**: Successful login, dashboard access

#### Test JWT Token Management
1. Open browser dev tools → Application → Local Storage
2. ✅ **Expected**: `token` and `refreshToken` present
3. Refresh the page
4. ✅ **Expected**: User remains logged in

### ✅ Bestie AI Chat Integration

#### Test Anonymous Chat (5-message limit)
1. Go to landing page, click "Student" without signing up
2. Select chat from navigation
3. Choose a topic (e.g., "Academic Stress")
4. Send 5 messages
5. ✅ **Expected**: After 5th message, prompted to sign up

#### Test Authenticated Chat
1. Sign in as student
2. Navigate to Bestie Chat
3. Select topic and send message
4. ✅ **Expected**: 
   - WebSocket connection established
   - AI response received
   - Agent indicators displayed (Listening 💙, etc.)

#### Test Crisis Detection
1. In chat, type: "I feel hopeless and want to end it all"
2. ✅ **Expected**:
   - Crisis dialog appears
   - Resources provided (Tele-MANAS 104)
   - Option to connect with counselor

### ✅ Mental Health Assessments

#### Test PHQ-9 Assessment
1. Navigate to "Daily Mood Check"
2. Click "Take Assessment" for Depression Screening
3. Complete all 9 questions
4. ✅ **Expected**:
   - Progress bar updates
   - Score calculated correctly
   - Severity level displayed
   - Recommendations provided
   - Data saved to backend

#### Test GAD-7 Assessment
1. Click "Take Assessment" for Anxiety Screening
2. Complete all 7 questions
3. ✅ **Expected**: Similar to PHQ-9 with appropriate anxiety scoring

#### Test Mood History
1. Complete both assessments
2. Check "Last completed" dates update
3. ✅ **Expected**: Accurate timestamps displayed

### ✅ Real-time Features (WebSocket)

#### Test WebSocket Connection
1. Open browser dev tools → Console
2. Look for WebSocket connection messages
3. ✅ **Expected**: "✅ WebSocket connected" in console

#### Test Chat Real-time Updates
1. Send message in Bestie Chat
2. ✅ **Expected**:
   - Message appears immediately
   - "Bestie is typing..." indicator
   - Response received via WebSocket

#### Test Notifications
1. Complete an assessment
2. ✅ **Expected**: Real-time notification of completion

### ✅ Offline Mode

#### Test Offline Chat
1. Open dev tools → Network → Go offline
2. Try sending chat message
3. ✅ **Expected**: 
   - Offline indicator appears
   - Fallback response provided
   - Warning message displayed

#### Test Offline Assessment
1. While offline, try taking assessment
2. ✅ **Expected**: Assessment works, data cached for later sync

## 🐛 Common Issues & Solutions

### Issue: "CORS Error"
**Solution**: Check that backend .env has correct CORS_ORIGINS including frontend port

### Issue: "Gemini API Error"
**Solution**: 
1. Verify API key is valid
2. Check API quota not exceeded
3. Ensure billing is enabled on Google Cloud

### Issue: "WebSocket Connection Failed"
**Solution**: 
1. Check backend is running on port 5000
2. Verify no firewall blocking WebSocket
3. Look for socket.io errors in backend logs

### Issue: "MongoDB Connection Error"
**Solution**: 
1. Verify MongoDB Atlas connection string
2. Check IP whitelist includes your IP
3. Ensure database user has correct permissions

### Issue: "Authentication Token Invalid"
**Solution**: 
1. Check JWT_SECRET matches in backend .env
2. Clear localStorage and try fresh login
3. Verify token expiration settings

## 📊 Performance Benchmarks

### Expected Response Times
- **Authentication**: < 500ms
- **Chat Response**: 1-3 seconds
- **Assessment Save**: < 300ms
- **WebSocket Connection**: < 100ms

### Resource Usage
- **Frontend Bundle**: ~2MB
- **Memory Usage**: < 100MB per service
- **Database Connections**: < 10 concurrent

## 🔍 Debug Tools

### Backend Debugging
```bash
# Enable debug mode
NODE_ENV=development DEBUG=* npm run dev
```

### FastAPI Debugging
```bash
# Enable debug logging
ENVIRONMENT=development LOG_LEVEL=debug python -m uvicorn app.main:app --reload
```

### Frontend Debugging
```javascript
// Enable WebSocket debugging
localStorage.setItem('debug', 'socket.io-client:*');
```

## 📈 Load Testing

### Basic Load Test with curl
```bash
# Test authentication endpoint
for i in {1..10}; do
  curl -X POST http://localhost:5000/api/auth/login \
    -H "Content-Type: application/json" \
    -d '{"email":"test@example.com","password":"password"}' &
done
```

### WebSocket Load Test
Use a tool like `artillery` to test concurrent WebSocket connections:
```bash
npm install -g artillery
# Create load test configuration and run
artillery run websocket-test.yml
```

## ✅ Integration Success Criteria

### Full Integration is successful when:
1. ✅ All services start without errors
2. ✅ Authentication works end-to-end
3. ✅ Chat receives AI responses
4. ✅ Assessments save to database
5. ✅ WebSocket real-time updates work
6. ✅ Offline mode gracefully degrades
7. ✅ Crisis detection triggers properly
8. ✅ No console errors in browser
9. ✅ All API calls return expected responses
10. ✅ Data persists between sessions

## 🚀 Next Steps After Successful Testing

1. **Performance Optimization**: Profile and optimize slow endpoints
2. **Security Audit**: Review authentication and data handling
3. **User Testing**: Conduct usability testing with real users
4. **Deployment**: Prepare for production deployment
5. **Monitoring**: Set up application monitoring and logging

## 📞 Support

If you encounter issues during testing:
1. Check the console logs in all services
2. Verify environment configuration
3. Ensure all dependencies are correctly installed
4. Review the INTEGRATION_GUIDE.md for API details

---

**ManMitra 3.0** - Making mental health support accessible through technology 💙
