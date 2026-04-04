// test/api.test.js - Integration tests for Tennis Tournament Scheduler API
const chai = require('chai');
const chaiHttp = require('chai-http');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const app = require('../server');
const User = require('../models/User');
const Player = require('../models/Player');
const Match = require('../models/Match');

chai.use(chaiHttp);
const { expect } = chai;

let mongoServer;
let adminToken;
let playerToken;
let playerId;
let matchId;

// ─────────────────────────── Setup & Teardown ───────────────────────────

before(async () => {
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();
  await mongoose.connect(uri);

  // Seed an admin account directly in the database (mimics seed.js)
  await User.create({
    name: 'Admin User',
    email: 'admin@test.com',
    password: 'admin123',
    role: 'admin',
  });

  // Seed player accounts directly (mimics seed.js)
  await User.create({
    name: 'Player One',
    email: 'player1@test.com',
    password: 'player123',
    role: 'player',
  });

  await User.create({
    name: 'James Foster',
    email: 'james@test.com',
    password: 'player123',
    role: 'player',
  });
});

after(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

// ═══════════════════════════════════════════════════════════════════════
// 1. HEALTH CHECK
// ═══════════════════════════════════════════════════════════════════════

describe('GET /api/health', () => {
  it('should return status ok', async () => {
    const res = await chai.request(app).get('/api/health');
    expect(res).to.have.status(200);
    expect(res.body).to.have.property('status', 'ok');
  });
});

// ═══════════════════════════════════════════════════════════════════════
// 2. AUTHENTICATION - REGISTRATION ALWAYS CREATES PLAYER
// ═══════════════════════════════════════════════════════════════════════

describe('Auth Endpoints', () => {
  describe('POST /api/auth/register', () => {
    it('should register a new user as player (default)', async () => {
      const res = await chai.request(app)
        .post('/api/auth/register')
        .send({ name: 'New Player', email: 'newplayer@test.com', password: 'password123' });

      expect(res).to.have.status(201);
      expect(res.body).to.have.property('role', 'player');
      expect(res.body).to.have.property('token');
    });

    it('should force player role even if admin role is sent', async () => {
      const res = await chai.request(app)
        .post('/api/auth/register')
        .send({ name: 'Sneaky User', email: 'sneaky@test.com', password: 'password123', role: 'admin' });

      expect(res).to.have.status(201);
      expect(res.body).to.have.property('role', 'player');
    });

    it('should reject duplicate email', async () => {
      const res = await chai.request(app)
        .post('/api/auth/register')
        .send({ name: 'Dup', email: 'admin@test.com', password: 'password123' });

      expect(res).to.have.status(400);
    });

    it('should reject missing name', async () => {
      const res = await chai.request(app)
        .post('/api/auth/register')
        .send({ email: 'noname@test.com', password: 'password123' });

      expect(res).to.have.status(400);
    });

    it('should reject short password', async () => {
      const res = await chai.request(app)
        .post('/api/auth/register')
        .send({ name: 'Short', email: 'short@test.com', password: '123' });

      expect(res).to.have.status(400);
    });

    it('should reject invalid email', async () => {
      const res = await chai.request(app)
        .post('/api/auth/register')
        .send({ name: 'Bad', email: 'notanemail', password: 'password123' });

      expect(res).to.have.status(400);
    });
  });

  describe('POST /api/auth/login', () => {
    it('should login seeded admin and return admin role', async () => {
      const res = await chai.request(app)
        .post('/api/auth/login')
        .send({ email: 'admin@test.com', password: 'admin123' });

      expect(res).to.have.status(200);
      expect(res.body).to.have.property('role', 'admin');
      expect(res.body).to.have.property('token');
      adminToken = res.body.token;
    });

    it('should login seeded player and return player role', async () => {
      const res = await chai.request(app)
        .post('/api/auth/login')
        .send({ email: 'player1@test.com', password: 'player123' });

      expect(res).to.have.status(200);
      expect(res.body).to.have.property('role', 'player');
      expect(res.body).to.have.property('token');
      playerToken = res.body.token;
    });

    it('should reject wrong password', async () => {
      const res = await chai.request(app)
        .post('/api/auth/login')
        .send({ email: 'admin@test.com', password: 'wrong' });

      expect(res).to.have.status(401);
    });

    it('should reject non-existent email', async () => {
      const res = await chai.request(app)
        .post('/api/auth/login')
        .send({ email: 'ghost@test.com', password: 'password123' });

      expect(res).to.have.status(401);
    });
  });

  describe('GET /api/auth/profile', () => {
    it('should return profile with role', async () => {
      const res = await chai.request(app)
        .get('/api/auth/profile')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res).to.have.status(200);
      expect(res.body).to.have.property('role', 'admin');
      expect(res.body).to.have.property('name', 'Admin User');
    });

    it('should reject request without token', async () => {
      const res = await chai.request(app).get('/api/auth/profile');
      expect(res).to.have.status(401);
    });

    it('should reject invalid token', async () => {
      const res = await chai.request(app)
        .get('/api/auth/profile')
        .set('Authorization', 'Bearer invalidtoken123');

      expect(res).to.have.status(401);
    });
  });

  describe('PUT /api/auth/profile', () => {
    it('should update profile fields', async () => {
      const res = await chai.request(app)
        .put('/api/auth/profile')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ university: 'QUT', address: 'Brisbane' });

      expect(res).to.have.status(200);
      expect(res.body).to.have.property('university', 'QUT');
    });
  });

  // ---------- USER SEARCH (Admin autocomplete) ----------
  describe('GET /api/auth/users/search', () => {
    it('admin should find users matching query', async () => {
      const res = await chai.request(app)
        .get('/api/auth/users/search?q=Player')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res).to.have.status(200);
      expect(res.body).to.be.an('array');
      expect(res.body.length).to.be.at.least(1);
      expect(res.body[0]).to.have.property('name');
      expect(res.body[0]).to.have.property('email');
      expect(res.body[0]).to.have.property('role');
    });

    it('admin should find users starting with J', async () => {
      const res = await chai.request(app)
        .get('/api/auth/users/search?q=J')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res).to.have.status(200);
      expect(res.body.length).to.be.at.least(1);
      expect(res.body[0].name).to.match(/^J/i);
    });

    it('should return empty for no match', async () => {
      const res = await chai.request(app)
        .get('/api/auth/users/search?q=ZZZZZ')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res).to.have.status(200);
      expect(res.body).to.have.length(0);
    });

    it('player should be DENIED searching users', async () => {
      const res = await chai.request(app)
        .get('/api/auth/users/search?q=Player')
        .set('Authorization', `Bearer ${playerToken}`);

      expect(res).to.have.status(403);
    });
  });
});

