const mongoose = require('mongoose');

const postSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true,
        maxlength: 120
    },
    slug: {
        type: String,
        required: true,
        unique: true,
        lowercase: true
    },
    content: {
        type: String,
        required: true
    },
    author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    coverImage: {
        type: String,
        default: ''
    },
    tags: [{
        type: String,
        trim: true
    }],
    published: {
        type: Boolean,
        default: true // Default to true for community feed
    },
    views: {
        type: Number,
        default: 0
    },
    upvotes: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    reports: [{
        user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        reason: { type: String, required: true },
        createdAt: { type: Date, default: Date.now }
    }]
}, {
    timestamps: true
});

// Create index on slug for fast lookups
postSchema.index({ slug: 1 });

const Post = mongoose.model('Post', postSchema);

module.exports = Post;
