const asyncHandler = require('express-async-handler');
const User = require('../models/User');
const { calculateFullProfile } = require('../utils/calculations');

// @desc Update profile + auto-calculate nutrition targets
// @route PUT /api/users/profile
const updateProfile = asyncHandler(async (req, res) => {
  const {
    name, age, gender, heightCm, weightKg, targetWeightKg,
    goal, activityLevel, dietaryPreference, workoutExperience,
  } = req.body;

  const user = await User.findById(req.user._id);
  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

  Object.assign(user, {
    name: name ?? user.name,
    age: age ?? user.age,
    gender: gender ?? user.gender,
    heightCm: heightCm ?? user.heightCm,
    weightKg: weightKg ?? user.weightKg,
    targetWeightKg: targetWeightKg ?? user.targetWeightKg,
    goal: goal ?? user.goal,
    activityLevel: activityLevel ?? user.activityLevel,
    dietaryPreference: dietaryPreference ?? user.dietaryPreference,
    workoutExperience: workoutExperience ?? user.workoutExperience,
  });

  if (user.age && user.gender && user.heightCm && user.weightKg) {
    const { bmr, tdee, dailyCalories, protein, carbs, fat } = calculateFullProfile({
      gender: user.gender,
      weightKg: user.weightKg,
      heightCm: user.heightCm,
      age: user.age,
      activityLevel: user.activityLevel,
      goal: user.goal,
    });
    user.bmr = bmr;
    user.tdee = tdee;
    user.dailyCalories = dailyCalories;
    user.dailyProtein = protein;
    user.dailyCarbs = carbs;
    user.dailyFat = fat;
    user.onboardingComplete = true;
  }

  await user.save();
  res.json({ success: true, user: user.toSafeObject() });
});

// @desc Get profile
// @route GET /api/users/profile
const getProfile = asyncHandler(async (req, res) => {
  res.json({ success: true, user: req.user.toSafeObject() });
});

// @desc Update theme preference
// @route PATCH /api/users/theme
const updateTheme = asyncHandler(async (req, res) => {
  const { theme } = req.body;
  req.user.theme = theme;
  await req.user.save();
  res.json({ success: true, theme: req.user.theme });
});

module.exports = { updateProfile, getProfile, updateTheme };
