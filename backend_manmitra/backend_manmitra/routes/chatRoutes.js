import express from "express";
import {
  startChatSession,
  sendChatMessage,
  endChatSession,
  getChatHistory,
  getChatStats
} from "/services/fastapiClient.js";

const router = express.Router();

// start a new session
router.post("/start", async (req, res) => {
  try {
    const { userId } = req.body;
    const response = await startChatSession(userId);
    res.json(response);
  } catch (err) {
    console.error("Error starting session:", err.message);
    res.status(500).json({ error: "Failed to start session" });
  }
});

// send message
router.post("/send", async (req, res) => {
  try {
    const { userId, message } = req.body;
    const response = await sendChatMessage(userId, message);
    res.json(response);
  } catch (err) {
    console.error("Error sending message:", err.message);
    res.status(500).json({ error: "Failed to send message" });
  }
});

// end session
router.post("/end", async (req, res) => {
  try {
    const { userId } = req.body;
    const response = await endChatSession(userId);
    res.json(response);
  } catch (err) {
    console.error("Error ending session:", err.message);
    res.status(500).json({ error: "Failed to end session" });
  }
});

// chat history
router.get("/history/:userId", async (req, res) => {
  try {
    const response = await getChatHistory(req.params.userId);
    res.json(response);
  } catch (err) {
    console.error("Error fetching history:", err.message);
    res.status(500).json({ error: "Failed to fetch history" });
  }
});

// chat stats
router.get("/stats/:userId", async (req, res) => {
  try {
    const response = await getChatStats(req.params.userId);
    res.json(response);
  } catch (err) {
    console.error("Error fetching stats:", err.message);
    res.status(500).json({ error: "Failed to fetch stats" });
  }
});

export default router;
