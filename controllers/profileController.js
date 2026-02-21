const UserService = require('../services/UserService');
const StatsService = require('../services/StatsService');

const userService = new UserService();
const statsService = new StatsService();

const getProfile = async (req, res) => {
  try {
    const userId = req.session.user.id;
    const user = await userService.getUserById(userId);
    const stats = await statsService.getUserStats(userId);

    res.render('profile/index', {
      user: {
        id: user.id,
        fullName: user.fullName,
        email: user.email,
        twofaEnabled: user.twofaEnabled
      },
      stats
    });
  } catch (err) {
    console.error(err);
    req.flash('error', 'Something went wrong loading your profile.');
    res.redirect('/dashboard');
  }
};

const getEditProfile = async (req, res) => {
  try {
    const userId = req.session.user.id;
    const user = await userService.getUserById(userId);

    res.render('profile/edit', {
      user: {
        id: user.id,
        fullName: user.fullName,
        email: user.email
      },
      errors: []
    });
  } catch (err) {
    console.error(err);
    req.flash('error', 'Something went wrong loading edit profile.');
    res.redirect('/profile');
  }
};

module.exports = { getProfile, getEditProfile };
