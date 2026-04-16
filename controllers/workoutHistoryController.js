const WorkoutSessionService = require('../services/WorkoutSessionService');

const sessionService = new WorkoutSessionService();

const getWorkoutHistory = async (req, res) => {
  try {
    const sessions = await sessionService.getHistory(req.session.user.id);
    res.render('workout-history/index', { sessions });
  } catch (err) {
    console.error(err);
    req.flash('error', 'Something went wrong loading workout history.');
    res.redirect('/profile');
  }
};

const getWorkoutHistoryDetail = async (req, res) => {
  try {
    const sessionId = Number(req.params.id);
    const userId = req.session.user.id;
    const session = await sessionService.getSessionDetail(sessionId, userId);
    if (!session) {
      req.flash('error', 'Session not found.');
      return res.redirect('/workout-history');
    }
    res.render('workout-history/detail', { session });
  } catch (err) {
    console.error(err);
    req.flash('error', 'Something went wrong.');
    res.redirect('/workout-history');
  }
};

const getSessionExercises = async (req, res) => {
  try {
    const sessionId = Number(req.params.id);
    const userId = req.session.user.id;
    const session = await sessionService.getSessionDetail(sessionId, userId);
    if (!session) return res.status(404).json({ error: 'Not found' });
    res.json({ exercises: session.exercises });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to load exercises' });
  }
};

module.exports = { getWorkoutHistory, getWorkoutHistoryDetail, getSessionExercises };
