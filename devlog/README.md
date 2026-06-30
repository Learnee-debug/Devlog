# DevLog

A full-stack issue tracker built on the MERN stack, with a Kanban board, real-time updates, and role-based access control.

**Live demo:** _not yet deployed_
**Repo:** https://github.com/Learnee-debug/Devlog

## Features

- **Authentication** — JWT-based auth with httpOnly cookies, bcrypt password hashing, register/login/logout flows
- **Kanban board** — drag-and-drop issue management across status columns (`@hello-pangea/dnd`)
- **Issue tracking** — create, view, and update issues with priority and status badges
- **Real-time sync** — Socket.io pushes live updates to all connected clients when issues change
- **Role-based access control (RBAC)** — `admin` / `developer` roles with protected routes
- **Dashboard** — project metrics and activity overview
- **Team management** — view and manage project members

## Tech Stack

**Frontend**
- React 19 + Vite
- React Router v7
- Tailwind CSS v4
- Axios
- Socket.io-client
- react-hot-toast, lucide-react

**Backend**
- Node.js + Express 5
- MongoDB + Mongoose 9
- Socket.io
- JWT (`jsonwebtoken`) + `bcryptjs`
- `cookie-parser`, `cors`, `dotenv`

## Project Structure

```
devlog/
├── client/   # React + Vite frontend
└── server/   # Express + MongoDB backend
```

## Getting Started

### Prerequisites
- Node.js 18+
- A MongoDB instance (local or [MongoDB Atlas](https://www.mongodb.com/atlas))

### 1. Install dependencies
```bash
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

### 3. (Optional) Seed sample data
```bash
npm run seed
```
This creates two demo accounts:
| Email | Password | Role |
|---|---|---|
| admin@devlog.com | password123 | admin |
| dev@devlog.com | password123 | developer |

### 4. Run the app
In separate terminals:
```bash
npm run dev:server   # API on http://localhost:5000
npm run dev:client   # App on http://localhost:5173
```

## API Overview

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/auth/register` | Create a new account |
| POST | `/api/auth/login` | Log in, sets auth cookie |
| POST | `/api/auth/logout` | Clear auth cookie |
| GET | `/api/auth/me` | Get current authenticated user |
| GET/POST | `/api/projects` | List / create projects |
| GET/POST/PATCH | `/api/issues` | List / create / update issues |
| GET | `/api/users` | List team members |

## License

ISC
