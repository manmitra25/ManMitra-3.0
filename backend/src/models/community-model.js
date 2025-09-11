const mongoose = require("mongoose");

const CommentSchema = new mongoose.Schema({
  anon_id: { type: mongoose.Schema.Types.ObjectId, ref: "AnonProfile" },
  text: { type: String, required: true },
  created_at: { type: Date, default: Date.now },
});

const CommunityPostSchema = new mongoose.Schema({
  anon_id: { type: mongoose.Schema.Types.ObjectId, ref: "AnonProfile" },
  content: { type: String, required: true },
  likes: { type: Number, default: 0 },
  comments: [CommentSchema],
  tags: [{ type: String }],
  created_at: { type: Date, default: Date.now },
});

const CommunityPost = mongoose.model("CommunityPost", CommunityPostSchema);

module.exports = CommunityPost;
