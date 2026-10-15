# FutureEra — AI Career Path Simulator

An AI-powered decision-support platform that helps users choose and pursue career goals. The app generates personalized month-by-month roadmaps, tracks daily progress through streaks and milestones, provides curated learning resources, offers job opportunities, and enables users to run multiple career paths in parallel with realistic time/cost/reward estimates.

> **Important:** FutureEra generates structured, assumption-based guidance framed as decision-support — never a guarantee.

---

## 🌟 Features

### Core Features
- 🎯 **AI-Generated Career Roadmaps** — Powered by Groq API (Llama-3) to create personalized career paths
- 📚 **Curated Learning Resources** — Real YouTube links, courses, and documentation for each milestone
- 💼 **Job Opportunities** — Access to real job boards and company career pages when milestones are completed
- 📊 **Multi-Path Comparison** — Compare 2-3 career paths side-by-side with visual charts
- 🔥 **Daily Streaks & Gamification** — 30-day heatmap tracking with achievement badges
- 🗺️ **Timeline Tracking** — Month-by-month milestone completion with progress visualization
- 🤖 **AI Mentor Chat** — "Evolve Me" — chat with your future self for personalized guidance
- 👥 **Community Features** — Connect with peers pursuing similar career goals
- 🌌 **Beautiful Galaxy-Themed UI** — Dark mode with starfield background and light mode support
- 📄 **PDF Export** — Generate detailed career path reports

### Authentication & Security
- 🔒 Production-grade JWT authentication (access + refresh token rotation)
- 📧 Password reset via email (Nodemailer with Gmail SMTP)
- 🛡️ Password hashing with bcrypt (12 salt rounds)
- ⚡ Rate limiting on sensitive routes
- 🎫 httpOnly cookies for refresh tokens

### Advanced Features
- 🎨 **Landing Page** — Modern landing page with hero section and feature highlights
- 🏷️ **Branding** — Custom logo throughout the application
- 🌓 **Theme Toggle** — Switch between dark (Galaxy) and light themes
- 📈 **Progress Analytics** — Timeline health, pace tracking, and completion statistics
- 🎯 **Focus Path** — Set a primary career path for concentrated effort
- 📊 **Peer Benchmarking** — Compare your progress with peers

---

## 🏗️ Architecture

### System Overview

```
┌─────────────────────────────────────────────────────────────┐
│                         Frontend (React)                    │
│  ┌─────────────────────────────────────────────────────┐  │
│  │  UI Components │ State Management │ Routing          │  │
│  │  - Pages       │ Context API        │ React Router    │  │
│  │  - Components │ Custom Hooks      │ Protected Routes │  │
│  └─────────────────────────────────────────────────────┘  │
│                          │                                 │
│                          ▼                                 │
│                   Axios (HTTP Client)                      │
│                          │                                 │
└──────────────────────────┼─────────────────────────────────┘
                           │ HTTP/JSON
                           ▼
┌─────────────────────────────────────────────────────────────┐
│                      Backend (Express)                      │
│  ┌─────────────────────────────────────────────────────┐  │
│  │  Middleware Layer                                   │  │
│  │  - Auth (JWT verification)                          │  │
│  │  - Rate Limiting                                    │  │
│  │  - Validation (Zod)                                 │  │
│  │  - Error Handling                                   │  │
│  └─────────────────────────────────────────────────────┘  │
│                          │                                 │
│  ┌─────────────────────────────────────────────────────┐  │
│  │  Controllers (Business Logic)                       │  │
│  │  - AuthController          │ PathController         │  │
│  │  - ActivityController       │ CommunityController    │  │
│  └─────────────────────────────────────────────────────┘  │
│                          │                                 │
│  ┌─────────────────────────────────────────────────────┐  │
│  │  Services (External Integrations)                   │  │
│  │  - LLM Service (Groq API)    │ Email Service         │  │
│  │  - Badge Service            │ Streak Service        │  │
│  └─────────────────────────────────────────────────────┘  │
│                          │                                 │
└──────────────────────────┼─────────────────────────────────┘
                           │
          ┌────────────────┼────────────────┐
          ▼                ▼                ▼
    ┌──────────┐    ┌──────────┐    ┌──────────┐
    │ MongoDB │    │  Groq    │    │  Gmail   │
    │ (Mongoose)│   │   API    │    │   SMTP   │
    └──────────┘    └──────────┘    └──────────┘
```

