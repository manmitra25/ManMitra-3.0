import express from "express";
import { signupTherapist, loginTherapist } from "../controllers/Therapist-controller.js";

const router = express.Router();

// Signup & Login
router.post("/signup", signupTherapist);
router.post("/login", loginTherapist);

export default router;
