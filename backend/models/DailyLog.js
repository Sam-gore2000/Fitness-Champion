const mongoose = require('mongoose');

// One doc per user per calendar day, aggregating everything for fast dashboard reads
const dailyLogSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    date: { type: String, required: true, index: true }, // YYYY-MM-DD

    caloriesConsumed: { type: Number, default: 0 },
    protein: { type: Number, default: 0 },
    carbs: { type: Number, default: 0 },
    fat: { type: Number, default: 0 },
    fiber: { type: Number, default: 0 },
    sugar: { type: Number, default: 0 },

    waterMl: { type: Number, default: 0 },
    steps: { type: Number, default: 0 },
    sleepHours: { type: Number, default: 0 },
    workoutCompleted: { type: Boolean, default: false },

    missionsCompleted: { type: Number, default: 0 },
    missionsTotal: { type: Number, default: 6 },
    xpEarned: { type: Number, default: 0 },

    // 'green' | 'yellow' | 'red' computed from goal completion
    status: { type: String, enum: ['green', 'yellow', 'red', 'pending'], default: 'pending' },
  },
  { timestamps: true }
);

dailyLogSchema.index({ user: 1, date: 1 }, { unique: true });

module.exports = mongoose.model('DailyLog', dailyLogSchema);
