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

module.exports = { getWorkoutHistory };
