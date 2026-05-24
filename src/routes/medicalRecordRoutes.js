import express from 'express';
import { uploadMedicalRecord, getMyMedicalRecords, deleteMedicalRecord } from '../controllers/medicalRecordController.js';
import { protect } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.post('/', protect, uploadMedicalRecord);
router.get('/me', protect, getMyMedicalRecords);
router.delete('/:id', protect, deleteMedicalRecord);

export default router;
