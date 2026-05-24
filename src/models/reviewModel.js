import mongoose from 'mongoose';

const reviewSchema = new mongoose.Schema(
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
        appointmentId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Appointment',
            unique: true, // One review per appointment
            required: true,
        },
        rating: {
            type: Number,
            required: true,
            min: 1,
            max: 5,
        },
        comment: {
            type: String,
            trim: true,
        }
    },
    {
        timestamps: true,
    }
);

const Review = mongoose.model('Review', reviewSchema);
export default Review;
