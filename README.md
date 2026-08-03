# FORGE — Hackathon Management System

FORGE is an all-in-one, production-ready MERN hackathon orchestration platform designed for organizers, participants, judges, and system administrators.

---

## 🛠️ Tech Stack

- **Frontend**: React 18, Vite, Tailwind CSS with custom Design Token system, Lucide Icons, Socket.io-client, Lenis Smooth Scroll.
- **Backend**: Node.js, Express.js, MongoDB (Mongoose), Socket.io (real-time events), JWT Authentication with httpOnly refresh cookies.
- **Validation**: Shared Zod schemas (`@forge/shared` workspace package).
- **Tooling**: npm Workspaces, Concurrently, ESLint, Prettier.

---

## 📁 Repository Folder Structure

```
Forge-capstone 3/
├── apps/
│   ├── client/                  # React 18 SPA (Vite + Tailwind CSS)
│   │   ├── src/
│   │   │   ├── components/      # UI components & story modules
│   │   │   ├── contexts/        # Auth, Socket, Theme, Notification contexts
│   │   │   ├── layouts/         # DashboardLayout shell
│   │   │   ├── pages/           # Role dashboards, hackathons, team, leaderboard, 404
│   │   │   ├── theme/           # design-tokens.css
│   │   │   └── App.jsx          # Primary routing & role guards
│   └── server/                  # Node.js / Express API Server
│       ├── src/
│       │   ├── config/          # Environment & Database connection
│       │   ├── middlewares/     # Auth, role check, error handling, validation
│       │   ├── models/          # Mongoose models (User, Hackathon, Team, Submission, etc.)
│       │   ├── routes/          # Express API route modules
│       │   ├── services/        # Business logic & services
│       │   └── socket/          # Socket.io room handlers
├── packages/
│   └── shared/                  # Shared Zod schemas & constants
├── scripts/
│   └── seed.js                  # Database seed script for development
├── .env.example                 # Environment variables reference
└── README.md                    # Project documentation
```

---

## 🚀 Environment Setup & Local Execution

### 1. Prerequisites
- Node.js (>= 20.0.0)
- MongoDB instance running locally (`mongodb://localhost:27017/forge`) or via MongoDB Atlas connection URI.

### 2. Environment Variables
Copy `.env.example` to `.env` in the root directory:
```bash
cp .env.example .env
```
Ensure `MONGODB_URI`, `ACCESS_TOKEN_SECRET`, and `REFRESH_TOKEN_SECRET` are configured.

### 3. Install Dependencies
Run npm install from the repository root to link workspaces:
```bash
npm install
```

### 4. Seed Seed Data
Populate MongoDB with initial test data (hackathons, users, teams, submissions):
```bash
npm run seed
```

### 5. Start Development Servers
Start both backend API (`http://localhost:5000`) and Vite frontend (`http://localhost:5173`) concurrently:
```bash
npm run dev
```

---

## 👥 Roles & Permissions Matrix

| Role | Access & Capabilities |
| :--- | :--- |
| **Participant** | Browse hackathons, register, create/join teams, access team workspace, submit projects, view leaderboards, collect verified certificates. |
| **Organizer** | Create & edit hackathons, manage registration queues, assign judges to submission review queues, publish final leaderboard results. |
| **Judge** | Access assigned submission queues, evaluate projects using multi-criterion weighted rubric scorecards. |
| **Admin** | Platform-wide administration, user management, audit logs, system-wide analytics overview. |

---

## ✨ Implemented Feature Summary (Spec Mapping)

- **Landing Page & Product Story**: Dynamic landing page built with Tailwind CSS design tokens and scroll-driven showcase sections.
- **Authentication & RBAC**: JWT access tokens + httpOnly refresh tokens, password reset flow, and role-gated routes (`ProtectedRoute.jsx` & `requireRole` middleware).
- **Hackathon Directory & Discovery**: Multi-filter search by mode (online/offline/hybrid), status, theme chips, and text search.
- **Organizing & Management**: Hackathon wizard form, deadline management, and status updates.
- **Team Workspace & Collaboration**: Real-time Socket.io team chat, invite member by email, leadership transfer, and member removal.
- **Project Submission & Versioning**: Multi-field submission forms with 10s auto-save, tech stack, screenshot URL arrays, and edit-before-deadline locks.
- **Blind Judging & Evaluation**: Judge review queues and multi-criteria scoring rubrics.
- **Leaderboards**: Ranked tournament standings sorting by average score and tie-breaker logic (`/hackathons/:slug/leaderboard`).
- **Verifiable Certificates**: Automated certificate generation on result publication with verification code endpoints.
- **404 Error Handling**: On-brand fallback page (`NotFoundPage.jsx`) for invalid routes.
