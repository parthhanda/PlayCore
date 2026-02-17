const mongoose = require('mongoose');

const squadSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        minlength: 3,
        maxlength: 30
    },
    ticker: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        uppercase: true,
        minlength: 3,
        maxlength: 4
    },
    description: {
        type: String,
        default: '',
        maxlength: 150
    },
    logo: {
        type: String,
        default: '' // URL to image
    },
    captain: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    members: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    stats: {
        wins: { type: Number, default: 0 },
        losses: { type: Number, default: 0 },
        elo: { type: Number, default: 1200 }
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Squad', squadSchema);
