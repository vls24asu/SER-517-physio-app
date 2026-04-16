const ExerciseService = require('../services/ExerciseService');
const db = require('../config/db');


const exerciseService = new ExerciseService();

/**
 * GET /library
 * Display exercise library with optional filters
 */
const getLibrary = async (req, res) => {
  try {
    const { category, difficulty, search, bodyPart, injury, location, skillLevel, tab, duration } = req.query;

    const activeTab = tab === 'programs' ? 'programs' : 'workouts';
    const validDurations = [10, 15, 20, 30];
    const activeDuration = validDurations.includes(parseInt(duration)) ? parseInt(duration) : 10;

    const filters = {};
    if (category && category !== 'all') filters.category = category;
    if (difficulty) filters.difficulty = difficulty;
    if (search) filters.search = search;
    if (bodyPart && bodyPart !== 'all') filters.bodyPart = bodyPart;
    if (injury && injury !== 'all') filters.injury = injury;
    if (location === 'home') filters.isGymOnly = false;
    if (location === 'gym') filters.isGymOnly = true;
    const validSkillLevels = ['Beginner', 'Intermediate', 'Advanced'];
    if (skillLevel && validSkillLevels.includes(skillLevel)) filters.difficulty = skillLevel;

    const [[exercises, bodyParts, injuries], programs] = await Promise.all([
      Promise.all([
        exerciseService.getAllExercises(filters),
        exerciseService.getAllBodyParts(),
        exerciseService.getAllInjuries()
      ]),
      db.query(
        `SELECT id, name, description, duration_min, activity, routine_type, emoji
         FROM Program WHERE duration_min = ? ORDER BY activity ASC, routine_type ASC`,
        [activeDuration]
      ).then(([rows]) => rows)
    ]);

    res.render('library/index', {
      exercises,
      activeCategory: category || 'all',
      searchQuery: search || '',
      bodyParts,
      injuries,
      activeBodyPart: bodyPart || 'all',
      activeInjury: injury || 'all',
      activeLocation: location || 'all',
      activeSkillLevel: skillLevel || 'all',
      activeTab,
      programs,
      activeDuration,
      validDurations
    });
  } catch (err) {
    console.error(err);
    req.flash('error', 'Failed to load exercise library');
    res.redirect('/dashboard');
  }
};

/**
 * GET /library/:id
 * Display single exercise detail
 */
const getExerciseDetail = async (req, res) => {
  try {
    const exercise = await exerciseService.getExerciseById(req.params.id);

    if (!exercise) {
      req.flash('error', 'Exercise not found');
      return res.redirect('/library');
    }

    const userId = req.session.user.id;
    const [savedRoutines, muscles] = await Promise.all([
      db.query(`SELECT id, name FROM Saved_Routine WHERE user_id = ? ORDER BY name ASC`, [userId]).then(([r]) => r),
      exerciseService.getMusclesForExercise(req.params.id)
    ]);

    res.render('library/detail', { exercise, savedRoutines, muscles });
  } catch (err) {
    console.error(err);
    req.flash('error', 'Failed to load exercise details');
    res.redirect('/library');
  }
};

/**
 * GET /library/search
 * Search exercises by name
 */
const searchExercises = async (req, res) => {
  try {
    const { q } = req.query;

    if (!q || q.trim().length === 0) {
      return res.redirect('/library');
    }

    const exercises = await exerciseService.searchExercises(q);

    res.render('library/search', {
      exercises,
      searchQuery: q
    });
  } catch (err) {
    console.error(err);
    req.flash('error', 'Search failed');
    res.redirect('/library');
  }
};

/**
 * GET /library/suggestions?q=
 * Returns JSON array of matching exercise names for autocomplete
 */
const getSuggestions = async (req, res) => {
  try {
    const { q } = req.query;
    if (!q || q.trim().length < 2) return res.json([]);

    const exercises = await exerciseService.searchExercises(q.trim());
    const suggestions = exercises.slice(0, 8).map(e => ({
      id: e.id,
      name: e.name,
      category: e.category
    }));
    res.json(suggestions);
  } catch (err) {
    console.error(err);
    res.json([]);
  }
};

/**
 * GET /library/programs
 * List programs filtered by duration
 */
const getPrograms = async (req, res) => {
  try {
    const duration = parseInt(req.query.duration) || 10;
    const validDurations = [10, 15, 20, 30];
    const activeDuration = validDurations.includes(duration) ? duration : 10;

    const [programs] = await db.query(
      `SELECT id, name, description, duration_min, activity, routine_type, emoji
       FROM Program WHERE duration_min = ? ORDER BY activity ASC, routine_type ASC`,
      [activeDuration]
    );

    res.render('library/programs', { programs, activeDuration, validDurations });
  } catch (err) {
    console.error(err);
    req.flash('error', 'Failed to load programs');
    res.redirect('/library');
  }
};

/**
 * GET /library/programs/:id
 * Program detail with exercise list
 */
