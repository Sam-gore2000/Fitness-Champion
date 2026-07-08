const asyncHandler = require('express-async-handler');
const Notification = require('../models/Notification');

// @desc Get notifications for current user
// @route GET /api/notifications
const getNotifications = asyncHandler(async (req, res) => {
  const notifications = await Notification.find({ user: req.user._id }).sort({ createdAt: -1 }).limit(50);
  const unreadCount = await Notification.countDocuments({ user: req.user._id, read: false });
  res.json({ success: true, notifications, unreadCount });
});

// @desc Create a notification (used internally / by cron jobs)
// @route POST /api/notifications
const createNotification = asyncHandler(async (req, res) => {
  const { type, title, message } = req.body;
  const notification = await Notification.create({ user: req.user._id, type, title, message });
  res.status(201).json({ success: true, notification });
});

// @desc Mark a notification as read
// @route PATCH /api/notifications/:id/read
const markAsRead = asyncHandler(async (req, res) => {
  const notification = await Notification.findOneAndUpdate(
    { _id: req.params.id, user: req.user._id },
    { read: true },
    { new: true }
  );
  res.json({ success: true, notification });
});

// @desc Mark all notifications read
// @route PATCH /api/notifications/read-all
const markAllAsRead = asyncHandler(async (req, res) => {
  await Notification.updateMany({ user: req.user._id, read: false }, { read: true });
  res.json({ success: true });
});

module.exports = { getNotifications, createNotification, markAsRead, markAllAsRead };
