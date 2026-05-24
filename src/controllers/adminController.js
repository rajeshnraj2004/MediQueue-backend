import Admin from '../models/adminModel.js';
import Doctor from '../models/doctorModel.js';
import User from '../models/userModel.js';
import Appointment from '../models/appointmentModel.js';
import jwt from 'jsonwebtoken';

const adminLogin = async (req, res) => {
    const { email, password } = req.body;
    try {
        if (email === process.env.ADMIN_EMAIL && password === process.env.ADMIN_PASSWORD) {
            let admin = await Admin.findOne({ email });
            if (!admin) {
                admin = new Admin({ email, password });
                await admin.save();
            }
            const token = jwt.sign({ id: admin._id, email, role: 'admin' }, process.env.JWT_SECRET, { expiresIn: '24h' });
            return res.json({ success: true, message: 'Admin logged in successfully', token });
        } else {
            return res.status(400).json({ success: false, message: 'Invalid credentials' });
        }
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

const getDashboardStats = async (req, res) => {
    try {
        const [doctorsCount, usersCount, appointmentsCount, openClinicsCount] = await Promise.all([
            Doctor.countDocuments(),
            User.countDocuments(),
            Appointment.countDocuments(),
            Doctor.countDocuments({ isClinicOpen: true }),
        ]);
        res.json({
            success: true,
            data: { 
                doctors: doctorsCount, 
                users: usersCount, 
                appointments: appointmentsCount, 
                queues: openClinicsCount 
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

const getAllAppointments = async (req, res) => {
    try {
        const appointments = await Appointment.find({})
            .populate('patientId', 'username email')
            .populate('doctorId', 'name specialization profileImage')
            .sort({ createdAt: -1 });
        res.json({ success: true, data: appointments });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export default { adminLogin, getDashboardStats, getAllAppointments };
