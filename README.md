# Vidyarth

An open e-book platform where users can discover, read, and contribute digital books. Admins review and approve all submissions before they become publicly available.

---

## Table of Contents

- [Overview](#overview)
- [Architecture](#architecture)
- [Quick Start](#quick-start)
- [Environment Variables](#environment-variables)
- [Project Structure](#project-structure)
- [User Roles](#user-roles)
- [Deployment](#deployment)
- [Contributing](#contributing)

---

## Overview

Vidyarth is a full-stack web application built with:

| Layer    | Technology                                      |
|----------|-------------------------------------------------|
| Frontend | React 19, TypeScript, Vite, Tailwind CSS        |
| Backend  | Node.js, Express, TypeScript                    |
| Database | Supabase (PostgreSQL)                           |
| Storage  | Supabase Storage (cover images + e-book files)  |
| Auth     | JWT (JSON Web Tokens)                           |

Key features:
- Browse and read approved e-books (EPUB, MOBI, AZW3)
- User registration and login with role-based access
- Contribute books (anonymous or attributed); all contributions enter a pending review queue
- Admins approve/reject submissions, manage users, and view platform statistics
- Per-book reviews and ratings
- Favorite books list
- In-browser text translation
- Activity logging for every significant user action

---

## Architecture

```
┌──────────────────────────────┐        ┌──────────────────────────────┐
│         Frontend             │        │          Backend             │
│  React + Vite (port 5173)    │──────▶ │  Express + TypeScript        │
│                              │  HTTP  │  (port 8080)                 │
└──────────────────────────────┘        └──────────┬───────────────────┘
                                                   │
                                         ┌─────────▼──────────┐
                                         │   Supabase Cloud    │
                                         │  PostgreSQL + Storage│
                                         └────────────────────┘
```

The frontend communicates with the backend exclusively through the REST API at `http://localhost:8080/api`. Authentication uses a JWT token sent in the `x-auth-token` request header.

---

## Quick Start

### Prerequisites

- Node.js 18 or later
- A [Supabase](https://supabase.com) project (free tier is sufficient)

### 1. Clone the repository

```bash
git clone https://github.com/MR-0312/Vidyarth.git
cd Vidyarth
```

### 2. Set up the database

Run the SQL in `backend/db/schema.sql` against your Supabase project (SQL Editor → paste → Run).

### 3. Configure the backend

```bash
cd backend
cp .env.example .env   # create from template if available, otherwise create manually
```

Edit `backend/.env` (see [Environment Variables](#environment-variables)).

```bash
npm install
npm run dev          # starts on http://localhost:8080
```

### 4. Configure the frontend

```bash
cd frontend
npm install
npm run dev          # starts on http://localhost:5173
```

Open `http://localhost:5173` in your browser.

---

## Environment Variables

### Backend (`backend/.env`)

| Variable                  | Required | Description                                                  |
|---------------------------|----------|--------------------------------------------------------------|
| `SUPABASE_URL`            | ✅       | Supabase project URL (e.g. `https://xxxx.supabase.co`)       |
| `SUPABASE_SERVICE_ROLE_KEY` | ✅     | Supabase service-role secret key                             |
| `JWT_SECRET`              | ✅       | A long random string used to sign JWT tokens                 |
| `PORT`                    | ❌       | HTTP port for the server (default: `8080`)                   |
| `ADMIN_SETUP_TOKEN`       | ❌       | Optional token required to call `POST /api/auth/setup-admin` |
| `NODE_ENV`                | ❌       | Set to `production` to hide error details from API responses |

The server will refuse to start if `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, or `JWT_SECRET` are missing.

### Frontend

The frontend currently hard-codes the API base URL as `http://localhost:8080/api` inside `frontend/src/context/AuthContext.tsx`. Update that constant (or introduce a `.env` file with `VITE_API_BASE_URL`) when deploying to a non-local environment.

---

## Project Structure

```
Vidyarth/
├── backend/                 # Express API server
│   ├── db/
│   │   ├── schema.sql       # PostgreSQL table definitions
│   │   ├── queries.ts       # All database query helpers
│   │   └── supabase.ts      # Supabase client initialisation
│   ├── middleware/
│   │   ├── auth.ts          # JWT authentication middleware
│   │   ├── admin.ts         # Admin-role guard middleware
│   │   ├── upload.ts        # Multer file-upload middleware
│   │   └── activityLogger.ts# Per-request activity logger
│   ├── models/
│   │   └── index.ts         # TypeScript interfaces for DB models
│   ├── routes/
│   │   ├── auth.ts          # /api/auth
│   │   ├── users.ts         # /api/users
│   │   ├── books.ts         # /api/books
│   │   ├── favorites.ts     # /api/favorites
│   │   ├── reviews.ts       # /api/reviews
│   │   ├── analytics.ts     # /api/analytics
│   │   ├── contributions.ts # /api/contributions
│   │   ├── translation.ts   # /api/translate
│   │   └── admin.ts         # /api/admin
│   ├── services/
│   │   ├── storageService.ts      # Supabase Storage helpers
│   │   ├── loggingService.ts      # User activity logging
│   │   ├── ebookParserService.ts  # EPUB/MOBI/AZW3 chapter extraction
│   │   ├── chapterParsingService.ts
│   │   ├── translationService.ts  # Google Translate integration
│   │   └── tokenBlacklist.ts      # In-memory JWT blacklist
│   ├── server.ts            # App entry point
│   ├── tsconfig.json
│   └── package.json
│
├── frontend/                # React + Vite SPA
│   ├── src/
│   │   ├── components/      # Shared UI components
│   │   ├── pages/           # Full-page route components
│   │   ├── context/         # React context providers
│   │   ├── services/        # API call helpers
│   │   ├── store/           # Zustand state stores
│   │   ├── hooks/           # Custom React hooks
│   │   ├── styles/          # Global CSS files
│   │   ├── utils/           # Utility functions
│   │   ├── constants/       # Shared constants
│   │   └── lib/             # Third-party library wrappers
│   ├── App.tsx              # Root component with routing
│   ├── vite.config.ts
│   └── package.json
│
├── backend/README.md        # Backend API reference
├── frontend/README.md       # Frontend component reference
└── README.md                # This file
```

---

## User Roles

| Role    | Capabilities                                                                                  |
|---------|-----------------------------------------------------------------------------------------------|
| `user`  | Browse books, read approved books, upload contributions, write reviews, manage favorites       |
| `admin` | Everything a user can do **plus** approve/reject books, manage user roles, view admin stats   |

### Promoting the first admin

After registering a normal account, call the setup endpoint once:

```bash
curl -X POST http://localhost:8080/api/auth/setup-admin \
  -H "Content-Type: application/json" \
  -d '{"email":"you@example.com","password":"yourpassword"}'
```

If `ADMIN_SETUP_TOKEN` is set in the backend `.env`, include `"adminToken":"<value>"` in the request body.

---

## Deployment

### Backend

```bash
cd backend
npm run build        # compiles TypeScript to dist/
npm start            # runs dist/server.js
```

Set all required environment variables in your hosting environment before starting.

### Frontend

```bash
cd frontend
npm run build        # outputs static files to dist/
```

Serve the `frontend/dist/` directory from any static host (e.g. Vercel, Netlify, or Nginx). Ensure your hosting environment proxies or rewrites API calls to the running backend.

---

## Contributing

1. Fork the repository and create a feature branch.
2. Make your changes with clear, focused commits.
3. Ensure both backend (`npm run dev`) and frontend (`npm run dev`) start without errors.
4. Open a pull request with a short description of what changed and why.

For details on the frontend components see [frontend/README.md](frontend/README.md).  
For the full API reference see [backend/README.md](backend/README.md).
