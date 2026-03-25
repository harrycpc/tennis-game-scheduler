// controllers/playerController.js - Player CRUD (admin-only for CUD)
const Player = require('../models/Player');
const User = require('../models/User');

// @desc    Get all players for the tournament (scoped by admin who created them)
// @route   GET /api/players
// @access  Private
const getPlayers = async (req, res) => {
  try {
    let query;

    if (req.user.role === 'admin') {
      // Admin sees players they created
      query = { createdBy: req.user.id };
    } else {
      // Player sees rosters where they are a participant
      // Find all admins' rosters that include this player
      query = { userId: req.user.id };

      // If no roster entry links to this user, fall back to showing
      // any roster they were added to by name match
      const linkedPlayers = await Player.find(query);
      if (linkedPlayers.length === 0) {
        query = { name: req.user.name };
      }
    }

    const players = await Player.find(query).sort({ createdAt: -1 });

    // If player role, get the full roster from the admin who added them
    if (req.user.role === 'player' && players.length > 0) {
      const adminId = players[0].createdBy;
      const fullRoster = await Player.find({ createdBy: adminId }).sort({ createdAt: -1 });
      return res.json(fullRoster);
    }

    res.json(players);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create a new player (admin adds a registered user to roster)
// @route   POST /api/players
// @access  Private (Admin only - enforced by route middleware)
const createPlayer = async (req, res) => {
  const { name, userId } = req.body;
  try {
    // Prevent duplicate player names in this admin's roster
    const exists = await Player.findOne({
      name: { $regex: new RegExp(`^${name.trim()}$`, 'i') },
      createdBy: req.user.id,
    });
    if (exists) {
      return res.status(400).json({ message: 'A player with this name already exists in the roster' });
    }

    // If userId provided, verify it's a real user
    let linkedUserId = null;
    if (userId) {
      const linkedUser = await User.findById(userId);
      if (linkedUser) {
        linkedUserId = linkedUser._id;
      }
    } else {
      // Try to auto-link by exact name match
      const matchedUser = await User.findOne({
        name: { $regex: new RegExp(`^${name.trim()}$`, 'i') },
      });
      if (matchedUser) {
        linkedUserId = matchedUser._id;
      }
    }

    const player = await Player.create({
      name: name.trim(),
      wins: 0,
      losses: 0,
      userId: linkedUserId,
      createdBy: req.user.id,
    });

    res.status(201).json(player);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update a player by ID
// @route   PUT /api/players/:id
// @access  Private (Admin only - enforced by route middleware)
const updatePlayer = async (req, res) => {
  try {
    const player = await Player.findById(req.params.id);

    if (!player) {
      return res.status(404).json({ message: 'Player not found' });
    }

    // Ownership check - only the admin who created this roster entry
    if (player.createdBy.toString() !== req.user.id.toString()) {
      return res.status(403).json({ message: 'Not authorized to update this player' });
    }

    const { name, wins, losses } = req.body;
    if (name !== undefined) player.name = name.trim();
    if (wins !== undefined) player.wins = wins;
    if (losses !== undefined) player.losses = losses;

    const updatedPlayer = await player.save();
    res.json(updatedPlayer);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete a player from the roster (does NOT delete the user account)
// @route   DELETE /api/players/:id
// @access  Private (Admin only - enforced by route middleware)
const deletePlayer = async (req, res) => {
  try {
    const player = await Player.findById(req.params.id);

    if (!player) {
      return res.status(404).json({ message: 'Player not found' });
    }

    // Ownership check
    if (player.createdBy.toString() !== req.user.id.toString()) {
      return res.status(403).json({ message: 'Not authorized to delete this player' });
    }

    // Remove from roster only - User account remains untouched
    await player.deleteOne();
    res.json({ message: 'Player removed from roster' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getPlayers, createPlayer, updatePlayer, deletePlayer };
