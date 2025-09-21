import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { User } from "../models/student-model.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || "supersecretkey";

// -------- SIGN UP --------
router.post("/signup", async (req, res) => {
  const { email, password, name, role, institution } = req.body;

  const existing = await User.findOne({ email });
  if (existing) return res.status(400).json({ error: "User already exists" });

  const hashedPassword = await bcrypt.hash(password, 10);
  const newUser = await User.create({ email, password: hashedPassword, name, role, institution });

  const token = jwt.sign({ id: newUser._id, email }, JWT_SECRET, { expiresIn: "1h" });

  res.json({ token, user: { id: newUser._id, email, name, role, institution } });
});

// -------- SIGN IN --------
router.post("/signin", async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });
  if (!user) return res.status(400).json({ error: "User not found" });

  const valid = await bcrypt.compare(password, user.password);
  if (!valid) return res.status(400).json({ error: "Invalid credentials" });

  const token = jwt.sign({ id: user._id, email }, JWT_SECRET, { expiresIn: "1h" });

  res.json({
    token,
    user: { id: user._id, email, name: user.name, role: user.role, institution: user.institution },
  });
});

// -------- PROFILE --------
router.get("/profile", protect, async (req, res) => {
  res.json(req.user);
});

export default router;
