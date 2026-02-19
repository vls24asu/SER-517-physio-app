const setNoStore = (res) => {
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, private');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');
};

const isAuthenticated = (req, res, next) => {
  // Prevent cached protected pages from being served after logout.
  setNoStore(res);

  if (req.session.user && req.session.user.id) {
    req.user = req.session.user;
    return next();
  }
  req.flash('error', 'You must log in first');
  res.redirect('/login');
};

module.exports = { isAuthenticated, setNoStore };
