/**
 * Rule-based fallback replies for the AI chat coach, used only when OpenAI is
 * unavailable (no key, no quota, rate-limited). Not a real AI — simple keyword
 * matching against a handful of common fitness/nutrition questions, so the
 * coach still gives a useful answer instead of just erroring out.
 */

const RULES = [
  {
    keywords: ['protein'],
    reply: (user) =>
      `Good protein sources that fit most diets: eggs, chicken breast, paneer, Greek yogurt/curd, dal, soya chunks, ` +
      `and milk. Your daily target is ${user.dailyProtein || 'set in your profile'}g — spreading it across 3-4 meals ` +
      `(roughly ${Math.round((user.dailyProtein || 100) / 4)}g per meal) makes it easier to hit than trying to get it all in one sitting.`,
  },
  {
    keywords: ['workout after', 'post workout', 'after gym', 'after workout'],
    reply: () =>
      `After a workout, aim for protein + carbs within a couple hours — e.g. a banana with a glass of milk, ` +
      `2-3 eggs with toast, or curd with fruit. The carbs replenish glycogen, the protein supports muscle repair.`,
  },
  {
    keywords: ['pizza', 'cheat', 'junk'],
    reply: (user) =>
      `Yes, in moderation. If pizza fits within your remaining calories for the day, it won't derail your ${
        user.goal?.replace('_', ' ') || 'goal'
      } — just try to balance the rest of the day lighter, and get some protein in in your next meal.`,
  },
  {
    keywords: ['only have eggs', 'only have milk', 'what can i make', 'what can i cook'],
    reply: () =>
      `With eggs and milk you can make a simple protein-rich meal: a 2-3 egg omelette, or scrambled eggs with a glass ` +
      `of milk on the side — roughly 20-25g protein. Add bread or leftover rice if you have it, for carbs.`,
  },
  {
    keywords: ['lose weight', 'fat loss', 'lean out'],
    reply: (user) =>
      `For fat loss, the main lever is a consistent calorie deficit — your target is ${
        user.dailyCalories || 'set in your profile'
      } kcal/day. Prioritize protein (keeps you full, protects muscle), and don't cut too aggressively — a slow, ` +
      `sustainable deficit is easier to stick to than a crash diet.`,
  },
  {
    keywords: ['muscle gain', 'bulk', 'build muscle'],
    reply: (user) =>
      `For muscle gain, you need a slight calorie surplus (yours is ${user.dailyCalories || 'set in your profile'} kcal/day) ` +
      `plus progressive overload in the gym — gradually increasing weight or reps over time. Protein around ` +
      `${user.dailyProtein || '1.6-2g per kg bodyweight'} supports the actual muscle repair.`,
  },
  {
    keywords: ['water', 'hydration'],
    reply: (user) =>
      `Your daily water target is ${(user.dailyWaterMl || 3000) / 1000}L. A simple habit: drink a glass right after waking up, ` +
      `one before each meal, and keep a bottle at your desk — that alone usually covers most of the target.`,
  },
  {
    keywords: ['sleep'],
    reply: () =>
      `7-9 hours is the general target for recovery and hormone regulation (including appetite hormones, which affect ` +
      `cravings). If you're consistently under that, it'll show up as slower recovery and more fatigue on workout days.`,
  },
  {
    keywords: ['breakfast'],
    reply: () =>
      `A solid high-protein breakfast: 2-3 eggs with a slice of bread, or oats made with milk and topped with a banana. ` +
      `Both give you 15-20g protein to start the day without much prep.`,
  },
];

const FALLBACK_REPLY =
  "I'm running in offline mode right now (the AI service is unavailable), so I can only answer a few common " +
  "questions about protein, workouts, sleep, water, and weight goals. For anything else, try rephrasing with one " +
  "of those topics, or check back once the AI service is back up.";

function getOfflineReply(message, user) {
  const lower = message.toLowerCase();
  const match = RULES.find((r) => r.keywords.some((k) => lower.includes(k)));
  return match ? match.reply(user) : FALLBACK_REPLY;
}

module.exports = { getOfflineReply };
