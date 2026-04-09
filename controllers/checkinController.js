const CheckinDAO = require('../dao/CheckinDAO');
const { generateRecommendedRoutine } = require('../services/RecommendationService');

const dao = new CheckinDAO();

const BODY_AREAS = [
  { value: 'ankle', label: 'Ankle', emoji: '🦶' },
  { value: 'knee', label: 'Knee', emoji: '🦵' },
  { value: 'hip', label: 'Hip', emoji: '🍑' },
  { value: 'back', label: 'Back', emoji: '🔙' },
  { value: 'shoulder', label: 'Shoulder', emoji: '💪' },
  { value: 'neck', label: 'Neck', emoji: '🧣' },
  { value: 'other', label: 'Other', emoji: '🩹' }
];

const SYMPTOM_TYPES = ['Pain', 'Swelling', 'Weakness', 'Instability', 'Tightness'];

const GOALS = [
  { value: 'strengthen', label: 'Strengthen', emoji: '💪' },
  { value: 'stretch', label: 'Stretch', emoji: '🤸' },
  { value: 'eliminate_pain', label: 'Eliminate pain', emoji: '🛑' },
  { value: 'mobility', label: 'Improve mobility', emoji: '🔄' }
];

const ENVIRONMENTS = [
  { value: 'at_home', label: 'At home', gymOnly: false },
  { value: 'condo_gym', label: 'Condo gym', gymOnly: true },
  { value: 'full_gym', label: 'Full gym', gymOnly: true }
];

const HOME_EQUIPMENT = [
  { value: 'yoga_mat', label: 'Yoga mat' },
  { value: 'resistance_band', label: 'Resistance band' },
  { value: 'dumbbells', label: 'Dumbbells' },
  { value: 'chair', label: 'Chair' },
  { value: 'foam_roller', label: 'Foam roller' },
  { value: 'none', label: 'None / bodyweight only' }
];

const GYM_EQUIPMENT = [
  { value: 'dumbbells', label: 'Dumbbells' },
  { value: 'cable_machine', label: 'Cable machine' },
  { value: 'treadmill', label: 'Treadmill' },
  { value: 'bike', label: 'Bike' },
  { value: 'leg_press', label: 'Leg press' },
  { value: 'smith_machine', label: 'Smith machine' },
  { value: 'resistance_bands', label: 'Resistance bands' },
  { value: 'bench', label: 'Bench' },
  { value: 'full_gym', label: 'Everything available' }
];

// ── helpers ──────────────────────────────────────────────────────────────────

function getToday() {
  return new Date().toISOString().split('T')[0];
}

function painLevelToStatus(level) {
  const n = parseInt(level) || 0;
  if (n >= 7) return 'red';
  if (n >= 4) return 'yellow';
  return 'green';
}

// ── GET /checkin ─────────────────────────────────────────────────────────────

const getCheckin = async (req, res) => {
  const userId = req.session.user.id;
  const today = getToday();

  // Already checked in today — skip to dashboard
  const last = await dao.getLastCheckinDate(userId);
  if (last === today) {
    return res.redirect('/dashboard');
  }

  res.render('checkin/index', {
    layout: 'layouts/main',
    user: req.session.user
  });
};

// ── POST /checkin ────────────────────────────────────────────────────────────

const postCheckin = async (req, res) => {
  const { feeling } = req.body;
  const userId = req.session.user.id;
  const today = getToday();

  // Store feeling in session for use throughout the flow
  req.session.checkin = { feeling, date: today };

  if (feeling === 'good') {
    // Mark check-in done and go to routine choice screen
    await dao.updateLastCheckinDate(userId, today);
    return res.redirect('/checkin/good');
  }

  // Not good → ask what's bothering them
  return res.redirect('/checkin/not-good');
};

// ── GET /checkin/not-good ────────────────────────────────────────────────────

const getNotGood = (req, res) => {
  if (!req.session.checkin) return res.redirect('/checkin');

  res.render('checkin/not-good', {
    layout: 'layouts/main',
    user: req.session.user
  });
};

// ── POST /checkin/not-good ───────────────────────────────────────────────────

const postNotGood = (req, res) => {
  const { issue_type } = req.body;
  req.session.checkin.issue_type = issue_type;

  if (issue_type === 'general_soreness' || issue_type === 'low_energy' ||
      issue_type === 'swelling' || issue_type === 'stiffness') {
    return res.redirect('/checkin/recovery');
  }

  // same_issue or something_new → full injury questions
  return res.redirect('/checkin/injury');
};

