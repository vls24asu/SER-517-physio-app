// routes/routineRoutes.js
const express = require('express');
const router = express.Router();

const { isAuthenticated } = require('../middleware/auth');
const { requireOnboardingComplete } = require('../middleware/onboarding');
const db = require('../config/db');

// ── Create Custom Routine (builder/draft) ──────────────────────────────────

// Show routine builder + current draft entries
router.get('/', isAuthenticated, requireOnboardingComplete, async (req, res) => {
  const userId = req.session.user.id;

  const [exercises] = await db.query(
    `SELECT id, name, category FROM Exercise ORDER BY name ASC`
  );

  const [routine] = await db.query(
    `SELECT re.id, re.sort_order,
            e.id AS exercise_id, e.name, e.category
     FROM Routine_Entry re
     JOIN Exercise e ON e.id = re.exercise_id
     WHERE re.user_id = ?
     ORDER BY re.sort_order ASC, re.created_at DESC`,
    [userId]
  );

  res.render('routines/index', { exercises, routine });
});

// Add exercise to draft
router.post('/add', isAuthenticated, requireOnboardingComplete, async (req, res) => {
  const userId = req.session.user.id;
  const exerciseId = Number(req.body.exercise_id);

  if (!exerciseId) {
    req.flash('error', 'Please select an exercise.');
    return res.redirect('/routines');
  }

  const [[row]] = await db.query(
    `SELECT COALESCE(MAX(sort_order), 0) AS maxSort FROM Routine_Entry WHERE user_id=?`,
    [userId]
  );
  const sortOrder = (row?.maxSort || 0) + 1;

  await db.query(
    `INSERT INTO Routine_Entry (user_id, exercise_id, is_completed, sort_order) VALUES (?, ?, 0, ?)`,
    [userId, exerciseId, sortOrder]
  );

  res.redirect('/routines');
});

// Remove exercise from draft
router.post('/remove', isAuthenticated, requireOnboardingComplete, async (req, res) => {
  const userId = req.session.user.id;
  const entryId = Number(req.body.entry_id);

  await db.query(
    `DELETE FROM Routine_Entry WHERE id=? AND user_id=?`,
    [entryId, userId]
  );

  res.redirect('/routines');
});

// Save draft as a named routine
router.post('/save', isAuthenticated, requireOnboardingComplete, async (req, res) => {
  const userId = req.session.user.id;
  const routineName = (req.body.routine_name || '').trim();

  if (!routineName) {
    req.flash('error', 'Please enter a name for your routine.');
    return res.redirect('/routines');
  }

  const [draft] = await db.query(
    `SELECT re.exercise_id, re.sort_order
     FROM Routine_Entry re
     WHERE re.user_id = ?
     ORDER BY re.sort_order ASC`,
    [userId]
  );

  if (draft.length === 0) {
    req.flash('error', 'Add at least one exercise before saving.');
    return res.redirect('/routines');
  }

  const [result] = await db.query(
    `INSERT INTO Saved_Routine (user_id, name) VALUES (?, ?)`,
    [userId, routineName]
  );
  const routineId = result.insertId;

  for (const entry of draft) {
    await db.query(
      `INSERT INTO Saved_Routine_Entry (routine_id, exercise_id, sort_order) VALUES (?, ?, ?)`,
      [routineId, entry.exercise_id, entry.sort_order]
    );
  }

  // Clear the draft
  await db.query(`DELETE FROM Routine_Entry WHERE user_id=?`, [userId]);

  req.flash('success', `Routine "${routineName}" saved!`);
  res.redirect('/routines/saved');
});

// ── Saved Routines ─────────────────────────────────────────────────────────

// List all saved routines
router.get('/saved', isAuthenticated, requireOnboardingComplete, async (req, res) => {
  const userId = req.session.user.id;

  const [routines] = await db.query(
    `SELECT sr.id, sr.name, sr.created_at,
            COUNT(sre.id) AS exercise_count,
            COALESCE(SUM(COALESCE(e.hold_time_sec, 0) + COALESCE(e.rest_time_sec, 0)), 0) AS total_seconds,
            GROUP_CONCAT(DISTINCT e.category ORDER BY e.category SEPARATOR ',') AS categories
     FROM Saved_Routine sr
     LEFT JOIN Saved_Routine_Entry sre ON sre.routine_id = sr.id
     LEFT JOIN Exercise e ON e.id = sre.exercise_id
     WHERE sr.user_id = ?
     GROUP BY sr.id
     ORDER BY sr.created_at DESC`,
    [userId]
  );

  const categoryEmoji = { strengthen: '💪', stretch: '🧘', avoid: '⚠️' };

  // Convert total_seconds to minutes and split categories
  const formatted = routines.map(r => {
    const cats = r.categories ? r.categories.split(',') : [];
    return {
      ...r,
      total_min: Math.round((r.total_seconds || 0) / 60),
      category_list: cats,
      emoji: categoryEmoji[cats[0]] || '🏋️'
    };
  });

  res.render('routines/saved', { routines: formatted });
});

// Delete a saved routine
router.post('/saved/delete', isAuthenticated, requireOnboardingComplete, async (req, res) => {
  const userId = req.session.user.id;
  const routineId = Number(req.body.routine_id);

  await db.query(
    `DELETE FROM Saved_Routine WHERE id=? AND user_id=?`,
    [routineId, userId]
  );

  req.flash('success', 'Routine deleted.');
  res.redirect('/routines/saved');
});

module.exports = router;
