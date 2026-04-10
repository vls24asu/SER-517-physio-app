const express = require('express');
const router = express.Router();
const { isAuthenticated } = require('../middleware/auth');
const {
  getNotifications,
  getUnreadCount,
  getLatestUnread,
  markAsRead,
  markAllAsRead,
  deleteOne,
  deleteAll,
  subscribePush,
} = require('../controllers/notificationController');

router.get('/',               isAuthenticated, getNotifications);
router.get('/unread-count',   isAuthenticated, getUnreadCount);
router.get('/latest-unread',  isAuthenticated, getLatestUnread);
router.post('/mark-all-read', isAuthenticated, markAllAsRead);
router.post('/delete-all',    isAuthenticated, deleteAll);
router.post('/:id/read',      isAuthenticated, markAsRead);
router.post('/:id/delete',    isAuthenticated, deleteOne);
router.post('/push-subscribe', isAuthenticated, subscribePush);

module.exports = router;
