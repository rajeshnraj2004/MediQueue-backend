import Message from '../models/messageModel.js';

/**
 * Sets up Socket.io chat event handlers.
 * Room naming: `chat_${appointmentId}`
 * Each socket must authenticate by sending { appointmentId, senderId, senderRole }
 * in the join_room event.
 */
export function setupChatSocket(io) {
  io.on('connection', (socket) => {
    console.log(`[Socket] Client connected: ${socket.id}`);

    // ── Join a chat room ────────────────────────────────────────────────────
    socket.on('join_room', async ({ appointmentId }) => {
      if (!appointmentId) return;
      const room = `chat_${appointmentId}`;
      socket.join(room);
      console.log(`[Socket] ${socket.id} joined room ${room}`);

      // Send message history on join
      try {
        const history = await Message.find({ appointmentId })
          .sort({ createdAt: 1 })
          .limit(100)
          .lean();
        socket.emit('chat_history', history);
      } catch (err) {
        console.error('[Socket] Failed to load chat history:', err.message);
        socket.emit('chat_history', []);
      }
    });

    // ── Send a message ──────────────────────────────────────────────────────
    socket.on('send_message', async ({ appointmentId, sender, senderId, text }) => {
      if (!appointmentId || !sender || !senderId || !text?.trim()) return;

      try {
        const saved = await Message.create({
          appointmentId,
          sender,
          senderId,
          text: text.trim(),
        });

        const payload = {
          _id: saved._id,
          appointmentId: saved.appointmentId,
          sender: saved.sender,
          senderId: saved.senderId,
          text: saved.text,
          createdAt: saved.createdAt,
        };

        // Broadcast to EVERYONE in the room (clients deduplicate on their end)
        const room = `chat_${appointmentId}`;
        io.to(room).emit('receive_message', payload);
      } catch (err) {
        console.error('[Socket] Failed to save message:', err.message);
        socket.emit('message_error', { message: 'Failed to send message.' });
      }
    });

    // ── Typing indicator ────────────────────────────────────────────────────
    socket.on('typing', ({ appointmentId, sender }) => {
      const room = `chat_${appointmentId}`;
      socket.to(room).emit('user_typing', { sender });
    });

    socket.on('stop_typing', ({ appointmentId }) => {
      const room = `chat_${appointmentId}`;
      socket.to(room).emit('user_stop_typing');
    });

    // ── Clear chat history ──────────────────────────────────────────────────
    socket.on('clear_chat', async ({ appointmentId }) => {
      if (!appointmentId) return;
      try {
        await Message.deleteMany({ appointmentId });
        const room = `chat_${appointmentId}`;
        io.to(room).emit('chat_cleared'); // Notify everyone in the room
      } catch (err) {
        console.error('[Socket] Failed to clear chat:', err.message);
      }
    });

    // ── Disconnect ──────────────────────────────────────────────────────────
    socket.on('disconnect', () => {
      console.log(`[Socket] Client disconnected: ${socket.id}`);
    });
  });
}
