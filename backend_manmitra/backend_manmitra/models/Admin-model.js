import mongoose from "mongoose";

const adminSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    collegeName: { type: String, required: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "SuperAdmin" },
    role: { type: String, default: "admin" },
  },
  { timestamps: true }
);

const Admin = mongoose.model("Admin", adminSchema);

export default Admin;
