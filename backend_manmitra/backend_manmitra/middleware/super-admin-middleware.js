// middleware/auth.js
import jwt from "jsonwebtoken";
import redisClient from "../config/redisClient.js";

export const superAdminAuth = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) return res.status(401).json({ message: "No token provided" });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // check Redis session
    const redisToken = await redisClient.get(`superadmin:${decoded.id}`);
    if (!redisToken || redisToken !== token) {
      return res.status(401).json({ message: "Session expired or invalid" });
    }

    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ message: "Unauthorized", error });
  }
};
