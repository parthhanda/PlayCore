const nodemailer = require('nodemailer');

let transporter = null;
let etherealAccount = null;

/**
 * Initialize the email transporter.
 * Uses env vars if provided, otherwise creates an Ethereal test account.
 */
const initTransporter = async () => {
    if (transporter) return transporter;

    if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
        // Production / custom SMTP
        transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST,
            port: parseInt(process.env.SMTP_PORT) || 587,
            secure: false,
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS
            }
        });
        console.log(`[EMAIL] Using custom SMTP: ${process.env.SMTP_HOST}`);
    } else {
        // Dev: create Ethereal test account
        etherealAccount = await nodemailer.createTestAccount();
        transporter = nodemailer.createTransport({
            host: 'smtp.ethereal.email',
            port: 587,
            secure: false,
            auth: {
                user: etherealAccount.user,
                pass: etherealAccount.pass
            }
        });
        console.log(`[EMAIL] Ethereal test account created:`);
        console.log(`        User: ${etherealAccount.user}`);
        console.log(`        Pass: ${etherealAccount.pass}`);
        console.log(`        Preview emails at: https://ethereal.email/login`);
    }

    return transporter;
};

/**
 * Send an email.
 * @param {string} to - Recipient email
 * @param {string} subject - Email subject
 * @param {string} html - HTML content
 * @returns {Object} - Info object with preview URL for Ethereal
 */
const sendEmail = async (to, subject, html) => {
    try {
        const t = await initTransporter();
        const from = process.env.SMTP_FROM || (etherealAccount ? etherealAccount.user : 'noreply@playcore.gg');

        const info = await t.sendMail({ from: `"PlayCore" <${from}>`, to, subject, html });

        // If using Ethereal, log the preview URL
        if (etherealAccount) {
            const previewUrl = nodemailer.getTestMessageUrl(info);
            console.log(`[EMAIL] Preview: ${previewUrl}`);
            return { messageId: info.messageId, previewUrl };
        }

        console.log(`[EMAIL] Sent to ${to}: ${info.messageId}`);
        return { messageId: info.messageId };
    } catch (error) {
        console.error(`[EMAIL] Failed to send to ${to}:`, error.message);
        return null;
    }
};

// ============================================
// Tournament Email Templates
// ============================================

const tournamentListedEmail = (tournament) => {
    const startDate = new Date(tournament.startDate).toLocaleDateString('en-IN', {
        weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
        hour: '2-digit', minute: '2-digit'
    });

    return {
        subject: `🎮 New Tournament: ${tournament.title}`,
        html: `
        <div style="background:#0a0a0a;color:#fff;font-family:Arial,sans-serif;padding:40px;max-width:600px;margin:0 auto;border:1px solid #1a1a1a;border-radius:16px;">
            <div style="text-align:center;margin-bottom:30px;">
                <h1 style="font-size:28px;margin:0;letter-spacing:2px;">PLAY<span style="color:#00ffff;">CORE</span></h1>
                <div style="width:60px;height:3px;background:linear-gradient(90deg,#00ffff,#ff00ff);margin:10px auto;border-radius:2px;"></div>
            </div>
            <div style="background:#111;border:1px solid #222;border-radius:12px;padding:30px;margin-bottom:20px;">
                <h2 style="color:#00ffff;font-size:22px;margin:0 0 8px 0;text-transform:uppercase;letter-spacing:1px;">🏆 New Tournament Listed</h2>
                <h3 style="color:#fff;font-size:20px;margin:0 0 20px 0;">${tournament.title}</h3>
                <table style="width:100%;border-collapse:collapse;">
                    <tr><td style="color:#888;padding:6px 0;font-size:13px;">GAME</td><td style="color:#fff;font-weight:bold;padding:6px 0;">${tournament.game}</td></tr>
                    <tr><td style="color:#888;padding:6px 0;font-size:13px;">TYPE</td><td style="color:#fff;font-weight:bold;padding:6px 0;">${(tournament.type || 'solo').toUpperCase()}</td></tr>
                    <tr><td style="color:#888;padding:6px 0;font-size:13px;">START DATE</td><td style="color:#00ffff;font-weight:bold;padding:6px 0;">${startDate}</td></tr>
                    <tr><td style="color:#888;padding:6px 0;font-size:13px;">MAX SLOTS</td><td style="color:#fff;font-weight:bold;padding:6px 0;">${tournament.maxParticipants}</td></tr>
                </table>
            </div>
            <div style="text-align:center;">
                <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/tournaments/${tournament._id}" style="display:inline-block;background:#00ffff;color:#000;font-weight:bold;padding:14px 40px;border-radius:10px;text-decoration:none;text-transform:uppercase;letter-spacing:2px;font-size:14px;">ENROLL NOW</a>
            </div>
            <p style="color:#444;font-size:11px;text-align:center;margin-top:30px;">You received this because you subscribed to tournament updates on PlayCore.</p>
        </div>`
    };
};

