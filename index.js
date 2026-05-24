import 'dotenv/config';
import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import ConnectDB from './src/config/ConnectDB.js';
import { setupChatSocket } from './src/socket/chatHandler.js';

// Import routes
import userRoutes from './src/routes/userRoutes.js';
import doctorRoutes from './src/routes/doctorRoutes.js';
import adminRoutes from './src/routes/adminRoutes.js';
import appointmentRoutes from './src/routes/appointmentRoutes.js';
import paymentRoutes from './src/routes/paymentRoutes.js';
import queueRoutes from './src/routes/queueRoutes.js';
import reviewRoutes from './src/routes/reviewRoutes.js';
import medicalRecordRoutes from './src/routes/medicalRecordRoutes.js';
import aiRoutes from './src/routes/aiRoutes.js';

const app = express();

// CORS — allow all origins (tighten in production)
app.use(cors({ origin: '*', credentials: true }));
app.use(express.json());

// Connect to MongoDB
ConnectDB();

// REST Routes
app.use('/api/users', userRoutes);
app.use('/api/doctors', doctorRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/queues', queueRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/medical-records', medicalRecordRoutes);
app.use('/api/ai', aiRoutes);

// Create HTTP server and attach Socket.io
const httpServer = createServer(app);
const io = new Server(httpServer, {
    cors: {
        origin: '*',
        methods: ['GET', 'POST'],
    },
});

// Wire up chat socket handlers
setupChatSocket(io);

const PORT = process.env.PORT || 5000;
httpServer.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}... 🌐🌐🌐`);
    console.log(`Socket.io real-time chat is active ⚡`);
    console.log(`[STARTUP] JWT_SECRET is: ${process.env.JWT_SECRET}`);
});

export default app;