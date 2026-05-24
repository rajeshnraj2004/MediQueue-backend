import jwt from 'jsonwebtoken';
import Doctor from '../models/doctorModel.js';

// Protect routes
export const protect = async (req, res, next) => {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            // 1. Extract token (using explicit split as requested)
            token = req.headers.authorization.split(' ')[1];

            // 2. Verify & decode
            const secret = process.env.JWT_SECRET;
            console.log('[DEBUG VERIFYING] JWT_SECRET in process.env:', secret);
            console.log('[DEBUG VERIFYING] Token being verified (full):', token);

            if (!secret) {
                console.error("JWT_SECRET is missing in environment variables!");
                return res.status(500).json({ success: false, message: 'Server configuration error' });
            }

            const decoded = jwt.verify(token, secret);
            console.log('[DEBUG VERIFYING] Successfully decoded payload:', decoded);

            // 3. Normalize: patient JWTs use `userId`, doctor/admin JWTs use `id`
            //    Unify to `id` so all controllers can safely do req.user.id
            if (decoded.userId && !decoded.id) {
                decoded.id = decoded.userId;
            }

            // 4. Role-based extra lookups
            if (decoded.role === 'doctor') {
                req.doctor = await Doctor.findById(decoded.id).select('-password');
                if (!req.doctor) {
                    return res.status(401).json({ success: false, message: 'Not authorized, doctor not found' });
                }
            } else if (decoded.role === 'admin') {
                req.admin = decoded;
            }

            req.user = decoded; // Always has .id after step 3
            next();
        } catch (error) {
            console.error(error);
            if (error.name === 'TokenExpiredError') {
                return res.status(401).json({ success: false, message: 'Token expired', expired: true });
            }
            return res.status(401).json({ success: false, message: 'Not authorized, token failed', error: error.message });
        }
    }

    if (!token) {
        return res.status(401).json({ success: false, message: 'Not authorized, no token' });
    }
};

// Check if user is an admin
export const isAdmin = (req, res, next) => {
    if (req.user && req.user.role === 'admin') {
        next();
    } else {
        res.status(403).json({ success: false, message: 'Not authorized as an admin' });
    }
};

// Check if user is a doctor
export const isDoctor = (req, res, next) => {
    if ((req.user && req.user.role === 'doctor') || (req.doctor)) {
        next();
    } else {
        res.status(403).json({ success: false, message: 'Not authorized as a doctor' });
    }
};
