import { Server as SocketIO } from 'socket.io';

export const initializeSocket = (server) => {
  const io = new SocketIO(server, {
    cors: {
      origin: process.env.FRONTEND_URL || "http://localhost:3000",
      methods: ["GET", "POST"]
    }
  });
  
  io.on('connection', (socket) => {
    console.log('New client connected');
    
    // Join channel room
    socket.on('join_channel', (channelId) => {
      socket.join(channelId);
      console.log(`User joined channel: ${channelId}`);
    });
    
    // Leave channel room
    socket.on('leave_channel', (channelId) => {
      socket.leave(channelId);
      console.log(`User left channel: ${channelId}`);
    });
    
    // Handle typing indicators
    socket.on('typing_start', (data) => {
      socket.to(data.channelId).emit('user_typing', {
        userId: socket.userId,
        username: data.username
      });
    });
    
    socket.on('typing_stop', (data) => {
      socket.to(data.channelId).emit('user_stop_typing', {
        userId: socket.userId
      });
    });
    
    socket.on('disconnect', () => {
      console.log('Client disconnected');
    });
  });
  
  return io;
};