import mongoose from "mongoose";

const volunteerSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    skills: { type: [String], required: true }, // e.g. ["counseling", "event support"]
    status: { type: String, enum: ["pending", "approved", "rejected"], default: "pending" },
    canCreateCommunities: {
      type: Boolean,
      default: true
    },
    createdCommunities: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Community'
    }],
    moderationRights: [{
      community: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Community'
      },
      permissions: [{
        type: String,
        enum: ['manage_channels', 'manage_messages', 'manage_members', 'ban_members']
      }]
    }]
  },
  { timestamps: true }
);

const Volunteer = mongoose.model("Volunteer", volunteerSchema);

export default Volunteer;