// ═══════════════════════════════════════════════════════════════════════
// 3. PLAYER CRUD - ADMIN ONLY FOR CUD
// ═══════════════════════════════════════════════════════════════════════

describe('Player Endpoints (Role-Based)', () => {
  describe('POST /api/players (Admin only)', () => {
    it('admin should create a player', async () => {
      const res = await chai.request(app)
        .post('/api/players')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ name: 'Player One' });

      expect(res).to.have.status(201);
      expect(res.body).to.have.property('name', 'Player One');
      expect(res.body).to.have.property('wins', 0);
      playerId = res.body._id;
    });

    it('admin should create additional players', async () => {
      for (const name of ['James Foster', 'Sarah Williams', 'New Player']) {
        const res = await chai.request(app)
          .post('/api/players')
          .set('Authorization', `Bearer ${adminToken}`)
          .send({ name });
        expect(res).to.have.status(201);
      }
    });

    it('player should be DENIED creating a player', async () => {
      const res = await chai.request(app)
        .post('/api/players')
        .set('Authorization', `Bearer ${playerToken}`)
        .send({ name: 'Hacker Player' });

      expect(res).to.have.status(403);
      expect(res.body.message).to.include('Admin only');
    });

    it('admin should reject duplicate player name', async () => {
      const res = await chai.request(app)
        .post('/api/players')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ name: 'player one' });

      expect(res).to.have.status(400);
      expect(res.body.message).to.include('already exists');
    });

    it('should reject empty player name', async () => {
      const res = await chai.request(app)
        .post('/api/players')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ name: '' });

      expect(res).to.have.status(400);
    });
  });

  describe('GET /api/players (All authenticated)', () => {
    it('admin should see all their roster players', async () => {
      const res = await chai.request(app)
        .get('/api/players')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res).to.have.status(200);
      expect(res.body).to.be.an('array');
      expect(res.body.length).to.equal(4);
    });

    it('player should see the roster (read-only)', async () => {
      const res = await chai.request(app)
        .get('/api/players')
        .set('Authorization', `Bearer ${playerToken}`);

      expect(res).to.have.status(200);
      expect(res.body).to.be.an('array');
    });
  });

  describe('PUT /api/players/:id (Admin only)', () => {
    it('admin should update a player name', async () => {
      const res = await chai.request(app)
        .put(`/api/players/${playerId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ name: 'Player One Updated' });

      expect(res).to.have.status(200);
      expect(res.body).to.have.property('name', 'Player One Updated');
    });

    it('player should be DENIED updating a player', async () => {
      const res = await chai.request(app)
        .put(`/api/players/${playerId}`)
        .set('Authorization', `Bearer ${playerToken}`)
        .send({ name: 'Hacked Name' });

      expect(res).to.have.status(403);
    });

    it('should return 404 for non-existent player', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      const res = await chai.request(app)
        .put(`/api/players/${fakeId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ name: 'Ghost' });

      expect(res).to.have.status(404);
    });
  });
});

