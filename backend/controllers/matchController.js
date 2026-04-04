// controllers/matchController.js - Match CRUD + round-robin generation
// Admin: full CRUD. Player: read-only (own matches only).
const Match = require('../models/Match');
const Player = require('../models/Player');

// @desc    Get matches - admin sees all their matches; player sees only their own
// @route   GET /api/matches
// @access  Private
const getMatches = async (req, res) => {
  try {
    if (req.user.role === 'admin') {
      const matches = await Match.find({ createdBy: req.user.id }).sort({ createdAt: 1 });
      return res.json(matches);
    }

    // Player: find the roster entry for this user, then get matches from that admin
    const rosterEntry = await Player.findOne({ userId: req.user.id });
    if (!rosterEntry) {
      // Fallback: try matching by name
      const byName = await Player.findOne({ name: req.user.name });
      if (!byName) return res.json([]);

      // Get only matches involving this player from that admin's tournament
      const matches = await Match.find({
        createdBy: byName.createdBy,
        $or: [{ player1: req.user.name }, { player2: req.user.name }],
      }).sort({ createdAt: 1 });
      return res.json(matches);
    }

    // Get only matches involving this player from the admin's tournament
    const matches = await Match.find({
      createdBy: rosterEntry.createdBy,
      $or: [{ player1: rosterEntry.name }, { player2: rosterEntry.name }],
    }).sort({ createdAt: 1 });
    res.json(matches);
  } catch (error) {
    console.error('getMatches error:', error.message);
    res.status(500).json([]);
  }
};

// @desc    Create a single match
// @route   POST /api/matches
// @access  Private (Admin only - enforced by route middleware)
const createMatch = async (req, res) => {
  const { player1, player2, courtName, timeSlot } = req.body;
  try {
    if (player1.trim() === player2.trim()) {
      return res.status(400).json({ message: 'A player cannot play against themselves' });
    }

    const match = await Match.create({
      player1: player1.trim(),
      player2: player2.trim(),
      courtName: courtName.trim(),
      timeSlot: timeSlot.trim(),
      createdBy: req.user.id,
    });

    res.status(201).json(match);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Auto-generate round-robin schedule from all players
// @route   POST /api/matches/generate
// @access  Private (Admin only - enforced by route middleware)
const generateMatches = async (req, res) => {
  const { totalCourts, startHour } = req.body;
  try {
    const players = await Player.find({ createdBy: req.user.id });

    if (players.length < 2) {
      return res.status(400).json({
        message: 'You need at least 2 players in the roster to generate a schedule',
      });
    }

    // Delete existing matches before regenerating
    await Match.deleteMany({ createdBy: req.user.id });

    const playerNames = players.map((p) => p.name);
    const n = playerNames.length;

    // ── Round-robin tournament algorithm ──
    // If odd number of players, add a "BYE" placeholder so every round
    // has n/2 matches and no player sits out without being tracked.
    const list = [...playerNames];
    if (n % 2 !== 0) list.push(null); // null = BYE
    const total = list.length;
    const rounds = [];

    // Generate rounds using the "circle method":
    // Fix the first player, rotate the rest.
    for (let round = 0; round < total - 1; round++) {
      const roundMatches = [];
      for (let i = 0; i < total / 2; i++) {
        const home = list[i];
        const away = list[total - 1 - i];
        // Skip matches involving BYE
        if (home !== null && away !== null) {
          roundMatches.push({ player1: home, player2: away });
        }
      }
      rounds.push(roundMatches);

      // Rotate: keep list[0] fixed, rotate the rest clockwise
      const last = list.pop();
      list.splice(1, 0, last);
    }

    // ── Assign time slots and courts ──
    // Each round gets a time slot. Within a round, matches are assigned
    // to courts (up to totalCourts simultaneously). If a round has more
    // matches than courts, they spill into the next time block.
    const generatedMatches = [];
    let currentTime = startHour * 60; // minutes since midnight

    for (const roundMatches of rounds) {
      let courtIndex = 0;
      for (const match of roundMatches) {
        const courtLetter = String.fromCharCode(65 + (courtIndex % totalCourts));
        const hours = Math.floor(currentTime / 60);
        const minutes = currentTime % 60;
        const period = hours >= 12 ? 'PM' : 'AM';
        const displayHour = hours % 12 || 12;
        const timeSlot = `${displayHour}:${minutes.toString().padStart(2, '0')} ${period}`;

        generatedMatches.push({
          player1: match.player1,
          player2: match.player2,
          courtName: `Court ${courtLetter}`,
          timeSlot,
          completed: false,
          createdBy: req.user.id,
        });

        courtIndex++;
        // If we've filled all courts, advance to the next time block
        if (courtIndex % totalCourts === 0) {
          currentTime += 90;
        }
      }
      // After each round, always advance to the next time block
      // (even if courts weren't all filled)
      if (courtIndex % totalCourts !== 0) {
        currentTime += 90;
      }
    }

    const created = await Match.insertMany(generatedMatches);
    res.status(201).json(created);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update a match (record result)
// @route   PUT /api/matches/:id
// @access  Private (Admin only - enforced by route middleware)
const updateMatch = async (req, res) => {
  try {
    const match = await Match.findById(req.params.id);

    if (!match) {
      return res.status(404).json({ message: 'Match not found' });
    }

    if (match.createdBy.toString() !== req.user.id.toString()) {
      return res.status(403).json({ message: 'Not authorized to update this match' });
    }

    const { winner, completed, player1, player2, courtName, timeSlot } = req.body;

    // If recording a winner on a previously incomplete match, update player stats
    if (winner && !match.completed) {
      const validWinner = winner === match.player1 || winner === match.player2;
      if (!validWinner) {
        return res.status(400).json({ message: 'Winner must be one of the match participants' });
      }

      const loserName = winner === match.player1 ? match.player2 : match.player1;

      await Player.findOneAndUpdate(
        { name: winner, createdBy: req.user.id },
        { $inc: { wins: 1 } }
      );
      await Player.findOneAndUpdate(
        { name: loserName, createdBy: req.user.id },
        { $inc: { losses: 1 } }
      );
    }

    if (winner !== undefined) match.winner = winner;
    if (completed !== undefined) match.completed = completed;
    if (player1 !== undefined) match.player1 = player1.trim();
    if (player2 !== undefined) match.player2 = player2.trim();
    if (courtName !== undefined) match.courtName = courtName.trim();
    if (timeSlot !== undefined) match.timeSlot = timeSlot.trim();

    const updatedMatch = await match.save();
    res.json(updatedMatch);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete a match
// @route   DELETE /api/matches/:id
// @access  Private (Admin only - enforced by route middleware)
const deleteMatch = async (req, res) => {
  try {
    const match = await Match.findById(req.params.id);

    if (!match) {
      return res.status(404).json({ message: 'Match not found' });
    }

    if (match.createdBy.toString() !== req.user.id.toString()) {
      return res.status(403).json({ message: 'Not authorized to delete this match' });
    }

    await match.deleteOne();
    res.json({ message: 'Match removed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getMatches, createMatch, generateMatches, updateMatch, deleteMatch };
