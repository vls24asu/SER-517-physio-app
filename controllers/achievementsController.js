const StatsService = require('../services/StatsService');

const statsService = new StatsService();

const ACHIEVEMENTS = [
  {
    id: 'first_session',
    name: 'First Step',
    description: 'Complete your first session',
    emoji: '🌟',
    check: (stats) => stats.totalSessions >= 1,
    progress: (stats) => ({ current: Math.min(stats.totalSessions, 1), target: 1 })
  },
  {
    id: 'first_streak',
    name: 'First Streak',
    description: 'Train 3 days in a row',
    emoji: '🔥',
    check: (stats) => stats.streak >= 3,
    progress: (stats) => ({ current: Math.min(stats.streak, 3), target: 3 })
  },
  {
    id: 'getting_strong',
    name: 'Getting Strong',
    description: 'Complete 10 sessions',
    emoji: '💪',
    check: (stats) => stats.totalSessions >= 10,
    progress: (stats) => ({ current: Math.min(stats.totalSessions, 10), target: 10 })
  },
  {
    id: 'half_hour_hero',
    name: 'Half Hour Hero',
    description: 'Accumulate 30 minutes of training',
    emoji: '⚡',
    check: (stats) => parseFloat(stats.totalTime) * 60 >= 30,
    progress: (stats) => ({
      current: Math.min(Math.round(parseFloat(stats.totalTime) * 60), 30),
      target: 30,
      unit: 'min'
    })
  },
  {
    id: 'time_keeper',
    name: 'Time Keeper',
    description: '5 hours total',
    emoji: '⏱️',
    check: (stats) => parseFloat(stats.totalTime) >= 5,
    progress: (stats) => ({
      current: Math.min(parseFloat(stats.totalTime), 5).toFixed(1),
      target: 5,
      unit: 'h'
    })
  },
  {
    id: 'week_warrior',
    name: 'Week Warrior',
    description: 'Complete 5 sessions in one week',
    emoji: '🏅',
    check: (stats) => stats.sessionsThisWeek >= 5,
    progress: (stats) => ({ current: Math.min(stats.sessionsThisWeek, 5), target: 5 })
  },
  {
    id: 'consistent',
    name: 'Consistent',
    description: 'Train 14 days in a row',
    emoji: '🎯',
    check: (stats) => stats.streak >= 14,
    progress: (stats) => ({ current: Math.min(stats.streak, 14), target: 14 })
  }
];

const getAchievements = async (req, res) => {
  try {
    const userId = req.session.user.id;
    const stats = await statsService.getUserStats(userId);

    const achievements = ACHIEVEMENTS.map(a => ({
      ...a,
      earned: a.check(stats),
      progress: a.progress(stats)
    }));

    const unlocked = achievements.filter(a => a.earned);
    const locked = achievements.filter(a => !a.earned);

    res.render('achievements/index', {
      unlocked,
      locked,
      unlockedCount: unlocked.length,
      totalCount: achievements.length,
      stats
    });
  } catch (err) {
    console.error(err);
    req.flash('error', 'Something went wrong loading achievements.');
    res.redirect('/profile');
  }
};

module.exports = { getAchievements, ACHIEVEMENTS };