### Data Flow

1. **User creates a career goal**
   - Frontend sends goal + profile to `/api/paths`
   - Backend validates with Zod
   - LLM Service calls Groq API to generate roadmap
   - Response validated against schema
   - CareerPath saved to MongoDB
   - Frontend receives structured roadmap

2. **User completes a milestone**
   - Frontend sends PATCH to `/api/paths/:id/milestone/:mid`
   - Backend updates CareerPath document
   - Badge Service checks for achievement eligibility
   - Streak Service updates daily activity
   - Frontend receives updated path data

3. **Password reset flow**
   - User submits email on Forgot Password page
   - Backend generates secure token (crypto.randomBytes)
   - Token hashed and saved to User document with 30min expiry
   - Email Service sends reset link via Gmail SMTP
   - User clicks link → opens Reset Password page
   - User submits new password
   - Backend validates token and updates password
   - All user sessions invalidated

---

## 🛠️ Tech Stack

### Frontend
| Technology | Version | Purpose |
|-------------|---------|---------|
| **React** | 18.3.1 | UI Framework |
| **Vite** | 5.4.0 | Build tool & dev server |
| **React Router** | 6.26.0 | Client-side routing |
| **Tailwind CSS** | 3.4.7 | Utility-first CSS |
| **Axios** | 1.7.0 | HTTP client |
| **Recharts** | 2.12.0 | Data visualization |
| **jsPDF** | 4.2.1 | PDF generation |
| **React Icons** | 5.3.0 | Icon library |
| **Zod** | 3.23.8 | Runtime validation |

### Backend
| Technology | Version | Purpose |
|-------------|---------|---------|
| **Node.js** | 20.x | Runtime environment |
| **Express** | 4.21.0 | Web framework |
| **MongoDB** | 6+ | NoSQL database |
| **Mongoose** | 8.7.0 | ODM for MongoDB |
| **Groq SDK** | 0.7.0 | AI API client (Llama-3) |
| **bcryptjs** | 2.4.3 | Password hashing |
| **jsonwebtoken** | 9.0.2 | JWT authentication |
| **Nodemailer** | 6.9.13 | Email sending (Gmail SMTP) |
| **Helmet** | 7.1.0 | Security headers |
| **express-rate-limit** | 7.4.0 | Rate limiting |
| **Zod** | 3.23.8 | Schema validation |

### Database Models
- **User** — Authentication, streaks, badges, focus path
- **CareerPath** — Career goals, roadmaps, milestones, estimates
- **DailyActivity** — Daily check-ins and task completion
- **StreakLog** — Streak history for analytics
- **Badge** — Achievement definitions
- **CommunityMessage** — Peer chat messages

---

## 📁 Project Structure

