# AI Fitness Companion

A full-stack AI-powered fitness & nutrition coaching app: nutrition tracking, AI meal recognition, an AI chat
coach, workout tracking with PR detection, body measurements, gamification (missions/XP/badges/streaks), a
color-coded calendar, analytics dashboards, grocery + budget meal planning, notifications, and an admin panel.

```
fitness-app/
├── backend/   Node.js + Express + MongoDB (Mongoose) + JWT auth + OpenAI integration
└── frontend/  React + TypeScript + Vite + Tailwind CSS
```

## Quick start (local)

```bash
# 1. Backend
cd backend
npm install
cp .env.example .env     # fill in MONGO_URI, JWT secrets, OPENAI_API_KEY, etc.
npm run dev               # http://localhost:5000

# 2. Frontend (new terminal)
cd frontend
npm install
cp .env.example .env      # VITE_API_URL=http://localhost:5000/api
npm run dev                # http://localhost:5173
```

Register an account, complete onboarding (this auto-calculates your BMR/TDEE/macro targets), and you're in.
To access `/admin`, register normally then set that user's `role` to `"admin"` directly in MongoDB Atlas, or run:

```js
// in mongosh, connected to your Atlas cluster
db.users.updateOne({ email: "you@example.com" }, { $set: { role: "admin" } })
```

## Deploying for real

| Layer | Where | Notes |
|---|---|---|
| Frontend | Vercel | Framework preset "Vite"; set `VITE_API_URL` to your Render backend URL |
| Backend | Render | Web Service, build `npm install`, start `npm start`; set all vars from `backend/.env.example` |
| Database | MongoDB Atlas | Free M0 cluster is enough to start; put the connection string in `MONGO_URI` |
| Images | Cloudinary | Free tier; wire an upload widget in the frontend, store the returned URL |
| AI | OpenAI API | Powers chat coach, meal recognition (vision), recommendations, and weekly/monthly reports |

Each `backend/README.md` and `frontend/README.md` has fuller deployment and architecture notes.

## What's real vs. what's an extension point

Every screen in the frontend calls a real, working backend endpoint — there's no mock/fake data layer to swap out
later. The pieces that need a credential or hardware you'll supply yourself (clearly marked in-code) are:
Cloudinary image upload (meal photos, avatars), a barcode-scanner camera component, and Google OAuth — the
backend's data model and auth flow are already built to support all three.

## Tech stack (as specced)

**Frontend**: React, TypeScript, Vite, Tailwind CSS, React Router, React Query, Zustand, Framer Motion, Chart.js
**Backend**: Node.js, Express, JWT + refresh-token auth, Mongoose
**Database**: MongoDB Atlas
**AI**: OpenAI API (chat, nutrition analysis, meal planning) + vision model (meal image recognition)
**Hosting**: Vercel (frontend), Render (backend), MongoDB Atlas (database), Cloudinary (images)
