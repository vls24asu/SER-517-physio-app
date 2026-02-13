const requireRole = (role) => {
  return (req, res, next) => {
    if (req.session.user && req.session.user.role === role) {
      return next();
    }
    req.flash('error', 'You do not have permission to access this page');
    res.redirect('/dashboard');
  };
};

module.exports = { requireRole };
