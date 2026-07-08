const asyncHandler = require('express-async-handler');
const Workout = require('../models/Workout');
const PersonalRecord = require('../models/PersonalRecord');
const { upsertDailyLog, todayStr } = require('./nutritionController');

// @desc Log a completed workout
// @route POST /api/workouts
const createWorkout = asyncHandler(async (req, res) => {
  const { name, durationMinutes, exercises, notes, date } = req.body;

  const workout = await Workout.create({
    user: req.user._id,
    name,
    durationMinutes,
    exercises,
    notes,
    date: date || Date.now(),
  });

  // Check each set for a new personal record
  const newPRs = [];
  for (const ex of exercises || []) {
    for (const set of ex.sets || []) {
      const best = await PersonalRecord.findOne({
        user: req.user._id,
        exerciseName: ex.name,
      }).sort({ weightKg: -1 });

      if (!best || set.weightKg > best.weightKg) {
        const pr = await PersonalRecord.create({
          user: req.user._id,
          exerciseName: ex.name,
          weightKg: set.weightKg,
          reps: set.reps,
        });
        newPRs.push(pr);
      }
    }
  }

  await upsertDailyLog(req.user._id, todayStr(workout.date), { set: { workoutCompleted: true } });

  res.status(201).json({ success: true, workout, newPRs });
});

// @desc Get workout history
// @route GET /api/workouts
const getWorkouts = asyncHandler(async (req, res) => {
  const { from, to, limit = 50 } = req.query;
  const filter = { user: req.user._id };
  if (from || to) {
    filter.date = {};
    if (from) filter.date.$gte = new Date(from);
    if (to) filter.date.$lte = new Date(to);
  }
  const workouts = await Workout.find(filter).sort({ date: -1 }).limit(Number(limit));
  res.json({ success: true, workouts });
});

// @desc Delete a workout
// @route DELETE /api/workouts/:id
const deleteWorkout = asyncHandler(async (req, res) => {
  const workout = await Workout.findOneAndDelete({ _id: req.params.id, user: req.user._id });
  if (!workout) {
    res.status(404);
    throw new Error('Workout not found');
  }
  res.json({ success: true, message: 'Workout deleted' });
});

// @desc Get personal records, optionally filtered by exercise
// @route GET /api/workouts/records
const getPersonalRecords = asyncHandler(async (req, res) => {
  const { exercise } = req.query;
  const filter = { user: req.user._id };
  if (exercise) filter.exerciseName = exercise;
  const records = await PersonalRecord.find(filter).sort({ achievedAt: -1 });
  res.json({ success: true, records });
});

module.exports = { createWorkout, getWorkouts, deleteWorkout, getPersonalRecords };
