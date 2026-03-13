const UserProfileDAO = require('../dao/UserProfileDAO');

/**
 * Enforces completion of onboarding before accessing the rest of the app.
 * Assumes auth middleware already validated the session.
 */
const requireOnboardingComplete = async (req, res, next) => {
  try {
    // Allow onboarding routes themselves.
    if (req.originalUrl && req.originalUrl.startsWith('/onboarding')) {
      return next();
    }

    const userId = req.session?.user?.id;
    if (!userId) return next();

    const dao = new UserProfileDAO();
    const status = await dao.getOnboardingStatus(userId);
    if (status.completed) return next();

    const step = status.step && Number.isInteger(Number(status.step)) ? Number(status.step) : 1;
    return res.redirect(`/onboarding/step/${step}`);
  } catch (err) {
    console.error('Onboarding middleware error:', err);
    return next();
  }
};

module.exports = { requireOnboardingComplete };
