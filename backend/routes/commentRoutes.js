const express = require('express');
const router = express.Router();
const { 
    getComments, 
    addComment, 
    deleteComment, 
    upvoteComment, 
    reportComment 
} = require('../controllers/commentController');
const { protect } = require('../middleware/authMiddleware');

router.route('/:postId')
    .get(getComments)
    .post(protect, addComment);

router.route('/item/:id')
    .delete(protect, deleteComment);

router.route('/item/:id/upvote')
    .post(protect, upvoteComment);

router.route('/item/:id/report')
    .post(protect, reportComment);

module.exports = router;
