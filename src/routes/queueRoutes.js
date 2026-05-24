import express from 'express';
import { toggleClinicStatus, joinQueue, getQueueStatus, nextPatient } from '../controllers/queueController.js';
import { protect, isDoctor } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.post('/toggle', protect, isDoctor, toggleClinicStatus);
router.post('/join', protect, joinQueue);
router.get('/status/:doctorId', getQueueStatus);
router.post('/next', protect, isDoctor, nextPatient);

export default router;
