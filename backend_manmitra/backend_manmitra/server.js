import dotenv from "dotenv";
import express from "express";
import cors from "cors";
import session from "express-session";
import { RedisStore } from "connect-redis"; 
import redisClient from "./config/redisClient.js";
import { createServer } from "http";

import { connectDB } from "./config/db.js";

// Routes
import superAdminRoutes from "./routes/super-Admin-routes.js";
import studentRoutes from "./routes/student-routes.js";
import adminRoutes from "./routes/admin-routes.js";
import therapistRoutes from "./routes/therapist-routes.js";
import volunteerRoutes from "./routes/volunteer-routes.js";

// NEW hub/task routes
import hubRoutes from "./routes/hubRoutes.js";
import taskRoutes from "./routes/taskProgressRoutes.js";

// NEW Peer-Community routes
import communityRoutes from "./routes/communities.js";
import channelRoutes from "./routes/channels.js";
import messageRoutes from "./routes/messages.js";

// Socket.io for real-time messaging
import { initializeSocket } from "./socket/index.js";

// Cron scheduler
import startCron from "./cron.js";

import analyticsRoutes from "./routes/analytics-routes.js";

dotenv.config();

const app = express();
const server = createServer(app);

// Connect DB
connectDB();

// Initialize Socket.io
initializeSocket(server);
app.set("io", initializeSocket(server));

// Middlewares
app.use(cors());
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Redis session store
app.use(
  session({
    store: new RedisStore({ client: redisClient }),
    secret: process.env.SESSION_SECRET || "superSecretKey",
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false, httpOnly: true, maxAge: 1000 * 60 * 60 }
  })
);

// Existing routes
app.use("/api/superadmin", superAdminRoutes);
app.use("/api/student", studentRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/therapist", therapistRoutes);
app.use("/api/volunteer", volunteerRoutes);

// NEW routes for Psychoeducational Hub
app.use("/api/hub", hubRoutes); // volunteers create content, students+volunteers view
app.use("/api/hub/progress", taskRoutes); // student task tracking (habits, todo, breathing)

// NEW routes for Peer-Community feature
app.use("/api/communities", communityRoutes);
app.use("/api/channels", channelRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api/analytics", analyticsRoutes);  // analtics 
// Health check endpoint
app.get("/api/health", (req, res) => {
  res.status(200).json({ message: "Server is running successfully!" });
});

// Start scheduler (habit reminders, daily streaks)
startCron();

// Start server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () =>
  console.log(`🚀 Server running on http://localhost:${PORT}`)
);