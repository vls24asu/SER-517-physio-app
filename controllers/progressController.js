const StatsService = require('../services/StatsService');
const WorkoutSessionService = require('../services/WorkoutSessionService');

const statsService = new StatsService();
const sessionService = new WorkoutSessionService();

const getProgress = async (req, res) => {
  try {
    const userId = req.session.user.id;
    const [stats, sessions] = await Promise.all([
      statsService.getUserStats(userId),
      sessionService.getHistory(userId)
    ]);

    res.render('progress/index', { stats, sessions });
  } catch (err) {
    console.error(err);
    req.flash('error', 'Something went wrong loading your progress.');
    res.redirect('/dashboard');
  }
};

module.exports = { getProgress };
