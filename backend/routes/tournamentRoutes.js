const express = require('express');
const router = express.Router();
const {
    getPublicTournaments,
    getTournamentById,
    createTournament,
    enrollTournament,
    exportTournamentData,
    startTournament,
    deleteTournament,
    getEnrolledTournaments
} = require('../controllers/tournamentController');
const { protect } = require('../middleware/authMiddleware');

// Public routes
router.get('/public', getPublicTournaments); // Anyone can see basic list

// Protected routes
router.get('/enrolled', protect, getEnrolledTournaments); // Get enrolled matches
router.get('/:id', protect, getTournamentById); // Requires login to see participants/bracket
router.post('/', protect, createTournament); // Any logged in user can host
router.post('/:id/enroll', protect, enrollTournament); // Submit enrollment form

// Host-only actions (Validated internally inside controller)
router.get('/:id/export', protect, exportTournamentData); // Download PDF
router.put('/:id/start', protect, startTournament); // Generate bracket
router.delete('/:id', protect, deleteTournament); // Terminate operation

module.exports = router;
