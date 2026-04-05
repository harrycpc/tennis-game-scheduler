# Tennis Tournament Scheduler

A full-stack MERN application for managing tennis tournaments with role-based access control, CRUD operations, JWT authentication, automated round-robin scheduling, and CI/CD deployment.

---

## Features

| Feature | Description |
|---|---|
| **Role-Based Access** | Admin manages tournament (full CRUD); Players view roster, their own matches, and standings (read-only) |
| **User Authentication** | Register (player only) & login with JWT; admin accounts created via seed script |
| **Player Roster (CRUD)** | Admin: create, read, update, delete roster entries; Player: read-only |
| **Autocomplete Search** | When admin adds a player, typing a name searches registered users from the database |
| **Match Scheduling (CRUD)** | Admin: generate round-robin, record results, delete matches; Player: view own matches only |
| **Live Leaderboard** | Real-time standings ranked by wins (read-only for all) |
| **User Profile** | View and update personal details |
| **Seed Script** | Pre-populates admin + player demo accounts and roster for easy demonstration |
| **Input Validation** | Server-side validation with express-validator |
| **Ownership Protection** | Users can only access/modify their own data |
| **Error Handling** | Centralised error middleware with 404 catch-all |
| **CI/CD Pipeline** | GitHub Actions: test → build → deploy to AWS EC2 |

---

## Tech Stack

- **Frontend:** React 18, React Router v6, Tailwind CSS, Axios, Lucide React (icons)
- **Backend:** Node.js, Express.js, MongoDB (Mongoose), JWT, bcrypt, express-validator
- **Testing:** Mocha, Chai, chai-http, mongodb-memory-server
- **CI/CD:** GitHub Actions (3-stage pipeline)
- **Deployment:** AWS EC2, PM2 process manager

---

## Project Structure

```
IFN584_Tennis_Scheduler/
├── .github/workflows/ci.yml     # CI/CD pipeline
├── ecosystem.config.js           # PM2 process config
├── backend/
│   ├── config/db.js              # MongoDB connection
│   ├── controllers/
│   │   ├── authController.js     # Auth logic (register/login/profile/user search)
│   │   ├── playerController.js   # Player CRUD logic (admin-only CUD)
│   │   └── matchController.js    # Match CRUD + round-robin (admin-only CUD)
│   ├── middleware/
│   │   ├── authMiddleware.js     # JWT verification + adminOnly guard
│   │   ├── errorMiddleware.js    # 404 + global error handler
│   │   └── validateMiddleware.js # express-validator rules
│   ├── models/
│   │   ├── User.js               # User schema + role (admin/player)
│   │   ├── Player.js             # Roster entry (linked to User via userId)
│   │   └── Match.js              # Match schema
│   ├── routes/
│   │   ├── authRoutes.js         # Includes /users/search for autocomplete
│   │   ├── playerRoutes.js       # GET: all; POST/PUT/DELETE: adminOnly
│   │   └── matchRoutes.js        # GET: all; POST/PUT/DELETE/generate: adminOnly
│   ├── test/api.test.js          # Integration test suite (45+ tests)
│   ├── seed.js                   # Database seeder (demo accounts + roster)
│   ├── server.js                 # Express app entry point
│   ├── .env.example
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── AppProviders.jsx
│   │   │   ├── Root.jsx          # Layout with role badge + bottom nav
│   │   │   └── ProtectedRoute.jsx
│   │   ├── context/
│   │   │   ├── AuthContext.js    # Auth state with role
│   │   │   └── DesignContext.js  # Lofi/Hifi design toggle
│   │   ├── pages/
│   │   │   ├── Welcome.jsx       # Landing page
│   │   │   ├── Login.jsx         # Sign in
│   │   │   ├── Register.jsx      # Create account (player only)
│   │   │   ├── Profile.jsx       # User profile
│   │   │   ├── Roster.jsx        # Admin: CRUD + autocomplete; Player: read-only
│   │   │   ├── Matches.jsx       # Admin: config/generate/record/delete; Player: view own
│   │   │   └── Standings.jsx     # Leaderboard (read-only for all)
│   │   ├── imports/svg-wpsbvjy4pf.js
│   │   ├── routes.js
│   │   ├── axiosConfig.jsx
│   │   └── App.js
│   └── package.json
├── package.json                  # Root scripts
└── README.md
```

---

## Project Setup Instructions

### Prerequisites

- Node.js v18+
- MongoDB (local install or [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) free cluster)
- npm

### 1. Clone the repository

```bash
git clone https://github.com/<YOUR_GITHUB_USERNAME>/IFN584_Tennis_Scheduler.git
cd IFN584_Tennis_Scheduler
```

### 2. Backend setup

```bash
cd backend
npm install
```

Create a `.env` file from the example:

```bash
cp .env.example .env
```

Edit `.env` with your MongoDB connection string:

```env
MONGO_URI=mongodb+srv://<user>:<password>@cluster.mongodb.net/tennis_scheduler
JWT_SECRET=2J8zqkP7VN6bxzg+Wy7DQZCA3Yx8mF3Bl0kch6HYtFs=
PORT=5001
NODE_ENV=development
```

### 3. Seed the database

```bash
npm run seed
```

This creates demo accounts and a pre-populated roster:

| Role | Email | Password |
|------|-------|----------|
| **Admin** | `admin@demo.com` | `admin123` |
| Player | `sarah@demo.com` | `player123` |
| Player | `mike@demo.com` | `player123` |
| Player | `emma@demo.com` | `player123` |
| Player | `james@demo.com` | `player123` |

