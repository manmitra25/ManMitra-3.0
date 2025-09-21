import express from "express";
import { registerStudent, loginStudent,verifyStudentLogin,verifyStudentSignup} from "../controllers/student-controller.js";

const router = express.Router();

// Register student
router.post("/signup", registerStudent);

router.post("/verify-signup", verifyStudentSignup);

// Login student
router.post("/login", loginStudent);

router.post("/verify-login", verifyStudentLogin); 

export default router;
