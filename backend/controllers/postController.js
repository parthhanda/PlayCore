const Post = require('../models/Post');
const slugify = require('slugify');

// @desc    Get all published posts
// @route   GET /api/posts
// @access  Public
const getPosts = async (req, res) => {
    try {
        const page = Number(req.query.page) || 1;
        const limit = Number(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        const posts = await Post.find({})
            .populate('author', 'username avatar')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        const total = await Post.countDocuments({});

        res.json({
            posts,
            page,
            pages: Math.ceil(total / limit),
            total
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Get post by slug
// @route   GET /api/posts/:slug
// @access  Public
const getPostBySlug = async (req, res) => {
    try {
        const post = await Post.findOne({ slug: req.params.slug })
            .populate('author', 'username avatar bio');

        if (!post) {
            return res.status(404).json({ message: 'Post not found' });
        }

        // Increment views
        post.views += 1;
        await post.save();

        res.json(post);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Create a post
// @route   POST /api/posts
// @access  Private
const createPost = async (req, res) => {
    try {
        const { title, content, coverImage, tags, published } = req.body;

        if (!title || !content) {
            return res.status(400).json({ message: 'Title and content are required' });
        }

        // Generate unique slug
        let slug = slugify(title, { lower: true, strict: true });
        let slugExists = await Post.findOne({ slug });
        let counter = 1;
        
        while (slugExists) {
            slug = `${slugify(title, { lower: true, strict: true })}-${counter}`;
            slugExists = await Post.findOne({ slug });
            counter++;
        }

        const post = new Post({
            title,
            slug,
            content,
            author: req.user.id,
            coverImage,
            tags: tags ? tags.map(tag => tag.trim()) : [],
            published: published !== undefined ? published : false
        });

        const createdPost = await post.save();
        res.status(201).json(createdPost);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Delete a post
// @route   DELETE /api/posts/:id
// @access  Private (Admin or Author)
const deletePost = async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);

        if (!post) {
            return res.status(404).json({ message: 'Post not found' });
        }

        // Check if user is author or admin
        const isAuthor = post.author.toString() === req.user.id;
        const isAdmin = req.user.roles && req.user.roles.includes('admin');

        if (!isAuthor && !isAdmin) {
            return res.status(403).json({ message: 'Not authorized to delete this post' });
        }

        // Delete associated comments
        const Comment = require('../models/Comment');
        await Comment.deleteMany({ post: post._id });

        await post.deleteOne();
        res.json({ message: 'Post and associated comments removed' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Upvote/downvote a post
// @route   POST /api/posts/:id/upvote
// @access  Private
const upvotePost = async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        if (!post) {
            return res.status(404).json({ message: 'Post not found' });
        }

        const userId = req.user.id;
        const index = post.upvotes.indexOf(userId);

        if (index === -1) {
            post.upvotes.push(userId);
        } else {
            post.upvotes.splice(index, 1);
        }

        await post.save();
        res.json(post.upvotes);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Report a post
// @route   POST /api/posts/:id/report
// @access  Private
const reportPost = async (req, res) => {
    try {
        const { reason } = req.body;
        if (!reason) return res.status(400).json({ message: 'Reason is required' });

        const post = await Post.findById(req.params.id);
        if (!post) return res.status(404).json({ message: 'Post not found' });

        const alreadyReported = post.reports.find(r => r.user.toString() === req.user.id);
        if (alreadyReported) {
            return res.status(400).json({ message: 'You have already reported this post' });
        }

        post.reports.push({ user: req.user.id, reason });
        await post.save();
        res.json({ message: 'Post reported successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

module.exports = {
    getPosts,
    getPostBySlug,
    createPost,
    deletePost,
    upvotePost,
    reportPost
};
