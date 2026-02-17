const express = require('express');
const router = express.Router();
const {
    getUserProfile,
    updateUserProfile,
    getUsers,
    sendFriendRequest,
    acceptFriendRequest,
    declineFriendRequest,
    removeFriend
} = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');

router.get('/', getUsers);
router.get('/u/:username', getUserProfile);
router.put('/profile', protect, updateUserProfile);

router.put('/request/:id', protect, sendFriendRequest);
router.put('/accept/:id', protect, acceptFriendRequest);
router.put('/decline/:id', protect, declineFriendRequest);
router.put('/remove/:id', protect, removeFriend);

module.exports = router;
