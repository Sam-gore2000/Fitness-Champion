const asyncHandler = require('express-async-handler');
const DailyLog = require('../models/DailyLog');
const BodyMeasurement = require('../models/BodyMeasurement');
const Workout = require('../models/Workout');

// @desc Aggregate analytics for dashboards (weekly protein/calories/water/sleep, weight & workout progress)
// @route GET /api/analytics?range=weekly|monthly
const getAnalytics = asyncHandler(async (req, res) => {
  const { range = 'weekly' } = req.query;
  const days = range === 'monthly' ? 30 : 7;
  const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
  const sinceStr = since.toISOString().slice(0, 10);

  const logs = await DailyLog.find({ user: req.user._id, date: { $gte: sinceStr } }).sort({ date: 1 });
  const weights = await BodyMeasurement.find({ user: req.user._id, date: { $gte: since } })
    .sort({ date: 1 })
    .select('date weightKg bodyFatPct');
  const workouts = await Workout.find({ user: req.user._id, date: { $gte: since } })
    .sort({ date: 1 })
    .select('date name durationMinutes exercises');

  const macroDistribution = logs.reduce(
    (acc, l) => {
      acc.protein += l.protein;
      acc.carbs += l.carbs;
      acc.fat += l.fat;
      return acc;
    },
    { protein: 0, carbs: 0, fat: 0 }
  );

  res.json({
    success: true,
    range,
    dailyLogs: logs,
    weightProgress: weights,
    workoutProgress: workouts,
    macroDistribution,
  });
});

module.exports = { getAnalytics };
