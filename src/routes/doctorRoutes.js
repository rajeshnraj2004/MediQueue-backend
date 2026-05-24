import express from 'express';
import {
    registerDoctor,
    loginDoctor,
    getDoctorProfile,
    updateDoctorProfile,
    uploadLicenseDocument,
    getAllDoctors,
    getAllApprovedDoctors,
    approveDoctor,
    rejectDoctor,
    logoutDoctor,
    deleteDoctor
} from '../controllers/doctorController.js';

import { protect, isAdmin, isDoctor } from '../middlewares/authMiddleware.js';
import upload from '../middlewares/uploadMiddleware.js';

const router = express.Router();

// Public routes
router.post('/register', registerDoctor);
router.post('/login', loginDoctor);
router.get('/approved', getAllApprovedDoctors);

// Protected routes (Doctor only)
router.get('/profile', protect, isDoctor, getDoctorProfile);
router.put('/profile', protect, isDoctor, updateDoctorProfile);
router.post('/upload-license', protect, isDoctor, upload.single('license'), uploadLicenseDocument);
router.post('/logout', protect, logoutDoctor);

// Admin routes
router.get('/', protect, isAdmin, getAllDoctors);
router.put('/:id/approve', protect, isAdmin, approveDoctor);
router.put('/:id/reject', protect, isAdmin, rejectDoctor);
router.delete('/:id', protect, isAdmin, deleteDoctor);

export default router;

