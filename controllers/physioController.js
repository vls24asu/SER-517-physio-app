const db = require('../config/db');
const StatsService = require('../services/StatsService');
const statsService = new StatsService();

// GET /physio/dashboard
const getDashboard = async (req, res) => {
  const physioId = req.session.user.id;
  try {
    // My Patients list with latest check-in info
    const [myPatients] = await db.query(
      `SELECT u.id, u.full_name, u.email,
              MAX(bcl.log_date) AS last_checkin_date,
              bcl2.feeling, bcl2.pain_status, bcl2.pain_scale
       FROM Physio_Assignment pa
       JOIN User u ON u.id = pa.patient_id
       LEFT JOIN Body_Checkin_Log bcl ON bcl.user_id = u.id
       LEFT JOIN Body_Checkin_Log bcl2 ON bcl2.user_id = u.id
         AND bcl2.log_date = (SELECT MAX(b2.log_date) FROM Body_Checkin_Log b2 WHERE b2.user_id = u.id)
       WHERE pa.physio_id = ? AND pa.is_active = 1
       GROUP BY u.id, bcl2.feeling, bcl2.pain_status, bcl2.pain_scale
       ORDER BY u.full_name ASC`,
      [physioId]
    );

    const patientCount = myPatients.length;

    // Checked-in today count
    const today = new Date().toISOString().split('T')[0];
    const [[{ checkedInToday }]] = await db.query(
      `SELECT COUNT(DISTINCT bcl.user_id) AS checkedInToday
       FROM Body_Checkin_Log bcl
       JOIN Physio_Assignment pa ON pa.patient_id = bcl.user_id
       WHERE pa.physio_id = ? AND pa.is_active = 1 AND bcl.log_date = ?`,
      [physioId, today]
    );

    res.render('physio/dashboard', {
      user: req.session.user,
      patientCount,
      checkedInToday,
      myPatients
    });
  } catch (err) {
    console.error(err);
    req.flash('error', 'Failed to load physio dashboard.');
    res.redirect('/login');
  }
};

// GET /physio/patients
const getPatients = async (req, res) => {
  const physioId = req.session.user.id;
  const search = req.query.search || '';
  try {
    // Show ALL non-physio users so the physio can see and assign patients
    const [patients] = await db.query(
      `SELECT u.id, u.full_name, u.email,
              MAX(bcl.log_date) AS last_checkin_date,
              bcl2.feeling, bcl2.pain_status,
              CASE WHEN pa.id IS NOT NULL THEN 1 ELSE 0 END AS is_assigned
       FROM User u
       LEFT JOIN Body_Checkin_Log bcl ON bcl.user_id = u.id
       LEFT JOIN Body_Checkin_Log bcl2 ON bcl2.user_id = u.id
         AND bcl2.log_date = (SELECT MAX(b2.log_date) FROM Body_Checkin_Log b2 WHERE b2.user_id = u.id)
       LEFT JOIN Physio_Assignment pa ON pa.patient_id = u.id AND pa.physio_id = ? AND pa.is_active = 1
       WHERE u.role = 'patient'
         AND (? = '' OR u.full_name LIKE ? OR u.email LIKE ?)
       GROUP BY u.id, bcl2.feeling, bcl2.pain_status, pa.id
       ORDER BY is_assigned DESC, u.full_name ASC`,
      [physioId, search, `%${search}%`, `%${search}%`]
    );

    res.render('physio/patients', { user: req.session.user, patients, search });
  } catch (err) {
    console.error(err);
    req.flash('error', 'Failed to load patients.');
    res.redirect('/physio/dashboard');
  }
};

