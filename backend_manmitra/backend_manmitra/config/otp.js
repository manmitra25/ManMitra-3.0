import crypto from "crypto";
import redisClient from "../config/redisClient.js";


const generateOTP = () => crypto.randomInt(100000, 999999).toString();

// Send OTP and store in Redis with expiry (5 min)
export const sendOTP = async (email) => {
  const otp = generateOTP();
  await redisClient.setex(`otp:${email}`, 300, otp); // expires in 5 min
  return otp;
};

// Verify OTP
export const verifyOTP = async (email, userOtp) => {
  const storedOtp = await redisClient.get(`otp:${email}`);
  if (!storedOtp) return false;
  return storedOtp === userOtp;
};
