const asyncHandler = require('express-async-handler');
const Food = require('../models/Food');
const Meal = require('../models/Meal');
const DailyLog = require('../models/DailyLog');

const todayStr = (d = new Date()) => d.toISOString().slice(0, 10);

async function upsertDailyLog(userId, date, deltas) {
  const log = await DailyLog.findOneAndUpdate(
    { user: userId, date },
    {
      $inc: {
        caloriesConsumed: deltas.calories || 0,
        protein: deltas.protein || 0,
        carbs: deltas.carbs || 0,
        fat: deltas.fat || 0,
        fiber: deltas.fiber || 0,
        sugar: deltas.sugar || 0,
        waterMl: deltas.waterMl || 0,
        steps: deltas.steps || 0,
      },
      $set: deltas.set || {},
    },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );
  return log;
}

// @desc Search reference food database
// @route GET /api/nutrition/foods/search?q=chicken
const searchFoods = asyncHandler(async (req, res) => {
  const { q } = req.query;
  if (!q) return res.json({ success: true, results: [] });

  const results = await Food.find({ $text: { $search: q } }).limit(20);
  res.json({ success: true, results });
});

// @desc Log a food/meal entry (manual, search, barcode, image, voice)
// @route POST /api/nutrition/meals
const logMeal = asyncHandler(async (req, res) => {
  const {
    name, mealType, source, quantityG, quantityValue, quantityUnit,
    calories, protein, carbs, fat, fiber, sugar, foodId, imageUrl,
  } = req.body;

  const meal = await Meal.create({
    user: req.user._id,
    food: foodId || undefined,
    name,
    mealType,
    source: source || 'manual',
    quantityG: quantityG ?? (quantityUnit === 'g' || quantityUnit === 'ml' ? quantityValue : 100),
    quantityValue,
    quantityUnit,
    calories, protein, carbs, fat,
    fiber: fiber || 0,
    sugar: sugar || 0,
    imageUrl,
  });

  const date = todayStr(meal.loggedAt);
  const log = await upsertDailyLog(req.user._id, date, { calories, protein, carbs, fat, fiber, sugar });

  res.status(201).json({ success: true, meal, dailyLog: log });
});

// @desc Get today's (or given date's) logged meals
// @route GET /api/nutrition/meals?date=YYYY-MM-DD
const getMeals = asyncHandler(async (req, res) => {
  const date = req.query.date || todayStr();
  const start = new Date(`${date}T00:00:00.000Z`);
  const end = new Date(`${date}T23:59:59.999Z`);

  const meals = await Meal.find({
    user: req.user._id,
    loggedAt: { $gte: start, $lte: end },
  }).sort({ loggedAt: 1 });

  res.json({ success: true, meals });
});

// @desc Delete a meal entry and roll back the daily log totals
// @route DELETE /api/nutrition/meals/:id
const deleteMeal = asyncHandler(async (req, res) => {
  const meal = await Meal.findOneAndDelete({ _id: req.params.id, user: req.user._id });
  if (!meal) {
    res.status(404);
    throw new Error('Meal entry not found');
  }
  const date = todayStr(meal.loggedAt);
  await upsertDailyLog(req.user._id, date, {
    calories: -meal.calories,
    protein: -meal.protein,
    carbs: -meal.carbs,
    fat: -meal.fat,
    fiber: -(meal.fiber || 0),
    sugar: -(meal.sugar || 0),
  });
  res.json({ success: true, message: 'Meal entry removed' });
});

// @desc Log water intake
// @route POST /api/nutrition/water
const logWater = asyncHandler(async (req, res) => {
  const { amountMl } = req.body;
  const date = todayStr();
  const log = await upsertDailyLog(req.user._id, date, { waterMl: amountMl });
  res.json({ success: true, dailyLog: log });
});

// @desc Log steps
// @route POST /api/nutrition/steps
const logSteps = asyncHandler(async (req, res) => {
  const { steps } = req.body;
  const date = todayStr();
  const log = await upsertDailyLog(req.user._id, date, { steps });
  res.json({ success: true, dailyLog: log });
});

// @desc Log sleep hours for the day
// @route POST /api/nutrition/sleep
const logSleep = asyncHandler(async (req, res) => {
  const { hours } = req.body;
  const date = todayStr();
  const log = await upsertDailyLog(req.user._id, date, { set: { sleepHours: hours } });
  res.json({ success: true, dailyLog: log });
});

// @desc Get today's daily log summary (for dashboard rings)
// @route GET /api/nutrition/daily-log?date=YYYY-MM-DD
const getDailyLog = asyncHandler(async (req, res) => {
  const date = req.query.date || todayStr();
  let log = await DailyLog.findOne({ user: req.user._id, date });
  if (!log) {
    log = await DailyLog.create({ user: req.user._id, date });
  }
  res.json({ success: true, dailyLog: log, targets: {
    calories: req.user.dailyCalories,
    protein: req.user.dailyProtein,
    carbs: req.user.dailyCarbs,
    fat: req.user.dailyFat,
    water: req.user.dailyWaterMl,
    steps: req.user.dailySteps,
    sleep: req.user.dailySleepHours,
  }});
});

module.exports = {
  searchFoods,
  logMeal,
  getMeals,
  deleteMeal,
  logWater,
  logSteps,
  logSleep,
  getDailyLog,
  upsertDailyLog,
  todayStr,
};
