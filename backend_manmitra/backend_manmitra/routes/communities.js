import express from 'express';
const router = express.Router();
import {
  getAllCommunities,
  getCommunity,
  createCommunity,
  joinCommunity,
  leaveCommunity,
  updateCommunity
} from '../controllers/communityController.js';
import { protect, volunteerProtect } from '../middleware/auth.js';

router.route('/')
  .get(getAllCommunities)
  .post(protect, volunteerProtect, createCommunity);

router.route('/:id')
  .get(getCommunity)
  .put(protect, volunteerProtect, updateCommunity);

router.route('/:id/join')
  .post(protect, joinCommunity);

router.route('/:id/leave')
  .post(protect, leaveCommunity);

export default router;