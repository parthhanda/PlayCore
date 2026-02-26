const mongoose = require('mongoose');

const MessageSchema = new mongoose.Schema({
    roomId: {
        type: String,
        required: true,
        index: true
    },
    sender: {
        type: String,
        required: true
    },
    senderId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    receiverId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
        // optional for squad chat
    },
    content: {
        type: String, // Encrypted content
        required: true
    },
    iv: {
        type: String, // Initialization Vector
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now,
        index: { expires: '24h' } // TTL Index: Auto-delete after 24 hours
    }
});

module.exports = mongoose.model('Message', MessageSchema);
