// models/HubContent.js
import mongoose from "mongoose";

const contentSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String },
  category: { 
    type: String, 
    enum: ["video", "book", "task", "audio"], 
    required: true 
  },
  subtype: { 
    // video: "long"|"short", audio: "audiobook"|"podcast", task: "breathing"|"todo"|"habit"
    type: String,
    required: true
  },
  url: { type: String },           // video/audio link or book download link
  duration: { type: Number },      // seconds for video/audio
  authors: [String],              // for books/podcasts
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  publishDate: { type: Date, default: Date.now },
  metadata: { type: mongoose.Schema.Types.Mixed }, // free-form (e.g., chapters, difficulty)
  isPublished: { type: Boolean, default: true }
}, { timestamps: true });

export default mongoose.model("HubContent", contentSchema);
