import express from 'express';
const router = express.Router();
import {
  getMessages,
  sendMessage,
  replyToMessage,
  editMessage,
  deleteMessage
} from '../controllers/messageController.js';
import { protect } from '../middleware/auth.js';

router.route('/channel/:channelId')
  .get(protect, getMessages)
  .post(protect, sendMessage);

router.route('/:messageId/reply')
  .post(protect, replyToMessage);

router.route('/:messageId')
  .put(protect, editMessage)
  .delete(protect, deleteMessage);

export default router;