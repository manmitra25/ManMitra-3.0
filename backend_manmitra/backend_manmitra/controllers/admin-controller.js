import Volunteer from "../models/Volunteers-model.js";
import Therapist from "../models/Therapist-model.js";
import Admin from "../models/Admin-model.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import redisClient from "../config/redisClient.js";

export const registerAdmin = async (req, res) => {
  try {
    const { name, email, password,collegeName } = req.body;

    // check if already exists
    const existing = await Admin.findOne({ email });
    if (existing) {
      return res.status(400).json({ message: "Admin already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newAdmin = new Admin({
      name,
      email,
      password: hashedPassword,
      collegeName
    });

    await newAdmin.save();
    res.status(201).json({ message: "Admin registered successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error registering Admin", error: error.message });
  }
};

// ================= Login Admin =================
export const loginAdmin = async (req, res) => {
  try {
    const { email, password } = req.body;

    const admin = await Admin.findOne({ email });
    if (!admin) {
      return res.status(404).json({ message: "Admin not found" });
    }

    // Compare hashed password
    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // Create JWT
    const token = jwt.sign(
      { id: admin._id, role: admin.role },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    // Save session in Redis
    await redisClient.setex(`admin:${admin._id}`, 3600, token);

    res.status(200).json({ message: "Login successful", token });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({
      message: "Error logging in Admin",
      error: error.message,
    });
  }
};

// ================= Login Student =================
export const loginStudent = async (req, res) => {
  try {
    const { email, password } = req.body;

    const student = await Student.findOne({ email });
    if (!student) return res.status(404).json({ message: "Student not found" });

    const isMatch = await bcrypt.compare(password, student.password);
    if (!isMatch) return res.status(401).json({ message: "Invalid credentials" });

    const token = jwt.sign({ id: student._id, role: "student" }, process.env.JWT_SECRET, { expiresIn: "1h" });

    res.status(200).json({ message: "Login successful", token });
  } catch (error) {
    res.status(500).json({ message: "Error logging in", error: error.message });
  }
};

// ================= Add Volunteer =================
export const addVolunteer = async (req, res) => {
  try {
    const { name, email, phone } = req.body;

    const existing = await Volunteer.findOne({ email });
    if (existing) return res.status(400).json({ message: "Volunteer already exists" });

    const volunteer = new Volunteer({
      name,
      email,
      phone,
      createdBy: req.user.id, // from admin middleware
    });

    await volunteer.save();
    res.status(201).json({ message: "Volunteer added successfully", volunteer });
  } catch (error) {
    res.status(500).json({ message: "Error adding volunteer", error });
  }
};

// ================= Add Therapist =================
export const addTherapist = async (req, res) => {
  try {
    const { name, email, phone, qualifications } = req.body;

    const existing = await Therapist.findOne({ email });
    if (existing) return res.status(400).json({ message: "Therapist already exists" });

    const therapist = new Therapist({
      name,
      email,
      phone,
      qualifications,
      createdBy: req.user.id,
    });

    await therapist.save();
    res.status(201).json({ message: "Therapist added successfully", therapist });
  } catch (error) {
    res.status(500).json({ message: "Error adding therapist", error });
  }
};

// ================= Get All Volunteers =================
export const getVolunteers = async (req, res) => {
  try {
    const volunteers = await Volunteer.find().select("-__v");
    res.status(200).json(volunteers);
  } catch (error) {
    res.status(500).json({ message: "Error fetching volunteers", error });
  }
};

// ================= Get All Therapists =================
export const getTherapists = async (req, res) => {
  try {
    const therapists = await Therapist.find().select("-__v");
    res.status(200).json(therapists);
  } catch (error) {
    res.status(500).json({ message: "Error fetching therapists", error });
  }
};

// ================= Delete Volunteer =================
export const deleteVolunteer = async (req, res) => {
  try {
    const { id } = req.params;
    await Volunteer.findByIdAndDelete(id);
    res.status(200).json({ message: "Volunteer deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting volunteer", error });
  }
};

// ================= Delete Therapist =================
export const deleteTherapist = async (req, res) => {
  try {
    const { id } = req.params;
    await Therapist.findByIdAndDelete(id);
    res.status(200).json({ message: "Therapist deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting therapist", error });
  }
};

// ==========================================================================================

// Get all pending requests
export const getPendingRequests = async (req, res) => {
  try {
    const therapists = await Therapist.find({ status: "pending" });
    const volunteers = await Volunteer.find({ status: "pending" });

    res.status(200).json({ therapists, volunteers });
  } catch (error) {
    res.status(500).json({ message: "Error fetching pending requests", error });
  }
};

// Approve or reject therapist
export const updateTherapistStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body; // "approved" or "rejected"

    const therapist = await Therapist.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    );

    if (!therapist) return res.status(404).json({ message: "Therapist not found" });

    res.status(200).json({ message: `Therapist ${status}`, therapist });
  } catch (error) {
    res.status(500).json({ message: "Error updating therapist status", error });
  }
};

// Approve or reject volunteer
export const updateVolunteerStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const volunteer = await Volunteer.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    );

    if (!volunteer) return res.status(404).json({ message: "Volunteer not found" });

    res.status(200).json({ message: `Volunteer ${status}`, volunteer });
  } catch (error) {
    res.status(500).json({ message: "Error updating volunteer status", error });
  }
};