const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const {
    createSquad,
    getSquads,
    getSquad,
    joinSquad,
    leaveSquad,
    deleteSquad
} = require('../controllers/squadController');

router.get('/', getSquads);
router.post('/', protect, createSquad);
router.post('/leave', protect, leaveSquad);
router.get('/:id', getSquad);
router.post('/:id/join', protect, joinSquad);
router.delete('/:id', protect, deleteSquad);

module.exports = router;
