const express = require('express');
const router = express.Router();
const { isAuthenticated } = require('../middleware/auth');
const ctrl = require('../controllers/settingsController');
const db = require('../config/db');

router.get('/', isAuthenticated, ctrl.getSettings);

router.get('/personal-info', isAuthenticated, ctrl.getPersonalInfo);
router.post('/personal-info', isAuthenticated, ctrl.postPersonalInfo);

router.get('/body-metrics', isAuthenticated, ctrl.getBodyMetrics);
router.post('/body-metrics', isAuthenticated, ctrl.postBodyMetrics);

router.get('/password', isAuthenticated, ctrl.getPassword);
router.post('/password', isAuthenticated, ctrl.postPassword);

router.get('/goals', isAuthenticated, ctrl.getGoals);
router.post('/goals', isAuthenticated, ctrl.postGoals);

router.get('/pain-management', isAuthenticated, ctrl.getPainManagement);
router.post('/pain-management', isAuthenticated, ctrl.postPainManagement);

router.get('/notifications',            isAuthenticated, ctrl.getNotifications);
router.post('/notifications',           isAuthenticated, ctrl.postNotifications);
router.post('/notifications/clear-all', isAuthenticated, ctrl.clearAllNotifications);

// Auto-save timezone detected from browser
router.post('/update-timezone', isAuthenticated, async (req, res) => {
  const { timezone } = req.body;
  if (!timezone) return res.json({ ok: false });
  await db.query(
    `INSERT INTO Notification_Preferences (user_id, timezone)
     VALUES (?, ?)
     ON DUPLICATE KEY UPDATE timezone = VALUES(timezone)`,
    [req.session.user.id, timezone]
  );
  res.json({ ok: true });
});

router.post('/delete-account', isAuthenticated, ctrl.deleteAccount);

module.exports = router;
