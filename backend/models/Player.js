// models/Player.js - Tournament player schema
// A Player is a roster entry created by an admin.
// `userId` links to the registered User account (optional, for autocomplete).
// `createdBy` is the admin who manages this tournament.
const mongoose = require('mongoose');

const playerSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    wins: { type: Number, default: 0, min: 0 },
    losses: { type: Number, default: 0, min: 0 },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Player', playerSchema);