```
CAPSTONE/
├── .env.example              # Template for environment variables
├── .gitignore                # Ensures .env and node_modules are NOT committed
├── README.md
│
├── server/                   # Express backend
│   ├── .env                  # YOUR secrets (never committed, create from .env.example)
│   ├── package.json
│   ├── index.js              # App entry point
│   ├── config/
│   │   ├── db.js             # MongoDB connection
│   │   └── env.js            # Environment variable loader
│   ├── models/               # Mongoose schemas
│   │   ├── User.js           # User authentication & profile
│   │   ├── CareerPath.js     # Career goals & roadmaps
│   │   ├── DailyActivity.js  # Daily check-ins
│   │   ├── StreakLog.js      # Streak history
│   │   ├── Badge.js          # Achievement definitions
│   │   └── CommunityMessage.js # Peer chat
│   ├── controllers/          # Route handlers
│   │   ├── authController.js      # Signup, login, logout, password reset
│   │   ├── pathController.js      # CRUD for career paths
│   │   ├── activityController.js  # Streaks, check-ins, badges
│   │   └── communityController.js # Peer chat
│   ├── routes/
│   │   ├── auth.js           # Auth endpoints
│   │   ├── paths.js          # Career path endpoints
│   │   ├── activity.js       # Activity endpoints
│   │   └── community.js      # Community endpoints
│   ├── middleware/
│   │   ├── auth.js           # JWT verification
│   │   ├── rateLimiter.js    # Rate limiting
│   │   ├── errorHandler.js  # Centralized error handling
│   │   └── validate.js       # Zod validation middleware
│   ├── services/
│   │   ├── llmService.js     # Groq API integration (roadmap generation & mentor chat)
│   │   ├── emailService.js   # Nodemailer email sending
│   │   ├── badgeService.js   # Badge awarding logic
│   │   └── streakService.js # Streak calculation
│   ├── validators/           # Zod schemas
│   │   ├── authValidators.js
│   │   ├── pathValidators.js
│   │   ├── llmResponseSchema.js
│   │   └── activityValidators.js
│   └── seed.js               # Database seeding script
│
├── client/                   # React frontend
│   ├── public/               # Static assets
│   │   ├── logo.png          # Brand logo
│   │   └── dashboard-illustration.jpg
│   ├── package.json
│   ├── index.html
│   ├── vite.config.js
│   ├── tailwind.config.js    # Galaxy color palette
│   ├── postcss.config.js
│   └── src/
│       ├── main.jsx          # React entry point
│       ├── App.jsx           # Routes + protected route wrapper
│       ├── index.css         # Galaxy theme + animations
│       ├── api/
│       │   └── axios.js      # Axios with JWT interceptors
│       ├── context/
│       │   ├── AuthContext.jsx    # Authentication state
│       │   └── ThemeContext.jsx  # Dark/light theme
│       ├── hooks/
│       │   ├── usePaths.js       # Career path hooks
│       │   └── useStreak.js      # Streak & activity hooks
│       ├── data/
│       │   ├── milestoneResources.js  # Real learning resources (YouTube, courses)
│       │   └── jobResources.js      # Real job board links
│       ├── components/
│       │   ├── common/       # Starfield, ProgressRing, Modal, Toast, BadgeCard
│       │   │   ├── ResourcesModal.jsx  # Learning resources modal
│       │   │   └── JobOffersModal.jsx  # Job opportunities modal
│       │   ├── dashboard/    # PathCard, StreakHeatmap, TodayTask
│       │   ├── comparison/   # ComparisonChart
│       │   ├── community/    # ChatWindow, MemberList
│       │   ├── landing/      # LandingHero
│       │   └── onboarding/   # GoalInputForm
│       │   ├── MentorChat.jsx  # AI mentor chat component
│       │   └── PeerBenchmark.jsx
│       └── pages/
│           ├── Landing.jsx         # Landing page
│           ├── Login.jsx           # Login page
│           ├── Signup.jsx          # Signup page
│           ├── ForgotPassword.jsx  # Password reset request
│           ├── ResetPassword.jsx   # Password reset form
│           ├── Dashboard.jsx       # Main dashboard
│           ├── PathDetail.jsx      # Career path details
│           ├── Compare.jsx         # Path comparison
│           └── Community.jsx       # Peer community
```

---

## 🚀 Getting Started

### Prerequisites

