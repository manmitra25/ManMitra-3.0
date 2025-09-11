import axios from 'axios';

// Environment-based configuration
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api';
const AI_API_BASE_URL = import.meta.env.VITE_AI_API_BASE_URL || 'http://localhost:8000/api';

// Node.js Backend API instance
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: { 'Content-Type': 'application/json' },
});

// FastAPI AI instance
const aiApi = axios.create({
  baseURL: AI_API_BASE_URL,
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
});

// Request interceptor to add auth token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token'); // From AuthProvider
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor for errors (e.g., handle 401 unauthorized)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Redirect to login or refresh token
      console.error('Unauthorized - Please log in again');
      localStorage.removeItem('token');
      window.location.href = '/login'; // Adjust based on your routes
    } else if (!navigator.onLine) {
      console.error('Offline - Using cached data');
    }
    return Promise.reject(error);
  }
);

// Optional: Add API key for FastAPI if needed
// aiApi.interceptors.request.use((config) => {
//   config.headers['X-API-Key'] = 'your-fastapi-key';
//   return config;
// });

export { api, aiApi };
