# AI Fitness Companion — Backend API

Node.js/Express REST API with MongoDB (Mongoose), JWT access + refresh token auth,
OpenAI-powered coaching/meal recognition, gamification, and an admin panel API.

## Setup

```bash
npm install
cp .env.example .env   # then fill in real values
npm run dev             # nodemon, http://localhost:5000
```

### Required env vars (see `.env.example`)
- `MONGO_URI` — MongoDB Atlas connection string
- `JWT_ACCESS_SECRET` / `JWT_REFRESH_SECRET` — long random strings
- `OPENAI_API_KEY` — for AI chat coach, meal recognition, reports, budget plans
- `SMTP_*` — for verification & password reset emails (optional in dev; logs to console if unset)
- `CLOUDINARY_*` — for meal photo & avatar uploads (frontend uploads directly to Cloudinary; backend just stores URLs)

## Deploying to Render

1. Push this `backend/` folder to a GitHub repo (or the repo root).
2. New Web Service on Render → connect the repo.
3. Build command: `npm install`. Start command: `npm start`.
4. Add all env vars from `.env.example` in Render's dashboard.
5. Set `CLIENT_URL` to your deployed Vercel frontend URL (needed for CORS + email links).

## Architecture

- `models/` — Mongoose schemas (User, Food, Meal, DailyLog, Workout, PersonalRecord,
  BodyMeasurement, Mission, Badge, Notification, GroceryList, ChatMessage, AiPrompt)
- `controllers/` — business logic per domain
- `routes/` — Express routers, mounted under `/api/*` in `server.js`
- `middleware/auth.js` — `protect` (JWT) and `adminOnly` guards
- `utils/calculations.js` — BMR/TDEE/macro math (Mifflin-St Jeor equation)

## Auth flow

- Access token: short-lived JWT (15m default), sent in `Authorization: Bearer <token>` header, stored in memory/localStorage on the frontend.
- Refresh token: long-lived JWT (30d default), stored in an httpOnly cookie scoped to `/api/auth`, used to silently mint new access tokens via `POST /api/auth/refresh`.
- Google login: schema already has a `googleId` field on `User`; wire up `passport-google-oauth20` or Google Identity Services on the frontend and add a `/api/auth/google` route when ready — left as a clearly-marked extension point since it needs real OAuth credentials.

## Notable endpoints

| Area | Endpoint |
|---|---|
| Auth | `POST /api/auth/register`, `/login`, `/refresh`, `/logout`, `/forgot-password`, `/reset-password/:token`, `/verify-email/:token`, `GET /me` |
| Profile | `GET/PUT /api/users/profile` (auto-computes BMR/TDEE/macros) |
| Nutrition | `GET /api/nutrition/foods/search`, `POST /meals`, `GET /meals`, `POST /water`, `/steps`, `/sleep`, `GET /daily-log` |
| Workouts | `POST/GET /api/workouts`, `GET /api/workouts/records` |
| Body | `POST/GET /api/body` |
| AI | `POST /api/ai/chat`, `GET /chat/history`, `GET /recommendations`, `POST /meal-recognition`, `GET /reports/weekly`, `/reports/monthly` |
| Gamification | `GET /api/missions/today`, `PATCH /:id/progress`, `GET /badges` |
| Notifications | `GET/POST /api/notifications`, `PATCH /:id/read` |
| Grocery | `POST /api/grocery/generate`, `GET /api/grocery` |
| Budget | `POST /api/budget/plan` |
| Calendar | `GET /api/calendar?year=&month=` |
| Analytics | `GET /api/analytics?range=weekly|monthly` |
| Admin | `GET /api/admin/stats`, `/users`, `/foods`, `POST /notifications/broadcast`, `GET/PUT /ai-prompts` (all require `role: admin`) |

## Notes on production readiness

- Rate limiting is applied to auth endpoints (`express-rate-limit`).
- `helmet` sets secure headers; CORS is locked to `CLIENT_URL`.
- Passwords hashed with bcrypt; refresh tokens never exposed to JS (httpOnly cookie).
- All controllers wrapped in `express-async-handler` + a centralized `errorHandler`.
- To make the first admin user, register normally then manually set `role: "admin"` on that user document in MongoDB Atlas (or add a one-off script).