const enrollmentConfirmEmail = (tournament, playerName) => {
    return {
        subject: `✅ Enrolled: ${tournament.title}`,
        html: `
        <div style="background:#0a0a0a;color:#fff;font-family:Arial,sans-serif;padding:40px;max-width:600px;margin:0 auto;border:1px solid #1a1a1a;border-radius:16px;">
            <div style="text-align:center;margin-bottom:30px;">
                <h1 style="font-size:28px;margin:0;letter-spacing:2px;">PLAY<span style="color:#00ffff;">CORE</span></h1>
                <div style="width:60px;height:3px;background:linear-gradient(90deg,#00ffff,#ff00ff);margin:10px auto;border-radius:2px;"></div>
            </div>
            <div style="background:#111;border:1px solid #0f4;border-radius:12px;padding:30px;margin-bottom:20px;">
                <h2 style="color:#0f4;font-size:22px;margin:0 0 16px 0;">✅ Enrollment Confirmed</h2>
                <p style="color:#ccc;font-size:15px;margin:0 0 20px 0;">Welcome aboard, <strong style="color:#fff;">${playerName}</strong>! You are now registered for:</p>
                <h3 style="color:#fff;font-size:20px;margin:0 0 16px 0;">${tournament.title}</h3>
                <p style="color:#888;font-size:13px;margin:0;">Game: <strong style="color:#fff;">${tournament.game}</strong> | Start: <strong style="color:#00ffff;">${new Date(tournament.startDate).toLocaleDateString('en-IN', { weekday: 'long', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</strong></p>
            </div>
            <p style="color:#888;font-size:13px;text-align:center;">You'll receive a reminder 5 minutes before the tournament starts. Stay sharp!</p>
        </div>`
    };
};

const tournamentReminderEmail = (tournament) => {
    return {
        subject: `⏰ STARTING SOON: ${tournament.title}`,
        html: `
        <div style="background:#0a0a0a;color:#fff;font-family:Arial,sans-serif;padding:40px;max-width:600px;margin:0 auto;border:1px solid #1a1a1a;border-radius:16px;">
            <div style="text-align:center;margin-bottom:30px;">
                <h1 style="font-size:28px;margin:0;letter-spacing:2px;">PLAY<span style="color:#00ffff;">CORE</span></h1>
                <div style="width:60px;height:3px;background:linear-gradient(90deg,#00ffff,#ff00ff);margin:10px auto;border-radius:2px;"></div>
            </div>
            <div style="background:#111;border:1px solid #f80;border-radius:12px;padding:30px;text-align:center;">
                <h2 style="color:#f80;font-size:26px;margin:0 0 12px 0;">⏰ 5 MINUTES WARNING</h2>
                <h3 style="color:#fff;font-size:22px;margin:0 0 20px 0;">${tournament.title}</h3>
                <p style="color:#ccc;font-size:15px;margin:0 0 8px 0;">Game: <strong>${tournament.game}</strong></p>
                <p style="color:#f80;font-size:18px;font-weight:bold;margin:20px 0;">GET READY — TOURNAMENT STARTS IN 5 MINUTES!</p>
                <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/tournaments/${tournament._id}" style="display:inline-block;background:#f80;color:#000;font-weight:bold;padding:14px 40px;border-radius:10px;text-decoration:none;text-transform:uppercase;letter-spacing:2px;font-size:14px;">VIEW TOURNAMENT</a>
            </div>
        </div>`
    };
};

module.exports = {
    initTransporter,
    sendEmail,
    tournamentListedEmail,
    enrollmentConfirmEmail,
    tournamentReminderEmail
};
