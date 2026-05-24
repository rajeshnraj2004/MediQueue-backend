import express from 'express';
import controllers from '../controllers/adminController.js';
import { protect, isAdmin } from '../middlewares/authMiddleware.js';

const { adminLogin, getDashboardStats, getAllAppointments } = controllers;

const router = express.Router();

router.post('/login', adminLogin);
router.get('/stats', protect, isAdmin, getDashboardStats);
router.get('/appointments', protect, isAdmin, getAllAppointments);

export default router;