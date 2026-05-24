import mongoose from 'mongoose';

const medicalRecordSchema = new mongoose.Schema(
    {
        patientId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        title: {
            type: String,
            required: true,
            trim: true,
        },
        type: {
            type: String, // 'PDF', 'Image', etc.
            required: true,
        },
        doctorName: {
            type: String,
            default: 'Self Uploaded',
        },
        fileUrl: {
            type: String, // String representation or path
            default: '',
        },
        date: {
            type: String,
            required: true,
        },
        icon: {
            type: String,
            default: 'document-text',
        },
        color: {
            type: String,
            default: '#6366F1',
        }
    },
    {
        timestamps: true,
    }
);

const MedicalRecord = mongoose.model('MedicalRecord', medicalRecordSchema);
export default MedicalRecord;
