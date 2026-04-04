// seed.js - Populate database with demo admin, player accounts, and sample roster
// Usage: node seed.js
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');
const Player = require('./models/Player');
const Match = require('./models/Match');

dotenv.config();

const seedData = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB connected for seeding...');

    // ─────────────────────────────────────────────
    // Clear existing data
    // ─────────────────────────────────────────────
    await User.deleteMany({});
    await Player.deleteMany({});
    await Match.deleteMany({});
    console.log('Cleared existing data.');

    // ─────────────────────────────────────────────
    // Create Users (1 admin + 4 players)
    // ─────────────────────────────────────────────
    const admin = await User.create({
      name: 'Admin User',
      email: 'admin@demo.com',
      password: 'admin123',
      role: 'admin',
      university: 'QUT',
      address: 'Brisbane, QLD',
    });

    const player1 = await User.create({
      name: 'Sarah Williams',
      email: 'sarah@demo.com',
      password: 'player123',
      role: 'player',
    });

    const player2 = await User.create({
      name: 'Mike Chen',
      email: 'mike@demo.com',
      password: 'player123',
      role: 'player',
    });

    const player3 = await User.create({
      name: 'Emma Rodriguez',
      email: 'emma@demo.com',
      password: 'player123',
      role: 'player',
    });

    const player4 = await User.create({
      name: 'James Foster',
      email: 'james@demo.com',
      password: 'player123',
      role: 'player',
    });

    console.log('Created users:');
    console.log('  Admin:  admin@demo.com  / admin123');
    console.log('  Player: sarah@demo.com  / player123');
    console.log('  Player: mike@demo.com   / player123');
    console.log('  Player: emma@demo.com   / player123');
    console.log('  Player: james@demo.com  / player123');

    // ─────────────────────────────────────────────
    // Create Roster (admin adds players to tournament)
    // ─────────────────────────────────────────────
    const rosterEntries = await Player.insertMany([
      { name: 'Sarah Williams', wins: 0, losses: 0, userId: player1._id, createdBy: admin._id },
      { name: 'Mike Chen', wins: 0, losses: 0, userId: player2._id, createdBy: admin._id },
      { name: 'Emma Rodriguez', wins: 0, losses: 0, userId: player3._id, createdBy: admin._id },
      { name: 'James Foster', wins: 0, losses: 0, userId: player4._id, createdBy: admin._id },
    ]);

    console.log(`Created ${rosterEntries.length} roster entries.`);

    // ─────────────────────────────────────────────
    // Done
    // ─────────────────────────────────────────────
    console.log('\nSeeding complete! You can now start the server.');
    console.log('Login as admin to manage the tournament, or as a player to view your schedule.\n');

    process.exit(0);
  } catch (error) {
    console.error('Seeding error:', error.message);
    process.exit(1);
  }
};

seedData();
