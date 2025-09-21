import jwt from "jsonwebtoken";
import redisClient from "../config/redisClient.js";

export const adminAuth = async (req, res, next) => {
  try {
    // Get token from headers
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) return res.status(401).json({ message: "No token provided" });

    // Verify JWT
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Check Redis session
    const redisToken = await redisClient.get(`admin:${decoded.id}`);
    if (!redisToken || redisToken !== token) {
      return res.status(401).json({ message: "Session expired or invalid" });
    }

    // Save decoded user info
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ message: "Unauthorized", error });
  }
};
