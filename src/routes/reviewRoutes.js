import express from 'express';
import { createReview, getDoctorReviews } from '../controllers/reviewController.js';
import { protect } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.post('/', protect, createReview);
router.get('/doctor/:doctorId', getDoctorReviews);

export default router;
