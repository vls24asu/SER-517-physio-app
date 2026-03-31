const NotificationDAO = require('../dao/NotificationDAO');

let webpush = null;
try {
  webpush = require('web-push');
} catch {
  // web-push not installed — push notifications disabled
}

const dao = new NotificationDAO();

// Maps notification type to its preference column name
const TYPE_PREF = {
  session_completed:    'type_session_completed',
  achievement_unlocked: 'type_achievement_unlocked',
  streak_active:        'type_streak_active',
  streak_broken:        'type_streak_broken',
  progress_milestone:   'type_progress_milestone',
  pain_checkin:         'type_pain_checkin',
  workout_reminder:     'type_workout_reminder',
};

class NotificationService {
  // Creates a notification, respecting user preferences and optional deduplication.
  async create(userId, type, title, message, { dedupe = true, dedupeByTitle = false } = {}) {
    const prefs = await dao.getPreferences(userId);

    if (!prefs.in_app_enabled) return null;

    const prefCol = TYPE_PREF[type];
    if (prefCol && !prefs[prefCol]) return null;

    if (dedupe) {
      const titleForCheck = dedupeByTitle ? title : null;
      const exists = await dao.existsToday(userId, type, titleForCheck);
      if (exists) return null;
    }

    const id = await dao.create(userId, type, title, message);
    if (prefs.push_enabled) {
      this.#sendPush(userId, title, message).catch(() => {});
    }
    return id;
  }

  async getAll(userId) {
    return dao.getAll(userId);
  }

  async getUnreadCount(userId) {
    return dao.getUnreadCount(userId);
  }

  async markAsRead(notificationId, userId) {
    return dao.markAsRead(notificationId, userId);
  }

  async markAllAsRead(userId) {
    return dao.markAllAsRead(userId);
  }

  async deleteOne(notificationId, userId) {
    return dao.deleteOne(notificationId, userId);
  }

  async deleteAll(userId) {
    return dao.deleteAll(userId);
  }

  async getPreferences(userId) {
    return dao.getPreferences(userId);
  }

  async savePreferences(userId, prefs) {
    return dao.upsertPreferences(userId, prefs);
  }

  async savePushSubscription(userId, subscription) {
    const { endpoint, keys: { p256dh, auth } } = subscription;
    return dao.savePushSubscription(userId, endpoint, p256dh, auth);
  }

  // Checks and fires dashboard-level notifications: reminder, streak broken, pain check-in.
  // Called once per dashboard load; all three types are deduped to once per day.
  async triggerDashboardNotifications(userId, currentStreak) {
    const prefs = await dao.getPreferences(userId);
    if (!prefs.in_app_enabled) return;

    // Workout reminder — fires at or after the user's preferred reminder time (in their timezone)
    if (prefs.type_workout_reminder) {
      const [prefHour, prefMin] = prefs.reminder_time.split(':').map(Number);
      const tz = prefs.timezone || 'UTC';
      const nowInTz = new Intl.DateTimeFormat('en-US', { timeZone: tz, hour: 'numeric', minute: 'numeric', hour12: false }).formatToParts(new Date());
      const tzHour = Number(nowInTz.find(p => p.type === 'hour').value);
      const tzMin  = Number(nowInTz.find(p => p.type === 'minute').value);
      const currentMinutes = tzHour * 60 + tzMin;
      const prefMinutes = prefHour * 60 + prefMin;

      if (currentMinutes >= prefMinutes) {
        const todayCount = await dao.getSessionCountToday(userId);
        if (todayCount === 0) {
          await this.create(
            userId,
            'workout_reminder',
            'Time for a workout!',
            'You haven\'t trained today. Start a session to keep your streak going.'
          );
        }
      }
    }

    const lastDateStr = await dao.getLastSessionDate(userId);

    // Streak broken — fires the day after a streak ends (last session was exactly 2 days ago)
    if (prefs.type_streak_broken && currentStreak === 0 && lastDateStr) {
      const lastDate = new Date(lastDateStr);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const diffDays = Math.round((today - lastDate) / (1000 * 60 * 60 * 24));
      if (diffDays >= 2) {
        await this.create(
          userId,
          'streak_broken',
          'Your streak ended',
          'You missed yesterday\'s session. Start fresh today!'
        );
      }
    }

    // Pain check-in — if user has pain areas and hasn't worked out in 5+ days
    // Only fires for existing users (lastDateStr must be set — new users with no sessions are excluded)
    if (prefs.type_pain_checkin && lastDateStr) {
      const painProfile = await dao.getUserPainProfile(userId);
      const hasPain = painProfile?.pain_status === 'yes' ||
        (painProfile?.pain_areas && painProfile.pain_areas !== 'none' && painProfile.pain_areas !== '[]');
      if (hasPain) {
        const daysSinceLast = Math.round((new Date().setHours(0, 0, 0, 0) - new Date(lastDateStr)) / (1000 * 60 * 60 * 24));
        if (daysSinceLast >= 5) {
          await this.create(
            userId,
            'pain_checkin',
            'Check in on your pain areas',
            'It\'s been a while since your last session. How are you feeling? A gentle session could help.'
          );
        }
      }
    }
  }

  async #sendPush(userId, title, body) {
    if (!webpush || !process.env.VAPID_PUBLIC_KEY || !process.env.VAPID_PRIVATE_KEY) return;
    const subs = await dao.getPushSubscriptions(userId);
    for (const sub of subs) {
      try {
        await webpush.sendNotification(
          { endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth } },
          JSON.stringify({ title, body })
        );
      } catch (err) {
        if (err.statusCode === 410 || err.statusCode === 404) {
          await dao.deletePushSubscription(userId, sub.endpoint);
        }
      }
    }
  }
}

module.exports = NotificationService;
