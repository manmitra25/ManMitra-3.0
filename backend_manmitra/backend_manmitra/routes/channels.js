import express from 'express';
const router = express.Router();
import {
  getChannels,
  createChannel,
  updateChannel,
  deleteChannel
} from '../controllers/channelController.js';
import { protect, volunteerProtect } from '../middleware/auth.js';

router.route('/community/:communityId')
  .get(protect, getChannels)
  .post(protect, volunteerProtect, createChannel);

router.route('/:id')
  .put(protect, volunteerProtect, updateChannel)
  .delete(protect, volunteerProtect, deleteChannel);

export default router;