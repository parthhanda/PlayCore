const mongoose = require('mongoose');

const MatchSchema = new mongoose.Schema({
    tournament: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Tournament',
        required: true
    },
    roundNumber: {
        type: Number, // e.g., 1 for Quarter-finals, 2 for Semi-finals
        required: true
    },
    matchNumber: {
        type: Number, // Position within the round (e.g., Match 1 vs 2)
        required: true
    },
    // Participants can be Users (solo) or Squads
    // Storing as exactly 2 participants max
    participants: [
        {
            participantId: {
                type: mongoose.Schema.Types.ObjectId,
                // We keep this generic so it can refer to User OR Squad depending on Tournament type
                required: true
            },
            modelType: {
                type: String,
                required: true,
                enum: ['User', 'Squad']
            }
        }
    ],
    winner: {
        type: mongoose.Schema.Types.ObjectId
    },
    // Flexible scores (e.g., Best of 3 means id1: 2, id2: 1)
    scores: {
        type: Map,
        of: Number,
        default: {}
    },
    status: {
        type: String,
        enum: ['pending', 'ready', 'in_progress', 'completed'],
        default: 'pending' // pending = waiting for previous round winners
    },
    // The match this winner advances to
    nextMatchId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Match'
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Match', MatchSchema);
