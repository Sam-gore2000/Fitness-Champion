const mongoose = require('mongoose');

// Daily generated mission set for a user
const missionSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    date: { type: String, required: true, index: true }, // YYYY-MM-DD
    type: {
      type: String,
      enum: ['protein', 'calories', 'water', 'workout', 'steps', 'sleep'],
      required: true,
    },
    label: String,
    target: Number,
    progress: { type: Number, default: 0 },
    unit: String,
    xpReward: { type: Number, default: 20 },
    completed: { type: Boolean, default: false },
    completedAt: Date,
  },
  { timestamps: true }
);

missionSchema.index({ user: 1, date: 1, type: 1 }, { unique: true });

module.exports = mongoose.model('Mission', missionSchema);
