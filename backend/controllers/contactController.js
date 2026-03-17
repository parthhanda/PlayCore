const { sendEmail, contactQueryEmail } = require('../utils/emailService');

const sendContactQuery = async (req, res) => {
    const { name, email, subject, message } = req.body;

    if (!name || !email || !subject || !message) {
        return res.status(400).json({ message: 'All fields are required.' });
    }

    try {
        const { subject: emailSubject, html } = contactQueryEmail(name, email, subject, message);
        
        // Send to the admin email
        await sendEmail('playcore.noreply@gmail.com', emailSubject, html);

        // Optionally send a confirmation to the user here too, but the user didn't ask for it.
        
        res.status(200).json({ message: 'Query sent successfully. Our intelligence team will contact you soon.' });
    } catch (error) {
        console.error('Contact query error:', error);
        res.status(500).json({ message: 'Failed to send query. Please try again later.' });
    }
};

module.exports = {
    sendContactQuery
};
