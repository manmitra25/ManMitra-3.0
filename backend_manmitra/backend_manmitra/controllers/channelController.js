import Channel from '../models/Channel.js';
import Community from '../models/Community.js';
import Volunteer from '../models/Volunteers-model.js';

// Get all channels in a community
export const getChannels = async (req, res) => {
  try {
    const { communityId } = req.params;
    
    const channels = await Channel.find({ community: communityId })
      .populate('createdBy', 'username')
      .sort({ position: 1, createdAt: 1 });
    
    res.json(channels);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Create channel (community admins/moderators only)
export const createChannel = async (req, res) => {
  try {
    const { communityId } = req.params;
    const { name, description, type, isPrivate, topic } = req.body;
    
    const community = await Community.findById(communityId);
    if (!community) {
      return res.status(404).json({ message: 'Community not found' });
    }
    
    // Check if user has permission to create channels
    const volunteer = await Volunteer.findById(req.user.volunteerId);
    const isCreator = community.createdBy.toString() === req.user.volunteerId;
    const hasModerationRights = volunteer.moderationRights.some(right => 
      right.community.toString() === communityId && 
      right.permissions.includes('manage_channels')
    );
    
    if (!isCreator && !hasModerationRights) {
      return res.status(403).json({ message: 'Not authorized to create channels' });
    }
    
    // Check if channel name already exists in this community
    const existingChannel = await Channel.findOne({ 
      community: communityId, 
      name 
    });
    
    if (existingChannel) {
      return res.status(400).json({ message: 'Channel name already exists in this community' });
    }
    
    const channel = new Channel({
      name,
      description,
      type,
      isPrivate: isPrivate || false,
      topic,
      community: communityId,
      createdBy: req.user.id
    });
    
    const savedChannel = await channel.save();
    
    // Add channel to community's channels array
    community.channels.push(savedChannel._id);
    await community.save();
    
    res.status(201).json(savedChannel);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update channel
export const updateChannel = async (req, res) => {
  try {
    const channel = await Channel.findById(req.params.id);
    
    if (!channel) {
      return res.status(404).json({ message: 'Channel not found' });
    }
    
    // Check if user has permission to update channels
    const community = await Community.findById(channel.community);
    const volunteer = await Volunteer.findById(req.user.volunteerId);
    const isCreator = community.createdBy.toString() === req.user.volunteerId;
    const hasModerationRights = volunteer.moderationRights.some(right => 
      right.community.toString() === channel.community.toString() && 
      right.permissions.includes('manage_channels')
    );
    
    if (!isCreator && !hasModerationRights) {
      return res.status(403).json({ message: 'Not authorized to update this channel' });
    }
    
    const updatedChannel = await Channel.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    
    res.json(updatedChannel);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete channel
export const deleteChannel = async (req, res) => {
  try {
    const channel = await Channel.findById(req.params.id);
    
    if (!channel) {
      return res.status(404).json({ message: 'Channel not found' });
    }
    
    // Check if user has permission to delete channels
    const community = await Community.findById(channel.community);
    const volunteer = await Volunteer.findById(req.user.volunteerId);
    const isCreator = community.createdBy.toString() === req.user.volunteerId;
    const hasModerationRights = volunteer.moderationRights.some(right => 
      right.community.toString() === channel.community.toString() && 
      right.permissions.includes('manage_channels')
    );
    
    if (!isCreator && !hasModerationRights) {
      return res.status(403).json({ message: 'Not authorized to delete this channel' });
    }
    
    await Channel.findByIdAndDelete(req.params.id);
    
    // Remove channel from community's channels array
    community.channels = community.channels.filter(
      channelId => channelId.toString() !== req.params.id
    );
    await community.save();
    
    res.json({ message: 'Channel deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};