// ── GET /checkin/injury ──────────────────────────────────────────────────────

const getInjury = (req, res) => {
  if (!req.session.checkin) return res.redirect('/checkin');

  res.render('checkin/injury', {
    layout: 'layouts/main',
    user: req.session.user,
    bodyAreas: BODY_AREAS,
    symptomTypes: SYMPTOM_TYPES,
    goals: GOALS,
    environments: ENVIRONMENTS,
    homeEquipment: HOME_EQUIPMENT,
    gymEquipment: GYM_EQUIPMENT,
    issueType: req.session.checkin.issue_type
  });
};

// ── POST /checkin/injury ─────────────────────────────────────────────────────

const postInjury = async (req, res) => {
  if (!req.session.checkin) return res.redirect('/checkin');

  const { body_area, pain_level, symptom_type, goal, environment, equipment } = req.body;

  // Normalise equipment to array
  let equipmentArr = [];
  if (equipment) {
    equipmentArr = Array.isArray(equipment) ? equipment : [equipment];
  }

  const isGymOnly = environment === 'condo_gym' || environment === 'full_gym';

  // Persist to session
  req.session.checkin = {
    ...req.session.checkin,
    body_area,
    pain_level: parseInt(pain_level) || 0,
    symptom_type,
    goal,
    environment,
    equipment: equipmentArr,
    isGymOnly
  };

  // Save check-in log to Body_Checkin_Log
  const userId = req.session.user.id;
  const today = req.session.checkin.date || getToday();

  try {
    await dao.saveCheckinLog({
      userId,
      areaName: body_area === 'other' ? (symptom_type || 'General') : body_area,
      date: today,
      painStatus: painLevelToStatus(pain_level),
      painScale: parseInt(pain_level) || 0,
      notes: symptom_type || null,
      feeling: 'not_good'
    });

    // Save environment preference
    if (environment) {
      await dao.saveWorkoutEnvironment(userId, environment);
    }

    // Mark check-in done for today
    await dao.updateLastCheckinDate(userId, today);
  } catch (err) {
    console.error('Error saving check-in log:', err);
  }

  return res.redirect('/checkin/recommend');
};

// ── GET /checkin/recovery ────────────────────────────────────────────────────

const getRecovery = async (req, res) => {
  if (!req.session.checkin) return res.redirect('/checkin');

  const RECOVERY_OPTIONS = [
    { value: 'recovery', label: 'Recovery routine', emoji: '🛌', description: 'Gentle movements to help your body recover' },
    { value: 'mobility', label: 'Mobility routine', emoji: '🔄', description: 'Improve joint range of motion' },
    { value: 'stretch', label: 'Stretch routine', emoji: '🤸', description: 'Relieve tightness and tension' }
  ];

  // Save check-in log for light day
  const userId = req.session.user.id;
  const today = req.session.checkin.date || getToday();

  try {
    await dao.saveCheckinLog({
      userId,
      areaName: 'General',
      date: today,
      painStatus: 'yellow',
      painScale: 3,
      notes: req.session.checkin.issue_type || 'light day',
      feeling: 'not_good'
    });
    await dao.updateLastCheckinDate(userId, today);
  } catch (err) {
    console.error('Error saving recovery check-in:', err);
  }

  res.render('checkin/recovery', {
    layout: 'layouts/main',
    user: req.session.user,
    recoveryOptions: RECOVERY_OPTIONS,
    issueType: req.session.checkin.issue_type
  });
};

// ── POST /checkin/recovery ───────────────────────────────────────────────────

const postRecovery = (req, res) => {
  const { routine_type } = req.body;
  req.session.checkin.recovery_type = routine_type;
  return res.redirect('/checkin/recommend');
};

// ── GET /checkin/recommend ───────────────────────────────────────────────────

