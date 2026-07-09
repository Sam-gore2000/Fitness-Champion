const asyncHandler = require('express-async-handler');
const OpenAI = require('openai');
const ChatMessage = require('../models/ChatMessage');
const Meal = require('../models/Meal');
const Workout = require('../models/Workout');
const DailyLog = require('../models/DailyLog');
const AiPrompt = require('../models/AiPrompt');
const { todayStr } = require('./nutritionController');
const { estimateOffline } = require('../utils/offlineNutritionDB');
const { getOfflineReply } = require('../utils/offlineCoach');

// True when the failure is "OpenAI isn't usable right now" (missing key, no
// quota/credits, rate limited) rather than some other bug — these are the
// cases where we fall back to offline logic instead of just erroring out.
function isAIUnavailable(err) {
  return err.statusCode === 503 || err.status === 429 || err.code === 'insufficient_quota';
}

// Lazily create the client so a missing OPENAI_API_KEY only breaks AI
// endpoints when they're actually called, not the whole server on boot.
let _openai = null;
function getOpenAI() {
  if (!process.env.OPENAI_API_KEY) {
    const err = new Error(
      'OPENAI_API_KEY is not set. Add it to backend/.env to use AI chat, meal recognition, and reports.'
    );
    err.statusCode = 503;
    throw err;
  }
  if (!_openai) _openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  return _openai;
}

const DEFAULT_PROMPTS = {
  chat_coach: `You are an encouraging, knowledgeable AI fitness and nutrition coach inside the AI Fitness Companion app.
Use the user's profile, goals, and recent logs to give specific, actionable, personalized answers.
Keep responses concise, warm, and practical. Always explain the "why" briefly behind a recommendation.`,
  meal_recommendation: `You are a nutrition recommendation engine. Given a user's remaining daily macros and dietary preference,
suggest 2-3 concrete food options with approximate quantities to help them hit their targets. Explain briefly why each helps.`,
  meal_recognition: `You are a meal recognition assistant. Given a description or image of a meal, identify likely food items,
estimate portion size, and estimate calories, protein, carbs, and fat. Respond ONLY in strict JSON with keys:
items (array of {name, portion, calories, protein, carbs, fat}), totalCalories, totalProtein, totalCarbs, totalFat.`,
  nutrition_estimate: `You are a nutrition database. Given a food name and a quantity (which may be in grams, milliliters,
or common units like pieces/eggs/slices/cups/tablespoons/servings), estimate its nutrition as accurately as possible
using standard nutrition data you know (USDA-style values), converting the given quantity to a realistic serving
weight first (e.g. "2 large eggs" ≈ 100g, "1 medium banana" ≈ 118g) before calculating. Respond ONLY with strict
JSON, no prose, no markdown fences, using exactly these keys:
{"calories": number, "protein": number, "carbs": number, "fat": number, "fiber": number, "sugar": number}.
All values are grams except calories (kcal), for the FULL given quantity (not per 100g). Round to the nearest whole number.`,
  weekly_report: `You are a fitness data analyst. Summarize the user's week: weight change, protein consistency, calorie
adherence, workout consistency, water intake, and sleep quality. End with 3 concrete, prioritized recommendations.`,
  monthly_report: `You are a fitness data analyst producing a monthly report. Include an overall progress score out of 100,
goal completion percentage, the user's best week and why, their weakest area, and a personalized improvement plan for
next month with 3-5 concrete steps.`,
};

async function getPrompt(key) {
  const record = await AiPrompt.findOne({ key });
  return record ? record.systemPrompt : DEFAULT_PROMPTS[key];
}

// Maps a short unit code (used by the frontend dropdown) to a natural-language
// label the AI prompt can use, e.g. quantityValue=2, unit='piece' -> "2 piece(s)".
const UNIT_LABELS = {
  g: 'g',
  ml: 'ml',
  piece: 'piece(s)',
  cup: 'cup(s)',
  tbsp: 'tablespoon(s)',
  tsp: 'teaspoon(s)',
  oz: 'oz',
  serving: 'serving(s)',
};

