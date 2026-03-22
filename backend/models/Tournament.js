const mongoose = require('mongoose');

const TournamentSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        required: true
    },
    game: {
        type: String,
        required: true,
        index: true
    },
    rules: {
        type: String
    },
    host: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    coverImage: {
        type: String, // URL to uploaded image
        default: ''
    },
    startDate: {
        type: Date,
        required: true,
        index: true
    },
    endDate: {
        type: Date,
        index: true,
        expires: 172800 // 48-hour (2 days) TTL after endDate
    },
    status: {
        type: String,
        enum: ['registration', 'in_progress', 'completed', 'cancelled'],
        default: 'registration',
        index: true
    },
    type: {
        type: String,
        enum: ['solo', 'squad'],
        default: 'solo'
    },
    maxParticipants: {
        type: Number,
        required: true
    },
    // The enrollment form data
    enrolledPlayers: [
        {
            user: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'User',
                required: true
            },
            inGameUid: {
                type: String,
                required: true
            },
            inGameName: {
                type: String,
                required: true
            },
            contactNumber: {
                type: String,
                required: true
            },
            enrolledAt: {
                type: Date,
                default: Date.now
            }
        }
    ],
    // Array of Match ObjectIds to track the bracket
    matches: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Match'
        }
    ],
    // Flag to prevent duplicate reminder emails
    reminderSent: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Tournament', TournamentSchema);