// ═══════════════════════════════════════════════════════════════════════
// 4. MATCH CRUD - ADMIN ONLY FOR CUD
// ═══════════════════════════════════════════════════════════════════════

describe('Match Endpoints (Role-Based)', () => {
  describe('POST /api/matches (Admin only)', () => {
    it('admin should create a match', async () => {
      const res = await chai.request(app)
        .post('/api/matches')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ player1: 'Player One Updated', player2: 'James Foster', courtName: 'Court A', timeSlot: '9:00 AM' });

      expect(res).to.have.status(201);
      expect(res.body).to.have.property('completed', false);
      matchId = res.body._id;
    });

    it('player should be DENIED creating a match', async () => {
      const res = await chai.request(app)
        .post('/api/matches')
        .set('Authorization', `Bearer ${playerToken}`)
        .send({ player1: 'A', player2: 'B', courtName: 'Court A', timeSlot: '9:00 AM' });

      expect(res).to.have.status(403);
    });

    it('admin should reject self-match', async () => {
      const res = await chai.request(app)
        .post('/api/matches')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ player1: 'Same', player2: 'Same', courtName: 'Court A', timeSlot: '9:00 AM' });

      expect(res).to.have.status(400);
    });
  });

  describe('POST /api/matches/generate (Admin only)', () => {
    it('admin should generate round-robin schedule', async () => {
      const res = await chai.request(app)
        .post('/api/matches/generate')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ totalCourts: 2, startHour: 9 });

      expect(res).to.have.status(201);
      expect(res.body).to.be.an('array');
      // C(4,2) = 6 matches for 4 players
      expect(res.body.length).to.equal(6);
      matchId = res.body[0]._id;
    });

    it('player should be DENIED generating schedule', async () => {
      const res = await chai.request(app)
        .post('/api/matches/generate')
        .set('Authorization', `Bearer ${playerToken}`)
        .send({ totalCourts: 2, startHour: 9 });

      expect(res).to.have.status(403);
    });

    it('should reject invalid totalCourts', async () => {
      const res = await chai.request(app)
        .post('/api/matches/generate')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ totalCourts: 0, startHour: 9 });

      expect(res).to.have.status(400);
    });
  });

  describe('GET /api/matches (All authenticated)', () => {
    it('admin should see all 6 matches', async () => {
      const res = await chai.request(app)
        .get('/api/matches')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res).to.have.status(200);
      expect(res.body.length).to.equal(6);
    });

    it('player should see only their own matches', async () => {
      const res = await chai.request(app)
        .get('/api/matches')
        .set('Authorization', `Bearer ${playerToken}`);

      expect(res).to.have.status(200);
      expect(res.body).to.be.an('array');
      // Player One is in some matches - verify each returned match includes them
      res.body.forEach((match) => {
        const playerName = 'Player One Updated';
        const isInMatch = match.player1 === playerName || match.player2 === playerName;
        expect(isInMatch).to.be.true;
      });
    });
  });

  describe('PUT /api/matches/:id (Admin only)', () => {
    it('admin should record a match result and update stats', async () => {
      const matchRes = await chai.request(app)
        .get('/api/matches')
        .set('Authorization', `Bearer ${adminToken}`);

      const firstMatch = matchRes.body[0];
      matchId = firstMatch._id;

      const res = await chai.request(app)
        .put(`/api/matches/${matchId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ winner: firstMatch.player1, completed: true });

      expect(res).to.have.status(200);
      expect(res.body).to.have.property('completed', true);
      expect(res.body).to.have.property('winner', firstMatch.player1);

      // Verify winner stats incremented
      const playersRes = await chai.request(app)
        .get('/api/players')
        .set('Authorization', `Bearer ${adminToken}`);

      const winnerPlayer = playersRes.body.find((p) => p.name === firstMatch.player1);
      expect(winnerPlayer.wins).to.be.at.least(1);
    });

    it('admin should reject invalid winner name', async () => {
      const matchRes = await chai.request(app)
        .get('/api/matches')
        .set('Authorization', `Bearer ${adminToken}`);

      const incomplete = matchRes.body.find((m) => !m.completed);
      if (!incomplete) return;

      const res = await chai.request(app)
        .put(`/api/matches/${incomplete._id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ winner: 'Non-Existent Player', completed: true });

      expect(res).to.have.status(400);
    });

    it('player should be DENIED recording a result', async () => {
      const matchRes = await chai.request(app)
        .get('/api/matches')
        .set('Authorization', `Bearer ${adminToken}`);

      const incomplete = matchRes.body.find((m) => !m.completed);
      if (!incomplete) return;

      const res = await chai.request(app)
        .put(`/api/matches/${incomplete._id}`)
        .set('Authorization', `Bearer ${playerToken}`)
        .send({ winner: incomplete.player1, completed: true });

      expect(res).to.have.status(403);
    });

    it('should return 404 for non-existent match', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      const res = await chai.request(app)
        .put(`/api/matches/${fakeId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ courtName: 'Court Z' });

      expect(res).to.have.status(404);
    });
  });

  describe('DELETE /api/matches/:id (Admin only)', () => {
    it('player should be DENIED deleting a match', async () => {
      const res = await chai.request(app)
        .delete(`/api/matches/${matchId}`)
        .set('Authorization', `Bearer ${playerToken}`);

      expect(res).to.have.status(403);
    });

    it('admin should delete a match', async () => {
      const res = await chai.request(app)
        .delete(`/api/matches/${matchId}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res).to.have.status(200);
      expect(res.body).to.have.property('message', 'Match removed');
    });

    it('should return 404 for already-deleted match', async () => {
      const res = await chai.request(app)
        .delete(`/api/matches/${matchId}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res).to.have.status(404);
    });
  });
});

// ═══════════════════════════════════════════════════════════════════════
// 5. PLAYER DELETE - ADMIN ONLY, DOES NOT DELETE USER ACCOUNT
// ═══════════════════════════════════════════════════════════════════════

describe('Player Delete (Admin only, preserves user account)', () => {
  it('player should be DENIED deleting from roster', async () => {
    const res = await chai.request(app)
      .delete(`/api/players/${playerId}`)
      .set('Authorization', `Bearer ${playerToken}`);

    expect(res).to.have.status(403);
  });

  it('admin should delete a player from roster', async () => {
    const res = await chai.request(app)
      .delete(`/api/players/${playerId}`)
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res).to.have.status(200);
    expect(res.body).to.have.property('message', 'Player removed from roster');
  });

  it('user account should still exist after roster deletion', async () => {
    const res = await chai.request(app)
      .post('/api/auth/login')
      .send({ email: 'player1@test.com', password: 'player123' });

    expect(res).to.have.status(200);
    expect(res.body).to.have.property('name', 'Player One');
    expect(res.body).to.have.property('role', 'player');
  });

  it('should return 404 for already-deleted roster entry', async () => {
    const res = await chai.request(app)
      .delete(`/api/players/${playerId}`)
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res).to.have.status(404);
  });
});

// ═══════════════════════════════════════════════════════════════════════
// 6. EDGE CASES
// ═══════════════════════════════════════════════════════════════════════

describe('Edge Cases', () => {
  it('should return 404 for undefined routes', async () => {
    const res = await chai.request(app).get('/api/nonexistent');
    expect(res).to.have.status(404);
  });
});