// @desc AI chat coach - conversational, personalized
// @route POST /api/ai/chat
const chatWithCoach = asyncHandler(async (req, res) => {
  const { message } = req.body;
  const user = req.user;

  await ChatMessage.create({ user: user._id, role: 'user', content: message });

  let reply;
  let offline = false;

  try {
    const history = await ChatMessage.find({ user: user._id }).sort({ createdAt: -1 }).limit(10);
    const systemPrompt = await getPrompt('chat_coach');

    const profileContext = `User profile: goal=${user.goal}, dailyCalories=${user.dailyCalories}, ` +
      `dailyProtein=${user.dailyProtein}g, dailyCarbs=${user.dailyCarbs}g, dailyFat=${user.dailyFat}g, ` +
      `dietaryPreference=${user.dietaryPreference}, activityLevel=${user.activityLevel}, workoutExperience=${user.workoutExperience}.`;

    const messages = [
      { role: 'system', content: `${systemPrompt}\n\n${profileContext}` },
      ...history.reverse().map((m) => ({ role: m.role, content: m.content })),
    ];

    const completion = await getOpenAI().chat.completions.create({
      model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
      messages,
      temperature: 0.7,
    });

    reply = completion.choices[0].message.content;
  } catch (err) {
    if (!isAIUnavailable(err)) throw err;
    offline = true;
    reply = getOfflineReply(message, user);
  }

  await ChatMessage.create({ user: user._id, role: 'assistant', content: reply });

  res.json({ success: true, reply, offline });
});

// @desc Get chat history
// @route GET /api/ai/chat/history
const getChatHistory = asyncHandler(async (req, res) => {
  const messages = await ChatMessage.find({ user: req.user._id }).sort({ createdAt: 1 }).limit(100);
  res.json({ success: true, messages });
});

// @desc Recommend meals/foods to hit remaining daily macros
// @route GET /api/ai/recommendations
const getMealRecommendations = asyncHandler(async (req, res) => {
  const user = req.user;
  const date = todayStr();
  const log = (await DailyLog.findOne({ user: user._id, date })) || {};

  const remaining = {
    calories: Math.max(0, (user.dailyCalories || 0) - (log.caloriesConsumed || 0)),
    protein: Math.max(0, (user.dailyProtein || 0) - (log.protein || 0)),
    carbs: Math.max(0, (user.dailyCarbs || 0) - (log.carbs || 0)),
    fat: Math.max(0, (user.dailyFat || 0) - (log.fat || 0)),
  };

  const systemPrompt = await getPrompt('meal_recommendation');
  const userPrompt = `Remaining today: ${remaining.calories} kcal, ${remaining.protein}g protein, ` +
    `${remaining.carbs}g carbs, ${remaining.fat}g fat. Dietary preference: ${user.dietaryPreference}.`;

  const completion = await getOpenAI().chat.completions.create({
    model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt },
    ],
    temperature: 0.6,
  });

  res.json({
    success: true,
    remaining,
    recommendation: completion.choices[0].message.content,
  });
});

// @desc Recognize meal from an uploaded image (vision) and return macro estimate
// @route POST /api/ai/meal-recognition
const recognizeMeal = asyncHandler(async (req, res) => {
  const { imageUrl, description } = req.body;
  const systemPrompt = await getPrompt('meal_recognition');

  const userContent = imageUrl
    ? [
        { type: 'text', text: description || 'Identify this meal and estimate its nutrition.' },
        { type: 'image_url', image_url: { url: imageUrl } },
      ]
    : (description || 'No description provided.');

  const completion = await getOpenAI().chat.completions.create({
    model: process.env.OPENAI_VISION_MODEL || 'gpt-4o-mini',
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userContent },
    ],
    temperature: 0.3,
    response_format: { type: 'json_object' },
  });

  let parsed;
  try {
    parsed = JSON.parse(completion.choices[0].message.content);
  } catch (e) {
    parsed = { raw: completion.choices[0].message.content };
  }

  res.json({ success: true, result: parsed });
});

