const Tournament = require('../models/Tournament');
const Match = require('../models/Match');
const User = require('../models/User');

// --- Pre-existing Routes (getPublicTournaments, getTournamentById, createTournament, enrollTournament) ---
// Note: We are doing a full replacement to add the startTournament Logic in a robust way.

const getPublicTournaments = async (req, res) => {
    try {
        const tournaments = await Tournament.find()
            .populate('host', 'username avatar')
            .select('title game startDate endDate status maxParticipants enrolledPlayers coverImage type')
            .sort({ createdAt: -1 });
        res.json(tournaments);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

const getTournamentById = async (req, res) => {
    try {
        const tournament = await Tournament.findById(req.params.id)
            .populate('host', 'username avatar')
            .populate('enrolledPlayers.user', 'username avatar')
            .populate({
                path: 'matches',
                populate: {
                    path: 'participants.participantId',
                    select: 'username avatar'
                }
            });

        if (!tournament) return res.status(404).json({ message: 'Tournament not found' });
        res.json(tournament);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

const createTournament = async (req, res) => {
    try {
        const { title, description, game, rules, startDate, endDate, maxParticipants, type } = req.body;
        const tournament = new Tournament({
            title, description, game, rules, host: req.user.id, startDate, endDate, maxParticipants, type, status: 'registration'
        });
        const createdTournament = await tournament.save();
        res.status(201).json(createdTournament);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

const enrollTournament = async (req, res) => {
    try {
        const { inGameUid, inGameName, contactNumber } = req.body;
        const tournament = await Tournament.findById(req.params.id);

        if (!tournament) return res.status(404).json({ message: 'Tournament not found' });
        if (tournament.status !== 'registration') return res.status(400).json({ message: 'Registration is closed' });
        if (tournament.enrolledPlayers.length >= tournament.maxParticipants) return res.status(400).json({ message: 'Tournament is full' });

        const alreadyEnrolled = tournament.enrolledPlayers.find(p => p.user.toString() === req.user.id.toString());
        if (alreadyEnrolled) return res.status(400).json({ message: 'Already enrolled' });

        tournament.enrolledPlayers.push({ user: req.user.id, inGameUid, inGameName, contactNumber });
        await tournament.save();

        const updatedTournament = await Tournament.findById(req.params.id)
            .populate('host', 'username avatar')
            .populate('enrolledPlayers.user', 'username avatar');

        res.status(200).json(updatedTournament);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

// --- NEW/UPDATED ROUTES ---

// @desc    Start tournament (Generate Brackets)
// @route   PUT /api/tournaments/:id/start
// @access  Private (Host Only)
const startTournament = async (req, res) => {
    try {
        const tournament = await Tournament.findById(req.params.id);

        if (!tournament) return res.status(404).json({ message: 'Tournament not found' });
        if (tournament.host.toString() !== req.user.id.toString()) return res.status(403).json({ message: 'Not authorized as host' });
        if (tournament.status !== 'registration') return res.status(400).json({ message: 'Tournament is already in progress or completed' });

        const players = [...tournament.enrolledPlayers];

        // Ensure even number of players for simple bracket if less than max (pad with nulls/byes if we wanted, but let's keep it simple: requires at least 2)
        if (players.length < 2) return res.status(400).json({ message: 'Need at least 2 players to start' });

        // Shuffle players (Seed conceptually)
        for (let i = players.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [players[i], players[j]] = [players[j], players[i]];
        }

        // --- Basic Single Elimination Bracket Generator ---
        // Calculate nearest power of 2
        const totalRounds = Math.ceil(Math.log2(players.length));
        const bracketSize = Math.pow(2, totalRounds);

        const matchesToSave = [];
        const matchRefsByNumber = {};

        // Generate backwards from Finals down to Round 1
        let matchCounter = 1;
        for (let round = totalRounds; round >= 1; round--) {
            const matchesInRound = Math.pow(2, totalRounds - round);

            for (let i = 0; i < matchesInRound; i++) {
                const isFinal = round === totalRounds;

                const match = new Match({
                    tournament: tournament._id,
                    roundNumber: round,
                    matchNumber: matchCounter++,
                    modelType: 'User', // Solo support currently
                    status: 'pending'
                });

                matchRefsByNumber[`R${round}-M${i}`] = match;

                // Link this match to the next round if it's not the final
                if (!isFinal) {
                    const nextMatchIndex = Math.floor(i / 2);
                    const nextMatch = matchRefsByNumber[`R${round + 1}-M${nextMatchIndex}`];
                    match.nextMatchId = nextMatch._id;
                }

                // If round 1, assign players
                if (round === 1) {
                    const p1 = players.pop();
                    const p2 = players.pop();

                    if (p1) match.participants.push({ participantId: p1.user, modelType: 'User' });
                    if (p2) match.participants.push({ participantId: p2.user, modelType: 'User' });

                    if (p1 && p2) match.status = 'ready';
                    else if (p1 || p2) match.status = 'completed'; // Bye round
                }

                matchesToSave.push(match);
            }
        }

        const savedMatches = await Match.insertMany(matchesToSave);
        const matchIds = savedMatches.map(m => m._id);

        tournament.matches = matchIds;
        tournament.status = 'in_progress';
        await tournament.save();

        res.status(200).json({ message: 'Tournament Started and Bracket Generated', tournament });
    } catch (error) {
        console.error("BRACKET ERROR:", error);
        res.status(500).json({ message: 'Server Error during Bracket Generation' });
    }
};

const PDFDocument = require('pdfkit');

// @desc    Export enrolled players to PDF
// @route   GET /api/tournaments/:id/export
// @access  Private (Host Only)
const exportTournamentData = async (req, res) => {
    try {
        const tournament = await Tournament.findById(req.params.id)
            .populate('enrolledPlayers.user', 'username email');

        if (!tournament) return res.status(404).json({ message: 'Tournament not found' });
        if (tournament.host.toString() !== req.user.id.toString()) return res.status(403).json({ message: 'Not authorized as host' });

        // Create a PDF Document
        const doc = new PDFDocument({ margin: 50 });

        // Setup streaming response
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename=Roster_${tournament.title.replace(/\s+/g, '_')}.pdf`);

        doc.pipe(res);

        // --- Document Styling & Content ---

        // Header
        doc.fontSize(24).font('Helvetica-Bold').fillColor('#00ffff')
            .text('OPERATION ROSTER', { align: 'center' });
        doc.moveDown(0.5);

        doc.fontSize(16).fillColor('#ffffff') // assuming black background logic visually, but pdf is white bg usually.
            .fillColor('#333333').text(`Tournament: ${tournament.title}`, { align: 'center' });
        doc.fontSize(12).fillColor('#666666').text(`Game: ${tournament.game} | Type: ${tournament.type.toUpperCase()}`, { align: 'center' });
        doc.moveDown(2);

        // Table Header
        const tableTop = doc.y;
        doc.font('Helvetica-Bold').fontSize(10).fillColor('#000000');
        doc.text('IGN (IN-GAME NAME)', 50, tableTop);
        doc.text('UID', 200, tableTop);
        doc.text('CONTACT INFO', 350, tableTop);
        doc.text('PLAYCORE USER', 450, tableTop);

        doc.moveTo(50, tableTop + 15).lineTo(550, tableTop + 15).strokeColor('#cccccc').stroke();
        doc.moveDown(1);

        // Table Rows
        let yPosition = doc.y + 5;
        doc.font('Helvetica').fontSize(10);

        tournament.enrolledPlayers.forEach((player, i) => {
            // Page break logic if too low
            if (yPosition > 700) {
                doc.addPage();
                yPosition = 50;
            }

            // Zebra striping bg logic (optional, keeping simple)
            doc.fillColor('#333333');
            doc.text(player.inGameName, 50, yPosition, { width: 140, lineBreak: false });
            doc.text(player.inGameUid, 200, yPosition, { width: 140, lineBreak: false });
            doc.text(player.contactNumber, 350, yPosition, { width: 90, lineBreak: false });
            doc.text(player.user.username, 450, yPosition, { width: 100, lineBreak: false });

            yPosition += 20;
            doc.moveTo(50, yPosition - 5).lineTo(550, yPosition - 5).strokeColor('#eeeeee').stroke();
        });

        doc.moveDown(2);
        doc.fontSize(8).fillColor('#999999').text(`Generated internally by PlayCore Systems for Host: ${req.user.username}`, 50, doc.y, { align: 'center' });

        // Finalize PDF file
        doc.end();

    } catch (error) {
        console.error("PDF EXPORT ERROR:", error);
        if (!res.headersSent) {
            res.status(500).json({ message: 'Server Error during Export' });
        }
    }
};

module.exports = {
    getPublicTournaments,
    getTournamentById,
    createTournament,
    enrollTournament,
    startTournament,
    exportTournamentData
};
