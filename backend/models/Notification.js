const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
    recipient: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    type: {
        type: String,
        required: true,
        enum: [
            'friend_request', 'friend_accept',
            'post_upvote', 'post_comment',
            'comment_upvote',
            'post_report', 'comment_report',
            'tournament_new', 'tournament_enrolled', 'tournament_reminder',
            'admin_broadcast'
        ]
    },
    message: { type: String, required: true },
    link: { type: String, default: '' },
    sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    read: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now, expires: 604800 } // 7-day TTL
});

module.exports = mongoose.model('Notification', notificationSchema);