// @desc Generate AI weekly progress report
// @route GET /api/ai/reports/weekly
const getWeeklyReport = asyncHandler(async (req, res) => {
  const since = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  const logs = await DailyLog.find({ user: req.user._id, createdAt: { $gte: since } }).sort({ date: 1 });
  const workouts = await Workout.countDocuments({ user: req.user._id, date: { $gte: since } });

  const systemPrompt = await getPrompt('weekly_report');
  const dataSummary = JSON.stringify({ logs, workoutsCompleted: workouts, user: {
    goal: req.user.goal, dailyCalories: req.user.dailyCalories, dailyProtein: req.user.dailyProtein,
  }});

  const completion = await getOpenAI().chat.completions.create({
    model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: `Here is the last 7 days of data: ${dataSummary}` },
    ],
    temperature: 0.5,
  });

  res.json({ success: true, report: completion.choices[0].message.content, rawData: { logs, workouts } });
});

// @desc Generate AI monthly report
// @route GET /api/ai/reports/monthly
const getMonthlyReport = asyncHandler(async (req, res) => {
  const since = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  const logs = await DailyLog.find({ user: req.user._id, createdAt: { $gte: since } }).sort({ date: 1 });
  const workouts = await Workout.countDocuments({ user: req.user._id, date: { $gte: since } });

  const systemPrompt = await getPrompt('monthly_report');
  const dataSummary = JSON.stringify({ logs, workoutsCompleted: workouts, user: {
    goal: req.user.goal, dailyCalories: req.user.dailyCalories,
  }});

  const completion = await getOpenAI().chat.completions.create({
    model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: `Here is the last 30 days of data: ${dataSummary}` },
    ],
    temperature: 0.5,
  });

  res.json({ success: true, report: completion.choices[0].message.content, rawData: { logs, workouts } });
});

// @desc Estimate nutrition (calories/protein/carbs/fat/fiber/sugar) for a food name + quantity,
// so the user never has to type macros by hand when logging a meal. Quantity can be grams, ml,
// or a natural unit like "piece", "cup", "tbsp", "serving" — e.g. 2 "piece" of eggs.
// @route POST /api/ai/estimate-nutrition
const estimateNutrition = asyncHandler(async (req, res) => {
  const { name, quantityValue, unit } = req.body;

  if (!name || !quantityValue) {
    res.status(400);
    throw new Error('Provide a food name and a quantity');
  }

  const unitLabel = UNIT_LABELS[unit] || unit || 'g';
  const quantityDescription = `${quantityValue} ${unitLabel}`;

  try {
    const systemPrompt = await getPrompt('nutrition_estimate');
    const completion = await getOpenAI().chat.completions.create({
      model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: `Food: ${name}. Quantity: ${quantityDescription}.` },
      ],
      temperature: 0.2,
      response_format: { type: 'json_object' },
    });

    let parsed;
    try {
      parsed = JSON.parse(completion.choices[0].message.content);
    } catch (e) {
      res.status(502);
      throw new Error('AI returned an unexpected response — try rewording the food name');
    }

    const toNum = (v) => (typeof v === 'number' && !isNaN(v) ? Math.round(v) : 0);
    const nutrition = {
      calories: toNum(parsed.calories),
      protein: toNum(parsed.protein),
      carbs: toNum(parsed.carbs),
      fat: toNum(parsed.fat),
      fiber: toNum(parsed.fiber),
      sugar: toNum(parsed.sugar),
    };

    return res.json({ success: true, nutrition, quantityDescription, offline: false });
  } catch (err) {
    if (!isAIUnavailable(err)) throw err;

    // AI is down — try the built-in offline database for common foods before
    // giving up and asking the user to enter macros manually.
    const offlineResult = estimateOffline(name, quantityValue, unit);
    if (offlineResult) {
      return res.json({ success: true, nutrition: offlineResult, quantityDescription, offline: true });
    }

    res.status(503);
    throw new Error(
      `AI is unavailable and "${name}" isn't in the offline database. Please enter the macros manually below.`
    );
  }
});

module.exports = {
  chatWithCoach,
  getChatHistory,
  getMealRecommendations,
  recognizeMeal,
  estimateNutrition,
  getWeeklyReport,
  getMonthlyReport,
};
