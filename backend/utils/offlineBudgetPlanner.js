/**
 * Rule-based 7-day high-protein budget meal plan, used when OpenAI is
 * unavailable. Not personalized like the AI version, but fully functional —
 * built from common, affordable Indian grocery staples.
 */

const VEG_DAY_TEMPLATE = [
  'Breakfast: 2 boiled eggs or a bowl of oats with milk and banana',
  'Lunch: 2 roti + dal + a portion of paneer or curd + a vegetable sabzi',
  'Snack: A handful of peanuts or roasted chana + a piece of fruit',
  'Dinner: Rice or roti + dal + soya chunks or paneer curry + salad',
];

const NONVEG_DAY_TEMPLATE = [
  'Breakfast: 2-3 eggs (boiled/omelette) + a slice of bread or toast',
  'Lunch: 2 roti or rice + chicken curry (150-200g) + a vegetable side',
  'Snack: Curd or a glass of milk + a piece of fruit',
  'Dinner: Rice or roti + fish or chicken (150g) + dal + salad',
];

const VEGAN_DAY_TEMPLATE = [
  'Breakfast: Oats made with soy/plant milk + banana + a spoon of peanut butter',
  'Lunch: 2 roti + dal + soya chunks curry + a vegetable sabzi',
  'Snack: A handful of almonds/peanuts + a piece of fruit',
  'Dinner: Rice + rajma or chana curry + a vegetable side + salad',
];

function templateFor(dietaryPreference) {
  if (dietaryPreference === 'vegan') return VEGAN_DAY_TEMPLATE;
  if (dietaryPreference === 'vegetarian') return VEG_DAY_TEMPLATE;
  return NONVEG_DAY_TEMPLATE; // none, pescatarian, keto, halal, kosher — closest reasonable default
}

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

function generateOfflineBudgetPlan({ monthlyBudget, currency, dailyProtein, dailyCalories, dietaryPreference }) {
  const symbol = currency === 'INR' ? '₹' : currency === 'USD' ? '$' : '';
  const weeklyBudget = Math.round(monthlyBudget / 4);
  const dailyBudget = Math.round(weeklyBudget / 7);
  const template = templateFor(dietaryPreference);

  const lines = [];
  lines.push(
    `7-Day High-Protein Budget Meal Plan (offline mode — AI service unavailable, using a general template)\n` +
    `Weekly budget: ~${symbol}${weeklyBudget} (~${symbol}${dailyBudget}/day) · Target: ~${dailyProtein || 100}g protein, ` +
    `~${dailyCalories || 2000} kcal/day\n`
  );

  DAYS.forEach((day, i) => {
    lines.push(`${day} (~${symbol}${dailyBudget}):`);
    template.forEach((meal) => lines.push(`  - ${meal}`));
    lines.push('');
  });

  lines.push(
    `Tips to stay in budget: buy eggs, dal, rice, and seasonal vegetables in bulk; paneer and soya chunks are ` +
    `cheaper protein per gram than most meats; and curd/milk are the most cost-effective way to add extra protein ` +
    `to any meal.`
  );

  return lines.join('\n');
}

module.exports = { generateOfflineBudgetPlan };
