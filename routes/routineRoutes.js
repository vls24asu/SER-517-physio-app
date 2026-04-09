// routes/routineRoutes.js
const express = require('express');
const router = express.Router();

const { isAuthenticated } = require('../middleware/auth');
const { requireOnboardingComplete } = require('../middleware/onboarding');
const db = require('../config/db');
const { generateRecommendedRoutine } = require('../services/RecommendationService');
const NotificationService = require('../services/NotificationService');
const StatsService = require('../services/StatsService');
const { ACHIEVEMENTS } = require('../controllers/achievementsController');

const notifService = new NotificationService();
const statsService = new StatsService();

// ── Create Custom Routine (builder/draft) ──────────────────────────────────

// Show routine builder + current draft entries
router.get('/', isAuthenticated, requireOnboardingComplete, async (req, res) => {
  const userId = req.session.user.id;

  // Persist filter state across add-exercise POST via query string
  const filterCategory = req.query.filterCategory || '';
  const filterBodyPart = req.query.filterBodyPart || '';
  const filterLocation = req.query.filterLocation || '';
  const filterSearch   = req.query.filterSearch   || '';

  const [[exercises], [routine], [bodyPartRows]] = await Promise.all([
    db.query(`SELECT id, name, category, body_part, injury, skill_level, is_gym_only FROM exercise ORDER BY name ASC`),
    db.query(
      `SELECT re.id, re.sort_order,
              e.id AS exercise_id, e.name, e.category
       FROM Routine_Entry re
       JOIN exercise e ON e.id = re.exercise_id
       WHERE re.user_id = ?
       ORDER BY re.sort_order ASC, re.created_at DESC`,
      [userId]
    ),
    db.query(`SELECT DISTINCT body_part FROM exercise WHERE body_part IS NOT NULL ORDER BY body_part ASC`)
  ]);

  const bodyParts = bodyPartRows.map(r => r.body_part);

  res.render('routines/index', {
    exercises,
    routine,
    bodyParts,
    filterCategory,
    filterBodyPart,
    filterLocation,
    filterSearch
  });
});

