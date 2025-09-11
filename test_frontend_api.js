// Test script to verify frontend API calls
const axios = require('axios');

async function testFrontendAPI() {
  console.log('🧪 Testing Frontend API Calls...\n');

  try {
    // Test 1: Chat Session Start (what frontend calls)
    console.log('1️⃣ Testing Chat Session Start...');
    const sessionResponse = await axios.post('http://localhost:3001/api/chat/start-session', {
      topic: 'general',
      language: 'en',
      isAnonymous: true
    });
    console.log('✅ Session Start Response:', sessionResponse.data);

    // Test 2: Send Message (what frontend calls)
    if (sessionResponse.data.success) {
      const sessionId = sessionResponse.data.data.sessionId;
      console.log('\n2️⃣ Testing Send Message...');
      
      const messageResponse = await axios.post('http://localhost:3001/api/chat/send-message', {
        sessionId: sessionId,
        message: 'Hello from frontend test!',
        language: 'en'
      });
      console.log('✅ Message Response:', messageResponse.data);
    }

  } catch (error) {
    console.log('❌ Frontend API Error:', error.response?.data || error.message);
    if (error.response) {
      console.log('Status:', error.response.status);
      console.log('Headers:', error.response.headers);
    }
  }

  console.log('\n🏁 Frontend API test completed!');
}

testFrontendAPI().catch(console.error);
