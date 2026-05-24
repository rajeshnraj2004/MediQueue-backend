import express from 'express';
import { diagnoseSymptoms } from '../controllers/aiController.js';

const router = express.Router();

// AI Diagnosis Endpoint
router.post('/diagnose', diagnoseSymptoms);

export default router;
