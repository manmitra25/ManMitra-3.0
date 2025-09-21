// models/SuperAdmin.js
import mongoose from "mongoose";

const superAdminSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, default: "superadmin" }, // fixed role
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model("SuperAdmin", superAdminSchema);
