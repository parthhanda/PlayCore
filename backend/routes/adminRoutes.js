const express = require('express');
const router = express.Router();
const { protect, admin } = require('../middleware/authMiddleware');
const {
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
} = require('../controllers/adminController');

// All routes are protected + admin only
router.use(protect, admin);

// Dashboard stats
router.get('/stats', getAdminStats);

// User management
router.get('/users', getAllUsers);
router.get('/users/:id', getUserById);
router.delete('/users/:id', deleteUserByAdmin);
router.put('/users/:id/role', toggleUserRole);

// Content moderation
router.get('/posts', getAllPosts);
router.get('/posts/reported', getReportedPosts);
router.delete('/posts/:id', adminDeletePost);
router.get('/comments/reported', getReportedComments);
router.delete('/comments/:id', adminDeleteComment);

module.exports = router;
