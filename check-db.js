import mongoose from 'mongoose';
import dotenv from 'dotenv';
import userModel from './src/models/userModel.js';

dotenv.config();

const checkUser = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URL);
        console.log('Connected to MongoDB');
        
        const userCount = await userModel.countDocuments();
        console.log('Total Users:', userCount);
        
        const users = await userModel.find({}, 'username email');
        console.log('Users in DB:', users);
        
        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
};

checkUser();
