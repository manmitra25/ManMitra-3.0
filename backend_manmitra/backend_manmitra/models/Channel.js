import mongoose from 'mongoose';

const channelSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    default: ''
  },
  community: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Community',
    required: true
  },
  type: {
    type: String,
    enum: ['text', 'voice'],
    default: 'text'
  },
  isPrivate: {
    type: Boolean,
    default: false
  },
  allowedMembers: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  topic: {
    type: String,
    default: ''
  },
  position: {
    type: Number,
    default: 0
  },
  isNSFW: {
    type: Boolean,
    default: false
  },
  rateLimit: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Index for better performance
channelSchema.index({ community: 1, name: 1 });

export default mongoose.model('Channel', channelSchema);