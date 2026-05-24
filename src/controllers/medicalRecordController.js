import MedicalRecord from '../models/medicalRecordModel.js';

/**
 * @desc    Upload a new medical record
 * @route   POST /api/medical-records
 * @access  Private (User)
 */
export const uploadMedicalRecord = async (req, res) => {
    try {
        const { title, type, doctorName, fileUrl, date, icon, color } = req.body;

        if (!title || !type || !date) {
            return res.status(400).json({ success: false, message: 'Please provide title, type and date' });
        }

        const record = await MedicalRecord.create({
            patientId: req.user.id,
            title,
            type,
            doctorName: doctorName || 'Self Uploaded',
            fileUrl: fileUrl || '',
            date,
            icon: icon || (type.toLowerCase().includes('image') ? 'image' : 'document-text'),
            color: color || (type.toLowerCase().includes('image') ? '#10B981' : '#6366F1')
        });

        res.status(201).json({
            success: true,
            message: 'Medical record uploaded successfully',
            data: record
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

/**
 * @desc    Get all medical records for the logged-in user
 * @route   GET /api/medical-records/me
 * @access  Private (User)
 */
export const getMyMedicalRecords = async (req, res) => {
    try {
        const records = await MedicalRecord.find({ patientId: req.user.id })
            .sort({ createdAt: -1 });

        res.json({ success: true, data: records });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

/**
 * @desc    Delete a medical record
 * @route   DELETE /api/medical-records/:id
 * @access  Private (User)
 */
export const deleteMedicalRecord = async (req, res) => {
    try {
        const record = await MedicalRecord.findById(req.params.id);

        if (!record) {
            return res.status(404).json({ success: false, message: 'Record not found' });
        }

        if (record.patientId.toString() !== req.user.id.toString()) {
            return res.status(403).json({ success: false, message: 'Not authorized to delete this record' });
        }

        await record.deleteOne();

        res.json({ success: true, message: 'Medical record deleted successfully' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
