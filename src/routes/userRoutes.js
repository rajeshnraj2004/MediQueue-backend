import express from 'express';
import { registerUser, loginUser, getSingleUser, getAllUsers, deleteUser } from '../controllers/userController.js';
import { protect, isAdmin } from '../middlewares/authMiddleware.js';

const router = express.Router();

// Register a new user
router.post('/register', registerUser);
router.post('/signup', registerUser);

// Login user
router.post('/login', loginUser);

// Get single user 
router.get('/:id', getSingleUser);

// Get all users (Admin only)
router.get('/', protect, isAdmin, getAllUsers);

// Delete user (Admin only)
router.delete('/:id', protect, isAdmin, deleteUser);

export default router;