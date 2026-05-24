import express from 'express';
import { savePushToken } from '../controllers/notificationController.js';
import { protect } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.post('/save-token', protect, savePushToken);

export default router;