const getRecommend = async (req, res) => {
  if (!req.session.checkin) return res.redirect('/checkin');

  const checkin = req.session.checkin;
  const userId = req.session.user.id;
  let exercises = [];
  let routineTitle = 'Your recommended routine for today';
  let routineEmoji = '🏥';
  let routineReason = null;

  try {
    if (checkin.body_area) {
      const areaLabel = checkin.body_area.charAt(0).toUpperCase() + checkin.body_area.slice(1);
      const goalLabel = GOALS.find(g => g.value === checkin.goal)?.label || checkin.goal;
      routineTitle = `${areaLabel} — ${goalLabel}`;
      routineEmoji = BODY_AREAS.find(a => a.value === checkin.body_area)?.emoji || '🩹';

      // Primary: scoring engine with check-in context
      try {
        const result = await generateRecommendedRoutine(userId, {
          bodyArea: checkin.body_area,
          goal: checkin.goal
        });
        if (result && result.exercises && result.exercises.length > 0) {
          exercises = result.exercises;
          routineReason = result.reason || null;
        }
      } catch (e) {
        console.error('Scoring engine error:', e);
      }

      // Fallback: SQL filter
      if (exercises.length === 0) {
        exercises = await dao.getInjuryExercises({
          bodyArea: checkin.body_area,
          goal: checkin.goal,
          isGymOnly: checkin.isGymOnly,
          equipment: checkin.equipment || []
        });
      }
    } else {
      // Recovery path
      const type = checkin.recovery_type || 'stretch';
      const typeLabels = { recovery: 'Recovery', mobility: 'Mobility', stretch: 'Stretch' };
      routineTitle = `${typeLabels[type] || 'Recovery'} routine`;
      routineEmoji = type === 'recovery' ? '🛌' : type === 'mobility' ? '🔄' : '🤸';

      // Primary: scoring engine with recovery context
      try {
        const result = await generateRecommendedRoutine(userId, {
          recoveryType: type
        });
        if (result && result.exercises && result.exercises.length > 0) {
          exercises = result.exercises;
          routineReason = result.reason || null;
        }
      } catch (e) {
        console.error('Scoring engine error:', e);
      }

      // Fallback: recovery SQL query
      if (exercises.length === 0) {
        exercises = await dao.getRecoveryExercises(type);
      }
    }
  } catch (err) {
    console.error('Error fetching recommended exercises:', err);
  }

  res.render('checkin/recommend', {
    layout: 'layouts/main',
    user: req.session.user,
    exercises,
    routineTitle,
    routineEmoji,
    routineReason,
    checkin
  });
};

// ── POST /checkin/save-and-start ─────────────────────────────────────────────

const saveAndStart = async (req, res) => {
  const userId = req.session.user.id;
  const db = require('../config/db');

  let exerciseIds;
  try {
    exerciseIds = JSON.parse(req.body.exercise_ids || '[]');
    if (!Array.isArray(exerciseIds) || exerciseIds.length === 0) throw new Error('empty');
  } catch {
    req.flash('error', 'Could not start routine.');
    return res.redirect('/checkin/recommend');
  }

  const checkin = req.session.checkin || {};
  const label = checkin.body_area
    ? checkin.body_area.charAt(0).toUpperCase() + checkin.body_area.slice(1)
    : (checkin.recovery_type || 'Recovery');
  const routineName = `${label} routine – ${new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`;

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

  res.redirect(`/routines/saved/${routineId}/preview`);
};

const db = require('../config/db');

const getGood = async (req, res) => {
  const userId = req.session.user.id;

  // Fetch the most recently used saved routine
  let lastRoutine = null;
  try {
    const [rows] = await db.query(
      `SELECT sr.id, sr.name
       FROM Workout_Session ws
       JOIN Saved_Routine sr ON sr.id = ws.routine_id
       WHERE ws.user_id = ? AND ws.routine_id IS NOT NULL
       ORDER BY ws.session_date DESC LIMIT 1`,
      [userId]
    );
    lastRoutine = rows[0] || null;

    // Fallback: most recently created saved routine
    if (!lastRoutine) {
      const [fallback] = await db.query(
        `SELECT id, name FROM Saved_Routine WHERE user_id = ? ORDER BY created_at DESC LIMIT 1`,
        [userId]
      );
      lastRoutine = fallback[0] || null;
    }
  } catch (e) {
    // silently ignore
  }

  res.render('checkin/good', { user: req.session.user, lastRoutine });
};

module.exports = {
  getCheckin,
  postCheckin,
  getGood,
  getNotGood,
  postNotGood,
  getInjury,
  postInjury,
  getRecovery,
  postRecovery,
  getRecommend,
  saveAndStart
};
