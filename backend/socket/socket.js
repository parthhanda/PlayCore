const socketIo = require('socket.io');
const Message = require('../models/Message');
const { encrypt, decrypt } = require('../utils/cryptoUtils');

let io;

const initSocket = (server) => {
    io = socketIo(server, {
        cors: {
            origin: process.env.FRONTEND_URL || "http://localhost:5173",
            methods: ["GET", "POST"]
        }
    });

    const onlineUsers = new Map(); // userId -> socketId

    io.on('connection', (socket) => {
        console.log('New client connected:', socket.id);

        const userId = socket.handshake.query.userId;
        if (userId) {
            onlineUsers.set(userId, socket.id);
            io.emit('online_users', Array.from(onlineUsers.keys()));
            console.log(`User ${userId} came online.`);
        }

        socket.on('join_room', (room) => {
            socket.join(room);
            console.log(`Socket ${socket.id} joined room ${room} `);
        });

        socket.on('send_message', (data) => {
            // data: { room, author, message, time }
            io.to(data.room).emit('receive_message', data);
        });

        socket.on('join_private_chat', async ({ roomId }) => {
            socket.join(roomId);
            console.log(`Socket ${socket.id} joined private room ${roomId} `);

            // Fetch chat history
            try {
                const messages = await Message.find({ roomId })
                    .sort({ createdAt: 1 })
                    .limit(50);

                const decryptedMessages = messages.map(msg => {
                    const decryptedContent = decrypt({ iv: msg.iv, content: msg.content });
                    return {
                        roomId: msg.roomId,
                        sender: msg.sender,
                        senderId: msg.senderId.toString(),
                        receiverId: msg.receiverId.toString(),
                        message: decryptedContent,
                        time: new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                        avatar: msg.avatar // We might need to populate this if we want avatars in history
                    };
                });

                socket.emit('chat_history', { roomId, messages: decryptedMessages });
            } catch (err) {
                console.error('Error fetching chat history:', err);
            }
        });

        socket.on('send_private_message', async (data) => {
            // data: { roomId, sender, message, time, senderId, receiverId }

            try {
                const { iv, content } = encrypt(data.message);

                const newMessage = new Message({
                    roomId: data.roomId,
                    sender: data.sender,
                    senderId: data.senderId,
                    receiverId: data.receiverId,
                    content,
                    iv
                });

                await newMessage.save();

                io.to(data.roomId).emit('receive_private_message', data);
            } catch (err) {
                console.error('Error saving message:', err);
            }
        });

        socket.on('typing', ({ roomId, user }) => {
            socket.to(roomId).emit('display_typing', { user, roomId });
        });

        socket.on('stop_typing', ({ roomId }) => {
            socket.to(roomId).emit('hide_typing', { roomId });
        });

        socket.on('message_seen', ({ roomId, messageId }) => {
            io.to(roomId).emit('message_status_update', { roomId, messageId, status: 'seen' });
        });

        socket.on('disconnect', () => {
            console.log('Client disconnected:', socket.id);
            if (userId) {
                onlineUsers.delete(userId);
                io.emit('online_users', Array.from(onlineUsers.keys()));
            }
        });
    });

    return io;
};

const getIo = () => {
    if (!io) {
        throw new Error("Socket.io not initialized!");
    }
    return io;
};

module.exports = { initSocket, getIo };
