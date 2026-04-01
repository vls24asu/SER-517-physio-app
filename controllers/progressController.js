const StatsService = require('../services/StatsService');
const WorkoutSessionService = require('../services/WorkoutSessionService');
const BodyCheckinDAO = require('../dao/BodyCheckinDAO');

const statsService = new StatsService();
const sessionService = new WorkoutSessionService();
const checkinDAO = new BodyCheckinDAO();

const getProgress = async (req, res) => {
  try {
    const userId = req.session.user.id;
    const period = ['week', 'month', 'year'].includes(req.query.period)
      ? req.query.period
      : 'week';

    const timezone = res.locals.userTimezone || 'UTC';
    const [stats, sessions, chartData, periodStats, focusAreas] = await Promise.all([
      statsService.getUserStats(userId),
      sessionService.getHistory(userId),
      sessionService.getChartData(userId, period, timezone),
      sessionService.getSessionCountForPeriod(userId, period, timezone),
      checkinDAO.getFocusAreas(userId)
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

    res.render('progress/index', {
      period,
      stats,
      sessions,
      chartData,
      sessionCount: periodStats.count,
      totalTimeLabel,
      periodLabel,
      focusAreas
    });
  } catch (err) {
    console.error(err);
    req.flash('error', 'Something went wrong loading your progress.');
    res.redirect('/dashboard');
  }
};

// POST /progress/focus-area  — add a new focus area
const addFocusArea = async (req, res) => {
  try {
    const userId = req.session.user.id;
    const { areaName, emoji } = req.body;
    if (!areaName) return res.status(400).json({ error: 'areaName required' });
    await checkinDAO.addFocusArea(userId, areaName, emoji || '🩹');
    res.json({ ok: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to save focus area' });
  }
};

// GET /progress/checkin/:area  — show the check-in detail page
const getCheckin = async (req, res) => {
  try {
    const userId = req.session.user.id;
    const areaName = decodeURIComponent(req.params.area);
    const logs = await checkinDAO.getLogs(userId, areaName);

    // Build a map { 'YYYY-MM-DD': { pain_status, pain_scale, notes } }
    const logMap = {};
    logs.forEach(l => { logMap[l.log_date] = l; });

    res.render('progress/checkin', { areaName, logMap, logs });
  } catch (err) {
    console.error(err);
    req.flash('error', 'Something went wrong.');
    res.redirect('/progress');
  }
};

// POST /progress/checkin/:area  — save a log entry
const saveCheckin = async (req, res) => {
  try {
    const userId = req.session.user.id;
    const areaName = decodeURIComponent(req.params.area);
    const { date, painStatus, painScale, notes } = req.body;

    if (!date || !painStatus) return res.status(400).json({ error: 'date and painStatus required' });

    await checkinDAO.saveLog(userId, areaName, date, painStatus, parseInt(painScale, 10) || 0, notes);
    res.json({ ok: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to save check-in' });
  }
};

module.exports = { getProgress, addFocusArea, getCheckin, saveCheckin };
