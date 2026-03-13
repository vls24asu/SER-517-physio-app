// routes/routineRoutes.js
const express = require('express');
const router = express.Router();

const { isAuthenticated } = require('../middleware/auth');
const { requireOnboardingComplete } = require('../middleware/onboarding');
const db = require('../config/db');

// Show routine builder + current routine entries
router.get('/', isAuthenticated, requireOnboardingComplete, async (req, res) => {
  const userId = req.session.user.id;

  // list exercises to add
  const [exercises] = await db.query(
    `SELECT id, name, category, is_gym_only
     FROM Exercise
     ORDER BY name ASC`
  );

  // current routine
  const [routine] = await db.query(
    `SELECT re.id, re.is_completed, re.sort_order,
            e.id AS exercise_id, e.name, e.category
     FROM Routine_Entry re
     JOIN Exercise e ON e.id = re.exercise_id
     WHERE re.user_id = ?
     ORDER BY re.sort_order ASC, re.created_at DESC`,
    [userId]
  );

  res.render('routines/index', { exercises, routine });
});

// Add exercise to routine
router.post('/add', isAuthenticated, requireOnboardingComplete, async (req, res) => {
  const userId = req.session.user.id;
  const exerciseId = Number(req.body.exercise_id);

  if (!exerciseId) {
    req.flash('error', 'Please select an exercise.');
    return res.redirect('/routines');
  }

  // next sort_order
  const [[row]] = await db.query(
    `SELECT COALESCE(MAX(sort_order), 0) AS maxSort FROM Routine_Entry WHERE user_id=?`,
    [userId]
  );
  const sortOrder = (row?.maxSort || 0) + 1;

  await db.query(
    `INSERT INTO Routine_Entry (user_id, exercise_id, is_completed, sort_order)
     VALUES (?, ?, 0, ?)`,
    [userId, exerciseId, sortOrder]
  );

  req.flash('success', 'Added to routine.');
  res.redirect('/routines');
});

// Remove routine entry
router.post('/remove', isAuthenticated, requireOnboardingComplete, async (req, res) => {
  const userId = req.session.user.id;
  const entryId = Number(req.body.entry_id);

  await db.query(
    `DELETE FROM Routine_Entry WHERE id=? AND user_id=?`,
    [entryId, userId]
  );

  req.flash('success', 'Removed from routine.');
  res.redirect('/routines');
});

// Start a session (logs a Workout_Session + resets routine completion)
router.post('/start-session', isAuthenticated, requireOnboardingComplete, async (req, res) => {
  const userId = req.session.user.id;

  const [routine] = await db.query(
    `SELECT re.id, e.name
     FROM Routine_Entry re
     JOIN Exercise e ON e.id=re.exercise_id
     WHERE re.user_id=?
     ORDER BY re.sort_order ASC`,
    [userId]
  );

  if (routine.length === 0) {
    req.flash('error', 'Your routine is empty. Add exercises first.');
    return res.redirect('/routines');
  }

  // mark all routine entries not completed for this session
  await db.query(`UPDATE Routine_Entry SET is_completed=0 WHERE user_id=?`, [userId]);

  // create workout session log (for /workout-history)
  const title = 'Workout Session';
  const durationMin = 0;
  const exerciseCount = routine.length;
  const tags = 'routine';
  const emoji = '🏋️';

  await db.query(
    `INSERT INTO Workout_Session (user_id, title, duration_min, exercise_count, tags, emoji)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [userId, title, durationMin, exerciseCount, tags, emoji]
  );

  req.flash('success', 'Session started. Track completion in your routine list.');
  res.redirect('/routines');
});

// Mark an entry complete
router.post('/complete', isAuthenticated, requireOnboardingComplete, async (req, res) => {
  const userId = req.session.user.id;
  const entryId = Number(req.body.entry_id);

  await db.query(
    `UPDATE Routine_Entry SET is_completed=1 WHERE id=? AND user_id=?`,
    [entryId, userId]
  );

  res.redirect('/routines');
});

module.exports = router;