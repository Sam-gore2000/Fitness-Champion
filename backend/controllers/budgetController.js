const asyncHandler = require('express-async-handler');
const OpenAI = require('openai');
const { generateOfflineBudgetPlan } = require('../utils/offlineBudgetPlanner');

let _openai = null;
function getOpenAI() {
  if (!process.env.OPENAI_API_KEY) {
    const err = new Error(
      'OPENAI_API_KEY is not set. Add it to backend/.env to use the budget meal planner.'
    );
    err.statusCode = 503;
    throw err;
  }
  if (!_openai) _openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  return _openai;
}

function isAIUnavailable(err) {
  return err.statusCode === 503 || err.status === 429 || err.code === 'insufficient_quota';
}

// @desc Generate a high-protein meal plan within a monthly budget
// @route POST /api/budget/plan
const generateBudgetPlan = asyncHandler(async (req, res) => {
  const { monthlyBudget, currency = 'INR' } = req.body;
  const user = req.user;
  const symbol = currency === 'INR' ? '₹' : currency === 'USD' ? '$' : '';

  try {
    const systemPrompt = `You are a budget-conscious nutrition planner for someone shopping in India. Design a realistic
7-day, high-protein meal plan that fits within roughly ${symbol}${Math.round(monthlyBudget / 4)} per week
(${symbol}${monthlyBudget}/month), using ingredients and prices realistic for Indian grocery stores/markets,
tailored to a ${user.dietaryPreference} diet, hitting close to ${user.dailyProtein}g protein and
${user.dailyCalories} kcal per day. Present it as a clear day-by-day breakdown with an estimated cost per day
in ${currency} (use the ${symbol} symbol, not any other currency).`;

    const completion = await getOpenAI().chat.completions.create({
      model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
      messages: [{ role: 'system', content: systemPrompt }, { role: 'user', content: 'Generate the plan.' }],
      temperature: 0.6,
    });

    return res.json({
      success: true,
      plan: completion.choices[0].message.content,
      monthlyBudget,
      currency,
      offline: false,
    });
  } catch (err) {
    if (!isAIUnavailable(err)) throw err;

    // AI is down — use the built-in rule-based planner instead of failing outright.
    const plan = generateOfflineBudgetPlan({
      monthlyBudget,
      currency,
      dailyProtein: user.dailyProtein,
      dailyCalories: user.dailyCalories,
      dietaryPreference: user.dietaryPreference,
    });

    return res.json({ success: true, plan, monthlyBudget, currency, offline: true });
  }
});

module.exports = { generateBudgetPlan };
