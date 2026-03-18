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

// ── Preview & Edit Saved Routine ───────────────────────────────────────────

// Preview a saved routine (Today's Session page)
router.get('/saved/:id/preview', isAuthenticated, requireOnboardingComplete, async (req, res) => {
  const userId = req.session.user.id;
  const routineId = Number(req.params.id);

  const [[routine]] = await db.query(
    `SELECT sr.id, sr.name,
            COUNT(sre.id) AS exercise_count,
            COALESCE(SUM(COALESCE(e.hold_time_sec, 0) + COALESCE(e.rest_time_sec, 0)), 0) AS total_seconds,
            GROUP_CONCAT(DISTINCT e.category ORDER BY e.category SEPARATOR ',') AS categories
     FROM Saved_Routine sr
     LEFT JOIN Saved_Routine_Entry sre ON sre.routine_id = sr.id
     LEFT JOIN Exercise e ON e.id = sre.exercise_id
     WHERE sr.id = ? AND sr.user_id = ?
     GROUP BY sr.id`,
    [routineId, userId]
  );

  if (!routine) {
    req.flash('error', 'Routine not found.');
    return res.redirect('/routines/saved');
  }

  const [exercises] = await db.query(
    `SELECT sre.id, sre.sort_order,
            e.id AS exercise_id, e.name, e.category,
            e.reps, e.sets, e.hold_time_sec, e.rest_time_sec
     FROM Saved_Routine_Entry sre
     JOIN Exercise e ON e.id = sre.exercise_id
     WHERE sre.routine_id = ?
     ORDER BY sre.sort_order ASC`,
    [routineId]
  );

  const categoryEmoji = { strengthen: '💪', stretch: '🧘', avoid: '⚠️' };
  const cats = routine.categories ? routine.categories.split(',') : [];
  const routineData = {
    ...routine,
    total_min: Math.round((routine.total_seconds || 0) / 60),
    category_list: cats,
    emoji: categoryEmoji[cats[0]] || '🏋️'
  };

  const exercisesWithMeta = exercises.map(ex => {
    const timeParts = [];
    if (ex.sets) timeParts.push(`${ex.sets} sets`);
    if (ex.reps) timeParts.push(`${ex.reps} reps`);
    else if (ex.hold_time_sec) timeParts.push(`${ex.hold_time_sec} seconds`);
    return { ...ex, meta: timeParts.join(' · '), emoji: categoryEmoji[ex.category] || '🏋️' };
  });

  res.render('routines/preview', { routine: routineData, exercises: exercisesWithMeta });
});

// Edit a saved routine (GET)
router.get('/saved/:id/edit', isAuthenticated, requireOnboardingComplete, async (req, res) => {
  const userId = req.session.user.id;
  const routineId = Number(req.params.id);

  const [[routine]] = await db.query(
    `SELECT id, name FROM Saved_Routine WHERE id = ? AND user_id = ?`,
    [routineId, userId]
  );

  if (!routine) {
    req.flash('error', 'Routine not found.');
    return res.redirect('/routines/saved');
  }

  const [entries] = await db.query(
    `SELECT sre.id, sre.sort_order,
            e.id AS exercise_id, e.name, e.category
     FROM Saved_Routine_Entry sre
     JOIN Exercise e ON e.id = sre.exercise_id
     WHERE sre.routine_id = ?
     ORDER BY sre.sort_order ASC`,
    [routineId]
  );

  const [allExercises] = await db.query(
    `SELECT id, name, category FROM Exercise ORDER BY name ASC`
  );

  res.render('routines/edit', { routine, entries, allExercises });
});

// Add exercise to a saved routine
router.post('/saved/:id/add', isAuthenticated, requireOnboardingComplete, async (req, res) => {
  const userId = req.session.user.id;
  const routineId = Number(req.params.id);
  const exerciseId = Number(req.body.exercise_id);

  const [[routine]] = await db.query(
    `SELECT id FROM Saved_Routine WHERE id = ? AND user_id = ?`,
    [routineId, userId]
  );
  if (!routine) return res.redirect('/routines/saved');

  if (!exerciseId) {
    req.flash('error', 'Please select an exercise.');
    return res.redirect(`/routines/saved/${routineId}/edit`);
  }

  const [[row]] = await db.query(
    `SELECT COALESCE(MAX(sort_order), 0) AS maxSort FROM Saved_Routine_Entry WHERE routine_id = ?`,
    [routineId]
  );
  const sortOrder = (row?.maxSort || 0) + 1;

  await db.query(
    `INSERT INTO Saved_Routine_Entry (routine_id, exercise_id, sort_order) VALUES (?, ?, ?)`,
    [routineId, exerciseId, sortOrder]
  );

  res.redirect(`/routines/saved/${routineId}/edit`);
});

