
<div align="center">

# DevLog

**A real-time, full-stack issue tracker for engineering teams.**

Kanban boards, live updates, and role-based access — built on the MERN stack.

[![Live Demo](https://img.shields.io/badge/demo-live-6C63FF?style=for-the-badge)](https://client-tan-omega-94.vercel.app)
![React](https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react&logoColor=black)
![Node](https://img.shields.io/badge/Node.js-Express_5-339933?style=flat-square&logo=node.js&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-Mongoose_9-47A248?style=flat-square&logo=mongodb&logoColor=white)
![Socket.io](https://img.shields.io/badge/Socket.io-Realtime-010101?style=flat-square&logo=socket.io&logoColor=white)
![License](https://img.shields.io/badge/license-ISC-lightgrey?style=flat-square)

**[Live Demo →](https://client-tan-omega-94.vercel.app)**

</div>

---

> **Status:** Frontend is deployed and live on Vercel. Backend API deployment is in progress — the demo link will be fully interactive once the API is connected. See [Deployment](#deployment) below.

## Overview

DevLog is a Linear/Jira-style issue tracker built to demonstrate a production-shaped MERN application: cookie-based JWT auth, a drag-and-drop Kanban workflow, live multi-client sync over WebSockets, and role-gated access control — all with a clean, custom-built UI (no component library).

## Features

| | |
|---|---|
| 🔐 **Authentication** | JWT in httpOnly cookies, bcrypt-hashed passwords, register / login / logout / session restore |
| 🗂️ **Kanban board** | Drag-and-drop issues across status columns (`@hello-pangea/dnd`) |
| ⚡ **Real-time sync** | Socket.io broadcasts issue changes instantly to every connected client |
| 🎯 **Issue tracking** | Create, edit, and triage issues with priority and status badges |
| 🛡️ **Role-based access control** | `admin` / `developer` roles, protected routes, scoped permissions |
| 📊 **Dashboard** | Live project metrics and activity at a glance |
| 👥 **Team management** | View and manage project members |

## Tech Stack

**Frontend**
React 19 · Vite · React Router v7 · Tailwind CSS v4 · Axios · Socket.io-client · react-hot-toast · lucide-react

**Backend**
Node.js · Express 5 · MongoDB · Mongoose 9 · Socket.io · JWT (`jsonwebtoken`) · `bcryptjs` · `cookie-parser` · `cors`

**Deployment**
Vercel (frontend) · Render (API) · MongoDB Atlas (database)

## Architecture

```
┌─────────────────┐        HTTPS / cookie-based JWT        ┌──────────────────┐
│   React + Vite   │ ───────────────────────────────────▶  │  Express 5 API   │
│   (Vercel)        │ ◀───────────────────────────────────  │  (Render)        │
└─────────────────┘        WebSocket (Socket.io)            └────────┬─────────┘
                                                                       │
                                                                       ▼
                                                              ┌──────────────────┐
                                                              │   MongoDB Atlas   │
                                                              └──────────────────┘
```

```
devlog/
├── client/   # React + Vite frontend
│   └── src/
│       ├── pages/        # Dashboard, Board, Login, Register, Team
│       ├── components/   # IssueCard, KanbanColumn, Sidebar, Navbar, ...
│       └── context/      # Auth + Socket providers
└── server/   # Express + MongoDB backend
    ├── routes/           # auth, projects, issues, users
    ├── models/           # User, Project, Issue
    ├── middleware/        # JWT verification
    └── socket/            # Real-time event handling
```

## Getting Started

### Prerequisites
- Node.js 18+
- A MongoDB instance ([MongoDB Atlas](https://www.mongodb.com/atlas) free tier works)

### 1. Clone & install
```bash
git clone https://github.com/Learnee-debug/Devlog.git
cd Devlog/devlog
npm run install:all
```

### 2. Configure environment variables

Create `server/.env`:
```env
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
CLIENT_URL=http://localhost:5173
PORT=5000
NODE_ENV=development
```

### 3. Seed sample data (optional)
```bash
npm run seed
```
Creates two demo accounts:

| Email | Password | Role |
|---|---|---|
| `admin@devlog.com` | `password123` | admin |
| `dev@devlog.com` | `password123` | developer |

### 4. Run locally
```bash
npm run dev:server   # API → http://localhost:5000
npm run dev:client   # App → http://localhost:5173
```

## API Reference

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/auth/register` | Create a new account |
| `POST` | `/api/auth/login` | Log in, sets auth cookie |
| `POST` | `/api/auth/logout` | Clear auth cookie |
| `GET` | `/api/auth/me` | Get the current authenticated user |
| `GET` `POST` | `/api/projects` | List / create projects |
| `GET` `POST` `PATCH` | `/api/issues` | List / create / update issues |
| `GET` | `/api/users` | List team members |
| `GET` | `/api/health` | Health check |

## Deployment

- **Frontend** — deployed on [Vercel](https://client-tan-omega-94.vercel.app), auto-builds from `client/`
- **Backend** — designed for [Render](https://render.com) (root: `server/`, build: `npm install`, start: `npm start`)
- **Database** — [MongoDB Atlas](https://www.mongodb.com/atlas)

Required backend environment variables in production: `MONGO_URI`, `JWT_SECRET`, `CLIENT_URL`, `NODE_ENV=production`.

## License

ISC
