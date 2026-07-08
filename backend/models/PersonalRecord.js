const mongoose = require('mongoose');

const personalRecordSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    exerciseName: { type: String, required: true },
    weightKg: { type: Number, required: true },
    reps: { type: Number, required: true },
    achievedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

personalRecordSchema.index({ user: 1, exerciseName: 1 });

module.exports = mongoose.model('PersonalRecord', personalRecordSchema);
