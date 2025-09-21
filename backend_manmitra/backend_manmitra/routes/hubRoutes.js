// routes/hubRoutes.js
import express from "express";
const router = express.Router();
import { createContent, listContent, getContent, updateContent } from "../controllers/hubController.js";
import { protect } from "../middleware/authMiddleware.js";
import { permit } from "../middleware/roleMiddleware.js";

// Create content (volunteer)
router.post("/", protect, permit("volunteer"), createContent);

// List content (student & volunteer)
router.get("/", protect, permit("student","volunteer"), listContent);

// Get detail
router.get("/:id", protect, permit("student","volunteer"), getContent);

// Update content (volunteer)
router.put("/:id", protect, permit("volunteer"), updateContent);

export default router;
