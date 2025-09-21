import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import Volunteer from "../models/Volunteers-model.js";
import redisClient from "../config/redisClient.js";

// ================= Volunteer Signup =================
export const signupVolunteer = async (req, res) => {
  try {
    const { name, email, password, skills } = req.body;

    // Check if volunteer already exists
    const existingVolunteer = await Volunteer.findOne({ email });
    if (existingVolunteer) {
      return res.status(400).json({ message: "Volunteer already exists" });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create volunteer account (status = pending for admin approval)
    const newVolunteer = new Volunteer({
      name,
      email,
      password: hashedPassword,
      skills,
      
      status: "pending",
    });

    await newVolunteer.save();

    res.status(201).json({
      message: "Volunteer account created. Waiting for admin approval.",
      volunteer: {
        id: newVolunteer._id,
        name: newVolunteer.name,
        email: newVolunteer.email,
        status: newVolunteer.status,
      },
    });
  } catch (error) {
    console.error("Signup error:", error);
    res.status(500).json({ message: "Error signing up volunteer", error: error.message });
  }
};

// ================= Volunteer Login =================
export const loginVolunteer = async (req, res) => {
  try {
    const { email, password } = req.body;

    const volunteer = await Volunteer.findOne({ email });
    if (!volunteer) {
      return res.status(404).json({ message: "Volunteer not found" });
    }

    // Check if admin approved
    if (volunteer.status !== "approved") {
      return res.status(403).json({ message: "Account not approved by admin yet." });
    }

    // Compare password
    const isMatch = await bcrypt.compare(password, volunteer.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // Generate JWT token
    const token = jwt.sign(
      { id: volunteer._id, role: "volunteer" },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    // Save session in Redis
    await redisClient.setex(`volunteer:${volunteer._id}`, 3600, token);

    res.status(200).json({
      message: "Login successful",
      token,
      volunteer: {
        id: volunteer._id,
        name: volunteer.name,
        email: volunteer.email,
        skills: volunteer.skills,
        availability: volunteer.availability,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Error logging in volunteer", error: error.message });
  }
};
