import Doctor from '../models/doctorModel.js';
import jwt from 'jsonwebtoken';

// Utility to generate Token
const generateToken = (id, role) => {
    console.log(`[DEBUG SIGNING - DOCTOR] Secret: ${process.env.JWT_SECRET}`);
    const token = jwt.sign({ id, role }, process.env.JWT_SECRET, {
        expiresIn: '365d',
    });
    console.log(`[DEBUG SIGNING - DOCTOR] Token snippet: ${token.substring(0, 20)}...`);
    return token;
};

/**
 * @desc    Register a new doctor
 * @route   POST /api/doctors/register
 * @access  Public
 */
export const registerDoctor = async (req, res) => {
    try {
        const {
            name, email, password, phone, specialization,
            experience, licenseNumber, clinicName, clinicAddress, clinicLocation,
            consultationFee, availability, profileImage, licenseDocument
        } = req.body;


        // Check if doctor exists
        const doctorExists = await Doctor.findOne({ email });
        if (doctorExists) {
            return res.status(400).json({ success: false, message: 'Doctor already exists with this email' });
        }

        const licenseExists = await Doctor.findOne({ licenseNumber });
        if (licenseExists) {
            return res.status(400).json({ success: false, message: 'License number already registered' });
        }

        // Create doctor
        const doctor = await Doctor.create({
            name, email, password, phone, specialization,
            experience, licenseNumber, clinicName, clinicAddress, clinicLocation,
            consultationFee, availability, profileImage, licenseDocument,
            status: 'pending' // Default status
        });


        if (doctor) {
            res.status(201).json({
                success: true,
                message: 'Doctor registered successfully. Await admin approval.',
                data: {
                    _id: doctor._id,
                    name: doctor.name,
                    email: doctor.email,
                    status: doctor.status
                }
            });
        }
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

/**
 * @desc    Login doctor
 * @route   POST /api/doctors/login
 * @access  Public
 */
export const loginDoctor = async (req, res) => {
    try {
        const { email, password } = req.body;

        const doctor = await Doctor.findOne({ email });

        if (doctor && (await doctor.comparePassword(password))) {
            res.json({
                success: true,
                message: 'Login successful',
                data: {
                    _id: doctor._id,
                    name: doctor.name,
                    email: doctor.email,
                    token: generateToken(doctor._id, 'doctor'),
                    status: doctor.status,
                    profileImage: doctor.profileImage
                }
            });
        } else {

            res.status(401).json({ success: false, message: 'Invalid email or password' });
        }
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

/**
 * @desc    Get doctor profile
 * @route   GET /api/doctors/profile
 * @access  Private (Doctor)
 */
export const getDoctorProfile = async (req, res) => {
    try {
        const doctor = await Doctor.findById(req.doctor._id).select('-password');
        if (doctor) {
            res.json({ success: true, data: doctor });
        } else {
            res.status(404).json({ success: false, message: 'Doctor not found' });
        }
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

/**
 * @desc    Update doctor profile
 * @route   PUT /api/doctors/profile
 * @access  Private (Doctor)
 */
export const updateDoctorProfile = async (req, res) => {
    try {
        const doctor = await Doctor.findById(req.doctor._id);

        if (doctor) {
            doctor.name = req.body.name || doctor.name;
            doctor.phone = req.body.phone || doctor.phone;
            doctor.specialization = req.body.specialization || doctor.specialization;
            doctor.experience = req.body.experience || doctor.experience;
            doctor.clinicName = req.body.clinicName || doctor.clinicName;
            doctor.clinicAddress = req.body.clinicAddress || doctor.clinicAddress;
            doctor.consultationFee = req.body.consultationFee || doctor.consultationFee;
            doctor.availability = req.body.availability || doctor.availability;
            doctor.profileImage = req.body.profileImage || doctor.profileImage;

            if (req.body.password) {
                doctor.password = req.body.password;
            }

            const updatedDoctor = await doctor.save();
            res.json({
                success: true,
                message: 'Profile updated successfully',
                data: updatedDoctor
            });
        } else {
            res.status(404).json({ success: false, message: 'Doctor not found' });
        }
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

/**
 * @desc    Upload license document
 * @route   POST /api/doctors/upload-license
 * @access  Private (Doctor)
 */
export const uploadLicenseDocument = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ success: false, message: 'No file uploaded' });
        }

        const doctor = await Doctor.findById(req.doctor._id);
        if (doctor) {
            doctor.licenseDocument = req.file.path; // Cloudinary URL
            await doctor.save();
            res.json({ success: true, message: 'Document uploaded successfully', url: req.file.path });
        } else {
            res.status(404).json({ success: false, message: 'Doctor not found' });
        }
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

/**
 * @desc    Get all doctors
 * @route   GET /api/doctors
 * @access  Private (Admin)
 */
export const getAllDoctors = async (req, res) => {
    try {
        const doctors = await Doctor.find({}).select('-password');
        res.json({ success: true, data: doctors });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

/**
 * @desc    Get all approved doctors
 * @route   GET /api/doctors/approved
 * @access  Public/Private
 */
export const getAllApprovedDoctors = async (req, res) => {
    try {
        const { lat, lng } = req.query;
        // For development: showing all doctors regardless of status
        // let doctors = await Doctor.find({ status: 'approved' }).select('-password');
        let doctors = await Doctor.find({}).select('-password');

        if (lat && lng) {
            const userLat = parseFloat(lat);
            const userLng = parseFloat(lng);

            // Calculate distance for each doctor
            doctors = doctors.map(doctor => {
                const docObj = doctor.toObject();
                if (docObj.clinicLocation && docObj.clinicLocation.latitude && docObj.clinicLocation.longitude) {
                    const docLat = docObj.clinicLocation.latitude;
                    const docLng = docObj.clinicLocation.longitude;

                    // Haversine formula
                    const R = 6371; // Earth radius in km
                    const dLat = (docLat - userLat) * Math.PI / 180;
                    const dLng = (docLng - userLng) * Math.PI / 180;
                    const a =
                        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
                        Math.cos(userLat * Math.PI / 180) * Math.cos(docLat * Math.PI / 180) *
                        Math.sin(dLng / 2) * Math.sin(dLng / 2);
                    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
                    const distance = R * c;

                    docObj.distance = distance.toFixed(1); // 1 decimal place
                } else {
                    docObj.distance = null;
                }
                return docObj;
            });

            // Optional: sort by distance
            doctors.sort((a, b) => (a.distance || Infinity) - (b.distance || Infinity));
        }

        res.json({ success: true, data: doctors });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

/**
 * @desc    Approve doctor
 * @route   PUT /api/doctors/:id/approve
 * @access  Private (Admin)
 */
export const approveDoctor = async (req, res) => {
    try {
        const doctor = await Doctor.findById(req.params.id);
        if (doctor) {
            doctor.status = 'approved';
            await doctor.save();
            res.json({ success: true, message: 'Doctor approved successfully' });
        } else {
            res.status(404).json({ success: false, message: 'Doctor not found' });
        }
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

/**
 * @desc    Reject doctor
 * @route   PUT /api/doctors/:id/reject
 * @access  Private (Admin)
 */
export const rejectDoctor = async (req, res) => {
    try {
        const doctor = await Doctor.findById(req.params.id);
        if (doctor) {
            doctor.status = 'rejected';
            await doctor.save();
            res.json({ success: true, message: 'Doctor rejected successfully' });
        } else {
            res.status(404).json({ success: false, message: 'Doctor not found' });
        }
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

/**
 * @desc    Logout doctor
 * @route   POST /api/doctors/logout
 * @access  Private
 */
export const logoutDoctor = async (req, res) => {
    res.json({ success: true, message: 'Logged out successfully' });
};

/**
 * @desc    Delete doctor
 * @route   DELETE /api/doctors/:id
 * @access  Private (Admin)
 */
export const deleteDoctor = async (req, res) => {
    try {
        const doctor = await Doctor.findByIdAndDelete(req.params.id);
        if (doctor) {
            res.json({ success: true, message: 'Doctor deleted successfully' });
        } else {
            res.status(404).json({ success: false, message: 'Doctor not found' });
        }
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};