> **Note:** Admin accounts can only be created via the seed script. The registration page always creates player accounts.

### 4. Frontend setup

```bash
cd ../frontend
npm install
```

For production deployment, update `src/axiosConfig.jsx` with your EC2 IP:

```js
baseURL: 'http://<YOUR_EC2_IP>:5001'
```

### 5. Run locally

From the project root:

```bash
npm run dev
```

This starts both backend (port 5001) and frontend (port 3000) concurrently.

### 6. Run tests

```bash
cd backend
npm test
```

Tests use an in-memory MongoDB instance — no external database needed.

---

## Role-Based Access Control

### Admin can:
- View all players in the roster
- Add registered users to the roster (with autocomplete search)
- Edit and delete roster entries (does NOT delete user accounts)
- Configure and generate round-robin match schedules
- Record match results (updates player win/loss stats)
- Delete matches
- View standings

### Player can:
- View the full roster (read-only)
- View only their own match schedule (read-only)
- View standings (read-only)
- Update their own profile

---

## API Endpoints

### Authentication

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| POST | `/api/auth/register` | Public | Register (always as player) |
| POST | `/api/auth/login` | Public | Login and receive JWT + role |
| GET | `/api/auth/profile` | Private | Get user profile |
| PUT | `/api/auth/profile` | Private | Update user profile |
| GET | `/api/auth/users/search?q=` | Admin | Search users by name (autocomplete) |

### Players (Roster)

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| GET | `/api/players` | Private | List roster (admin: own; player: linked admin's) |
| POST | `/api/players` | Admin | Add player to roster |
| PUT | `/api/players/:id` | Admin | Update player name |
| DELETE | `/api/players/:id` | Admin | Remove from roster (user account preserved) |

### Matches

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| GET | `/api/matches` | Private | List matches (admin: all; player: own only) |
| POST | `/api/matches` | Admin | Create a single match |
| POST | `/api/matches/generate` | Admin | Generate round-robin schedule |
| PUT | `/api/matches/:id` | Admin | Update / record result |
| DELETE | `/api/matches/:id` | Admin | Delete a match |

---

## CI/CD Pipeline

The GitHub Actions workflow uses a **self-hosted runner** on your EC2 instance. When you push to `main`, the workflow runs directly on your EC2 — no SSH keys or remote connections needed.

### How it works:

1. Your EC2 instance runs a GitHub Actions runner as a background service
2. On push to `main`, GitHub sends the job to your EC2 runner
3. The runner checks out code, installs deps, builds frontend, runs tests, writes `.env`, and restarts PM2 — all directly on the server

### Workflow steps:

1. **Checkout Code** — clones repo onto EC2
2. **Setup Node.js** — configures Node 22
3. **Print Env Secret** — verifies environment secrets are accessible
4. **pm2 stop all** — stops currently running app
5. **Install Backend Dependencies** — `yarn install` in `./backend`
6. **Install Frontend Dependencies** — `yarn install` + `yarn run build` in `./frontend`
7. **Run Backend Tests** — `npm test` with MongoDB connection from secrets
8. **npm ci** — clean install at root level
9. **Create .env** — writes `PROD` secret to `backend/.env` for production
10. **pm2 start/restart** — restarts the app with updated code

### Required GitHub Secrets:

**Environment secrets** (under Settings → Environments → `MONGO_URI`):

| Secret | Description |
|--------|-------------|
| `MONGO_URI` | MongoDB connection string |
| `JWT_SECRET` | JWT authentication secret key |
| `PORT` | Application port (e.g., `5001`) |

**Repository secret** (under Settings → Secrets and variables → Actions):

| Secret | Description |
|--------|-------------|
| `PROD` | Full `.env` file contents for production (all env vars on separate lines) |

### Self-hosted runner setup on EC2:

```bash
# On your EC2 instance:
mkdir actions-runner && cd actions-runner
curl -o actions-runner-linux-x64-2.321.0.tar.gz -L https://github.com/actions/runner/releases/download/v2.321.0/actions-runner-linux-x64-2.321.0.tar.gz
tar xzf ./actions-runner-linux-x64-2.321.0.tar.gz
./config.sh --url https://github.com/<YOUR_USERNAME>/<YOUR_REPO> --token <YOUR_TOKEN>
sudo ./svc.sh install
sudo ./svc.sh start
```

---

## GitHub Branching Strategy

- `main` — Production-ready code; protected branch
- `feature/<name>` — Feature branches (e.g., `feature/player-crud`, `feature/match-scheduling`)
- All features merged via **Pull Requests** with CI checks passing

---

## Public URL (EC2 instance Public IPv4 address)

```
http://15.135.83.231
```

## Demo Credentials

| Role | Email | Password |
|------|-------|----------|
| **Admin** | `admin@demo.com` | `admin123` |
| Player | `sarah@demo.com` | `player123` |
| Player | `mike@demo.com` | `player123` |
| Player | `emma@demo.com` | `player123` |
| Player | `james@demo.com` | `player123` |

---

## References

- [React Documentation](https://react.dev/)
- [Express.js Guide](https://expressjs.com/en/guide/routing.html)
- [Mongoose Documentation](https://mongoosejs.com/docs/)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [Lucide React Icons](https://lucide.dev/)
- [JWT Introduction](https://jwt.io/introduction)
- [express-validator](https://express-validator.github.io/docs/)
- [Mocha Testing Framework](https://mochajs.org/)
- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [PM2 Process Manager](https://pm2.keymetrics.io/docs/usage/quick-start/)
