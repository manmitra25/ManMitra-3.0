// models/TaskProgress.js
import mongoose from "mongoose";

const todoItemSchema = new mongoose.Schema({
  text: { type: String, required: true },
  done: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
  doneAt: { type: Date }
});

const habitSchema = new mongoose.Schema({
  title: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  // map of 'YYYY-MM-DD' => true
  doneDates: { type: Map, of: Boolean, default: {} },
  currentStreak: { type: Number, default: 0 },
  bestStreak: { type: Number, default: 0 },
  reminderTime: { type: String } // optional "HH:MM" (24h) in server local or UTC convention
});

const taskProgressSchema = new mongoose.Schema({
  student: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
  content: { type: mongoose.Schema.Types.ObjectId, ref: "HubContent", required: true },
  category: { type: String, enum: ["task", "video","book","audio"], default: "task" },

  // breathing sessions
  breathingSessions: [{
    startedAt: Date,
    durationSec: Number,
    details: mongoose.Schema.Types.Mixed
  }],

  // todo list items
  todoList: [todoItemSchema],

  // habits
  habits: [habitSchema],

  completed: { type: Boolean, default: false },
  lastUpdated: { type: Date, default: Date.now }
}, { timestamps: true });

export default mongoose.model("TaskProgress", taskProgressSchema);
