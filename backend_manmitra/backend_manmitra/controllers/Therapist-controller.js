import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import Therapist from "../models/Therapist-model.js";
import redisClient from "../config/redisClient.js";

// ================= Signup Therapist =================
export const signupTherapist = async (req, res) => {
  try {
    const { name, email, password, specialization } = req.body;

    // check if already exists
    const existing = await Therapist.findOne({ email });
    if (existing) {
      return res.status(400).json({ message: "Therapist already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const therapist = new Therapist({
      name,
      email,
      password: hashedPassword,
      specialization,
      status: "pending" // default, waiting for Admin approval
    });

    await therapist.save();
    res.status(201).json({ message: "Signup successful. Waiting for Admin approval.", therapist });
  } catch (error) {
    res.status(500).json({ message: "Error signing up Therapist", error: error.message });
  }
};

// ================= Login Therapist =================
export const loginTherapist = async (req, res) => {
  try {
    const { email, password } = req.body;

    const therapist = await Therapist.findOne({ email });
    if (!therapist) {
      return res.status(404).json({ message: "Therapist not found" });
    }

    // Check if approved
    if (therapist.status !== "approved") {
      return res.status(403).json({ message: "Your account is not approved yet" });
    }

    const isMatch = await bcrypt.compare(password, therapist.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign(
      { id: therapist._id, role: "therapist" },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    // Save session in Redis
    await redisClient.setex(`therapist:${therapist._id}`, 3600, token);

    res.status(200).json({ message: "Login successful", token });
  } catch (error) {
    res.status(500).json({ message: "Error logging in Therapist", error: error.message });
  }
};
