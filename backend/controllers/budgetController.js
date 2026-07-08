const asyncHandler = require('express-async-handler');
const OpenAI = require('openai');

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

// @desc Generate a high-protein meal plan within a monthly budget
// @route POST /api/budget/plan
const generateBudgetPlan = asyncHandler(async (req, res) => {
  const { monthlyBudget, currency = 'USD' } = req.body;
  const user = req.user;

  const systemPrompt = `You are a budget-conscious nutrition planner. Design a realistic 7-day, high-protein meal
plan that fits within roughly ${monthlyBudget / 4} ${currency} per week (${monthlyBudget} ${currency}/month),
tailored to a ${user.dietaryPreference} diet, hitting close to ${user.dailyProtein}g protein and
${user.dailyCalories} kcal per day. Present it as a clear day-by-day breakdown with estimated cost per day.`;

  const completion = await getOpenAI().chat.completions.create({
    model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
    messages: [{ role: 'system', content: systemPrompt }, { role: 'user', content: 'Generate the plan.' }],
    temperature: 0.6,
  });

  res.json({ success: true, plan: completion.choices[0].message.content, monthlyBudget, currency });
});

module.exports = { generateBudgetPlan };
