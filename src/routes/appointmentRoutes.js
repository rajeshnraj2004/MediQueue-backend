import express from 'express';
import {
    createAppointment,
    getUserAppointments,
    getDoctorAppointments,
    updateAppointmentStatus,
    cancelAppointment,
    deleteAppointment
} from '../controllers/appointmentController.js';
import { protect, isDoctor } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.post('/', protect, createAppointment);
router.get('/me', protect, getUserAppointments);
router.get('/doctor', protect, isDoctor, getDoctorAppointments);
router.patch('/:id/status', protect, isDoctor, updateAppointmentStatus);
router.patch('/:id/cancel', protect, cancelAppointment);
router.delete('/:id', protect, deleteAppointment);

export default router;

