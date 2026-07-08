const asyncHandler = require('express-async-handler');
const GroceryList = require('../models/GroceryList');
const Meal = require('../models/Meal');

// @desc Auto-generate a grocery list from the user's recent meal patterns
// @route POST /api/grocery/generate
const generateGroceryList = asyncHandler(async (req, res) => {
  const since = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  const recentMeals = await Meal.find({ user: req.user._id, loggedAt: { $gte: since } });

  // Aggregate distinct food names as a simple heuristic shopping list
  const nameCounts = {};
  recentMeals.forEach((m) => {
    nameCounts[m.name] = (nameCounts[m.name] || 0) + 1;
  });

  const items = Object.entries(nameCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 20)
    .map(([name, count]) => ({
      name,
      quantity: `${count}x this week`,
      category: 'General',
      estimatedCost: 0,
      checked: false,
    }));

  const list = await GroceryList.create({
    user: req.user._id,
    weekOf: new Date().toISOString().slice(0, 10),
    items,
    generatedFromPlan: 'recent_meals',
  });

  res.status(201).json({ success: true, groceryList: list });
});

// @desc Get grocery lists for the user
// @route GET /api/grocery
const getGroceryLists = asyncHandler(async (req, res) => {
  const lists = await GroceryList.find({ user: req.user._id }).sort({ createdAt: -1 }).limit(10);
  res.json({ success: true, groceryLists: lists });
});

// @desc Toggle checked state of a grocery item
// @route PATCH /api/grocery/:listId/items/:itemIndex
const toggleItem = asyncHandler(async (req, res) => {
  const { listId, itemIndex } = req.params;
  const list = await GroceryList.findOne({ _id: listId, user: req.user._id });
  if (!list || !list.items[itemIndex]) {
    res.status(404);
    throw new Error('Grocery item not found');
  }
  list.items[itemIndex].checked = !list.items[itemIndex].checked;
  await list.save();
  res.json({ success: true, groceryList: list });
});

module.exports = { generateGroceryList, getGroceryLists, toggleItem };
