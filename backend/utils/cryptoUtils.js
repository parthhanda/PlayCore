const crypto = require('crypto');

// Use a secure key from environment variables or generate a fallback for dev
// In production, this MUST be a 32-byte hex string in .env
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY
    ? Buffer.from(process.env.ENCRYPTION_KEY, 'hex')
    : crypto.scryptSync('development_secret_passphrase', 'salt', 32);

const IV_LENGTH = 16; // For AES, this is always 16

const encrypt = (text) => {
    const iv = crypto.randomBytes(IV_LENGTH);
    const cipher = crypto.createCipheriv('aes-256-cbc', ENCRYPTION_KEY, iv);
    let encrypted = cipher.update(text);
    encrypted = Buffer.concat([encrypted, cipher.final()]);
    return {
        iv: iv.toString('hex'),
        content: encrypted.toString('hex')
    };
};

const decrypt = (text) => {
    // text expects { iv, content }
    if (!text || !text.iv || !text.content) return null;

    try {
        const iv = Buffer.from(text.iv, 'hex');
        const encryptedText = Buffer.from(text.content, 'hex');
        const decipher = crypto.createDecipheriv('aes-256-cbc', ENCRYPTION_KEY, iv);
        let decrypted = decipher.update(encryptedText);
        decrypted = Buffer.concat([decrypted, decipher.final()]);
        return decrypted.toString();
    } catch (error) {
        console.error('Decryption failed:', error.message);
        return '[Encrypted Message - Key Mismatch]';
    }
};

module.exports = { encrypt, decrypt };
