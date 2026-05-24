import mongoose from 'mongoose';

const appointmentSchema = new mongoose.Schema(
    {
        patientId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        doctorId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Doctor',
            required: true,
        },
        date: {
            type: String, // Storing as 'YYYY-MM-DD' or localized string for simplicity
            required: true,
        },
        time: {
            type: String, // e.g. '10:00 AM'
            required: true,
        },
        paymentStatus: {
            type: String,
            enum: ['Pending', 'Completed', 'Failed', 'Refunded'],
            default: 'Pending',
        },
        status: {
            type: String,
            enum: ['Upcoming', 'Completed', 'Cancelled'],
            default: 'Upcoming',
        },
        fee: {
            type: Number,
            required: true,
        }
    },
    {
        timestamps: true,
    }
);

const Appointment = mongoose.model('Appointment', appointmentSchema);
export default Appointment;
