import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import SuperAdmin from "../models/Super-Admin-model.js";
import Admin from "../models/Admin-model.js";
import redisClient from "../config/redisClient.js"; // Redis setup file

// ================= Register Super Admin =================
export const registerSuperAdmin = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // check if already exists
    const existing = await SuperAdmin.findOne({ email });
    if (existing) {
      return res.status(400).json({ message: "SuperAdmin already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const superAdmin = new SuperAdmin({
      name,
      email,
      password: hashedPassword,
    });

    await superAdmin.save();
    res.status(201).json({ message: "SuperAdmin registered successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error registering SuperAdmin", error });
  }
};

// ================= Login Super Admin =================
export const loginSuperAdmin = async (req, res) => {
  try {
    const { email, password } = req.body;

    const superAdmin = await SuperAdmin.findOne({ email });
    if (!superAdmin) {
      return res.status(404).json({ message: "SuperAdmin not found" });
    }

    const isMatch = await bcrypt.compare(password, superAdmin.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign(
      { id: superAdmin._id, role: superAdmin.role },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    // Save session in Redis
    await redisClient.setex(`superadmin:${superAdmin._id}`, 3600, token);

    res.status(200).json({ message: "Login successful", token });
  } catch (error) {
    console.error("Login error:", error);  // <-- log error in console
    res.status(500).json({ message: "Error logging in SuperAdmin", error: error.message });
  }
};


// ================= Add Admin =================
export const addAdmin = async (req, res) => {
  try {
    const { name, email, password, collegeName } = req.body;

    // check if already exists
    const existing = await Admin.findOne({ email });
    if (existing) {
      return res.status(400).json({ message: "Admin already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const admin = new Admin({
      name,
      email,
      password: hashedPassword,
      collegeName,
      createdBy: req.user.id, // superadmin id from middleware
    });

    await admin.save();
    res.status(201).json({ message: "Admin created successfully", admin });
  } catch (error) {
    res.status(500).json({ message: "Error adding Admin", error });
  }
};

// ================= Get All Admins =================
export const getAllAdmins = async (req, res) => {
  try {
    const admins = await Admin.find().select("-password");
    res.status(200).json(admins);
  } catch (error) {
    res.status(500).json({ message: "Error fetching Admins", error });
  }
};