// Remove exercise from a saved routine
router.post('/saved/:id/remove', isAuthenticated, requireOnboardingComplete, async (req, res) => {
  const userId = req.session.user.id;
  const routineId = Number(req.params.id);
  const entryId = Number(req.body.entry_id);

  const [[routine]] = await db.query(
    `SELECT id FROM Saved_Routine WHERE id = ? AND user_id = ?`,
    [routineId, userId]
  );
  if (!routine) return res.redirect('/routines/saved');

  await db.query(
    `DELETE FROM Saved_Routine_Entry WHERE id = ? AND routine_id = ?`,
    [entryId, routineId]
  );

  res.redirect(`/routines/saved/${routineId}/edit`);
});

// Start session for a saved routine
router.get('/saved/:id/session', isAuthenticated, requireOnboardingComplete, async (req, res) => {
  const userId = req.session.user.id;
  const routineId = Number(req.params.id);

  const [[routine]] = await db.query(
    `SELECT id, name FROM Saved_Routine WHERE id = ? AND user_id = ?`,
    [routineId, userId]
  );

  if (!routine) {
    req.flash('error', 'Routine not found.');
    return res.redirect('/routines/saved');
  }

  const [exercises] = await db.query(
    `SELECT e.name, e.category, e.sets, e.reps, e.hold_time_sec, e.tips, e.common_mistakes
     FROM Saved_Routine_Entry sre
     JOIN Exercise e ON e.id = sre.exercise_id
     WHERE sre.routine_id = ?
     ORDER BY sre.sort_order ASC`,
    [routineId]
  );

  const categoryEmoji = { strengthen: '💪', stretch: '🧘', avoid: '⚠️' };
  const steps = [];
  const totalExercises = exercises.length;

  exercises.forEach((ex, exIdx) => {
    const numSets = Math.max(1, Math.round(Number(ex.sets) || 1));
    for (let s = 1; s <= numSets; s++) {
      steps.push({
        name: ex.name,
        category: ex.category,
        emoji: categoryEmoji[ex.category] || '🏋️',
        exerciseNum: exIdx + 1,
        totalExercises,
        setNum: s,
        totalSets: numSets,
        timerSec: ex.hold_time_sec || 90,
        reps: ex.reps || null,
        tips: ex.tips || ex.common_mistakes || null
      });
    }
  });

  res.render('routines/session', { stepsJson: JSON.stringify(steps), routineId });
});

// Log a completed session
router.post('/saved/:id/log-session', isAuthenticated, async (req, res) => {
  const userId = req.session.user.id;
  const routineId = Number(req.params.id);

  const [[routine]] = await db.query(
    `SELECT sr.name,
            COUNT(sre.id) AS exercise_count,
            COALESCE(SUM(COALESCE(e.hold_time_sec, 0)), 0) AS total_seconds,
            GROUP_CONCAT(DISTINCT e.category ORDER BY e.category SEPARATOR ',') AS categories
     FROM Saved_Routine sr
     LEFT JOIN Saved_Routine_Entry sre ON sre.routine_id = sr.id
     LEFT JOIN Exercise e ON e.id = sre.exercise_id
     WHERE sr.id = ? AND sr.user_id = ?
     GROUP BY sr.id`,
    [routineId, userId]
  );

  if (!routine) return res.json({ ok: false });

  const categoryEmoji = { strengthen: '💪', stretch: '🧘', avoid: '⚠️' };
  const cats = routine.categories ? routine.categories.split(',') : [];
  const emoji = categoryEmoji[cats[0]] || '🏋️';
  const durationMin = Math.max(1, Math.round((routine.total_seconds || 0) / 60));

  await db.query(
    `INSERT INTO Workout_Session (user_id, title, duration_min, exercise_count, tags, emoji)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [userId, routine.name, durationMin, routine.exercise_count || 0, cats.join(','), emoji]
  );

  res.json({ ok: true });
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
