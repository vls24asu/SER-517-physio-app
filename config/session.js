const sessionConfig = {
  secret: process.env.SESSION_SECRET || '',
  resave: false,
  saveUninitialized: false
};

module.exports = sessionConfig;
