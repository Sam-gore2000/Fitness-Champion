function calculateBMR({ gender, weightKg, heightCm, age }) {
  const base = 10 * weightKg + 6.25 * heightCm - 5 * age;
  return Math.round(gender === 'male' ? base + 5 : base - 161);
}

const ACTIVITY_MULTIPLIERS = {
  sedentary: 1.2,
  light: 1.375,
  moderate: 1.55,
  active: 1.725,
  very_active: 1.9,
};

function calculateTDEE(bmr, activityLevel) {
  const multiplier = ACTIVITY_MULTIPLIERS[activityLevel] || 1.2;
  return Math.round(bmr * multiplier);
}

function calculateDailyCalories(tdee, goal) {
  switch (goal) {
    case 'fat_loss':
      return Math.round(tdee * 0.8);
    case 'muscle_gain':
      return Math.round(tdee * 1.12);
    default:
      return tdee;
  }
}

function calculateMacros(dailyCalories, weightKg, goal) {
  let proteinPerKg;
  let fatPct;
  switch (goal) {
    case 'muscle_gain':
      proteinPerKg = 2.0;
      fatPct = 0.25;
      break;
    case 'fat_loss':
      proteinPerKg = 2.2;
      fatPct = 0.3;
      break;
    default:
      proteinPerKg = 1.8;
      fatPct = 0.28;
  }
  const proteinG = Math.round(proteinPerKg * weightKg);
  const proteinCals = proteinG * 4;
  const fatCals = dailyCalories * fatPct;
  const fatG = Math.round(fatCals / 9);
  const carbCals = dailyCalories - proteinCals - fatCals;
  const carbG = Math.max(0, Math.round(carbCals / 4));
  return { protein: proteinG, carbs: carbG, fat: fatG };
}

function calculateFullProfile({ gender, weightKg, heightCm, age, activityLevel, goal }) {
  const bmr = calculateBMR({ gender, weightKg, heightCm, age });
  const tdee = calculateTDEE(bmr, activityLevel);
  const dailyCalories = calculateDailyCalories(tdee, goal);
  const macros = calculateMacros(dailyCalories, weightKg, goal);
  return { bmr, tdee, dailyCalories, ...macros };
}

module.exports = {
  calculateBMR,
  calculateTDEE,
  calculateDailyCalories,
  calculateMacros,
  calculateFullProfile,
  ACTIVITY_MULTIPLIERS,
};
