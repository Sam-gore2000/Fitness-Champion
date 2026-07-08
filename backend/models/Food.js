const mongoose = require('mongoose');

// Reference nutrition database entry (per 100g unless servingSizeG is given)
const foodSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    brand: { type: String, trim: true },
    category: { type: String, trim: true },
    servingSizeG: { type: Number, default: 100 },
    calories: { type: Number, required: true },
    protein: { type: Number, required: true },
    carbs: { type: Number, required: true },
    fat: { type: Number, required: true },
    fiber: { type: Number, default: 0 },
    sugar: { type: Number, default: 0 },
    barcode: { type: String, index: true },
    imageUrl: String,
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    verified: { type: Boolean, default: false },
  },
  { timestamps: true }
);

foodSchema.index({ name: 'text', brand: 'text' });

module.exports = mongoose.model('Food', foodSchema);
