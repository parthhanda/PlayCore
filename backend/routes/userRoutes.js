const express = require('express');
const router = express.Router();
const {
    getUserProfile,
    getMyProfile,
    updateUserProfile,
    getUsers,
    sendFriendRequest,
    acceptFriendRequest,
    declineFriendRequest,
    removeFriend,
    getFriendsList,
    deleteOwnAccount,
    toggleTournamentSubscription
} = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');

router.get('/', getUsers);
router.get('/u/:username', getUserProfile);
router.get('/profile', protect, getMyProfile);
router.put('/profile', protect, updateUserProfile);
router.delete('/profile', protect, deleteOwnAccount);
router.get('/friends/list', protect, getFriendsList);

router.put('/request/:id', protect, sendFriendRequest);
router.put('/accept/:id', protect, acceptFriendRequest);
router.put('/decline/:id', protect, declineFriendRequest);
router.put('/remove/:id', protect, removeFriend);
router.put('/tournament-subscribe', protect, toggleTournamentSubscription);

module.exports = router;
