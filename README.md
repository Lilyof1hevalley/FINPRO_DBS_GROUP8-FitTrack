# FitTrack

> Database Systems Practicum — Final Project 2025/2026  
> Kelompok 8 · Nadira Fayyaza Aisy · Naufal Rafif · Muhammad Risyad Ali · Syifa Sarah Nuraini  

A full-stack fitness tracking platform built on a relational core. FitTrack turns every logged set into structured insight — strength trends, personal records, weekly volume, and personalised workout recommendations — all driven by a normalised PostgreSQL schema.

---

## Table of Contents

- [Overview](#overview)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Database Design](#database-design)
- [API Reference](#api-reference)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [Features](#features)
- [SOP Compliance](#sop-compliance)
- [Known Limitations & Roadmap](#known-limitations--roadmap)
- [Contributors](#contributors)

---

## Overview

People train regularly, but their effort ends up scattered — sets, reps, weight, duration across notebooks and memory. Without a system of record, progress is invisible. FitTrack fixes that.

At its core: a normalised PostgreSQL schema wrapped in a secure Express REST API, consumed by a React SPA. Every time a user logs a set, it becomes a structured row that feeds charts, personal records, and recommendations the next time they open the app.

---

## Tech Stack

**Frontend**
- React 18 + Vite
- React Router 6 (client-side routing, protected views)
- Recharts (progress charts and analytics)
- Axios (HTTP client with centralised JWT attachment)
- react-hot-toast (async feedback)
- CSS Modules (scoped, per-page styling)

**Backend**
- Express 5 (REST API)
- jsonwebtoken + bcryptjs (stateless auth, password hashing)
- express-validator (declarative input validation)
- helmet + cors (security headers, origin control)
- pg (PostgreSQL client, pooled connections)

**Data & External Services**
- PostgreSQL hosted on Neon (serverless, cloud)
- Google Identity (OAuth 2.0 sign-in)
- YouTube Data API v3 (workout video recommendations)
- Resend (transactional email for password reset)

---

## Project Structure

```
FINPRO_DBS_GROUP8-FitTrack/
│
├── Backend/
│   ├── src/
│   │   ├── app.js                  # Express entry point
│   │   ├── controllers/
│   │   │   ├── authController.js
│   │   │   ├── exerciseController.js
│   │   │   ├── logController.js
│   │   │   ├── progressController.js
│   │   │   ├── recommendationController.js
│   │   │   ├── userController.js
│   │   │   └── workoutController.js
│   │   ├── db/
│   │   │   ├── migrate.js          # Schema + seed (transactional)
│   │   │   └── pool.js             # pg connection pool
│   │   ├── middleware/
│   │   │   ├── auth.js             # JWT verification
│   │   │   └── errorHandler.js     # Global error + validation handler
│   │   ├── routes/
│   │   │   ├── auth.js
│   │   │   ├── users.js
│   │   │   ├── workouts.js
│   │   │   ├── progress.js
│   │   │   └── misc.js             # /recommendations + /exercises
│   │   └── services/
│   │       ├── emailService.js     # Resend integration
│   │       └── youtubeService.js   # YouTube API query builder + cache
│   ├── package.json
│   └── env                         # Rename to .env before running
│
└── Frontend/
    ├── index.html
    ├── vite.config.js
    └── src/
        ├── App.jsx                 # Route declarations
        ├── main.jsx
        ├── index.css
        ├── api/
        │   ├── client.js           # Axios instance (auto-attaches JWT)
        │   └── services.js         # API call functions
        ├── components/
        │   ├── AppLayout.jsx       # Auth guard wrapper
        │   ├── Sidebar.jsx
        │   └── TopBar.jsx
        ├── context/
        │   └── AuthContext.jsx     # Global auth state
        └── pages/
            ├── Login.jsx
            ├── Signup.jsx
            ├── Dashboard.jsx
            ├── Workouts.jsx
            ├── WorkoutNew.jsx
            ├── WorkoutDetail.jsx
            ├── Progress.jsx
            ├── Exercises.jsx
            ├── Recommendations.jsx
            ├── Profile.jsx
            ├── Settings.jsx
            ├── ForgotPassword.jsx
            └── ResetPassword.jsx
```

---

## Database Design

Five tables, all with referential integrity enforced at the database layer.

```
users
  id · username (UNIQUE) · email (UNIQUE) · password_hash
  full_name · age CHECK(1–119) · weight_kg · height_cm
  experience_level ENUM · fitness_goal ENUM
  created_at · updated_at

exercises
  id · name (UNIQUE) · muscle_group · category · description

workout_sessions
  id · user_id FK→users CASCADE
  title · notes · duration_min
  started_at TIMESTAMPTZ · ended_at TIMESTAMPTZ

workout_logs
  id · session_id FK→workout_sessions CASCADE
  exercise_id FK→exercises
  set_number · reps · weight_kg · duration_sec · notes

youtube_recommendations
  id · user_id FK→users CASCADE
  video_id · title · channel_title · thumbnail_url · published_at
```

**Key design decisions:**

- `experience_level` and `fitness_goal` are first-class `ENUM` types — invalid values are rejected at the database layer, not just in application code.
- Every foreign key has an index. Queries on workout history and analytics stay fast as data grows.
- `ON DELETE CASCADE` throughout — deleting a user atomically removes their sessions, logs, and cached video recommendations.
- Schema runs inside `BEGIN / COMMIT` with `ROLLBACK` on failure, using `IF NOT EXISTS` for idempotency. Safe to re-run.
- `TIMESTAMPTZ` and `NUMERIC` types are used intentionally so SQL can do aggregation (weekly volume, strength trends, frequency) without any transformation in application code.

---

## API Reference

Base URL: `http://localhost:3000/api`

All routes except `/auth/*` require a `Authorization: Bearer <token>` header.

**Auth** — `/api/auth`

| Method | Path | Description |
|--------|------|-------------|
| POST | `/register` | Register with email + password |
| POST | `/login` | Login, returns JWT |
| POST | `/google` | Google OAuth login |
| POST | `/forgot-password` | Send password reset email |
| POST | `/reset-password` | Consume token, set new password |

**Users** — `/api/users`

| Method | Path | Description |
|--------|------|-------------|
| GET | `/me` | Get current user profile |
| PATCH | `/me` | Update profile |
| DELETE | `/me` | Delete account |

**Workouts** — `/api/workouts`

| Method | Path | Description |
|--------|------|-------------|
| POST | `/` | Create a new session |
| GET | `/` | List all user sessions |
| GET | `/:id` | Get session with logs |
| PATCH | `/:id` | Update session metadata |
| DELETE | `/:id` | Delete session |
| POST | `/:sessionId/logs` | Add a single set |
| POST | `/:sessionId/logs/bulk` | Add multiple sets (transactional) |
| DELETE | `/:sessionId/logs/:logId` | Remove a set |

**Progress** — `/api/progress`

| Method | Path | Description |
|--------|------|-------------|
| GET | `/strength` | Strength over time (max weight per day per exercise) |
| GET | `/volume` | Weekly volume (SUM weight × reps, bucketed by week) |
| GET | `/records` | Personal records (best set per exercise) |
| GET | `/frequency` | Sessions and total minutes per week |

**Recommendations** — `/api/recommendations`

| Method | Path | Description |
|--------|------|-------------|
| GET | `/` | Fetch fresh videos from YouTube (uses profile) |
| GET | `/cached` | Return cached videos (zero API quota used) |

**Exercises** — `/api/exercises`

| Method | Path | Description |
|--------|------|-------------|
| GET | `/` | List all exercises in the catalog |

**Health**

| Method | Path | Description |
|--------|------|-------------|
| GET | `/health` | Returns `{ status: "ok", timestamp }` |

---

## Getting Started

### Prerequisites

- Node.js 18+
- A PostgreSQL database (Neon or local)
- Google Cloud project with OAuth 2.0 credentials and YouTube Data API v3 enabled
- A Resend account for transactional email

### 1. Clone the repo

```bash
git clone https://github.com/your-repo/FINPRO_DBS_GROUP8-FitTrack.git
cd FINPRO_DBS_GROUP8-FitTrack
```

### 2. Set up the backend

```bash
cd Backend
cp env .env          # fill in your values (see Environment Variables below)
npm install
npm run db:migrate   # creates all tables and seeds exercise data
npm run dev          # starts on http://localhost:3000
```

### 3. Set up the frontend

```bash
cd ../Frontend
npm install
npm run dev          # starts on http://localhost:5173
```

Open `http://localhost:5173` in your browser.

---

## Environment Variables

Rename `Backend/env` to `Backend/.env` and fill in the values below. Never commit this file.

```env
NODE_ENV=development

# PostgreSQL (Neon or local)
PGHOST=your-neon-host
PGDATABASE=your-db-name
PGUSER=your-db-user
PGPASSWORD=your-db-password
PGSSLMODE=require

# Google OAuth
GOOGLE_CLIENT_ID=your-google-client-id

# YouTube Data API v3
YOUTUBE_API_KEY=your-youtube-api-key

# Resend (transactional email)
RESEND_API_KEY=your-resend-api-key
FRONTEND_URL=http://localhost:5173

# JWT
JWT_SECRET=a-long-random-secret-string
```

---

## Features

**Accounts & Profiles**
Sign up with email/password or continue with Google. Profile stores fitness goal, experience level, age, weight, and height. All of these feed into personalised recommendations.

**Workout Logging**
Create a session, then log sets against any exercise in the catalog. Single-set and bulk-insert modes are available. Bulk insert wraps all sets in a single database transaction — either everything is saved or nothing is.

**Live Session View**
An elapsed timer and a between-set rest timer run client-side while you train. Logging doesn't interrupt the timer.

**Progress Analytics**
Four SQL-powered views: strength over time (max weight per day per exercise), weekly volume (sum of weight × reps bucketed by ISO week), personal records (best set ever per exercise), and training frequency (sessions and total minutes per week). Rendered with Recharts.

**Smart Recommendations**
The recommendation engine reads `fitness_goal`, `experience_level`, and a target muscle group from the user's profile, builds a natural-language search query, and fetches up to 8 YouTube videos via the Data API v3. Results are cached per user in PostgreSQL. A `/cached` endpoint serves stored videos with zero API quota — and acts as a graceful fallback if the live fetch fails.

**Security**
- Passwords hashed with bcrypt at cost factor 12
- Stateless JWT sessions (7-day expiry), Bearer token on every protected route
- Google OAuth tokens verified server-side
- Password reset via single-use crypto token with 1-hour expiry (generic response prevents account enumeration)
- 100% parameterised SQL — no string concatenation, no SQL injection surface
- `helmet` sets secure HTTP headers; `cors` restricts allowed origins; a centralised error handler prevents internal details from leaking

---

## SOP Compliance

| Requirement | How FitTrack delivers | Status |
|---|---|---|
| Database system implementation | Full-stack web application |  Met |
| Minimum 3 tables | 5 normalised tables |  Exceeded |
| Managed with PostgreSQL | PostgreSQL on Neon (cloud) | Met |
| UML · Flowchart · ERD | Included in deliverables and presentation |  Met |
| Database dump (.sql) | Exported and included in repo |  Met |
| Report PPT · ReadMe | Presentation + this file |  Met |
| Library/framework usage | React, Express, Recharts, pg, etc. |  Met |
| Tidy GitHub repository | Structured Backend / Frontend split |  Met |

---

## Known Limitations & Roadmap

Things we're aware of and plan to fix:

- **Secrets management** — rotate any keys that were committed and move everything to an untracked `.env` going forward
- **Redis cache** — recommendations currently cache to PostgreSQL; Redis would reduce DB load and is a noted SOP bonus
- **Pagination** — analytics endpoints return full result sets; server-side pagination needed at scale
- **Automated tests** — no unit or integration tests yet for controllers and critical SQL paths
- **Calorie estimation** — currently uses a constant; should be derived from actual exercise metadata and body metrics

---

## Contributors

| Name | Role |
|---|---|
| Nadira Fayyaza Aisy |Full-stack, Database Design |
| Naufal Rafif | Frontend, API Integration |
| Moss | Backend, Auth & Security |
| risyad | UI/UX, Documentations |

---

*Database Systems Practicum · Final Project 2025/2026 · Kelompok 8*
