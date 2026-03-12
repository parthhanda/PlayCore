const User = require('../models/User');
const Post = require('../models/Post');
const Comment = require('../models/Comment');
const Message = require('../models/Message');
const Squad = require('../models/Squad');
const Tournament = require('../models/Tournament');
const cascadeDeleteUser = require('../utils/cascadeDeleteUser');

// @desc    Get admin dashboard stats
// @route   GET /api/admin/stats
// @access  Private/Admin
const getAdminStats = async (req, res) => {
    try {
        const [totalUsers, totalPosts, totalComments, totalTournaments, totalSquads, totalMessages] = await Promise.all([
            User.countDocuments(),
            Post.countDocuments(),
            Comment.countDocuments(),
            Tournament.countDocuments(),
            Squad.countDocuments(),
            Message.countDocuments()
        ]);

        const reportedPosts = await Post.countDocuments({ 'reports.0': { $exists: true } });
        const reportedComments = await Comment.countDocuments({ 'reports.0': { $exists: true } });
        const adminUsers = await User.countDocuments({ roles: 'admin' });

        res.json({
            totalUsers,
            totalPosts,
            totalComments,
            totalTournaments,
            totalSquads,
            totalMessages,
            reportedPosts,
            reportedComments,
            adminUsers
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Get all users (paginated + search)
// @route   GET /api/admin/users
// @access  Private/Admin
const getAllUsers = async (req, res) => {
    try {
        const page = Number(req.query.page) || 1;
        const limit = Number(req.query.limit) || 20;
        const skip = (page - 1) * limit;
        const search = req.query.search || '';

        const filter = search
            ? {
                $or: [
                    { username: { $regex: search, $options: 'i' } },
                    { email: { $regex: search, $options: 'i' } },
                    { gamertag: { $regex: search, $options: 'i' } }
                ]
            }
            : {};

        const users = await User.find(filter)
            .select('-password')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        const total = await User.countDocuments(filter);

        res.json({ users, total, page, pages: Math.ceil(total / limit) });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Get single user detail
// @route   GET /api/admin/users/:id
// @access  Private/Admin
const getUserById = async (req, res) => {
    try {
        const user = await User.findById(req.params.id).select('-password').populate('squad', 'name ticker');
        if (!user) return res.status(404).json({ message: 'User not found' });

        // Get counts of user's content
        const postCount = await Post.countDocuments({ author: user._id });
        const commentCount = await Comment.countDocuments({ author: user._id });

        res.json({ user, postCount, commentCount });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Delete a user (cascade)
// @route   DELETE /api/admin/users/:id
// @access  Private/Admin
const deleteUserByAdmin = async (req, res) => {
    try {
        const targetUser = await User.findById(req.params.id);
        if (!targetUser) return res.status(404).json({ message: 'User not found' });

        // Prevent admin from deleting themselves via this route
        if (targetUser._id.toString() === req.user.id) {
            return res.status(400).json({ message: 'Cannot delete your own account via admin panel. Use profile self-delete.' });
        }

        const summary = await cascadeDeleteUser(targetUser._id);
        res.json({ message: `User "${targetUser.username}" and all associated data deleted.`, summary });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Toggle user role (user <-> admin)
// @route   PUT /api/admin/users/:id/role
// @access  Private/Admin
const toggleUserRole = async (req, res) => {
    try {
        const targetUser = await User.findById(req.params.id);
        if (!targetUser) return res.status(404).json({ message: 'User not found' });

        if (targetUser._id.toString() === req.user.id) {
            return res.status(400).json({ message: 'Cannot modify your own role' });
        }

        if (targetUser.roles.includes('admin')) {
            targetUser.roles = ['user'];
        } else {
            targetUser.roles = ['user', 'admin'];
        }

        await targetUser.save();
        res.json({ message: `User "${targetUser.username}" roles updated to: ${targetUser.roles.join(', ')}`, roles: targetUser.roles });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Get all posts (admin view with report counts)
// @route   GET /api/admin/posts
// @access  Private/Admin
const getAllPosts = async (req, res) => {
    try {
        const posts = await Post.find()
            .populate('author', 'username avatar')
            .sort({ createdAt: -1 })
            .lean();

        // Add report count
        const postsWithCounts = posts.map(p => ({
            ...p,
            reportCount: p.reports ? p.reports.length : 0
        }));

        res.json(postsWithCounts);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Get reported posts
// @route   GET /api/admin/posts/reported
// @access  Private/Admin
const getReportedPosts = async (req, res) => {
    try {
        const posts = await Post.find({ 'reports.0': { $exists: true } })
            .populate('author', 'username avatar')
            .populate('reports.user', 'username')
            .sort({ 'reports.length': -1 });

        res.json(posts);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Delete any post (admin)
// @route   DELETE /api/admin/posts/:id
// @access  Private/Admin
const adminDeletePost = async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        if (!post) return res.status(404).json({ message: 'Post not found' });

        // Delete associated comments
        await Comment.deleteMany({ post: post._id });
        await post.deleteOne();

        res.json({ message: 'Post and associated comments deleted' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Get reported comments
// @route   GET /api/admin/comments/reported
// @access  Private/Admin
const getReportedComments = async (req, res) => {
    try {
        const comments = await Comment.find({ 'reports.0': { $exists: true } })
            .populate('author', 'username avatar')
            .populate('post', 'title slug')
            .populate('reports.user', 'username')
            .sort({ createdAt: -1 });

        res.json(comments);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Delete any comment (admin)
// @route   DELETE /api/admin/comments/:id
// @access  Private/Admin
const adminDeleteComment = async (req, res) => {
    try {
        const comment = await Comment.findById(req.params.id);
        if (!comment) return res.status(404).json({ message: 'Comment not found' });

        await comment.deleteOne();
        res.json({ message: 'Comment deleted' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

module.exports = {
    getAdminStats,
    getAllUsers,
    getUserById,
    deleteUserByAdmin,
    toggleUserRole,
    getAllPosts,
    getReportedPosts,
    adminDeletePost,
    getReportedComments,
    adminDeleteComment
};
