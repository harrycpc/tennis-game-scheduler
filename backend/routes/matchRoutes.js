// routes/matchRoutes.js - Match CRUD + generation endpoints
// GET is open to all authenticated users (players see their own matches)
// POST, PUT, DELETE, GENERATE are admin-only
const express = require('express');
const router = express.Router();
const {
  getMatches,
  createMatch,
  generateMatches,
  updateMatch,
  deleteMatch,
} = require('../controllers/matchController');
const { protect, adminOnly } = require('../middleware/authMiddleware');
const { validateMatch, validateGenerateMatches } = require('../middleware/validateMiddleware');

router.get('/', protect, getMatches);
router.post('/', protect, adminOnly, validateMatch, createMatch);
router.post('/generate', protect, adminOnly, validateGenerateMatches, generateMatches);
router.put('/:id', protect, adminOnly, updateMatch);
router.delete('/:id', protect, adminOnly, deleteMatch);

module.exports = router;
