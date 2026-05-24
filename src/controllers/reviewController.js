import Review from '../models/reviewModel.js';
import Doctor from '../models/doctorModel.js';
import Appointment from '../models/appointmentModel.js';

/**
 * @desc    Submit a review for a doctor
 * @route   POST /api/reviews
 * @access  Private (User)
 */
export const createReview = async (req, res) => {
    try {
        const { doctorId, appointmentId, rating, comment } = req.body;

        if (!doctorId || !appointmentId || !rating) {
            return res.status(400).json({ success: false, message: 'Please provide all required fields' });
        }

        // Check if appointment exists and belongs to the user
        const appointment = await Appointment.findById(appointmentId);
        if (!appointment) {
            return res.status(404).json({ success: false, message: 'Appointment not found' });
        }

        if (appointment.patientId.toString() !== req.user.id.toString()) {
            return res.status(403).json({ success: false, message: 'Not authorized to review this appointment' });
        }

        if (appointment.status !== 'Completed') {
            return res.status(400).json({ success: false, message: 'Can only review completed appointments' });
        }

        // Check if already reviewed
        const existingReview = await Review.findOne({ appointmentId });
        if (existingReview) {
            return res.status(400).json({ success: false, message: 'Appointment already reviewed' });
        }

        const review = await Review.create({
            patientId: req.user.id,
            doctorId,
            appointmentId,
            rating,
            comment
        });

        // Update doctor rating
        const doctor = await Doctor.findById(doctorId);
        if (doctor) {
            const reviews = await Review.find({ doctorId });
            const avgRating = reviews.reduce((acc, item) => item.rating + acc, 0) / reviews.length;
            
            doctor.numReviews = reviews.length;
            doctor.rating = avgRating;
            await doctor.save();
        }

        res.status(201).json({
            success: true,
            message: 'Review submitted successfully',
            data: review
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

/**
 * @desc    Get reviews for a doctor
 * @route   GET /api/reviews/doctor/:doctorId
 * @access  Public
 */
export const getDoctorReviews = async (req, res) => {
    try {
        const reviews = await Review.find({ doctorId: req.params.doctorId })
            .populate('patientId', 'username profileImage')
            .sort({ createdAt: -1 });

        res.json({ success: true, data: reviews });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
