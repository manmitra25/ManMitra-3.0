import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const studentSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  collegeName: {
    type: String,
    required: true,
    enum: ["MIT - Maqsad Institute of Engineering", "BITS - Bomb institute of technology"], // Dropdown options
  },
  // New fields for community feature
  communityProfiles: [{
    community: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Community'
    },
    username: {
      type: String,
      required: true
    },
    avatar: {
      type: String,
      default: ''
    },
    roles: [{
      type: String,
      default: 'member'
    }],
    joinedAt: {
      type: Date,
      default: Date.now
    },
    isBanned: {
      type: Boolean,
      default: false
    },
    banReason: {
      type: String,
      default: ''
    }
  }],
}, { timestamps: true });

// Hash password before saving
studentSchema.pre("save", async function(next) {
  if (!this.isModified("password")) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

export default mongoose.model("Student", studentSchema);
