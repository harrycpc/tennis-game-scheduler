// routes/playerRoutes.js - Player CRUD endpoints
// GET is open to all authenticated users (players see roster read-only)
// POST, PUT, DELETE are admin-only
const express = require('express');
const router = express.Router();
const {
  getPlayers,
  createPlayer,
  updatePlayer,
  deletePlayer,
} = require('../controllers/playerController');
const { protect, adminOnly } = require('../middleware/authMiddleware');
const { validatePlayer } = require('../middleware/validateMiddleware');

router.get('/', protect, getPlayers);
router.post('/', protect, adminOnly, validatePlayer, createPlayer);
router.put('/:id', protect, adminOnly, updatePlayer);
router.delete('/:id', protect, adminOnly, deletePlayer);

module.exports = router;
