const express = require('express');
const { protect } = require('../middleware/auth');
const {
  getNotifications, createNotification, markAsRead, markAllAsRead,
} = require('../controllers/notificationController');

const router = express.Router();

router.get('/', protect, getNotifications);
router.post('/', protect, createNotification);
router.patch('/:id/read', protect, markAsRead);
router.patch('/read-all', protect, markAllAsRead);

module.exports = router;
