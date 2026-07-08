require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const connectDB = require('./config/db');
const { notFound, errorHandler } = require('./middleware/errorHandler');

connectDB();

const app = express();

app.use(helmet());
// In development, allow any localhost/127.0.0.1 port (Vite sometimes picks a
// different port than 5173 if it's already in use) so this doesn't require
// updating CLIENT_URL every time. In production, only CLIENT_URL is allowed.
const isLocalhost = (origin) => /^http:\/\/(localhost|127\.0\.0\.1):\d+$/.test(origin || '');

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true); // same-origin / curl / server-to-server
      if (origin === process.env.CLIENT_URL) return callback(null, true);
      if (process.env.NODE_ENV !== 'production' && isLocalhost(origin)) return callback(null, true);
      callback(new Error(`CORS blocked for origin: ${origin}`));
    },
    credentials: true,
  })
);
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
if (process.env.NODE_ENV !== 'production') app.use(morgan('dev'));

app.get('/api/health', (req, res) => res.json({ success: true, status: 'ok', time: new Date().toISOString() }));

app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/nutrition', require('./routes/nutritionRoutes'));
app.use('/api/workouts', require('./routes/workoutRoutes'));
app.use('/api/body', require('./routes/bodyRoutes'));
app.use('/api/ai', require('./routes/aiRoutes'));
app.use('/api/missions', require('./routes/missionRoutes'));
app.use('/api/notifications', require('./routes/notificationRoutes'));
app.use('/api/grocery', require('./routes/groceryRoutes'));
app.use('/api/budget', require('./routes/budgetRoutes'));
app.use('/api/calendar', require('./routes/calendarRoutes'));
app.use('/api/analytics', require('./routes/analyticsRoutes'));
app.use('/api/admin', require('./routes/adminRoutes'));

app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`AI Fitness Companion API running on port ${PORT}`));
