const asyncHandler = require('express-async-handler');
const User = require('../models/User');
const Food = require('../models/Food');
const Notification = require('../models/Notification');
const AiPrompt = require('../models/AiPrompt');

// @desc List/search users
// @route GET /api/admin/users
const listUsers = asyncHandler(async (req, res) => {
  const { q, page = 1, limit = 20 } = req.query;
  const filter = q ? { $or: [{ name: new RegExp(q, 'i') }, { email: new RegExp(q, 'i') }] } : {};
  const users = await User.find(filter)
    .select('-password')
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(Number(limit));
  const total = await User.countDocuments(filter);
  res.json({ success: true, users, total, page: Number(page) });
});

// @desc Update a user's role or basic fields (admin only)
// @route PATCH /api/admin/users/:id
const updateUser = asyncHandler(async (req, res) => {
  const { role, isEmailVerified } = req.body;
  const user = await User.findByIdAndUpdate(
    req.params.id,
    { ...(role && { role }), ...(isEmailVerified !== undefined && { isEmailVerified }) },
    { new: true }
  ).select('-password');
  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }
  res.json({ success: true, user });
});

// @desc Delete a user
// @route DELETE /api/admin/users/:id
const deleteUser = asyncHandler(async (req, res) => {
  const user = await User.findByIdAndDelete(req.params.id);
  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }
  res.json({ success: true, message: 'User deleted' });
});

// @desc CRUD for the shared food/nutrition database
// @route GET/POST /api/admin/foods
const listFoods = asyncHandler(async (req, res) => {
  const { q, page = 1, limit = 20 } = req.query;
  const filter = q ? { name: new RegExp(q, 'i') } : {};
  const foods = await Food.find(filter).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(Number(limit));
  const total = await Food.countDocuments(filter);
  res.json({ success: true, foods, total });
});

const createFood = asyncHandler(async (req, res) => {
  const food = await Food.create({ ...req.body, createdBy: req.user._id, verified: true });
  res.status(201).json({ success: true, food });
});

const updateFood = asyncHandler(async (req, res) => {
  const food = await Food.findByIdAndUpdate(req.params.id, req.body, { new: true });
  if (!food) {
    res.status(404);
    throw new Error('Food not found');
  }
  res.json({ success: true, food });
});

const deleteFood = asyncHandler(async (req, res) => {
  await Food.findByIdAndDelete(req.params.id);
  res.json({ success: true, message: 'Food deleted' });
});

// @desc Broadcast a system notification to all users (or a filtered set)
// @route POST /api/admin/notifications/broadcast
const broadcastNotification = asyncHandler(async (req, res) => {
  const { title, message, userIds } = req.body;
  const filter = userIds && userIds.length ? { _id: { $in: userIds } } : {};
  const users = await User.find(filter).select('_id');
  const docs = users.map((u) => ({ user: u._id, type: 'system', title, message }));
  await Notification.insertMany(docs);
  res.status(201).json({ success: true, count: docs.length });
});

// @desc Manage editable AI system prompts
// @route GET/PUT /api/admin/ai-prompts
const listAiPrompts = asyncHandler(async (req, res) => {
  const prompts = await AiPrompt.find();
  res.json({ success: true, prompts });
});

const upsertAiPrompt = asyncHandler(async (req, res) => {
  const { key, label, systemPrompt } = req.body;
  const prompt = await AiPrompt.findOneAndUpdate(
    { key },
    { label, systemPrompt, updatedBy: req.user._id },
    { new: true, upsert: true }
  );
  res.json({ success: true, prompt });
});

// @desc High-level platform stats for the admin dashboard
// @route GET /api/admin/stats
const getStats = asyncHandler(async (req, res) => {
  const totalUsers = await User.countDocuments();
  const verifiedUsers = await User.countDocuments({ isEmailVerified: true });
  const totalFoods = await Food.countDocuments();
  res.json({ success: true, stats: { totalUsers, verifiedUsers, totalFoods } });
});

module.exports = {
  listUsers, updateUser, deleteUser,
  listFoods, createFood, updateFood, deleteFood,
  broadcastNotification,
  listAiPrompts, upsertAiPrompt,
  getStats,
};
