const Comment = require('../models/Comment');
const Post = require('../models/Post');

// @desc    Get comments for a post
// @route   GET /api/comments/:postId
// @access  Public
const getComments = async (req, res) => {
    try {
        const comments = await Comment.find({ post: req.params.postId })
            .populate('author', 'username avatar')
            .sort({ createdAt: -1 });
        res.json(comments);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Add a comment to a post
// @route   POST /api/comments/:postId
// @access  Private
const addComment = async (req, res) => {
    try {
        const { content } = req.body;
        if (!content) return res.status(400).json({ message: 'Content is required' });

        const post = await Post.findById(req.params.postId);
        if (!post) return res.status(404).json({ message: 'Post not found' });

        const comment = new Comment({
            content,
            author: req.user.id,
            post: req.params.postId
        });

        const createdComment = await comment.save();
        const populatedComment = await createdComment.populate('author', 'username avatar');
        res.status(201).json(populatedComment);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Delete a comment
// @route   DELETE /api/comments/:id
// @access  Private
const deleteComment = async (req, res) => {
    try {
        const comment = await Comment.findById(req.params.id);
        if (!comment) return res.status(404).json({ message: 'Comment not found' });

        // Check if user is author or admin (Admin requires looking at req.user.roles but we just do simple check or let admin middleware pass if needed. Will check here.)
        if (comment.author.toString() !== req.user.id && !req.user.roles.includes('admin')) {
            return res.status(401).json({ message: 'Not authorized' });
        }

        await comment.deleteOne();
        res.json({ message: 'Comment removed' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Upvote/downvote a comment
// @route   POST /api/comments/:id/upvote
// @access  Private
const upvoteComment = async (req, res) => {
    try {
        const comment = await Comment.findById(req.params.id);
        if (!comment) return res.status(404).json({ message: 'Comment not found' });

        const userId = req.user.id;
        const index = comment.upvotes.indexOf(userId);

        if (index === -1) {
            comment.upvotes.push(userId);
        } else {
            comment.upvotes.splice(index, 1);
        }

        await comment.save();
        res.json(comment.upvotes);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Report a comment
// @route   POST /api/comments/:id/report
// @access  Private
const reportComment = async (req, res) => {
    try {
        const { reason } = req.body;
        if (!reason) return res.status(400).json({ message: 'Reason is required' });

        const comment = await Comment.findById(req.params.id);
        if (!comment) return res.status(404).json({ message: 'Comment not found' });

        const alreadyReported = comment.reports.find(r => r.user.toString() === req.user.id);
        if (alreadyReported) {
            return res.status(400).json({ message: 'You have already reported this comment' });
        }

        comment.reports.push({ user: req.user.id, reason });
        await comment.save();
        res.json({ message: 'Comment reported successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

module.exports = {
    getComments,
    addComment,
    deleteComment,
    upvoteComment,
    reportComment
};
