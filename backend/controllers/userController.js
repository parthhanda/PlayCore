const User = require('../models/User');

// @desc    Get user profile by username
// @route   GET /api/users/u/:username
// @access  Public
const getUserProfile = async (req, res) => {
    try {
        const user = await User.findOne({ username: req.params.username }).select('-password');
        if (user) {
            res.json(user);
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Get all users (with search)
// @route   GET /api/users
// @access  Public
const getUsers = async (req, res) => {
    try {
        const keyword = req.query.search
            ? {
                $or: [
                    { username: { $regex: req.query.search, $options: 'i' } },
                    { gamertag: { $regex: req.query.search, $options: 'i' } },
                ],
            }
            : {};

        const users = await User.find(keyword)
            .select('username avatar gamertag createdAt')
            .limit(20);

        res.json(users);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
const updateUserProfile = async (req, res) => {
    try {
        const { bio, socialLinks, avatar, coverImage, gameConnections } = req.body;

        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        if (bio !== undefined) user.bio = bio;
        if (avatar !== undefined) user.avatar = avatar;
        if (coverImage !== undefined) user.coverImage = coverImage;
        if (socialLinks) user.socialLinks = { ...user.socialLinks, ...socialLinks };
        if (gameConnections) user.gameConnections = gameConnections;

        const updatedUser = await user.save();

        res.json({
            _id: updatedUser._id,
            username: updatedUser.username,
            email: updatedUser.email,
            roles: updatedUser.roles,
            avatar: updatedUser.avatar,
            bio: updatedUser.bio,
            coverImage: updatedUser.coverImage,
            socialLinks: updatedUser.socialLinks,
            gameConnections: updatedUser.gameConnections,
            createdAt: updatedUser.createdAt
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Send Friend Request
// @route   PUT /api/users/request/:id
// @access  Private
const sendFriendRequest = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        const targetUser = await User.findById(req.params.id);

        if (!targetUser) return res.status(404).json({ message: 'User not found' });

        if (user.friends.includes(targetUser._id)) {
            return res.status(400).json({ message: 'Already friends' });
        }

        if (user.sentRequests.some(r => r.to.toString() === targetUser._id.toString())) {
            return res.status(400).json({ message: 'Request already sent' });
        }

        if (user.friendRequests.some(r => r.from.toString() === targetUser._id.toString())) {
            return res.status(400).json({ message: 'User already sent you a request' });
        }

        user.sentRequests.push({ to: targetUser._id });
        targetUser.friendRequests.push({ from: user._id });

        await user.save();
        await targetUser.save();

        res.json(user.sentRequests);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Accept Friend Request
// @route   PUT /api/users/accept/:id
// @access  Private
const acceptFriendRequest = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        const requester = await User.findById(req.params.id);

        if (!requester) return res.status(404).json({ message: 'User not found' });

        // Remove from requests
        user.friendRequests = user.friendRequests.filter(r => r.from.toString() !== requester._id.toString());
        requester.sentRequests = requester.sentRequests.filter(r => r.to.toString() !== user._id.toString());

        // Add to friends
        if (!user.friends.includes(requester._id)) {
            user.friends.push(requester._id);
            requester.friends.push(user._id);
        }

        await user.save();
        await requester.save();

        await user.populate('friends', 'username avatar');

        res.json(user.friends);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Decline/Cancel Friend Request
// @route   PUT /api/users/decline/:id
// @access  Private
const declineFriendRequest = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        const target = await User.findById(req.params.id);

        if (!target) return res.status(404).json({ message: 'User not found' });

        // Remove from both sides (covers declining received and cancelling sent)
        user.friendRequests = user.friendRequests.filter(r => r.from.toString() !== target._id.toString());
        user.sentRequests = user.sentRequests.filter(r => r.to.toString() !== target._id.toString());

        target.friendRequests = target.friendRequests.filter(r => r.from.toString() !== user._id.toString());
        target.sentRequests = target.sentRequests.filter(r => r.to.toString() !== user._id.toString());

        await user.save();
        await target.save();

        res.json({ message: 'Request removed' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Remove Friend
// @route   PUT /api/users/remove/:id
// @access  Private
const removeFriend = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        const friend = await User.findById(req.params.id);

        if (!friend) return res.status(404).json({ message: 'User not found' });

        user.friends = user.friends.filter(f => f.toString() !== friend._id.toString());
        friend.friends = friend.friends.filter(f => f.toString() !== user._id.toString());

        await user.save();
        await friend.save();

        res.json(user.friends);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Get Friends List
// @route   GET /api/users/friends/list
// @access  Private
const getFriendsList = async (req, res) => {
    try {
        const user = await User.findById(req.user.id).populate('friends', 'username avatar gamertag status');

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.json(user.friends);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

module.exports = {
    getUserProfile,
    updateUserProfile,
    getUsers,
    getFriendsList,
    sendFriendRequest,
    acceptFriendRequest,
    declineFriendRequest,
    removeFriend
};
