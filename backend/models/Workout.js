const mongoose = require('mongoose');

const setSchema = new mongoose.Schema(
  {
    reps: Number,
    weightKg: Number,
    restSeconds: Number,
    isPR: { type: Boolean, default: false },
  },
  { _id: false }
);

const exerciseEntrySchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    muscleGroup: {
      type: String,
      enum: ['chest', 'back', 'biceps', 'triceps', 'legs', 'shoulders', 'core', 'cardio', 'full_body'],
      default: 'full_body',
    },
    sets: [setSchema],
    durationMinutes: Number, // used instead of sets for cardio-type entries
  },
  { _id: false }
);

const workoutSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    name: { type: String, default: 'Workout' },
    date: { type: Date, default: Date.now, index: true },
    durationMinutes: Number,
    exercises: [exerciseEntrySchema],
    notes: String,
  },
  { timestamps: true }
);

module.exports = mongoose.model('Workout', workoutSchema);
