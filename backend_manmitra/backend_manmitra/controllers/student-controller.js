import Student from "../models/student-model.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { sendOTP, verifyOTP } from "../config/otp.js";
import redisClient from "../config/redisClient.js";
import nodemailer from "nodemailer";

// Nodemailer transporter
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER, // Gmail email
    pass: process.env.EMAIL_PASS, // Gmail App Password
  },
});

// ================= Register Student =================
export const registerStudent = async (req, res) => {
  try {
    const { email, password, collegeName } = req.body;

    const existing = await Student.findOne({ email });
    if (existing) {
      return res.status(400).json({ message: "Student already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    // Temporarily store user details in Redis for OTP verification
    await redisClient.setex(
      `pendingStudent:${email}`,
      600,
      JSON.stringify({ email, password: hashedPassword, collegeName })
    ); // expires in 10 min

    const otp = await sendOTP(email);

    // Send OTP via email
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Verify your Student Account",
      text: `Your OTP is ${otp}. It expires in 5 minutes.`,
    });

    res.status(200).json({ message: "OTP sent to email. Verify to complete registration." });
  } catch (error) {
    res.status(500).json({ message: "Error registering student", error: error.message });
  }
};

// ================= Verify Signup OTP =================
export const verifyStudentSignup = async (req, res) => {
  try {
    const { email, otp } = req.body;

    const isValid = await verifyOTP(email, otp);
    if (!isValid) return res.status(400).json({ message: "Invalid or expired OTP" });

    const pendingData = await redisClient.get(`pendingStudent:${email}`);
    if (!pendingData) return res.status(400).json({ message: "No signup request found" });

    const { password, collegeName } = JSON.parse(pendingData);

    const newStudent = new Student({ email, password, collegeName });
    await newStudent.save();

    // Cleanup Redis
    await redisClient.del(`otp:${email}`);
    await redisClient.del(`pendingStudent:${email}`);

    res.status(201).json({ message: "Student registered successfully", student: newStudent });
  } catch (error) {
    res.status(500).json({ message: "Error verifying OTP", error: error.message });
  }
};


// ================= Login Student =================
export const loginStudent = async (req, res) => {
  try {
    const { email, password } = req.body;

    // 1️⃣ Find student by email
    const student = await Student.findOne({ email });
    if (!student) return res.status(404).json({ message: "Student not found" });

    // 2️⃣ Compare entered password with hashed password in DB
    const isMatch = await bcrypt.compare(password, student.password);
    if (!isMatch) return res.status(401).json({ message: "Invalid credentials" });

    // 3️⃣ Generate OTP and store in Redis (5 min expiry)
    const otp = await sendOTP(email);

    // 4️⃣ Send OTP via Gmail
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Login Verification OTP",
      text: `Your login OTP is ${otp}. It expires in 5 minutes.`,
    });

    res.status(200).json({ message: "OTP sent. Verify to complete login." });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Error logging in", error: error.message });
  }
};

// ================= Verify Student Login =================
export const verifyStudentLogin = async (req, res) => {
  try {
    const { email, otp } = req.body;

    // 1️⃣ Verify OTP
    const isValid = await verifyOTP(email, otp);
    if (!isValid) return res.status(400).json({ message: "Invalid or expired OTP" });

    // 2️⃣ Fetch student
    const student = await Student.findOne({ email });
    if (!student) return res.status(404).json({ message: "Student not found" });

    // 3️⃣ Generate JWT token
    const token = jwt.sign({ id: student._id, role: "student" }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });

    // 4️⃣ Cleanup Redis OTP
    await redisClient.del(`otp:${email}`);

    res.status(200).json({ message: "Login successful", token });
  } catch (error) {
    console.error("OTP verification error:", error);
    res.status(500).json({ message: "OTP verification failed", error: error.message });
  }
};
