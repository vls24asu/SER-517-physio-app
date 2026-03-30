const db = require('../config/db');

class RecommendationDAO {
  /**
   * Fetch the user's onboarding profile for recommendation inputs.
   */
  async getUserProfile(userId) {
    const [rows] = await db.query(
      `SELECT fitness_level, exercise_preference, available_equipment,
              pain_areas, pain_status, pain_intensity, workout_duration_min, goals
       FROM User_Profile
       WHERE user_id = ?`,
      [userId]
    );
    return rows[0] || null;
  }

  /**
   * Fetch active injuries for additional pain area context.
   */
  async getUserInjuries(userId) {
    const [rows] = await db.query(
      `SELECT body_part, injury_type, severity
       FROM Injury
       WHERE user_id = ? AND is_active = 1`,
      [userId]
    );
    return rows;
  }

  /**
   * Fetch all exercises with their associated muscle groups.
   * Excludes 'avoid' category exercises — never recommended.
   */
  async getAllExercisesWithMuscleGroups() {
    const [rows] = await db.query(
      `SELECT e.id, e.name, e.category, e.skill_level, e.is_gym_only,
              e.equipment_needed, e.sets, e.reps, e.hold_time_sec,
              e.rest_time_sec, e.sessions_count, e.tips,
              GROUP_CONCAT(DISTINCT mg.name ORDER BY mg.name SEPARATOR ',') AS muscle_groups
       FROM exercise e
       LEFT JOIN exercise_muscle_group emg ON emg.exercise_id = e.id
       LEFT JOIN muscle_group mg ON mg.id = emg.muscle_group_id
       WHERE e.category != 'avoid'
       GROUP BY e.id`
    );
    return rows;
  }

  /**
   * Fetch exercises the user has done recently (for variety/freshness scoring).
   */
  async getRecentExerciseHistory(userId, days = 14) {
    const [rows] = await db.query(
      `SELECT wse.exercise_id, MAX(ws.session_date) AS last_done
       FROM Workout_Session ws
       JOIN Workout_Session_Exercise wse ON wse.session_id = ws.id
       WHERE ws.user_id = ? AND ws.session_date >= DATE_SUB(NOW(), INTERVAL ? DAY)
       GROUP BY wse.exercise_id`,
      [userId, days]
    );
    return rows;
  }
}

module.exports = RecommendationDAO;
