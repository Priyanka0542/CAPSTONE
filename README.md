# FutureEra — AI Career Path Simulator

An AI-powered decision-support platform that helps users choose and pursue career goals. The app generates personalized month-by-month roadmaps, tracks daily progress through streaks and milestones, lets users run multiple career paths in parallel, compare them side by side, and shows realistic time/cost/reward estimates.

> **Important:** FutureEra generates structured, assumption-based guidance framed as decision-support — never a guarantee.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18 (Vite 5) + Tailwind CSS 3 + Recharts |
| Backend | Node.js + Express |
| Database | MongoDB (Mongoose) |
| Auth | JWT (access + refresh tokens) + bcrypt |
| AI | Groq API (Llama-3) for roadmap generation |
| Validation | Zod on both frontend and backend |

---

## 🚀 Contributor Setup Guide

Follow these steps to clone, install, and run FutureEra locally.

### Prerequisites

Make sure you have these installed on your machine:

| Tool | Version | Download |
|------|---------|----------|
| **Node.js** | 18+ (recommended: 20.x) | [nodejs.org](https://nodejs.org/) |
| **MongoDB** | 6+ (Community Server) | [mongodb.com/try/download](https://www.mongodb.com/try/download/community) |
| **Git** | Any recent version | [git-scm.com](https://git-scm.com/) |
| **Groq API Key** | Free tier | [console.groq.com/keys](https://console.groq.com/keys) |

> **MongoDB tip:** On Windows, install MongoDB Community Server and make sure the MongoDB service is running. You can check with: `mongosh` in your terminal. Alternatively, use [MongoDB Atlas](https://www.mongodb.com/atlas) (free tier) for a cloud database.

### Step 1: Clone the repository

```bash
git clone https://github.com/Priyanka0542/CAPSTONE.git
cd CAPSTONE
```

### Step 2: Set up environment variables

The `.env` file holds all secrets and is **never committed to git**. You need to create your own:

```bash
# Copy the example file into the server folder
cp .env.example server/.env
```

On **Windows PowerShell**, use:
```powershell
Copy-Item .env.example server/.env
```

Now **edit `server/.env`** and fill in your values:

```env
# MongoDB — use local or Atlas connection string
MONGODB_URI=mongodb://localhost:27017/futureera

# JWT Secrets — generate random strings (MUST be unique, NEVER share these)
# Quick generator: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
JWT_ACCESS_SECRET=paste_a_random_64char_hex_string_here
JWT_REFRESH_SECRET=paste_a_different_random_64char_hex_string_here

# Groq AI — sign up at https://console.groq.com and create an API key
GROQ_API_KEY=gsk_your_key_here

# Server config — leave these as-is for local dev
PORT=5000
NODE_ENV=development
CLIENT_URL=http://localhost:5173
```

#### How to get each value:

| Variable | How to get it |
|----------|--------------|
| `MONGODB_URI` | **Local:** Install MongoDB and use `mongodb://localhost:27017/futureera`. **Atlas:** Create a free cluster at [mongodb.com/atlas](https://www.mongodb.com/atlas), get the connection string, and replace `<password>` with your DB password. |
| `JWT_ACCESS_SECRET` | Run `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"` in your terminal. Copy the output. |
| `JWT_REFRESH_SECRET` | Run the same command again to get a **different** random string. |
| `GROQ_API_KEY` | Sign up at [console.groq.com](https://console.groq.com), go to API Keys, create a new key. Free tier gives generous limits. |
| `PORT` | Keep as `5000` unless you have a conflict. |
| `CLIENT_URL` | Keep as `http://localhost:5173` for local dev. |

### Step 3: Install dependencies

```bash
# Install backend dependencies
cd server
npm install

# Install frontend dependencies
cd ../client
npm install
```

### Step 4: Start MongoDB

Make sure MongoDB is running:

- **Windows:** It usually runs as a service after installation. Check in Services app or run `mongosh` to verify.
- **Mac (Homebrew):** `brew services start mongodb-community`
- **Linux:** `sudo systemctl start mongod`
- **Atlas:** No action needed — it's always running in the cloud.

### Step 5: Run the app

Open **two terminal windows**:

```bash
# Terminal 1 — Start the backend
cd server
npm run dev
# Should show: ✅ MongoDB connected: localhost
# Should show: 🚀 FutureEra server running on port 5000
```

```bash
# Terminal 2 — Start the frontend
cd client
npm run dev
# Should show: VITE ready at http://localhost:5173/
```

### Step 6: Open in browser

Go to **c** — you should see the FutureEra login page with the Galaxy dark theme!

Sign up with any email/password to get started.

---

## 📁 Project Structure

```
CAPSTONE/
├── .env.example              # ← Template for environment variables
├── .gitignore                # ← Ensures .env and node_modules are NOT committed
├── README.md
│
├── server/                   # Express backend
│   ├── .env                  # ← YOUR secrets (never committed, create from .env.example)
│   ├── package.json
│   ├── index.js              # App entry point
│   ├── config/
│   │   ├── db.js             # MongoDB connection
│   │   └── env.js            # Environment variable loader
│   ├── models/               # Mongoose schemas
│   │   ├── User.js
│   │   ├── CareerPath.js
│   │   ├── DailyActivity.js
│   │   ├── StreakLog.js
│   │   └── Badge.js
│   ├── controllers/          # Route handlers
│   │   ├── authController.js
│   │   ├── pathController.js
│   │   └── activityController.js
│   ├── routes/
│   │   ├── auth.js
│   │   ├── paths.js
│   │   └── activity.js
│   ├── middleware/
│   │   ├── auth.js           # JWT verification
│   │   ├── rateLimiter.js
│   │   ├── errorHandler.js
│   │   └── validate.js       # Zod validation middleware
│   ├── services/
│   │   ├── llmService.js     # Groq API integration
│   │   ├── badgeService.js
│   │   └── streakService.js
│   └── validators/           # Zod schemas
│       ├── authValidators.js
│       ├── pathValidators.js
│       ├── llmResponseSchema.js
│       └── activityValidators.js
│
├── client/                   # React frontend
│   ├── package.json
│   ├── index.html
│   ├── vite.config.js
│   ├── tailwind.config.js    # Galaxy color palette
│   ├── postcss.config.js
│   └── src/
│       ├── main.jsx
│       ├── App.jsx           # Routes + protected route wrapper
│       ├── index.css          # Galaxy theme + animations
│       ├── api/axios.js      # Axios with JWT interceptors
│       ├── context/AuthContext.jsx
│       ├── hooks/
│       │   ├── usePaths.js
│       │   └── useStreak.js
│       ├── components/
│       │   ├── common/       # Starfield, ProgressRing, Modal, Toast, BadgeCard
│       │   ├── dashboard/    # PathCard, StreakHeatmap, TodayTask
│       │   ├── comparison/   # ComparisonChart
│       │   └── onboarding/   # GoalInputForm
│       └── pages/
│           ├── Login.jsx
│           ├── Signup.jsx
│           ├── ForgotPassword.jsx
│           ├── Dashboard.jsx
│           ├── PathDetail.jsx
│           └── Compare.jsx
```

---

## ✨ Features

- 🎯 AI-generated career roadmaps (powered by Groq / Llama-3)
- 📊 Multi-path comparison with bar & radar charts (Recharts)
- 🔥 Daily streaks with 30-day heatmap
- 🏆 Gamification badges (7-day streak, 30-day streak, first milestone, etc.)
- 🗺️ Month-by-month timeline tracking with milestone completion
- 🔒 Production-grade JWT authentication (access + refresh token rotation)
- 🌌 Galaxy-themed dark UI with starfield background
- ⚠️ AI disclaimer shown everywhere estimates are displayed

---

## 🔌 API Endpoints

### Auth (no JWT required)
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/signup` | Create account |
| POST | `/api/auth/login` | Log in |
| POST | `/api/auth/refresh` | Refresh access token |
| POST | `/api/auth/logout` | Log out |
| POST | `/api/auth/forgot-password` | Request password reset |

### Career Paths (JWT required)
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/paths` | Create path (triggers AI) |
| GET | `/api/paths` | Get all user's paths |
| GET | `/api/paths/:id` | Get single path |
| PATCH | `/api/paths/:id` | Update status / set focus |
| DELETE | `/api/paths/:id` | Soft delete |
| GET | `/api/paths/compare?ids=id1,id2` | Compare 2-3 paths |
| PATCH | `/api/paths/:id/milestone/:mid` | Complete a milestone |

### Activity / Streaks / Badges (JWT required)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/activity/today` | Today's task + activities |
| POST | `/api/activity/checkin` | Daily check-in |
| GET | `/api/activity/streaks` | Streak data + 30-day history |
| GET | `/api/activity/badges` | User's earned badges |

---

## 🛡️ Security

- Passwords hashed with bcrypt (salt rounds: 12)
- JWT access tokens (15 min) + refresh tokens (7 days, httpOnly cookie, rotated)
- Rate limiting on auth routes (20 req / 15 min)
- Helmet.js security headers
- CORS locked to frontend origin
- Zod validation on all endpoints
- No stack traces or raw errors in production
- All secrets in `.env`, never hardcoded

---

## 🤝 Contributing

1. Fork the repo
2. Create a feature branch: `git checkout -b feature/your-feature`
3. Follow the setup guide above to get running locally
4. Make your changes
5. Test thoroughly
6. Commit: `git commit -m "Add your feature"`
7. Push: `git push origin feature/your-feature`
8. Open a Pull Request

**⚠️ Never commit `.env` files or API keys. The `.gitignore` protects against this, but double-check before pushing.**

---

## 📜 License

MIT