// GET /physio/patients/:id
const getPatientProfile = async (req, res) => {
  const physioId = req.session.user.id;
  const patientId = Number(req.params.id);
  try {
    // Verify assignment
    const [[assignment]] = await db.query(
      `SELECT id FROM Physio_Assignment WHERE physio_id = ? AND patient_id = ? AND is_active = 1`,
      [physioId, patientId]
    );
    if (!assignment) {
      req.flash('error', 'Patient not found.');
      return res.redirect('/physio/patients');
    }

    const [[patient]] = await db.query(
      `SELECT u.id, u.full_name, u.email,
              up.age, up.weight_kg, up.height_cm, up.pain_areas,
              up.pain_status AS onboarding_pain_status,
              up.selected_injuries
       FROM User u
       LEFT JOIN User_Profile up ON up.user_id = u.id
       WHERE u.id = ?`,
      [patientId]
    );

    // Activity stats + streak
    const [[actStats]] = await db.query(
      `SELECT COUNT(*) AS total_sessions,
              COALESCE(SUM(duration_min), 0) AS total_minutes,
              COUNT(CASE WHEN YEARWEEK(session_date,1) = YEARWEEK(NOW(),1) THEN 1 END) AS sessions_this_week
       FROM Workout_Session WHERE user_id = ?`,
      [patientId]
    );
    const statsData = await statsService.getUserStats(patientId).catch(() => ({ streak: 0 }));
    actStats.streak = statsData.streak || 0;

    // Recent workouts (last 10) with feedback
    const [recentWorkouts] = await db.query(
      `SELECT ws.id, ws.title, ws.session_date, ws.duration_min, ws.exercise_count,
              wf.overall_pain, wf.difficulty, wf.felt_after, wf.unsafe_flag, wf.notes
       FROM Workout_Session ws
       LEFT JOIN Workout_Feedback wf ON wf.session_id = ws.id
       WHERE ws.user_id = ?
       ORDER BY ws.session_date DESC LIMIT 10`,
      [patientId]
    );

    // Daily check-in log (last 30 days)
    const [checkinLog] = await db.query(
      `SELECT log_date, feeling, pain_status, pain_scale, area_name
       FROM Body_Checkin_Log
       WHERE user_id = ? AND log_date >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)
       ORDER BY log_date DESC`,
      [patientId]
    );

    // Body check-in focus areas
    const [focusAreas] = await db.query(
      `SELECT DISTINCT area_name, emoji FROM User_Focus_Area WHERE user_id = ?`,
      [patientId]
    );

    // Build per-area log map for heatmap
    const areaLogs = {};
    for (const fa of focusAreas) {
      areaLogs[fa.area_name] = checkinLog.filter(c => c.area_name === fa.area_name);
    }

    // Pain area chips and injuries from onboarding
    const painAreas = patient.pain_areas ? patient.pain_areas.split(',').map(p => p.trim()).filter(Boolean) : [];
    let injuries = [];
    try {
      injuries = patient.selected_injuries ? JSON.parse(patient.selected_injuries) : [];
    } catch { injuries = []; }

    res.render('physio/patient-profile', {
      user: req.session.user,
      patient,
      actStats,
      recentWorkouts,
      checkinLog,
      focusAreas,
      areaLogs,
      painAreas,
      injuries
    });
  } catch (err) {
    console.error(err);
    req.flash('error', 'Failed to load patient profile.');
    res.redirect('/physio/patients');
  }
};

// POST /physio/patients/:id/assign
const assignPatient = async (req, res) => {
  const physioId = req.session.user.id;
  const patientId = Number(req.params.id);
  try {
    await db.query(
      `INSERT INTO Physio_Assignment (physio_id, patient_id, is_active)
       VALUES (?, ?, 1)
       ON DUPLICATE KEY UPDATE is_active = 1`,
      [physioId, patientId]
    );
    req.flash('success', 'Patient added to your list.');
  } catch (err) {
    console.error(err);
    req.flash('error', 'Failed to add patient.');
  }
  res.redirect('/physio/patients');
};

// POST /physio/patients/:id/unassign
const unassignPatient = async (req, res) => {
  const physioId = req.session.user.id;
  const patientId = Number(req.params.id);
  try {
    await db.query(
      `UPDATE Physio_Assignment SET is_active = 0 WHERE physio_id = ? AND patient_id = ?`,
      [physioId, patientId]
    );
    req.flash('success', 'Patient removed from your list.');
  } catch (err) {
    console.error(err);
    req.flash('error', 'Failed to remove patient.');
  }
  const from = req.body.from || 'dashboard';
  res.redirect(from === 'patients' ? '/physio/patients' : '/physio/dashboard');
};

module.exports = { getDashboard, getPatients, getPatientProfile, assignPatient, unassignPatient };
