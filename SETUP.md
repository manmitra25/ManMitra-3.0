# ManMitra 3.0 Backend Setup Guide

## Prerequisites

- Node.js (v16 or higher)
- Python (v3.8 or higher)
- MongoDB
- Redis (optional, for caching and rate limiting)

## Environment Setup

### Backend (Node.js)

1. Copy the example environment file:
```bash
cp backend/env.example backend/.env
```

2. Update the following variables in `backend/.env`:
- `MONGO_URI`: Your MongoDB connection string
- `JWT_SECRET`: A secure secret key for JWT tokens
- `JWT_REFRESH_SECRET`: A secure secret key for refresh tokens
- `AI_SERVICE_URL`: URL to your FastAPI service (default: http://localhost:8000/api)

### FastAPI Service

1. Create a `.env` file in the `fast_api` directory with:
```env
ENVIRONMENT=development
CORS_ORIGINS=http://localhost:3000,http://localhost:5173
GEMINI_API_KEY=your-gemini-api-key
AI_MODEL=gemini-2.5-flash
AI_TEMPERATURE=0.7
AI_SAFETY_TEMPERATURE=0.2
CHAT_HISTORY_LIMIT=50
CHAT_MAX_TOKENS=1000
CRISIS_KEYWORDS=suicide,kill myself,end it,don't want to live
CRISIS_RESPONSE_TEMPLATE=We're here to help. Please reach out to a trusted adult or counselor.
SAFETY_CHECK_ENABLED=true
SAFETY_TEMPERATURE=0.2
LOG_LEVEL=info
LOG_FILE=logs/fastapi.log
API_KEY_HEADER=X-API-Key
RATE_LIMIT_PER_MINUTE=60
```

## Installation

### Backend Dependencies

```bash
cd backend
npm install
```

### FastAPI Dependencies

```bash
cd fast_api
pip install -r requirements.txt
```

## Running the Services

### Start MongoDB
Make sure MongoDB is running on your system.

### Start the Backend Service
```bash
cd backend
npm start
```

### Start the FastAPI Service
```bash
cd fast_api
python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

## API Endpoints

### Authentication
- POST `/api/auth/signup` - Student signup
- POST `/api/auth/login` - Student login
- POST `/api/auth/admin/login` - Admin/Counselor login
- POST `/api/auth/refresh` - Refresh token
- POST `/api/auth/logout` - Logout
- GET `/api/auth/profile` - Get user profile
- PUT `/api/auth/profile` - Update user profile

### Admin
- POST `/api/admin/counselors` - Create counselor
- GET `/api/admin/counselors` - List counselors
- GET `/api/admin/counselors/:id` - Get counselor details
- PUT `/api/admin/counselors/:id` - Update counselor
- DELETE `/api/admin/counselors/:id` - Delete counselor
- GET `/api/admin/analytics` - Get analytics
- GET `/api/admin/colleges` - List colleges

### Booking
- POST `/api/bookings` - Create booking
- GET `/api/bookings` - List user's bookings
- GET `/api/bookings/:id` - Get booking details
- PUT `/api/bookings/:id/cancel` - Cancel booking
- PUT `/api/bookings/:id/complete` - Complete booking
- POST `/api/bookings/hold` - Hold time slot

### Forum
- GET `/api/forum/posts` - List posts
- GET `/api/forum/posts/:id` - Get post details
- POST `/api/forum/posts` - Create post
- POST `/api/forum/posts/:id/like` - Toggle post like
- POST `/api/forum/comments` - Create comment
- PUT `/api/forum/posts/:id/moderate` - Moderate post

### FastAPI Endpoints
- POST `/api/chat/ask` - Chat with Bestie AI
- POST `/api/moderation/scan-post` - Moderate forum content

## WebSocket Events

### Chat Events
- `chat-message` - Send chat message
- `bestie-response` - Receive AI response
- `crisis-alert` - Crisis detection alert
- `request-login` - Login required after anonymous limit

### Booking Events
- `booking-created` - New booking notification
- `booking-cancelled` - Booking cancellation
- `slot-locked` - Time slot locked
- `slot-released` - Time slot released

### Notification Events
- `new-notification` - New notification
- `notification-read` - Notification marked as read

## Testing

### Backend Tests
```bash
cd backend
npm test
```

### FastAPI Tests
```bash
cd fast_api
pytest
```

## Security Considerations

1. Change all default secrets in production
2. Use HTTPS in production
3. Implement rate limiting
4. Validate all inputs
5. Use environment variables for sensitive data
6. Regularly update dependencies
7. Implement proper error handling
8. Use secure headers (Helmet.js for Node.js)

## Monitoring

- Health checks: GET `/health`
- Metrics endpoint: GET `/metrics`
- Logs are written to `logs/` directory

## Troubleshooting

1. Check MongoDB connection
2. Verify environment variables
3. Check service logs
4. Ensure all dependencies are installed
5. Verify CORS settings
6. Check API key configuration for Gemini

## Support

For issues and questions, please refer to the project documentation or contact the development team.
