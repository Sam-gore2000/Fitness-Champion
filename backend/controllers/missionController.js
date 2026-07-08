const asyncHandler = require('express-async-handler');
const Mission = require('../models/Mission');
const User = require('../models/User');
const Badge = require('../models/Badge');
const { todayStr } = require('./nutritionController');

const DEFAULT_MISSIONS = (user) => [
  { type: 'protein', label: 'Hit your protein goal', target: user.dailyProtein, unit: 'g', xpReward: 25 },
  { type: 'calories', label: 'Stay within calorie target', target: user.dailyCalories, unit: 'kcal', xpReward: 20 },
  { type: 'water', label: 'Drink enough water', target: user.dailyWaterMl, unit: 'ml', xpReward: 15 },
  { type: 'workout', label: 'Complete a workout', target: 1, unit: 'session', xpReward: 30 },
  { type: 'steps', label: 'Hit your step goal', target: user.dailySteps, unit: 'steps', xpReward: 15 },
  { type: 'sleep', label: 'Get quality sleep', target: user.dailySleepHours, unit: 'hrs', xpReward: 15 },
];

function xpForNextLevel(level) {
  return level * 200;
}

// @desc Get (or generate) today's missions
// @route GET /api/missions/today
const getTodayMissions = asyncHandler(async (req, res) => {
  const date = todayStr();
  let missions = await Mission.find({ user: req.user._id, date });

  if (missions.length === 0) {
    const defaults = DEFAULT_MISSIONS(req.user);
    missions = await Mission.insertMany(
      defaults.map((m) => ({ ...m, user: req.user._id, date }))
    );
  }

  res.json({ success: true, missions, xp: req.user.xp, level: req.user.level, streakDays: req.user.streakDays });
});

// @desc Update mission progress and award XP on completion
// @route PATCH /api/missions/:id/progress
const updateMissionProgress = asyncHandler(async (req, res) => {
  const { progress } = req.body;
  const mission = await Mission.findOne({ _id: req.params.id, user: req.user._id });
  if (!mission) {
    res.status(404);
    throw new Error('Mission not found');
  }

  mission.progress = progress;
  const wasCompleted = mission.completed;
  mission.completed = progress >= mission.target;
  if (mission.completed) mission.completedAt = new Date();
  await mission.save();

  const user = await User.findById(req.user._id);
  let newBadges = [];

  if (mission.completed && !wasCompleted) {
    user.xp += mission.xpReward;
    while (user.xp >= xpForNextLevel(user.level)) {
      user.xp -= xpForNextLevel(user.level);
      user.level += 1;
    }

    const today = todayStr();
    if (user.lastStreakDate !== today) {
      const yesterday = todayStr(new Date(Date.now() - 86400000));
      user.streakDays = user.lastStreakDate === yesterday ? user.streakDays + 1 : 1;
      user.lastStreakDate = today;
    }

    if (user.streakDays === 7) {
      const badge = await Badge.findOne({ key: 'week_streak' });
      if (badge && !user.badges.includes(badge._id)) {
        user.badges.push(badge._id);
        newBadges.push(badge);
      }
    }

    await user.save();
  }

  res.json({ success: true, mission, xp: user.xp, level: user.level, streakDays: user.streakDays, newBadges });
});

// @desc Get user's earned badges
// @route GET /api/missions/badges
const getBadges = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).populate('badges');
  res.json({ success: true, badges: user.badges, xp: user.xp, level: user.level, streakDays: user.streakDays });
});

module.exports = { getTodayMissions, updateMissionProgress, getBadges };
