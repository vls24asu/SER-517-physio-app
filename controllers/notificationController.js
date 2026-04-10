const NotificationService = require('../services/NotificationService');

const notifService = new NotificationService();

const TYPE_META = {
  session_completed:  { icon: 'bi-check-circle-fill',  color: '#22c55e' },
  achievement_unlocked: { icon: 'bi-trophy-fill',       color: '#F7B32B' },
  streak_active:      { icon: 'bi-fire',               color: '#f97316' },
  streak_broken:      { icon: 'bi-exclamation-circle-fill', color: '#ef4444' },
  progress_milestone: { icon: 'bi-graph-up-arrow',     color: '#3b82f6' },
  pain_checkin:       { icon: 'bi-heart-pulse-fill',   color: '#a855f7' },
  workout_reminder:   { icon: 'bi-alarm-fill',         color: '#6b7280' },
  session_reminder:   { icon: 'bi-calendar-check-fill', color: '#0ea5e9' },
};

const getNotifications = async (req, res) => {
  try {
    const userId = req.session.user.id;
    const raw = await notifService.getAll(userId);
    const notifications = raw.map(n => ({
      ...n,
      meta: TYPE_META[n.type] || { icon: 'bi-bell-fill', color: '#6b7280' }
    }));
    res.render('notifications/index', { notifications });
  } catch (err) {
    console.error(err);
    req.flash('error', 'Could not load notifications.');
    res.redirect('/dashboard');
  }
};

const getUnreadCount = async (req, res) => {
  try {
    const count = await notifService.getUnreadCount(req.session.user.id);
    res.json({ count });
  } catch {
    res.json({ count: 0 });
  }
};

const markAsRead = async (req, res) => {
  try {
    await notifService.markAsRead(Number(req.params.id), req.session.user.id);
    res.json({ ok: true });
  } catch {
    res.json({ ok: false });
  }
};

const markAllAsRead = async (req, res) => {
  try {
    await notifService.markAllAsRead(req.session.user.id);
    res.json({ ok: true });
  } catch {
    res.json({ ok: false });
  }
};

const deleteAll = async (req, res) => {
  try {
    await notifService.deleteAll(req.session.user.id);
    res.json({ ok: true });
  } catch {
    res.json({ ok: false });
  }
};

const deleteOne = async (req, res) => {
  try {
    await notifService.deleteOne(Number(req.params.id), req.session.user.id);
    res.json({ ok: true });
  } catch {
    res.json({ ok: false });
  }
};

// Returns the 5 most recent unread notifications — used by the toast system
const getLatestUnread = async (req, res) => {
  try {
    const userId = req.session.user.id;
    const all = await notifService.getAll(userId);
    const unread = all
      .filter(n => !n.is_read)
      .slice(0, 5)
      .map(n => ({ ...n, meta: TYPE_META[n.type] || { icon: 'bi-bell-fill', color: '#6b7280' } }));
    res.json({ notifications: unread });
  } catch {
    res.json({ notifications: [] });
  }
};

const subscribePush = async (req, res) => {
  try {
    await notifService.savePushSubscription(req.session.user.id, req.body);
    res.json({ ok: true });
  } catch (err) {
    console.error(err);
    res.json({ ok: false });
  }
};

module.exports = {
  getNotifications,
  getUnreadCount,
  getLatestUnread,
  markAsRead,
  markAllAsRead,
  deleteOne,
  deleteAll,
  subscribePush,
};
