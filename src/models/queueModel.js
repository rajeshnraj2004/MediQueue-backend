import mongoose from 'mongoose';

const queueSchema = new mongoose.Schema(
    {
        doctorId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Doctor',
            required: true,
        },
        patientId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        appointmentId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Appointment',
        },
        queueNumber: {
            type: Number,
            required: true,
        },
        status: {
            type: String,
            enum: ['Waiting', 'In-Consultation', 'Completed', 'Cancelled'],
            default: 'Waiting',
        },
        joinedAt: {
            type: Date,
            default: Date.now,
        }
    },
    {
        timestamps: true,
    }
);

const Queue = mongoose.model('Queue', queueSchema);
export default Queue;
