import express from "express";
import { signupVolunteer, loginVolunteer } from "../controllers/volunteer-controller.js";

const router = express.Router();

// Volunteer Signup
router.post("/signup", signupVolunteer);

// Volunteer Login
router.post("/login", loginVolunteer);

export default router;
