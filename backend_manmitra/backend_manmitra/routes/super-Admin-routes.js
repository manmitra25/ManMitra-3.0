// routes/superAdminRoutes.js
import express from "express";
import {
  registerSuperAdmin,
  loginSuperAdmin,
  addAdmin,
  getAllAdmins,
} from "../controllers/super-Admin-controller.js";
import { superAdminAuth } from "../middleware/super-admin-middleware.js";

const router = express.Router();

router.post("/register", registerSuperAdmin);
router.post("/login", loginSuperAdmin);
router.post("/add-admin", superAdminAuth, addAdmin);
router.get("/admins", superAdminAuth, getAllAdmins);

export default router;
