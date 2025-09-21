// routes/taskProgressRoutes.js
import express from "express";
const router = express.Router();
import { protect } from "../middleware/authMiddleware.js";
import { permit } from "../middleware/roleMiddleware.js";
import * as controller from "../controllers/taskProgressController.js";

// Breathing session
router.post("/:contentId/breathing", protect, permit("student"), controller.addBreathingSession);

// Todo
router.get("/:contentId/todo", protect, permit("student"), controller.getTodoList);
router.post("/:contentId/todo", protect, permit("student"), controller.addTodoItem);
router.put("/:contentId/todo/:itemId/toggle", protect, permit("student"), controller.toggleTodo);

// Habits
router.post("/:contentId/habits", protect, permit("student"), controller.createHabit);
router.post("/:contentId/habits/:habitId/done", protect, permit("student"), controller.markHabitDone);

// Progress read
router.get("/:contentId/progress", protect, permit("student"), controller.getProgress);

// Volunteer manual reminder
router.post("/reminder/send", protect, permit("volunteer"), controller.sendHabitReminder);

export default router;
