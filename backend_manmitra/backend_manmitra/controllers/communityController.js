import Community from '../models/Community.js';
import Student from '../models/student-model.js';
import Volunteer from '../models/Volunteers-model.js';

// Get all communities
export const getAllCommunities = async (req, res) => {
  try {
    const { category, search, page = 1, limit = 10 } = req.query;
    
    let query = { isActive: true };
    
    if (category && category !== 'All') {
      query.category = category;
    }
    
    if (search) {
      query.$text = { $search: search };
    }
    
    const communities = await Community.find(query)
      .populate('createdBy', 'user')
      .populate('members.user', 'username email')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 });
    
    const total = await Community.countDocuments(query);
    
    res.json({
      communities,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get single community
export const getCommunity = async (req, res) => {
  try {
    const community = await Community.findById(req.params.id)
      .populate('createdBy', 'user')
      .populate('members.user', 'username email')
      .populate('channels');
    
    if (!community) {
      return res.status(404).json({ message: 'Community not found' });
    }
    
    res.json(community);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Create new community (volunteers only)
export const createCommunity = async (req, res) => {
  try {
    const volunteer = await Volunteer.findById(req.user.volunteerId);
    
    if (!volunteer || !volunteer.canCreateCommunities) {
      return res.status(403).json({ message: 'Not authorized to create communities' });
    }
    
    const { name, description, category, rules } = req.body;
    
    // Check if community name already exists
    const existingCommunity = await Community.findOne({ name });
    if (existingCommunity) {
      return res.status(400).json({ message: 'Community name already exists' });
    }
    
    const community = new Community({
      name,
      description,
      category,
      rules: rules || [],
      createdBy: req.user.volunteerId
    });
    
    const savedCommunity = await community.save();
    
    // Add community to volunteer's created communities
    volunteer.createdCommunities.push(savedCommunity._id);
    await volunteer.save();
    
    res.status(201).json(savedCommunity);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Join community
export const joinCommunity = async (req, res) => {
  try {
    const { communityId, username } = req.body;
    const userId = req.user.id;
    
    const community = await Community.findById(communityId);
    if (!community) {
      return res.status(404).json({ message: 'Community not found' });
    }
    
    // Check if user is already a member
    const isMember = community.members.some(member => 
      member.user.toString() === userId
    );
    
    if (isMember) {
      return res.status(400).json({ message: 'Already a member of this community' });
    }
    
    // Check if username is unique within the community
    const usernameExists = community.members.some(member => 
      member.username === username
    );
    
    if (usernameExists) {
      return res.status(400).json({ message: 'Username already taken in this community' });
    }
    
    // Add user to community members
    community.members.push({
      user: userId,
      username
    });
    
    await community.save();
    
    // Add community to user's community profiles
    const user = await Student.findById(userId);
    user.communityProfiles.push({
      community: communityId,
      username
    });
    
    await user.save();
    
    res.json({ message: 'Successfully joined community', community });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Leave community
export const leaveCommunity = async (req, res) => {
  try {
    const { communityId } = req.params;
    const userId = req.user.id;
    
    const community = await Community.findById(communityId);
    if (!community) {
      return res.status(404).json({ message: 'Community not found' });
    }
    
    // Remove user from community members
    community.members = community.members.filter(member => 
      member.user.toString() !== userId
    );
    
    await community.save();
    
    // Remove community from user's community profiles
    const user = await Student.findById(userId);
    user.communityProfiles = user.communityProfiles.filter(
      profile => profile.community.toString() !== communityId
    );
    
    await user.save();
    
    res.json({ message: 'Successfully left community' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update community (volunteers/admins only)
export const updateCommunity = async (req, res) => {
  try {
    const community = await Community.findById(req.params.id);
    
    if (!community) {
      return res.status(404).json({ message: 'Community not found' });
    }
    
    // Check if user is the creator or has moderation rights
    const volunteer = await Volunteer.findById(req.user.volunteerId);
    const isCreator = community.createdBy.toString() === req.user.volunteerId;
    const hasModerationRights = volunteer.moderationRights.some(right => 
      right.community.toString() === req.params.id
    );
    
    if (!isCreator && !hasModerationRights) {
      return res.status(403).json({ message: 'Not authorized to update this community' });
    }
    
    const updatedCommunity = await Community.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    
    res.json(updatedCommunity);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};