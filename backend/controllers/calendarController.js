const asyncHandler = require('express-async-handler');
const DailyLog = require('../models/DailyLog');

function computeStatus(log, user) {
  if (!log) return 'pending';
  const calRatio = user.dailyCalories ? log.caloriesConsumed / user.dailyCalories : 0;
  const proteinRatio = user.dailyProtein ? log.protein / user.dailyProtein : 0;
  const workoutOk = log.workoutCompleted;

  const calOk = calRatio >= 0.85 && calRatio <= 1.15;
  const proteinOk = proteinRatio >= 0.9;

  const score = [calOk, proteinOk, workoutOk].filter(Boolean).length;
  if (score === 3) return 'green';
  if (score >= 1) return 'yellow';
  return 'red';
}

// @desc Get calendar data (color-coded days) for a month
// @route GET /api/calendar?year=2026&month=7
const getCalendar = asyncHandler(async (req, res) => {
  const { year, month } = req.query; // month 1-12
  const y = Number(year) || new Date().getFullYear();
  const m = Number(month) || new Date().getMonth() + 1;

  const start = `${y}-${String(m).padStart(2, '0')}-01`;
  const lastDay = new Date(y, m, 0).getDate();
  const end = `${y}-${String(m).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`;

  const logs = await DailyLog.find({
    user: req.user._id,
    date: { $gte: start, $lte: end },
  });

  const byDate = {};
  logs.forEach((log) => {
    byDate[log.date] = computeStatus(log, req.user);
  });

  res.json({ success: true, year: y, month: m, days: byDate });
});

module.exports = { getCalendar };
