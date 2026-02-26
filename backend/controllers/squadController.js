const Squad = require('../models/Squad');
const User = require('../models/User');
const mongoose = require('mongoose');

// @desc    Create a new squad
// @route   POST /api/squads
// @access  Private
const createSquad = async (req, res) => {
    const { name, ticker, description, logo } = req.body;

    if (!name || !ticker) {
        return res.status(400).json({ message: 'Name and Ticker are required' });
    }

    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const user = await User.findById(req.user.id).session(session);
        if (user.squad) {
            await session.abortTransaction();
            return res.status(400).json({ message: 'You are already in a squad' });
        }

        const squadExists = await Squad.findOne({ $or: [{ name }, { ticker }] }).session(session);
        if (squadExists) {
            await session.abortTransaction();
            return res.status(400).json({ message: 'Squad name or ticker already exists' });
        }

        const newSquad = await Squad.create([{
            name,
            ticker: ticker.toUpperCase(),
            description,
            logo,
            captain: user._id,
            members: [user._id]
        }], { session });

        user.squad = newSquad[0]._id;
        await user.save({ session });

        await session.commitTransaction();
        res.status(201).json(newSquad[0]);
    } catch (error) {
        await session.abortTransaction();
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    } finally {
        session.endSession();
    }
};

// @desc    Get all squads
// @route   GET /api/squads
// @access  Public
const getSquads = async (req, res) => {
    try {
        const squads = await Squad.find().populate('captain', 'username avatar').select('-members');
        res.json(squads);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Get single squad
// @route   GET /api/squads/:id
// @access  Public
const getSquad = async (req, res) => {
    try {
        const squad = await Squad.findById(req.params.id)
            .populate('captain', 'username avatar')
            .populate('members', 'username avatar elo online');

        if (!squad) {
            return res.status(404).json({ message: 'Squad not found' });
        }
        res.json(squad);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Join a squad
// @route   POST /api/squads/:id/join
// @access  Private
const joinSquad = async (req, res) => {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const user = await User.findById(req.user.id).session(session);
        if (user.squad) {
            await session.abortTransaction();
            return res.status(400).json({ message: 'You are already in a squad' });
        }

        const squad = await Squad.findById(req.params.id).session(session);
        if (!squad) {
            await session.abortTransaction();
            return res.status(404).json({ message: 'Squad not found' });
        }

        squad.members.push(user._id);
        await squad.save({ session });

        user.squad = squad._id;
        await user.save({ session });

        await session.commitTransaction();
        res.json(squad);
    } catch (error) {
        await session.abortTransaction();
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    } finally {
        session.endSession();
    }
};

// @desc    Leave a squad
// @route   POST /api/squads/leave
// @access  Private
const leaveSquad = async (req, res) => {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const user = await User.findById(req.user.id).session(session);
        if (!user.squad) {
            await session.abortTransaction();
            return res.status(400).json({ message: 'You are not in a squad' });
        }

        const squad = await Squad.findById(user.squad).session(session);
        if (!squad) {
            // Data inconsistency fix attempt
            user.squad = null;
            await user.save({ session });
            await session.commitTransaction();
            return res.json({ message: 'Squad record missing, you have been reset.' });
        }

        // Remove from members
        squad.members = squad.members.filter(m => m.toString() !== user._id.toString());

        // Check if captain
        if (squad.captain.toString() === user._id.toString()) {
            if (squad.members.length > 0) {
                // Promote random member
                const randomIndex = Math.floor(Math.random() * squad.members.length);
                squad.captain = squad.members[randomIndex];
            } else {
                // Dissolve squad
                await Squad.findByIdAndDelete(squad._id).session(session);
                user.squad = null;
                await user.save({ session });
                await session.commitTransaction();
                return res.json({ message: 'Squad dissolved' });
            }
        }

        await squad.save({ session });
        user.squad = null;
        await user.save({ session });

        await session.commitTransaction();
        res.json({ message: 'Left squad' });
    } catch (error) {
        await session.abortTransaction();
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    } finally {
        session.endSession();
    }
};

// @desc    Delete a squad (Disband Squad)
// @route   DELETE /api/squads/:id
// @access  Private
const deleteSquad = async (req, res) => {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const squad = await Squad.findById(req.params.id).session(session);

        if (!squad) {
            await session.abortTransaction();
            return res.status(404).json({ message: 'Squad not found' });
        }

        // Only captain can disband
        if (squad.captain.toString() !== req.user._id.toString()) {
            await session.abortTransaction();
            return res.status(403).json({ message: 'Not authorized: Only the captain can disband the squad' });
        }

        // Nullify squad reference for all members
        await User.updateMany(
            { _id: { $in: squad.members } },
            { $set: { squad: null } }
        ).session(session);

        // Delete the squad
        await Squad.findByIdAndDelete(squad._id).session(session);

        await session.commitTransaction();
        res.json({ message: 'Squad has been disbanded' });
    } catch (error) {
        await session.abortTransaction();
        console.error("Error deleting squad:", error);
        res.status(500).json({ message: 'Server error while disbanding squad' });
    } finally {
        session.endSession();
    }
};

module.exports = {
    createSquad,
    getSquads,
    getSquad,
    joinSquad,
    leaveSquad,
    deleteSquad
};
