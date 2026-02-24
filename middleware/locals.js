const setLocals = (req, res, next) => {
  res.locals.currentUser = req.session.user || null;
  res.locals.currentPath = req.originalUrl.split('?')[0];
  next();
};

module.exports = { setLocals };
