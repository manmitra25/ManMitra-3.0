// config/redisClient.js
import Redis from "ioredis";

const redisClient = new Redis({
  host: "127.0.0.1",
  port: 6379,
});

// Log errors
redisClient.on("error", (err) => console.error("Redis Client Error", err));

// Connect to Redis
redisClient.on("connect", () => {
  console.log("✅ Redis client connected");
});

export default redisClient;
