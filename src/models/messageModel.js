import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema(
  {
    appointmentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Appointment',
      required: true,
      index: true,
    },
    sender: {
      type: String,
      enum: ['user', 'doctor'],
      required: true,
    },
    senderId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },
    text: {
      type: String,
      required: true,
      maxlength: 1000,
    },
  },
  { timestamps: true }
);

const Message = mongoose.model('Message', messageSchema);
export default Message;
