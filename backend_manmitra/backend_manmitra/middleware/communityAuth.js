import Community from '../models/Community.js';
import Volunteer from '../models/Volunteers-model.js';

// Check if user is member of a community
export const isCommunityMember = async (req, res, next) => {
  try {
    const { communityId } = req.params;
    const userId = req.user.id;
    
    const community = await Community.findById(communityId);
    
    if (!community) {
      return res.status(404).json({ message: 'Community not found' });
    }
    
    const isMember = community.members.some(member => 
      member.user.toString() === userId
    );
    
    if (!isMember) {
      return res.status(403).json({ message: 'Not a member of this community' });
    }
    
    next();
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Check if user is community admin/moderator
export const isCommunityAdmin = async (req, res, next) => {
  try {
    const { communityId } = req.params;
    
    const community = await Community.findById(communityId);
    
    if (!community) {
      return res.status(404).json({ message: 'Community not found' });
    }
    
    // Check if user is the creator
    const isCreator = community.createdBy.toString() === req.user.volunteerId;
    
    if (!isCreator) {
      // Check if user has moderation rights
      const volunteer = await Volunteer.findById(req.user.volunteerId);
      const hasModerationRights = volunteer.moderationRights.some(right => 
        right.community.toString() === communityId
      );
      
      if (!hasModerationRights) {
        return res.status(403).json({ message: 'Not authorized as community admin/moderator' });
      }
    }
    
    next();
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};