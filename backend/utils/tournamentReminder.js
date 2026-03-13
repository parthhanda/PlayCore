const cron = require('node-cron');
const Tournament = require('../models/Tournament');
const User = require('../models/User');
const { sendEmail, tournamentReminderEmail } = require('./emailService');
const { sendNotification } = require('./notificationHelper');

/**
 * Cron job: runs every minute.
 * Checks for tournaments starting in the next 5 minutes.
 * Sends reminder emails to all enrolled players.
 * Uses `reminderSent` flag to avoid duplicate emails.
 */
const startTournamentReminders = () => {
    cron.schedule('* * * * *', async () => {
        try {
            const now = new Date();
            const fiveMinLater = new Date(now.getTime() + 5 * 60 * 1000);

            // Find tournaments starting in the next 5 minutes that haven't been reminded
            const tournaments = await Tournament.find({
                startDate: { $gte: now, $lte: fiveMinLater },
                status: 'registration',
                reminderSent: { $ne: true }
            }).populate('enrolledPlayers.user', 'username email');

            for (const tournament of tournaments) {
                console.log(`[REMINDER CRON] Sending reminders for: ${tournament.title}`);

                const emailData = tournamentReminderEmail(tournament);

                for (const player of tournament.enrolledPlayers) {
                    if (player.user && player.user.email) {
                        // Send email
                        await sendEmail(player.user.email, emailData.subject, emailData.html);

                        // Send in-app notification
                        await sendNotification({
                            recipient: player.user._id,
                            type: 'tournament_reminder',
                            message: `⏰ "${tournament.title}" starts in 5 minutes! Get ready!`,
                            link: `/tournaments/${tournament._id}`
                        });
                    }
                }

                // Mark as reminded to prevent duplicate sends
                tournament.reminderSent = true;
                await tournament.save();

                console.log(`[REMINDER CRON] Sent ${tournament.enrolledPlayers.length} reminders for "${tournament.title}"`);
            }
        } catch (error) {
            console.error('[REMINDER CRON] Error:', error.message);
        }
    });

    console.log('[REMINDER CRON] Tournament reminder job started (every minute)');
};

module.exports = { startTournamentReminders };
