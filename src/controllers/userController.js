import userModel from '../models/userModel.js';
import jwt from 'jsonwebtoken';


// Create a new user
export const registerUser = async (req, res) => {
    try {
        const { name, username, email, password } = req.body;
        const finalName = name || username;

        // Check if user already exists (email or username)
        const existingUser = await userModel.findOne({ 
            $or: [{ email }, { username: finalName }] 
        });

        if (existingUser) {
            const field = existingUser.email === email ? 'Email' : 'Username';
            return res.status(400).json({ message: `${field} already exists` });
        }

        // Create new user
        const newUser = await userModel.create({ username: finalName, email, password });
        
        // Generate JWT token
        console.log('[DEBUG SIGNING - REGISTER] Secret:', process.env.JWT_SECRET);
        const token = jwt.sign({ id: newUser._id, role: 'patient' }, process.env.JWT_SECRET, { expiresIn: '30d' });
        console.log('[DEBUG SIGNING - REGISTER] Generated Token First Part:', token.substring(0, 20) + '...');

        res.status(201).json({ message: 'User created successfully', user: newUser, token });
    } catch (error) {
        console.error('Registration Error:', error);
        res.status(500).json({ 
            message: 'Error creating user', 
            error: error.message || error 
        });
    }

}

// Login user

export const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Find user by email
        const user = await userModel.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        // Check if password is correct
        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        // Generate JWT token
        console.log('[DEBUG SIGNING - LOGIN] Secret:', process.env.JWT_SECRET);
        const token = jwt.sign({ id: user._id, role: 'patient' }, process.env.JWT_SECRET, { expiresIn: '30d' });
        console.log('[DEBUG SIGNING - LOGIN] Generated Token First Part:', token.substring(0, 20) + '...');

        res.status(200).json({ message: 'Login successful', user, token });
    } catch (error) {
        res.status(500).json({ message: 'Error logging in', error });
    }
}

export const getSingleUser = async (req, res) => {
    try {
        const userId = req.params.id;
        const user = await userModel.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.status(200).json({ user });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching user', error });
    }
}

export const getAllUsers = async (req, res) => {
    try {
        const users = await userModel.find();
        res.status(200).json({ users });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching users', error });
    }
}

export const deleteUser = async (req, res) => {
    try {
        const userId = req.params.id;
        const user = await userModel.findByIdAndDelete(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.status(200).json({ message: 'User deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting user', error });
    }
}

export default {
    registerUser,
    loginUser,
    getSingleUser,
    getAllUsers,
    deleteUser
};