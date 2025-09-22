import axios from "axios";

const fastapiBaseURL = process.env.FASTAPI_URL || "http://localhost:8000/api";

// create axios instance with connection pooling
const client = axios.create({
  baseURL: fastapiBaseURL,
  timeout: 5000, // 5s timeout
  headers: { "Content-Type": "application/json" }
});

export async function startChatSession(userId) {
  const res = await client.post("/chat/start", { user_id: userId });
  return res.data;
}

export async function sendChatMessage(userId, message) {
  const res = await client.post("/chat/send", { user_id: userId, message });
  return res.data;
}

export async function endChatSession(userId) {
  const res = await client.post("/chat/end", { user_id: userId });
  return res.data;
}

export async function getChatHistory(userId) {
  const res = await client.get(`/chat/history/${userId}`);
  return res.data;
}

export async function getChatStats(userId) {
  const res = await client.get(`/chat/stats/${userId}`);
  return res.data;
}
