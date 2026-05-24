import Queue from '../models/queueModel.js';
import Doctor from '../models/doctorModel.js';
import Appointment from '../models/appointmentModel.js';

// Toggle clinic status (Open/Close)
export const toggleClinicStatus = async (req, res) => {
    try {
        const doctorId = req.doctor._id;
        const doctor = await Doctor.findById(doctorId);
        
        doctor.isClinicOpen = !doctor.isClinicOpen;
        
        // Reset queue number if closing
        if (!doctor.isClinicOpen) {
            doctor.currentQueueNumber = 0;
            // Optionally clear today's queue records or mark as cancelled
            await Queue.updateMany({ doctorId, status: 'Waiting' }, { status: 'Cancelled' });
        }
        
        await doctor.save();
        res.json({ success: true, isClinicOpen: doctor.isClinicOpen });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Join live queue (Patient)
export const joinQueue = async (req, res) => {
    try {
        const { doctorId, appointmentId } = req.body;
        const patientId = req.user.id;

        const doctor = await Doctor.findById(doctorId);
        if (!doctor.isClinicOpen) {
            return res.status(400).json({ success: false, message: 'Clinic is currently closed' });
        }

        // Check if already in queue
        const existing = await Queue.findOne({ doctorId, patientId, status: { $in: ['Waiting', 'In-Consultation'] } });
        if (existing) {
            return res.status(400).json({ success: false, message: 'You are already in the queue' });
        }

        // Increment queue number
        doctor.currentQueueNumber += 1;
        await doctor.save();

        const queueItem = new Queue({
            doctorId,
            patientId,
            appointmentId,
            queueNumber: doctor.currentQueueNumber
        });

        await queueItem.save();
        res.status(201).json({ success: true, data: queueItem });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Get Live Queue Status
export const getQueueStatus = async (req, res) => {
    try {
        const { doctorId } = req.params;
        const currentInConsultation = await Queue.findOne({ doctorId, status: 'In-Consultation' }).populate('patientId', 'username');
        const waitingCount = await Queue.countDocuments({ doctorId, status: 'Waiting' });
        
        res.json({ 
            success: true, 
            data: { 
                current: currentInConsultation, 
                waiting: waitingCount 
            } 
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Next Patient (Doctor)
export const nextPatient = async (req, res) => {
    try {
        const doctorId = req.doctor._id;

        // 1. Mark current as Completed
        await Queue.updateMany({ doctorId, status: 'In-Consultation' }, { status: 'Completed' });

        // 2. Get next in line
        const next = await Queue.findOne({ doctorId, status: 'Waiting' }).sort({ queueNumber: 1 });
        if (next) {
            next.status = 'In-Consultation';
            await next.save();
            return res.json({ success: true, message: 'Next patient called', data: next });
        }

        res.json({ success: true, message: 'No more patients in queue' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export default { toggleClinicStatus, joinQueue, getQueueStatus, nextPatient };
