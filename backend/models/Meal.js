const mongoose = require('mongoose');

const mealSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    food: { type: mongoose.Schema.Types.ObjectId, ref: 'Food' },
    name: { type: String, required: true },
    mealType: {
      type: String,
      enum: ['breakfast', 'lunch', 'dinner', 'snack'],
      default: 'snack',
    },
    source: {
      type: String,
      enum: ['manual', 'search', 'barcode', 'image', 'voice'],
      default: 'manual',
    },
    quantityG: { type: Number, default: 100 },
    calories: { type: Number, required: true },
    protein: { type: Number, required: true },
    carbs: { type: Number, required: true },
    fat: { type: Number, required: true },
    fiber: { type: Number, default: 0 },
    sugar: { type: Number, default: 0 },
    imageUrl: String,
    loggedAt: { type: Date, default: Date.now, index: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Meal', mealSchema);
