const StatsService = require('../services/StatsService');

const statsService = new StatsService();

const getDashboard = async (req, res) => {
  try {
    const userId = req.session.user.id;
    const stats = await statsService.getUserStats(userId);
    
    // Get greeting based on time of day
    const hour = new Date().getHours();
    let greeting;
    if (hour < 12) {
      greeting = 'Good morning';
    } else if (hour < 17) {
      greeting = 'Good afternoon';
    } else {
      greeting = 'Good evening';
    }

    res.render('dashboard/index', {
      greeting,
      stats,
      user: req.session.user
    });
  } catch (err) {
    console.error(err);
    req.flash('error', 'Something went wrong loading your dashboard.');
    res.redirect('/login');
  }
};

module.exports = { getDashboard };
