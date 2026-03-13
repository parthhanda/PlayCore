const Notification = require('../models/Notification');
const { getIo } = require('../socket/socket');

/**
 * Create and send an in-app notification.
 * Also pushes real-time via Socket.IO if recipient is online.
 */
const sendNotification = async ({ recipient, type, message, link = '', sender = null }) => {
    try {
        // Don't notify yourself
        if (sender && sender.toString() === recipient.toString()) return null;

        const notification = await Notification.create({
            recipient, type, message, link, sender
        });

        // Populate sender info for real-time push
        const populated = await Notification.findById(notification._id)
            .populate('sender', 'username avatar');

        // Push via Socket.IO if online
        try {
            const io = getIo();
            io.to(`user_${recipient.toString()}`).emit('new_notification', populated);
        } catch (e) {
            // Socket not initialized yet, skip
        }

        return notification;
    } catch (error) {
        console.error('[NOTIFICATION] Failed to send:', error.message);
        return null;
    }
};

module.exports = { sendNotification };
