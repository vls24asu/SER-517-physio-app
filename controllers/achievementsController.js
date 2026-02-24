const StatsService = require('../services/StatsService');

const statsService = new StatsService();

const ACHIEVEMENTS = [
  {
    id: 'first_streak',
    name: 'First Streak',
    description: 'Train 3 days in a row',
    emoji: '🔥',
    check: (stats) => stats.streak >= 3
  },
  {
    id: 'getting_strong',
    name: 'Getting Strong',
    description: 'Complete 10 sessions',
    emoji: '💪',
    check: (stats) => stats.totalSessions >= 10
  },
  {
    id: 'time_keeper',
    name: 'Time Keeper',
    description: '5 hours total',
    emoji: '⏱️',
    check: (stats) => parseFloat(stats.totalTime) >= 5
  },
  {
    id: 'consistent',
    name: 'Consistant',
    description: 'Train 2 weeks straight',
    emoji: '🎯',
    check: (stats) => stats.streak >= 14
  }
];

const getAchievements = async (req, res) => {
  try {
    const userId = req.session.user.id;
    const stats = await statsService.getUserStats(userId);

    const achievements = ACHIEVEMENTS.map(a => ({
      ...a,
      earned: a.check(stats)
    }));

    const unlocked = achievements.filter(a => a.earned).length;

    res.render('achievements/index', { achievements, unlocked, stats });
  } catch (err) {
    console.error(err);
    req.flash('error', 'Something went wrong loading achievements.');
    res.redirect('/profile');
  }
};

module.exports = { getAchievements };
