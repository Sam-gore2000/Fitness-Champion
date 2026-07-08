const mongoose = require('mongoose');

const groceryItemSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    quantity: String,
    category: String,
    estimatedCost: Number,
    checked: { type: Boolean, default: false },
  },
  { _id: false }
);

const groceryListSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    weekOf: { type: String }, // YYYY-MM-DD (Monday)
    items: [groceryItemSchema],
    totalEstimatedCost: Number,
    budgetLimit: Number,
    generatedFromPlan: { type: String },
  },
  { timestamps: true }
);

module.exports = mongoose.model('GroceryList', groceryListSchema);
