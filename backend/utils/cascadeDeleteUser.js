const User = require('../models/User');
const Post = require('../models/Post');
const Comment = require('../models/Comment');
const Message = require('../models/Message');
const Squad = require('../models/Squad');
const Tournament = require('../models/Tournament');
const Match = require('../models/Match');

/**
 * Cascade-delete a user and ALL their data across the entire platform.
 * Used by both admin deletion and user self-deletion.
 * @param {string} userId - The ObjectId of the user to purge
 * @returns {Object} Summary of what was deleted
 */
const cascadeDeleteUser = async (userId) => {
    const summary = {};

    // 1. Delete all posts by user + their associated comments
    const userPosts = await Post.find({ author: userId });
    const postIds = userPosts.map(p => p._id);
    summary.postsDeleted = postIds.length;

    // Delete all comments on those posts
    const commentsOnPosts = await Comment.deleteMany({ post: { $in: postIds } });
    summary.commentsOnPostsDeleted = commentsOnPosts.deletedCount;

    // Delete the posts themselves
    await Post.deleteMany({ author: userId });

    // 2. Delete all comments authored by user (on other people's posts)
    const userComments = await Comment.deleteMany({ author: userId });
    summary.userCommentsDeleted = userComments.deletedCount;

    // 3. Remove user from upvotes and reports on remaining posts/comments
    await Post.updateMany({}, {
        $pull: {
            upvotes: userId,
            reports: { user: userId }
        }
    });
    await Comment.updateMany({}, {
        $pull: {
            upvotes: userId,
            reports: { user: userId }
        }
    });

    // 4. Delete all messages where user is sender or receiver
    const messages = await Message.deleteMany({
        $or: [{ senderId: userId }, { receiverId: userId }]
    });
    summary.messagesDeleted = messages.deletedCount;

    // 5. Handle squads
    // If user is captain → transfer captaincy to next member, or dissolve if no members left
    const captainedSquads = await Squad.find({ captain: userId });
    for (const squad of captainedSquads) {
        const otherMembers = squad.members.filter(m => m.toString() !== userId.toString());
        if (otherMembers.length > 0) {
            // Transfer captaincy to first remaining member
            squad.captain = otherMembers[0];
            squad.members = otherMembers;
            await squad.save();
            // Clear the new captain's squad reference (it should already be set)
        } else {
            // No members left, dissolve squad
            await Squad.deleteOne({ _id: squad._id });
        }
    }
    summary.captainedSquadsHandled = captainedSquads.length;

    // Remove user from squads they are a member of (not captain)
    await Squad.updateMany(
        { members: userId },
        { $pull: { members: userId } }
    );

    // 6. Remove user from tournament enrollments
    await Tournament.updateMany(
        {},
        { $pull: { enrolledPlayers: { user: userId } } }
    );

    // 7. Remove user from match participants
    await Match.updateMany(
        {},
        { $pull: { participants: { participantId: userId, modelType: 'User' } } }
    );

    // 8. Remove from all other users' friends, friendRequests, sentRequests
    await User.updateMany(
        {},
        {
            $pull: {
                friends: userId,
                friendRequests: { from: userId },
                sentRequests: { to: userId }
            }
        }
    );

    // 9. Delete the user document itself
    await User.deleteOne({ _id: userId });
    summary.userDeleted = true;

    return summary;
};

module.exports = cascadeDeleteUser;
