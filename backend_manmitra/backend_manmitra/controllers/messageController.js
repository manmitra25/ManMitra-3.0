import Message from '../models/Message.js';
import Channel from '../models/Channel.js';
import Community from '../models/Community.js';
import Volunteer from '../models/Volunteers-model.js';

// Get messages in a channel
export const getMessages = async (req, res) => {
  try {
    const { channelId } = req.params;
    const { page = 1, limit = 50, before } = req.query;
    
    let query = { channel: channelId };
    
    if (before) {
      query.createdAt = { $lt: new Date(before) };
    }
    
    const messages = await Message.find(query)
      .populate('author', 'username')
      .populate('replies.author', 'username')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);
    
    const total = await Message.countDocuments(query);
    
    res.json({
      messages: messages.reverse(), // Return in chronological order
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Send message
export const sendMessage = async (req, res) => {
  try {
    const { channelId } = req.params;
    const { content, attachments } = req.body;
    const userId = req.user.id;
    
    const channel = await Channel.findById(channelId);
    if (!channel) {
      return res.status(404).json({ message: 'Channel not found' });
    }
    
    // Check if user is a member of the community
    const community = await Community.findById(channel.community);
    const isMember = community.members.some(member => 
      member.user.toString() === userId
    );
    
    if (!isMember) {
      return res.status(403).json({ message: 'You must be a member of this community to send messages' });
    }
    
    // Get user's community username
    const userCommunityProfile = community.members.find(member => 
      member.user.toString() === userId
    );
    
    const message = new Message({
      content,
      channel: channelId,
      author: userId,
      communityUsername: userCommunityProfile.username,
      attachments: attachments || []
    });
    
    const savedMessage = await message.save();
    const populatedMessage = await Message.findById(savedMessage._id)
      .populate('author', 'username')
      .populate('replies.author', 'username');
    
    // Emit socket event for real-time messaging
    req.app.get('io').to(channelId).emit('new_message', populatedMessage);
    
    res.status(201).json(populatedMessage);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Reply to message
export const replyToMessage = async (req, res) => {
  try {
    const { messageId } = req.params;
    const { content } = req.body;
    const userId = req.user.id;
    
    const originalMessage = await Message.findById(messageId);
    if (!originalMessage) {
      return res.status(404).json({ message: 'Message not found' });
    }
    
    const channel = await Channel.findById(originalMessage.channel);
    const community = await Community.findById(channel.community);
    
    // Check if user is a member of the community
    const isMember = community.members.some(member => 
      member.user.toString() === userId
    );
    
    if (!isMember) {
      return res.status(403).json({ message: 'You must be a member of this community to reply to messages' });
    }
    
    // Get user's community username
    const userCommunityProfile = community.members.find(member => 
      member.user.toString() === userId
    );
    
    const reply = {
      content,
      author: userId,
      communityUsername: userCommunityProfile.username,
      repliedTo: messageId
    };
    
    originalMessage.replies.push(reply);
    const savedMessage = await originalMessage.save();
    
    const populatedMessage = await Message.findById(savedMessage._id)
      .populate('author', 'username')
      .populate('replies.author', 'username');
    
    // Emit socket event for real-time messaging
    req.app.get('io').to(channel._id.toString()).emit('message_updated', populatedMessage);
    
    res.json(populatedMessage);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Edit message
export const editMessage = async (req, res) => {
  try {
    const { messageId } = req.params;
    const { content } = req.body;
    
    const message = await Message.findById(messageId);
    if (!message) {
      return res.status(404).json({ message: 'Message not found' });
    }
    
    // Check if user is the author of the message
    if (message.author.toString() !== req.user.id) {
      return res.status(403).json({ message: 'You can only edit your own messages' });
    }
    
    message.content = content;
    message.edited = {
      isEdited: true,
      editedAt: new Date()
    };
    
    const savedMessage = await message.save();
    const populatedMessage = await Message.findById(savedMessage._id)
      .populate('author', 'username')
      .populate('replies.author', 'username');
    
    // Emit socket event for real-time messaging
    const channel = await Channel.findById(message.channel);
    req.app.get('io').to(channel._id.toString()).emit('message_updated', populatedMessage);
    
    res.json(populatedMessage);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete message
export const deleteMessage = async (req, res) => {
  try {
    const { messageId } = req.params;
    
    const message = await Message.findById(messageId);
    if (!message) {
      return res.status(404).json({ message: 'Message not found' });
    }
    
    const channel = await Channel.findById(message.channel);
    const community = await Community.findById(channel.community);
    
    // Check if user is the author or has moderation rights
    const isAuthor = message.author.toString() === req.user.id;
    const volunteer = await Volunteer.findById(req.user.volunteerId);
    const isCreator = community.createdBy.toString() === req.user.volunteerId;
    const hasModerationRights = volunteer.moderationRights.some(right => 
      right.community.toString() === community._id.toString() && 
      right.permissions.includes('manage_messages')
    );
    
    if (!isAuthor && !isCreator && !hasModerationRights) {
      return res.status(403).json({ message: 'Not authorized to delete this message' });
    }
    
    await Message.findByIdAndDelete(messageId);
    
    // Emit socket event for real-time messaging
    req.app.get('io').to(channel._id.toString()).emit('message_deleted', messageId);
    
    res.json({ message: 'Message deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};