import Appointment from '../models/appointmentModel.js';

/**
 * @desc    Create a new appointment
 * @route   POST /api/appointments
 * @access  Private (User)
 */
export const createAppointment = async (req, res) => {
    try {
        const { doctorId, date, time, fee, paymentStatus } = req.body;

        if (!doctorId || !date || !time) {
            return res.status(400).json({ success: false, message: 'Please provide all required fields' });
        }

        const appointment = await Appointment.create({
            patientId: req.user.id,
            doctorId,
            date,
            time,
            fee,
            paymentStatus: paymentStatus || 'Pending'
        });

        res.status(201).json({
            success: true,
            message: 'Appointment created successfully',
            data: appointment
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

/**
 * @desc    Get logged in user's appointments
 * @route   GET /api/appointments/me
 * @access  Private (User)
 */
export const getUserAppointments = async (req, res) => {
    try {
        const appointments = await Appointment.find({ patientId: req.user.id })
            .populate('doctorId', 'name specialization profileImage clinicName consultationFee')
            .populate('patientId', 'username email')
            .sort({ createdAt: -1 });

        res.json({ success: true, data: appointments });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

/**
 * @desc    Get all appointments for the logged-in doctor
 * @route   GET /api/appointments/doctor
 * @access  Private (Doctor)
 */
export const getDoctorAppointments = async (req, res) => {
    try {
        const appointments = await Appointment.find({ doctorId: req.user.id })
            .populate('patientId', 'username email')
            .populate('doctorId', 'name')
            .sort({ createdAt: -1 });

        res.json({ success: true, data: appointments });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

/**
 * @desc    Update appointment status (doctor only)
 * @route   PATCH /api/appointments/:id/status
 * @access  Private (Doctor)
 */
export const updateAppointmentStatus = async (req, res) => {
    try {
        const { status } = req.body;
        const validStatuses = ['Upcoming', 'Completed', 'Cancelled'];

        if (!validStatuses.includes(status)) {
            return res.status(400).json({ success: false, message: `Status must be one of: ${validStatuses.join(', ')}` });
        }

        const appointment = await Appointment.findById(req.params.id);
        if (!appointment) {
            return res.status(404).json({ success: false, message: 'Appointment not found' });
        }

        // Only the doctor assigned to this appointment can update it
        if (appointment.doctorId.toString() !== req.user.id.toString()) {
            return res.status(403).json({ success: false, message: 'Not authorized to update this appointment' });
        }

        appointment.status = status;
        await appointment.save();

        res.json({ success: true, message: 'Status updated', data: appointment });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};


/**
 * @desc    Cancel an appointment (patient)
 * @route   PATCH /api/appointments/:id/cancel
 * @access  Private (User)
 */
export const cancelAppointment = async (req, res) => {
    try {
        const appointment = await Appointment.findById(req.params.id);
        if (!appointment) {
            return res.status(404).json({ success: false, message: 'Appointment not found' });
        }

        if (appointment.patientId.toString() !== req.user.id.toString()) {
            return res.status(403).json({ success: false, message: 'Not authorized to cancel this appointment' });
        }

        if (appointment.status === 'Completed') {
            return res.status(400).json({ success: false, message: 'Cannot cancel a completed appointment' });
        }

        appointment.status = 'Cancelled';
        await appointment.save();

        res.json({ success: true, message: 'Appointment cancelled successfully', data: appointment });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

/**
 * @desc    Delete an appointment record
 * @route   DELETE /api/appointments/:id
 * @access  Private (User)
 */
export const deleteAppointment = async (req, res) => {
    try {
        const appointment = await Appointment.findById(req.params.id);
        if (!appointment) {
            return res.status(404).json({ success: false, message: 'Appointment not found' });
        }

        if (appointment.patientId.toString() !== req.user.id.toString()) {
            return res.status(403).json({ success: false, message: 'Not authorized to delete this appointment' });
        }

        await appointment.deleteOne();

        res.json({ success: true, message: 'Appointment record deleted successfully' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
