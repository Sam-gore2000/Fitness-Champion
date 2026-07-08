# AI Fitness Companion — Frontend

React + TypeScript + Vite + Tailwind CSS + React Query + Zustand + Framer Motion + Chart.js.

## Setup

```bash
npm install
cp .env.example .env    # set VITE_API_URL to your backend, e.g. http://localhost:5000/api
npm run dev              # http://localhost:5173
```

## Deploying to Vercel

1. Push `frontend/` to GitHub (or the repo root, with Vercel's root directory set to `frontend`).
2. Import the repo in Vercel → framework preset "Vite".
3. Add env var `VITE_API_URL` pointing at your deployed Render backend, e.g. `https://your-api.onrender.com/api`.
4. Deploy. Update the backend's `CLIENT_URL` env var to this Vercel URL for CORS + email links to work.

## Design system

- **Palette**: indigo/brand (`#4F46E5`) primary, emerald for success/protein, amber for warnings, rose for danger —
  tuned to read as a premium health product rather than a generic template. See `tailwind.config.js`.
- **Type**: "Plus Jakarta Sans" for headings/display, "Inter" for body & data density.
- **Signature element**: Apple Health-style progress rings (`components/ui/ProgressRing.tsx`) used consistently for
  calories/protein/carbs/fat across the dashboard.
- Glassmorphism via `.glass-card` (see `src/index.css`), dark mode via Tailwind's `class` strategy + `useUIStore`.

## Structure

```
src/
  api/         axios modules per backend domain (auth, nutrition, workouts, ai, admin, ...)
  store/       zustand: authStore (user/tokens), uiStore (theme/sidebar)
  components/
    layout/    Sidebar, Topbar, MobileNav, AppLayout
    ui/        GlassCard, ProgressRing, StatCard, Button, Modal, EmptyState, Spinner
  pages/       one file per route (Dashboard, Nutrition, Workouts, BodyMeasurements, AIChat,
               Missions, Notifications, Grocery, Budget, Calendar, Analytics, Reports, Admin, auth pages)
  routes/      ProtectedRoute (auth guard + onboarding redirect), AdminRoute (role guard)
  types/       shared TypeScript interfaces mirroring backend Mongoose schemas
  utils/       calculations.ts (BMR/TDEE helpers for optimistic UI)
```

## Auth flow

On load, `AuthBootstrap` (in `App.tsx`) silently calls `POST /auth/refresh` using the httpOnly cookie to mint a
fresh access token, then fetches `/auth/me`. The access token lives only in memory (Zustand), never localStorage,
so a page reload always re-derives it from the refresh cookie — this is why `withCredentials: true` is set on the
axios instance. A 401 from any other request triggers one automatic refresh-and-retry (see `api/client.ts`).

## What's stubbed vs. real

Every page calls its real backend endpoint — there is no mock data layer. The only things intentionally left as
extension points (clearly commented in-file) are:
- Cloudinary image upload widget for meal photos / avatars (backend already accepts an `imageUrl` string)
- Barcode camera scanner component (backend already accepts `source: "barcode"` meal entries)
- Google OAuth button (backend `User` model already has a `googleId` field ready)

## Notable libraries

`@tanstack/react-query` for all server state/caching, `zustand` for client state, `framer-motion` for micro
animations, `chart.js` + `react-chartjs-2` for analytics/body-measurement charts, `lucide-react` for icons,
`react-hot-toast` for notifications.
