const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        minlength: 3
    },
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true,
        match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please fill a valid email address']
    },
    password: {
        type: String,
        required: true,
        minlength: 6,
        select: false // Do not return password by default
    },
    roles: {
        type: [String],
        enum: ['user', 'admin'],
        default: ['user']
    },
    gamertag: {
        type: String,
        unique: true,
        sparse: true // Allow null/undefined but unique if present
    },
    avatar: {
        type: String,
        default: ''
    },
    bio: {
        type: String,
        default: ''
    },
    coverImage: {
        type: String,
        default: ''
    },
    socialLinks: {
        discord: { type: String, default: '' },
        twitter: { type: String, default: '' },
        instagram: { type: String, default: '' },
        steam: { type: String, default: '' },
        twitch: { type: String, default: '' }
    },
    gameConnections: [
        {
            game: { type: String, required: true },
            uid: { type: String, required: true }
        }
    ],
    friends: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User', default: [] }],
    friendRequests: [{
        from: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        status: { type: String, default: 'pending' }
    }],
    sentRequests: [{
        to: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        status: { type: String, default: 'pending' }
    }],
    squad: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Squad',
        default: null
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

// Encrypt password using bcrypt
userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) {
        next();
    }

    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});

// Match user entered password to hashed password in database
userSchema.methods.matchPassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.model('User', userSchema);

module.exports = User;
