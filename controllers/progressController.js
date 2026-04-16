const StatsService = require('../services/StatsService');
const WorkoutSessionService = require('../services/WorkoutSessionService');
const BodyCheckinDAO = require('../dao/BodyCheckinDAO');
const db = require('../config/db');

const statsService = new StatsService();
const sessionService = new WorkoutSessionService();
const checkinDAO = new BodyCheckinDAO();

async function syncPainAreasFromFocusAreas(userId) {
  const [rows] = await db.query(
    `SELECT area_name FROM User_Focus_Area WHERE user_id = ? ORDER BY created_at ASC`,
    [userId]
  );
  const areas = rows.map(r => r.area_name);
  const painAreas = areas.length > 0 ? areas.join(',') : null;
  await db.query(
    `UPDATE User_Profile SET pain_areas = ?, updated_at = CURRENT_TIMESTAMP WHERE user_id = ?`,
    [painAreas, userId]
  );
}

const getProgress = async (req, res) => {
  try {
    const userId = req.session.user.id;
    const period = ['week', 'month', 'year'].includes(req.query.period)
      ? req.query.period
      : 'week';

    const timezone = res.locals.userTimezone || 'UTC';
    const [stats, sessions, chartData, periodStats, focusAreas, areaOptions, painLogs] = await Promise.all([
      statsService.getUserStats(userId),
      sessionService.getHistory(userId),
      sessionService.getChartData(userId, period, timezone),
      sessionService.getSessionCountForPeriod(userId, period, timezone),
      checkinDAO.getFocusAreas(userId),
      checkinDAO.getAreaOptions(),
      checkinDAO.getAllLogsForUser(userId, 30)
    ]);

    // Shape pain logs into { dates: [...], areas: [{ name, values }] }
    const painDatesSet = [...new Set(painLogs.map(l => l.log_date))].sort();
    const painAreaMap = {};
    painLogs.forEach(l => {
      if (!painAreaMap[l.area_name]) painAreaMap[l.area_name] = {};
      painAreaMap[l.area_name][l.log_date] = l.pain_scale;
    });
    const painChartData = {
      dates: painDatesSet,
      areas: Object.keys(painAreaMap).map(name => ({
        name,
        values: painDatesSet.map(d => painAreaMap[name][d] != null ? painAreaMap[name][d] : null)
      }))
    };

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
      focusAreas,
      areaOptions,
      painChartData
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
    await syncPainAreasFromFocusAreas(userId);
    res.json({ ok: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to save focus area' });
  }
};

// DELETE /progress/focus-area  — remove a focus area
const removeFocusArea = async (req, res) => {
  try {
    const userId = req.session.user.id;
    const { areaName } = req.body;
    if (!areaName) return res.status(400).json({ error: 'areaName required' });
    await db.query(
      `DELETE FROM User_Focus_Area WHERE user_id = ? AND area_name = ?`,
      [userId, areaName]
    );
    await syncPainAreasFromFocusAreas(userId);
    res.json({ ok: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to remove focus area' });
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

// GET /progress/checkin/:area/data  — return logs as JSON (for modal)
const getCheckinData = async (req, res) => {
  try {
    const userId = req.session.user.id;
    const areaName = decodeURIComponent(req.params.area);
    const logs = await checkinDAO.getLogs(userId, areaName);
    const logMap = {};
    logs.forEach(l => { logMap[l.log_date] = l; });
    res.json({ ok: true, areaName, logMap });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to load check-in data' });
  }
};

// POST /progress/checkin/:area  — save a log entry
const saveCheckin = async (req, res) => {
  try {
    const userId = req.session.user.id;
    const areaName = decodeURIComponent(req.params.area);
    const { date, painStatus, painScale, notes } = req.body;

    if (!date || !painStatus) return res.status(400).json({ error: 'date and painStatus required' });

    // Block future dates
    const today = new Date().toISOString().slice(0, 10);
    if (date > today) return res.status(400).json({ error: 'Cannot log for a future date' });

    const painScaleInt = parseInt(painScale, 10);
    const finalScale = isNaN(painScaleInt) ? 0 : painScaleInt;
    await checkinDAO.saveLog(userId, areaName, date, painStatus, finalScale, notes);

    // Sync pain scale for this area to pain_intensity_map using the latest logged date's value
    const [[latestLog]] = await db.query(
      `SELECT pain_scale FROM Body_Checkin_Log
       WHERE user_id = ? AND area_name = ?
       ORDER BY log_date DESC LIMIT 1`,
      [userId, areaName]
    );
    const syncedScale = latestLog ? latestLog.pain_scale : finalScale;
    const [[profile]] = await db.query(
      `SELECT pain_intensity_map FROM User_Profile WHERE user_id = ?`, [userId]
    );
    let intensityMap = {};
    if (profile && profile.pain_intensity_map) {
      try {
        intensityMap = typeof profile.pain_intensity_map === 'string'
          ? JSON.parse(profile.pain_intensity_map)
          : profile.pain_intensity_map;
      } catch (e) { intensityMap = {}; }
    }
    intensityMap[areaName] = syncedScale;
    const allVals = Object.values(intensityMap).map(Number).filter(n => !isNaN(n));
    const maxVal = allVals.length ? Math.max(...allVals) : syncedScale;
    await db.query(
      `UPDATE User_Profile SET pain_intensity_map = ?, pain_intensity = ?, updated_at = CURRENT_TIMESTAMP WHERE user_id = ?`,
      [JSON.stringify(intensityMap), maxVal, userId]
    );

    res.json({ ok: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to save check-in' });
  }
};

module.exports = { getProgress, addFocusArea, removeFocusArea, getCheckin, getCheckinData, saveCheckin };
