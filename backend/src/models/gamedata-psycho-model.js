const mongoose = require("mongoose");

const GameDataSchema = new mongoose.Schema({
  game_type: {
    type: String,
    enum: ["puzzle", "word_game", "riddle"],
  },
  content: String,
});

const PsychoContentSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ["video", "image", "game"],
    required: true,
  },
  title: { type: String, required: true },
  description: String,
  url: String, // for videos/images
  game_data: GameDataSchema, // only if type = game
  tags: [{ type: String }],
  created_at: { type: Date, default: Date.now },
});

const PsychoContent = mongoose.model("PsychoContent", PsychoContentSchema);

module.exports = PsychoContent;
