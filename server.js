require('dotenv').config();

const express = require('express');
const session = require('express-session');
const flash = require('connect-flash');
const expressLayouts = require('express-ejs-layouts');
const path = require('path');
const sessionConfig = require('./config/session');
const routes = require('./routes');
const db = require('./config/db');

const app = express();
const PORT = process.env.PORT || 3000;

if (!process.env.SESSION_SECRET) {
  console.error('Missing SESSION_SECRET in .env. Copy .env.example to .env and set all values.');
  process.exit(1);
}

// Parse form data and JSON
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Session and flash messages
app.use(session(sessionConfig));
app.use(flash());

// Make flash messages and current user available to all views
app.use((req, res, next) => {
  res.locals.success = req.flash('success');
  res.locals.error = req.flash('error');
  res.locals.currentUser = req.session.user || null;
  res.locals.currentPath = req.path;
  next();
});

// EJS setup with layouts
app.use(expressLayouts);
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.set('layout', 'layouts/main');

// Static files
app.use(express.static(path.join(__dirname, 'public')));

// Routes
app.use('/', routes);

// Default route
app.get('/', (req, res) => {
  if (req.session.user) {
    return res.redirect('/dashboard');
  }
  res.redirect('/login');
});

// Start server after confirming DB connectivity
const start = async () => {
  try {
    await db.query('SELECT 1');
    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error('Database connection failed. Check DB_* values in .env and ensure MySQL is running.');
    console.error(err.message);
    process.exit(1);
  }
};

start();
