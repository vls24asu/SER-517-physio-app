const isAuthenticated = (req, res, next) => {
  if (req.session.user && req.session.user.id) {
    req.user = req.session.user;
    return next();
  }
  req.flash('error', 'You must log in first');
  res.redirect('/login');
};

module.exports = { isAuthenticated };
