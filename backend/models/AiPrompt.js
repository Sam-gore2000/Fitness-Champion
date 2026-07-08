const mongoose = require('mongoose');

// Admin-editable system prompts used across AI features
const aiPromptSchema = new mongoose.Schema(
  {
    key: {
      type: String,
      required: true,
      unique: true,
      enum: ['chat_coach', 'meal_recognition', 'nutrition_estimate', 'weekly_report', 'monthly_report', 'meal_recommendation'],
    },
    label: String,
    systemPrompt: { type: String, required: true },
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('AiPrompt', aiPromptSchema);