// Add exercise to draft
router.post('/add', isAuthenticated, requireOnboardingComplete, async (req, res) => {
  const userId = req.session.user.id;
  const exerciseId = Number(req.body.exercise_id);

  // Preserve filter state through the POST redirect
  const filterCategory = req.body.filterCategory || '';
  const filterBodyPart = req.body.filterBodyPart || '';
  const filterLocation = req.body.filterLocation || '';
  const filterSearch   = req.body.filterSearch   || '';

  const params = new URLSearchParams();
  if (filterCategory) params.set('filterCategory', filterCategory);
  if (filterBodyPart) params.set('filterBodyPart', filterBodyPart);
  if (filterLocation) params.set('filterLocation', filterLocation);
  if (filterSearch)   params.set('filterSearch',   filterSearch);
  const qs = params.toString() ? '?' + params.toString() : '';

  if (!exerciseId) {
    req.flash('error', 'Please select an exercise.');
    return res.redirect('/routines' + qs);
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

  res.redirect('/routines' + qs);
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

// ── Exercise detail API (for preview card on create routine page) ───────────

router.get('/exercise-info/:id', isAuthenticated, async (req, res) => {
  const [rows] = await db.query(
    `SELECT id, name, category, skill_level, equipment_needed, position,
            tempo, \`sets\`, reps, is_gym_only, tips, common_mistakes,
            body_part, injury, contraction_type, bilateral
     FROM exercise WHERE id = ?`,
    [req.params.id]
  );
  if (!rows[0]) return res.json({ ok: false });
  res.json({ ok: true, exercise: rows[0] });
});

// ── Saved Routines ─────────────────────────────────────────────────────────

// List all saved routines (+ AI-generated recommendation)
router.get('/saved', isAuthenticated, requireOnboardingComplete, async (req, res) => {
  const userId = req.session.user.id;
  const validTypes = ['custom', 'injury', 'fitness', 'lifestyle', 'activity'];
  const activeTab = validTypes.includes(req.query.type) ? req.query.type : 'all';

  // Run routine fetch and AI recommendation in parallel for speed
  const recommendationPromise = generateRecommendedRoutine(userId).catch(() => null);

  const whereClause = activeTab === 'all'
    ? 'WHERE sr.user_id = ?'
    : "WHERE sr.user_id = ? AND COALESCE(sr.routine_type, 'custom') = ?";
  const queryParams = activeTab === 'all' ? [userId] : [userId, activeTab];

  const [routines] = await db.query(
    `SELECT sr.id, sr.name, sr.created_at,
            COALESCE(sr.routine_type, 'custom') AS routine_type,
            COUNT(sre.id) AS exercise_count,
            COALESCE(SUM(COALESCE(e.hold_time_sec, 0) + COALESCE(e.rest_time_sec, 0)), 0) AS total_seconds,
            GROUP_CONCAT(DISTINCT e.category ORDER BY e.category SEPARATOR ',') AS categories
     FROM Saved_Routine sr
     LEFT JOIN Saved_Routine_Entry sre ON sre.routine_id = sr.id
     LEFT JOIN exercise e ON e.id = sre.exercise_id
     ${whereClause}
     GROUP BY sr.id
     ORDER BY sr.created_at DESC`,
    queryParams
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

  const recommendation = await recommendationPromise;

  res.render('routines/saved', { routines: formatted, recommendation, activeTab });
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
     LEFT JOIN exercise e ON e.id = sre.exercise_id
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
     JOIN exercise e ON e.id = sre.exercise_id
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
     JOIN exercise e ON e.id = sre.exercise_id
     WHERE sre.routine_id = ?
     ORDER BY sre.sort_order ASC`,
    [routineId]
  );

  const [allExercises] = await db.query(
    `SELECT id, name, category FROM exercise ORDER BY name ASC`
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
     JOIN exercise e ON e.id = sre.exercise_id
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

  res.render('routines/session', { stepsJson: JSON.stringify(steps), routineId, routineName: routine.name });
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
     LEFT JOIN exercise e ON e.id = sre.exercise_id
     WHERE sr.id = ? AND sr.user_id = ?
     GROUP BY sr.id`,
    [routineId, userId]
  );

  if (!routine) return res.json({ ok: false });

  const categoryEmoji = { strengthen: '💪', stretch: '🧘', avoid: '⚠️' };
  const cats = routine.categories ? routine.categories.split(',') : [];
  const emoji = categoryEmoji[cats[0]] || '🏋️';
  const durationMin = Math.max(1, Math.round((routine.total_seconds || 0) / 60));

  // Capture stats before session to detect newly unlocked achievements
  const statsBefore = await statsService.getUserStats(userId);
  const unlockedBefore = new Set(ACHIEVEMENTS.filter(a => a.check(statsBefore)).map(a => a.id));

  const [wsResult] = await db.query(
    `INSERT INTO Workout_Session (user_id, routine_id, title, duration_min, exercise_count, tags, emoji)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [userId, routineId, routine.name, durationMin, routine.exercise_count || 0, cats.join(','), emoji]
  );
  const sessionId = wsResult.insertId;

  // Snapshot exercises so history survives routine deletion
  const [exercises] = await db.query(
    `SELECT sre.sort_order, e.id, e.name, e.category, e.sets, e.reps, e.hold_time_sec
     FROM Saved_Routine_Entry sre
     JOIN exercise e ON e.id = sre.exercise_id
     WHERE sre.routine_id = ?
     ORDER BY sre.sort_order ASC`,
    [routineId]
  );

  // Per-exercise log submitted from session player (indexed by step, not exercise)
  // Multiple steps per exercise (sets) — pick the last step for each exercise index
  const exerciseLog = Array.isArray(req.body.exerciseLog) ? req.body.exerciseLog : [];

  // Build a map: exerciseIndex -> aggregated log entry (last set's data)
  const logByExercise = {};
  if (exerciseLog.length > 0) {
    exerciseLog.forEach((entry, stepIdx) => {
      const step = JSON.parse(JSON.stringify(entry)); // clone
      // Find which exercise this step belongs to by matching against steps order
      // We use sort_order (0-based exercise index) from exercises array
      // steps are ordered: ex0-set1, ex0-set2, ex1-set1, ... so we need to map back
      logByExercise[stepIdx] = step;
    });
  }

  // Map step indices back to exercise indices
  const stepToExercise = [];
  exercises.forEach((ex, exIdx) => {
    const numSets = Math.max(1, Math.round(Number(ex.sets) || 1));
    for (let s = 0; s < numSets; s++) stepToExercise.push(exIdx);
  });

  // Aggregate per exercise: use last set's data, sum sets_completed
  const aggregated = {};
  stepToExercise.forEach((exIdx, stepIdx) => {
    const entry = exerciseLog[stepIdx] || {};
    if (!aggregated[exIdx]) aggregated[exIdx] = { setsCompleted: 0, repsCompleted: null, weightUsed: null, painDuring: 0, skipped: true };
    if (!entry.skipped) aggregated[exIdx].skipped = false;
    if (entry.setsCompleted) aggregated[exIdx].setsCompleted += (entry.setsCompleted || 1);
    if (entry.repsCompleted != null) aggregated[exIdx].repsCompleted = entry.repsCompleted;
    if (entry.weightUsed != null) aggregated[exIdx].weightUsed = entry.weightUsed;
    if (entry.painDuring != null && entry.painDuring > aggregated[exIdx].painDuring) aggregated[exIdx].painDuring = entry.painDuring;
  });

  for (const [exIdx, ex] of exercises.entries()) {
    const log = aggregated[exIdx] || {};
    await db.query(
      `INSERT INTO Workout_Session_Exercise
         (session_id, exercise_id, name, category, \`sets\`, reps, hold_time_sec, sort_order,
          weight_used, reps_completed, sets_completed, pain_during_exercise, skipped)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        sessionId, ex.id, ex.name, ex.category, ex.sets, ex.reps, ex.hold_time_sec, ex.sort_order,
        log.weightUsed ?? null,
        log.repsCompleted ?? null,
        log.setsCompleted || null,
        log.painDuring ?? null,
        log.skipped ? 1 : 0
      ]
    );
  }

  // Fire notifications (non-blocking — errors here don't fail the session log)
  try {
    const statsAfter = await statsService.getUserStats(userId);

    // Session completed
    await notifService.create(
      userId,
      'session_completed',
      'Session complete!',
      `You finished "${routine.name}" — ${durationMin} min, ${routine.exercise_count} exercises.`,
      { dedupe: false }
    );

    // Newly unlocked achievements
    for (const a of ACHIEVEMENTS) {
      if (!unlockedBefore.has(a.id) && a.check(statsAfter)) {
        await notifService.create(
          userId,
          'achievement_unlocked',
          `Achievement unlocked: ${a.name}`,
          `${a.emoji} ${a.description}`,
          { dedupe: true, dedupeByTitle: true }
        );
      }
    }

    // Streak active (fires when streak increases, deduped to once per day)
    if (statsAfter.streak >= 1 && statsAfter.streak > statsBefore.streak) {
      await notifService.create(
        userId,
        'streak_active',
        `${statsAfter.streak}-day streak!`,
        `You've trained ${statsAfter.streak} days in a row. Keep it up!`
      );
    }

    // Progress milestones
    const MILESTONES = [5, 10, 25, 50, 100];
    for (const milestone of MILESTONES) {
      if (statsBefore.totalSessions < milestone && statsAfter.totalSessions >= milestone) {
        await notifService.create(
          userId,
          'progress_milestone',
          `${milestone} sessions milestone!`,
          `You've completed ${milestone} workouts. Amazing progress!`,
          { dedupe: false }
        );
      }
    }
  } catch (notifErr) {
    console.error('Notification error after session log:', notifErr);
  }

  // Remove the earliest scheduled entry for this routine now that it's been completed
  await db.query(
    `DELETE FROM Scheduled_Session
     WHERE user_id = ? AND routine_id = ?
     ORDER BY scheduled_at ASC LIMIT 1`,
    [userId, routineId]
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

// ── Save AI-Recommended Routine ─────────────────────────────────────────────

router.post('/save-recommended', isAuthenticated, requireOnboardingComplete, async (req, res) => {
  const userId = req.session.user.id;
  let exerciseIds;

  try {
    exerciseIds = JSON.parse(req.body.exercise_ids || '[]');
    if (!Array.isArray(exerciseIds) || exerciseIds.length === 0) throw new Error('empty');
  } catch {
    req.flash('error', 'Could not save recommended routine.');
    return res.redirect('/routines/saved');
  }

  const routineName = req.body.routine_name ||
    `AI Recommended – ${new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`;

  const [result] = await db.query(
    `INSERT INTO Saved_Routine (user_id, name) VALUES (?, ?)`,
    [userId, routineName]
  );
  const routineId = result.insertId;

  for (let i = 0; i < exerciseIds.length; i++) {
    await db.query(
      `INSERT INTO Saved_Routine_Entry (routine_id, exercise_id, sort_order) VALUES (?, ?, ?)`,
      [routineId, Number(exerciseIds[i]), i + 1]
    );
  }

  req.flash('success', `"${routineName}" saved to your routines!`);
  res.redirect('/routines/saved');
});

// Schedule a session for a saved routine
router.post('/saved/:id/schedule', isAuthenticated, requireOnboardingComplete, async (req, res) => {
  const userId = req.session.user.id;
  const routineId = parseInt(req.params.id);
  const { scheduled_at } = req.body;

  if (!scheduled_at) {
    req.flash('error', 'Please select a date and time.');
    return res.redirect('/routines/saved');
  }

  const [rows] = await db.query(`SELECT name FROM Saved_Routine WHERE id = ? AND user_id = ?`, [routineId, userId]);
  if (!rows.length) return res.redirect('/routines/saved');

  await db.query(
    `INSERT INTO Scheduled_Session (user_id, routine_id, routine_name, scheduled_at) VALUES (?, ?, ?, ?)`,
    [userId, routineId, rows[0].name, new Date(scheduled_at)]
  );

  req.flash('success', `Session scheduled!`);
  res.redirect('/routines/saved');
});

// Cancel a scheduled session
router.post('/schedule/:id/cancel', isAuthenticated, async (req, res) => {
  const userId = req.session.user.id;
  await db.query(`DELETE FROM Scheduled_Session WHERE id = ? AND user_id = ?`, [req.params.id, userId]);
  res.redirect('/dashboard');
});

module.exports = router;
