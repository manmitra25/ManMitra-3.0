// controllers/taskProgressController.js
import TaskProgress from "../models/TaskProgress.js";
import HubContent from "../models/HubContent.js";
import Student from "../models/student-model.js";
import { sendEmail } from "../utils/email.js";

// Helper to get or create a TaskProgress doc
const getOrCreateProgress = async (studentId, contentId) => {
  let prog = await TaskProgress.findOne({ student: studentId, content: contentId });
  if (!prog) {
    prog = await TaskProgress.create({ student: studentId, content: contentId, category: "task" });
  }
  return prog;
};

// Breathing session
const addBreathingSession = async (req, res) => {
  try {
    const { contentId } = req.params;
    const { startedAt = new Date(), durationSec = 0, details } = req.body;

    // Optional: validate content is a task with subtype breathing
    const content = await HubContent.findById(contentId);
    if (!content) return res.status(404).json({ message: "Content not found" });

    const prog = await getOrCreateProgress(req.user._id, contentId);
    prog.breathingSessions.push({ startedAt, durationSec, details });
    prog.lastUpdated = new Date();
    await prog.save();

    res.status(201).json(prog);
  } catch (err) {
    console.error("addBreathingSession error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// Todo: get, add, toggle
const getTodoList = async (req, res) => {
  try {
    const { contentId } = req.params;
    const prog = await getOrCreateProgress(req.user._id, contentId);
    res.json(prog.todoList || []);
  } catch (err) {
    console.error("getTodoList error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

const addTodoItem = async (req, res) => {
  try {
    const { contentId } = req.params;
    const { text } = req.body;
    if (!text) return res.status(400).json({ message: "text required" });

    const prog = await getOrCreateProgress(req.user._id, contentId);
    prog.todoList.push({ text });
    prog.lastUpdated = new Date();
    await prog.save();

    res.status(201).json(prog.todoList);
  } catch (err) {
    console.error("addTodoItem error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

const toggleTodo = async (req, res) => {
  try {
    const { contentId, itemId } = req.params;
    const prog = await getOrCreateProgress(req.user._id, contentId);
    const item = prog.todoList.id(itemId);
    if (!item) return res.status(404).json({ message: "Todo not found" });

    item.done = !item.done;
    item.doneAt = item.done ? new Date() : undefined;
    prog.lastUpdated = new Date();
    await prog.save();

    res.json(item);
  } catch (err) {
    console.error("toggleTodo error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// Habits: create and mark done
const createHabit = async (req, res) => {
  try {
    const { contentId } = req.params;
    const { title, reminderTime } = req.body;
    if (!title) return res.status(400).json({ message: "title required" });

    const prog = await getOrCreateProgress(req.user._id, contentId);
    prog.habits.push({ title, reminderTime });
    prog.lastUpdated = new Date();
    await prog.save();

    res.status(201).json(prog.habits);
  } catch (err) {
    console.error("createHabit error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

const markHabitDone = async (req, res) => {
  try {
    const { contentId, habitId } = req.params;
    const prog = await getOrCreateProgress(req.user._id, contentId);
    const habit = prog.habits.id(habitId);
    if (!habit) return res.status(404).json({ message: "Habit not found" });

    const dateKey = new Date().toISOString().slice(0,10);
    if (habit.doneDates.get(dateKey)) {
      return res.status(200).json({ message: "Already marked done for today", habit });
    }

    habit.doneDates.set(dateKey, true);

    // Check yesterday
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yKey = yesterday.toISOString().slice(0,10);
    const didYesterday = habit.doneDates.get(yKey) || false;

    if (didYesterday) habit.currentStreak = (habit.currentStreak || 0) + 1;
    else habit.currentStreak = 1;

    if (habit.currentStreak > habit.bestStreak) habit.bestStreak = habit.currentStreak;

    prog.lastUpdated = new Date();
    await prog.save();

    res.json({ habit });
  } catch (err) {
    console.error("markHabitDone error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

const getProgress = async (req, res) => {
  try {
    const { contentId } = req.params;
    const prog = await TaskProgress.findOne({ student: req.user._id, content: contentId });
    res.json(prog || {});
  } catch (err) {
    console.error("getProgress error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

const sendHabitReminder = async (req, res) => {
  try {
    const { studentId, contentId, habitId } = req.body;
    if (!studentId || !contentId || !habitId) return res.status(400).json({ message: "studentId, contentId and habitId required" });

    const prog = await TaskProgress.findOne({ student: studentId, content: contentId }).populate("student", "email username");
    if (!prog) return res.status(404).json({ message: "No progress found" });

    const habit = prog.habits.id(habitId);
    if (!habit) return res.status(404).json({ message: "Habit not found" });

    if (!prog.student || !prog.student.email) return res.status(404).json({ message: "Student email not available" });

    await sendEmail({
      to: prog.student.email,
      subject: `Reminder: ${habit.title}`,
      text: `Hi ${prog.student.username || 'student'}, this is a reminder to complete your habit: ${habit.title}.`
    });

    res.json({ message: "Reminder sent" });
  } catch (err) {
    console.error("sendHabitReminder error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

export {
  addBreathingSession,
  getTodoList,
  addTodoItem,
  toggleTodo,
  createHabit,
  markHabitDone,
  getProgress,
  sendHabitReminder
};