const getProgramDetail = async (req, res) => {
  try {
    const [[program]] = await db.query(
      `SELECT id, name, description, duration_min, activity, routine_type, emoji
       FROM Program WHERE id = ?`,
      [req.params.id]
    );

    if (!program) {
      req.flash('error', 'Program not found');
      return res.redirect('/library/programs');
    }

    const [exercises] = await db.query(
      `SELECT * FROM Program_Exercise WHERE program_id = ? ORDER BY sort_order ASC`,
      [program.id]
    );

    const userId = req.session.user.id;
    const [savedRoutines] = await db.query(
      `SELECT id, name FROM Saved_Routine WHERE user_id = ? ORDER BY name ASC`,
      [userId]
    );

    res.render('library/program-detail', { program, exercises, savedRoutines });
  } catch (err) {
    console.error(err);
    req.flash('error', 'Failed to load program');
    res.redirect('/library/programs');
  }
};

/**
 * GET /library/programs/:id/session
 * Start a live session for a program
 */
const startProgramSession = async (req, res) => {
  try {
    const [[program]] = await db.query(
      `SELECT id, name FROM Program WHERE id = ?`,
      [req.params.id]
    );

    if (!program) {
      req.flash('error', 'Program not found');
      return res.redirect('/library/programs');
    }

    const [exercises] = await db.query(
      `SELECT * FROM Program_Exercise WHERE program_id = ? ORDER BY sort_order ASC`,
      [program.id]
    );

    const typeEmoji = { strengthen: '💪', stretch: '🧘', mobility: '🏃', stability: '⚖️' };
    const steps = [];
    const totalExercises = exercises.length;

    exercises.forEach((ex, exIdx) => {
      const numSets = Math.max(1, Math.round(Number(ex.sets) || 1));
      for (let s = 1; s <= numSets; s++) {
        steps.push({
          name: ex.exercise_name,
          category: ex.exercise_type || 'strengthen',
          emoji: typeEmoji[ex.exercise_type] || '🏋️',
          exerciseNum: exIdx + 1,
          totalExercises,
          setNum: s,
          totalSets: numSets,
          timerSec: ex.rest_time_sec || 90,
          reps: ex.reps || null,
          tips: ex.tips || ex.common_mistakes || null
        });
      }
    });

    res.render('routines/session', {
      stepsJson: JSON.stringify(steps),
      routineId: 0,
      routineName: program.name,
      logUrl: `/library/programs/${program.id}/log-session`,
      feedbackUrl: `/library/programs/${program.id}/feedback`,
      doneUrl: `/library/programs/${program.id}`
    });
  } catch (err) {
    console.error(err);
    req.flash('error', 'Failed to start program session');
    res.redirect(`/library/programs/${req.params.id}`);
  }
};

/**
 * POST /library/programs/:id/log-session
 * Log a completed program session to workout history
 */
const logProgramSession = async (req, res) => {
  try {
    const userId = req.session.user.id;
    const programId = Number(req.params.id);

    const [[program]] = await db.query(
      `SELECT id, name, duration_min, emoji FROM Program WHERE id = ?`,
      [programId]
    );
    if (!program) return res.json({ ok: false });

    const [exercises] = await db.query(
      `SELECT exercise_name, exercise_type, sets, reps, rest_time_sec, sort_order
       FROM Program_Exercise WHERE program_id = ? ORDER BY sort_order ASC`,
      [programId]
    );

    const [wsResult] = await db.query(
      `INSERT INTO Workout_Session (user_id, routine_id, title, duration_min, exercise_count, tags, emoji)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [userId, null, program.name, program.duration_min || 1, exercises.length, 'program', program.emoji || '🗓️']
    );
    const sessionId = wsResult.insertId;

    for (const [i, ex] of exercises.entries()) {
      await db.query(
        `INSERT INTO Workout_Session_Exercise
           (session_id, exercise_id, name, category, \`sets\`, reps, hold_time_sec, sort_order)
         VALUES (?, NULL, ?, ?, ?, ?, ?, ?)`,
        [sessionId, ex.exercise_name, ex.exercise_type || 'strengthen', ex.sets, ex.reps, ex.rest_time_sec, i]
      );
    }

    res.json({ ok: true, sessionId });
  } catch (err) {
    console.error(err);
    res.json({ ok: false });
  }
};

/**
 * POST /library/programs/:id/feedback
 * Save post-workout feedback for a program session
 */
const logProgramFeedback = async (req, res) => {
  try {
    const userId = req.session.user.id;
    const { sessionId, overallPain, difficulty, feltAfter, unsafeFlag, notes } = req.body;
    if (!sessionId) return res.json({ ok: false, error: 'sessionId required' });

    const unsafe = unsafeFlag ? 1 : 0;
    await db.query(
      `INSERT INTO Workout_Feedback (session_id, overall_pain, difficulty, felt_after, unsafe_flag, notes)
       VALUES (?, ?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE
         overall_pain = VALUES(overall_pain),
         difficulty   = VALUES(difficulty),
         felt_after   = VALUES(felt_after),
         unsafe_flag  = VALUES(unsafe_flag),
         notes        = VALUES(notes)`,
      [sessionId, overallPain || 0, difficulty || 3, feltAfter || 'okay', unsafe, notes || null]
    );

    if (unsafe) {
      await db.query(
        `UPDATE Workout_Session SET unsafe_flag = 1 WHERE id = ? AND user_id = ?`,
        [sessionId, userId]
      );
    }

    res.json({ ok: true });
  } catch (err) {
    console.error(err);
    res.json({ ok: false });
  }
};

module.exports = {
  getLibrary,
  getExerciseDetail,
  searchExercises,
  getSuggestions,
  getPrograms,
  getProgramDetail,
  startProgramSession,
  logProgramSession,
  logProgramFeedback
};
