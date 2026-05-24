import express from 'express';
import { createOrder, verifyPayment } from '../controllers/paymentController.js';
import { protect } from '../middlewares/authMiddleware.js';

const router = express.Router();

// POST /api/payments/create-order  → Create a Razorpay (or simulated) order
router.post('/create-order', protect, createOrder);

// POST /api/payments/verify        → Verify Razorpay payment signature
router.post('/verify', protect, verifyPayment);

export default router;
