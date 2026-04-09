const db = require('../config/db');

// GET /physio/dashboard
const getDashboard = async (req, res) => {
  const physioId = req.session.user.id;
  try {
    // Patient count assigned to this physio
    const [[{ patientCount }]] = await db.query(
      `SELECT COUNT(*) AS patientCount FROM Physio_Assignment WHERE physio_id = ? AND is_active = 1`,
      [physioId]
    );

    // Checked-in today count (across all assigned patients)
    const today = new Date().toISOString().split('T')[0];
    const [[{ checkedInToday }]] = await db.query(
      `SELECT COUNT(DISTINCT bcl.user_id) AS checkedInToday
       FROM Body_Checkin_Log bcl
       JOIN Physio_Assignment pa ON pa.patient_id = bcl.user_id
       WHERE pa.physio_id = ? AND pa.is_active = 1 AND bcl.log_date = ?`,
      [physioId, today]
    );

    // 7-day check-in feed for assigned patients
    const [feed] = await db.query(
      `SELECT u.full_name, bcl.log_date, bcl.feeling, bcl.pain_status, bcl.pain_scale, bcl.area_name
       FROM Body_Checkin_Log bcl
       JOIN User u ON u.id = bcl.user_id
       JOIN Physio_Assignment pa ON pa.patient_id = bcl.user_id
       WHERE pa.physio_id = ? AND pa.is_active = 1
         AND bcl.log_date >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)
       ORDER BY bcl.log_date DESC, bcl.created_at DESC
       LIMIT 50`,
      [physioId]
    );

    res.render('physio/dashboard', {
      user: req.session.user,
      patientCount,
      checkedInToday,
      feed
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
    const [patients] = await db.query(
      `SELECT u.id, u.full_name, u.email,
              MAX(bcl.log_date) AS last_checkin_date,
              bcl2.feeling, bcl2.pain_status
       FROM Physio_Assignment pa
       JOIN User u ON u.id = pa.patient_id
       LEFT JOIN Body_Checkin_Log bcl ON bcl.user_id = u.id
       LEFT JOIN Body_Checkin_Log bcl2 ON bcl2.user_id = u.id
         AND bcl2.log_date = (SELECT MAX(b2.log_date) FROM Body_Checkin_Log b2 WHERE b2.user_id = u.id)
       WHERE pa.physio_id = ? AND pa.is_active = 1
         AND (? = '' OR u.full_name LIKE ? OR u.email LIKE ?)
       GROUP BY u.id, bcl2.feeling, bcl2.pain_status
       ORDER BY u.full_name ASC`,
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
              up.age, up.weight_kg, up.height_cm, up.pain_area, up.pain_status AS onboarding_pain_status
       FROM User u
       LEFT JOIN User_Profile up ON up.user_id = u.id
       WHERE u.id = ?`,
      [patientId]
    );

    // Activity stats
    const [[actStats]] = await db.query(
      `SELECT COUNT(*) AS total_sessions,
              COALESCE(SUM(duration_min), 0) AS total_minutes,
              COUNT(CASE WHEN YEARWEEK(session_date,1) = YEARWEEK(NOW(),1) THEN 1 END) AS sessions_this_week
       FROM Workout_Session WHERE user_id = ?`,
      [patientId]
    );

    // Recent workouts (last 5) with feedback
    const [recentWorkouts] = await db.query(
      `SELECT ws.id, ws.title, ws.session_date, ws.duration_min, ws.exercise_count,
              wf.overall_pain, wf.difficulty, wf.felt_after, wf.unsafe_flag, wf.notes
       FROM Workout_Session ws
       LEFT JOIN Workout_Feedback wf ON wf.session_id = ws.id
       WHERE ws.user_id = ?
       ORDER BY ws.session_date DESC LIMIT 5`,
      [patientId]
    );

    // Daily check-in log (last 14 entries)
    const [checkinLog] = await db.query(
      `SELECT log_date, feeling, pain_status, pain_scale, area_name
       FROM Body_Checkin_Log
       WHERE user_id = ?
       ORDER BY log_date DESC LIMIT 14`,
      [patientId]
    );

    // Body check-in focus areas with latest 5 entries each
    const [focusAreas] = await db.query(
      `SELECT DISTINCT area_name, emoji FROM User_Focus_Area WHERE user_id = ?`,
      [patientId]
    );

    // Pain area chips from onboarding
    const painAreas = patient.pain_area ? patient.pain_area.split(',').map(p => p.trim()) : [];

    res.render('physio/patient-profile', {
      user: req.session.user,
      patient,
      actStats,
      recentWorkouts,
      checkinLog,
      focusAreas,
      painAreas
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
    req.flash('success', 'Patient assigned successfully.');
  } catch (err) {
    console.error(err);
    req.flash('error', 'Failed to assign patient.');
  }
  res.redirect('/physio/patients');
};

module.exports = { getDashboard, getPatients, getPatientProfile, assignPatient };
