const StatsService = require('../services/StatsService');
const WorkoutSessionService = require('../services/WorkoutSessionService');

const statsService = new StatsService();
const sessionService = new WorkoutSessionService();

const getProgress = async (req, res) => {
  try {
    const userId = req.session.user.id;
    const period = ['week', 'month', 'year'].includes(req.query.period)
      ? req.query.period
      : 'week';

    const [stats, sessions, chartData, exercises, periodStats] = await Promise.all([
      statsService.getUserStats(userId),
      sessionService.getHistory(userId),
      sessionService.getChartData(userId, period),
      sessionService.getExercisesForPeriod(userId, period),
      sessionService.getSessionCountForPeriod(userId, period)
    ]);

    const now = new Date();
    const periodLabel = period === 'week'
      ? 'This week'
      : period === 'month'
        ? now.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
        : String(now.getFullYear());

    const totalMin = periodStats.totalMin;
    const totalTimeLabel = totalMin >= 60
      ? `${(totalMin / 60).toFixed(1)} hours total`
      : `${totalMin} minutes total`;

    const periodExercisesLabel = period === 'week'
      ? 'this week'
      : period === 'month'
        ? 'this month'
        : 'this year';

    res.render('progress/index', {
      period,
      stats,
      sessions,
      chartData,
      exercises,
      sessionCount: periodStats.count,
      totalTimeLabel,
      periodLabel,
      periodExercisesLabel
    });
  } catch (err) {
    console.error(err);
    req.flash('error', 'Something went wrong loading your progress.');
    res.redirect('/dashboard');
  }
};

module.exports = { getProgress };