| Tool | Version | Download |
|------|---------|----------|
| **Node.js** | 18+ (recommended: 20.x) | [nodejs.org](https://nodejs.org/) |
| **MongoDB** | 6+ (Community Server) | [mongodb.com/try/download](https://www.mongodb.com/try/download/community) |
| **Git** | Any recent version | [git-scm.com](https://git-scm.com/) |
| **Groq API Key** | Free tier | [console.groq.com/keys](https://console.groq.com/keys) |
| **Gmail App Password** | (for password reset) | See setup below |

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
Copy-Item .env.example server\.env
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

# Email Configuration (Gmail SMTP) — for password reset
EMAIL_USER=youraddress@gmail.com
EMAIL_APP_PASSWORD=your16characterapppassword
EMAIL_FROM_NAME=FutureEra

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
| `EMAIL_USER` | Your Gmail address for sending password reset emails |
| `EMAIL_APP_PASSWORD` | Gmail App Password (see below) |
| `PORT` | Keep as `5000` unless you have a conflict. |
| `CLIENT_URL` | Keep as `http://localhost:5173` for local dev. |

#### Setting up Gmail App Password (for password reset)

1. Go to the Google account that will send emails
2. Enable 2-Step Verification (required for App Passwords)
3. Go to: Google Account → Security → 2-Step Verification → App passwords
4. Create a new app password named "FutureEra"
5. Copy the 16-character password Google generates
6. Add it to your `.env` file as `EMAIL_APP_PASSWORD`

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

Go to **http://localhost:5173** — you should see the FutureEra landing page with the beautiful galaxy theme!

Sign up with any email/password to get started.

---

## 🔌 API Endpoints

### Authentication (no JWT required)

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/signup` | Create account |
| POST | `/api/auth/login` | Log in (returns access token + sets refresh cookie) |
| POST | `/api/auth/refresh` | Refresh access token using refresh cookie |
| POST | `/api/auth/logout` | Log out (clears refresh cookie) |
| POST | `/api/auth/forgot-password` | Request password reset email |
| POST | `/api/auth/reset-password` | Reset password with token |
| GET | `/api/auth/me` | Get current user profile (JWT required) |

### Career Paths (JWT required)

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/paths` | Create path (triggers AI roadmap generation) |
| GET | `/api/paths` | Get all user's paths |
| GET | `/api/paths/:id` | Get single path details |
| PATCH | `/api/paths/:id` | Update status / set focus path |
| DELETE | `/api/paths/:id` | Soft delete (status: 'deleted') |
| GET | `/api/paths/compare?ids=id1,id2` | Compare 2-3 paths side-by-side |
| PATCH | `/api/paths/:id/milestone/:mid` | Complete a milestone |

### Activity / Streaks / Badges (JWT required)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/activity/today` | Today's task + recent activities |
| POST | `/api/activity/checkin` | Daily check-in (updates streak) |
| GET | `/api/activity/streaks` | Streak data + 30-day history |
| GET | `/api/activity/badges` | User's earned badges |

### Community (JWT required)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/community/:goalSlug/members` | Get members pursuing same goal |
| GET | `/api/community/:goalSlug/messages` | Get chat messages |
| POST | `/api/community/:goalSlug/messages` | Send chat message |

---

## 🛡️ Security

- **Password Security:** Hashed with bcrypt (12 salt rounds), never stored in plain text
- **JWT Authentication:** Access tokens (15 min) + refresh tokens (7 days, httpOnly cookie, rotated on each refresh)
- **Rate Limiting:** Configurable rate limiting on auth routes (20 req / 15 min)
- **Security Headers:** Helmet.js for HTTP security headers
- **CORS:** Locked to frontend origin only
- **Input Validation:** Zod validation on all endpoints
- **Error Handling:** No stack traces or raw errors in production
- **Secrets Management:** All secrets in `.env`, never hardcoded
- **Password Reset:** Secure token generation with 30-minute expiry
- **Email Security:** Gmail App Password (not regular password) for SMTP

---

## 🎨 Theme & UI

### Galaxy Dark Theme (Default)
- Background: Deep space (#05010F)
- Primary accent: Comet Violet (#8A5CFF)
- Success: Aurora Teal (#00F0C0)
- Warning: Solar Amber (#FFB84D)
- Danger: Meteor Red (#FF5C7A)
- Animated starfield background
- Glass-morphism cards with subtle borders

### Light Theme
- Background: Clean white (#F8FAFC)
- Maintains accent colors
- Improved readability for bright environments
- Toggle via ThemeToggle component

---

## 🤖 AI Integration

### Groq API (Llama-3)

The app uses Groq's API to power two AI features:

1. **Roadmap Generation**
   - Takes user's career goal and profile
   - Generates structured JSON with:
     - Estimated duration, cost, and annual salary
     - Risk assessment
     - Month-by-month milestones with tasks
     - Assumptions and timeline
   - Validates response with Zod schema
   - Retries if salary format is incorrect

2. **Mentor Chat ("Evolve Me")**
   - Simulates user's future self
   - Provides personalized guidance based on:
     - Current progress
     - Completed milestones
     - Timeline health
     - Pace tracking
   - Context-aware responses
   - Encouraging but honest about progress

---

## 📊 Data Models

### User
```javascript
{
  name: String,
  email: String (unique),
  passwordHash: String (hashed),
  currentStreak: Number,
  longestStreak: Number,
  lastActiveDate: Date,
  totalBadgesEarned: [ObjectId],
  refreshToken: String,
  passwordResetToken: String,
  passwordResetExpires: Date,
  focusPathId: ObjectId
}
```

### CareerPath
```javascript
{
  userId: ObjectId,
  goalTitle: String,
  goalSlug: String,
  status: 'active' | 'paused' | 'completed' | 'deleted',
  estimatedMonths: Number,
  estimatedCostINR: Number,
  estimatedOutcomeSalaryINR: Number,
  riskLevel: 'low' | 'medium' | 'high',
  roadmap: [{
    month: Number,
    milestone: String,
    tasks: [String],
    completed: Boolean
  }],
  assumptions: String,
  monthsElapsed: Number,
  userProfile: { age, degree, budget, country },
  targetDuration: Number,
  durationUnit: 'Months' | 'Years',
  targetCompletionDate: Date,
  estimatedWeeklyHours: Number,
  currentPace: String,
  timelineHealth: String
}
```

---

## 🎯 Badge System

Achievement badges are awarded automatically:

| Badge | Requirement |
|-------|-------------|
| First Steps | Create your first career path |
| Week Warrior | 7-day streak |
| Month Master | 30-day streak |
| Milestone Champion | Complete 10 milestones |
| Path Pioneer | Complete an entire career path |
| Consistency King | 60-day streak |
| Roadmap Runner | Complete 50 milestones |

---

## 🧪 Testing the App

### Test Password Reset Flow

1. Go to Forgot Password page
2. Submit a real email you can access
3. Check your inbox (and spam folder) for the email
4. Click the link in the email
5. Confirm it lands on Reset Password page with the token
6. Set a new password
7. Confirm login works with the new password

### Test Resource System

1. Create a career path (e.g., "Become a Software Engineer")
2. Navigate to PathDetail page
3. Click "📚 Resources" on any milestone
4. Verify it shows relevant YouTube courses, documentation, and practice sites
5. Complete all milestones
6. Click "💼 View Job Opportunities"
7. Verify it shows real job boards and company career pages

---

## 🐛 Troubleshooting

### MongoDB Connection Issues
- Ensure MongoDB service is running
- Check `MONGODB_URI` in `.env`
- For Atlas, ensure IP whitelist includes your IP

### Email Not Sending
- Verify Gmail App Password is correct
- Ensure 2-Step Verification is enabled
- Check Gmail SMTP is not blocking (less secure apps must be enabled)
- Check server logs for Nodemailer errors

### AI Not Generating Roadmaps
- Verify `GROQ_API_KEY` is valid
- Check Groq API status
- Ensure internet connection is working
- Check server logs for LLM errors

### Frontend Build Issues
- Clear node_modules and reinstall: `rm -rf node_modules && npm install`
- Check Node.js version (18+ required)
- Verify Vite configuration

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

---

## 🙏 Acknowledgments

- **Groq** — For providing fast, free AI API access
- **Llama-3** — The underlying AI model powering our roadmap generation
- **React Community** — For the amazing ecosystem
- **Tailwind CSS** — For the utility-first CSS framework

---

## 📞 Support

For issues or questions, please open an issue on GitHub.

---

Built with ❤️ by PLAN
