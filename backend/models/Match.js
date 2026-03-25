// models/Match.js - Tournament match schema
const mongoose = require('mongoose');

const matchSchema = new mongoose.Schema(
  {
    player1: { type: String, required: true, trim: true },
    player2: { type: String, required: true, trim: true },
    courtName: { type: String, required: true, trim: true },
    timeSlot: { type: String, required: true, trim: true },
    winner: { type: String, default: '' },
    completed: { type: Boolean, default: false },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Match', matchSchema);
