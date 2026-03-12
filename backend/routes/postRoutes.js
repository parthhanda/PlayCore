const express = require('express');
const router = express.Router();
const { getPosts, getPostBySlug, createPost, deletePost, upvotePost, reportPost } = require('../controllers/postController');
const { protect, admin } = require('../middleware/authMiddleware');

router.route('/')
    .get(getPosts)
    .post(protect, createPost); // Allow all users to create

router.route('/:slug')
    .get(getPostBySlug);

router.route('/:id')
    .delete(protect, deletePost); // Admin or Author can delete

router.route('/:id/upvote')
    .post(protect, upvotePost);

router.route('/:id/report')
    .post(protect, reportPost);

module.exports = router;
