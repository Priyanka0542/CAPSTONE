# FutureEra — AI Career Path Simulator

An AI-powered decision-support platform that helps users choose and pursue career goals. The app generates personalized month-by-month roadmaps, tracks daily progress through streaks and milestones, lets users run multiple career paths in parallel, compare them side by side, and shows realistic time/cost/reward estimates.

> **Important:** FutureEra generates structured, assumption-based guidance framed as decision-support — never a guarantee.

## Tech Stack

- **Frontend:** React (Vite) + Tailwind CSS + Recharts
- **Backend:** Node.js + Express
- **Database:** MongoDB (Mongoose)
- **Auth:** JWT (access + refresh tokens) + bcrypt
- **AI:** Groq API (Llama-3) for roadmap generation
- **Validation:** Zod on both frontend and backend

## Getting Started

### Prerequisites

- Node.js 18+
- MongoDB (local or Atlas)
- Groq API key

### Setup

1. Clone the repo and install dependencies:

```bash
# Server
cd server
cp .env.example .env   # Edit with your credentials
npm install

# Client
cd ../client
npm install
```

2. Configure environment variables in `server/.env`:

```
MONGODB_URI=mongodb://localhost:27017/futureera
JWT_ACCESS_SECRET=your_secret
JWT_REFRESH_SECRET=your_secret
GROQ_API_KEY=your_groq_key
CLIENT_URL=http://localhost:5173
```

3. Start both servers:

```bash
# Terminal 1 — Backend
cd server
npm run dev

# Terminal 2 — Frontend
cd client
npm run dev
```

4. Open http://localhost:5173

## Features

- 🎯 AI-generated career roadmaps
- 📊 Multi-path comparison with bar & radar charts
- 🔥 Daily streaks with 30-day heatmap
- 🏆 Gamification badges
- 🗺️ Month-by-month timeline tracking
- 🔒 Production-grade JWT authentication
- 🌌 Galaxy-themed dark UI

## Project Structure

```
futureera/
├── client/          # React frontend
│   └── src/
│       ├── api/         # Axios instance
│       ├── components/  # Common, dashboard, comparison, onboarding
│       ├── context/     # AuthContext
│       ├── hooks/       # usePaths, useStreak
│       └── pages/       # Login, Signup, Dashboard, PathDetail, Compare
├── server/          # Express backend
│   ├── config/      # DB & env config
│   ├── controllers/ # Route handlers
│   ├── middleware/   # Auth, rate limiter, error handler, validate
│   ├── models/      # Mongoose schemas
│   ├── routes/      # API routes
│   ├── services/    # LLM, badge, streak services
│   └── validators/  # Zod schemas
└── .env.example
```

## License

MIT