const ConnectionManager = require('./ConnectionManager');

class CheckinDAO {
  #cm;

  constructor() {
    this.#cm = ConnectionManager.getInstance();
  }

  // ── Last Check-In Date ───────────────────────────────────────────────────

  async getLastCheckinDate(userId) {
    const conn = await this.#cm.getConnection();
    try {
      const [rows] = await conn.execute(
        `SELECT DATE_FORMAT(last_checkin_date, '%Y-%m-%d') AS last_checkin_date
         FROM User WHERE id = ? LIMIT 1`,
        [userId]
      );
      return rows[0]?.last_checkin_date || null;
    } finally {
      conn.release();
    }
  }

  async updateLastCheckinDate(userId, date) {
    const conn = await this.#cm.getConnection();
    try {
      await conn.execute(
        `UPDATE User SET last_checkin_date = ? WHERE id = ?`,
        [date, userId]
      );
    } finally {
      conn.release();
    }
  }

  // ── Save Check-In Log ────────────────────────────────────────────────────

  async saveCheckinLog({ userId, areaName, date, painStatus, painScale, notes, feeling }) {
    const conn = await this.#cm.getConnection();
    try {
      await conn.execute(
        `INSERT INTO Body_Checkin_Log
           (user_id, area_name, log_date, pain_status, pain_scale, notes, feeling)
         VALUES (?, ?, ?, ?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE
           pain_status = VALUES(pain_status),
           pain_scale  = VALUES(pain_scale),
           notes       = VALUES(notes),
           feeling     = VALUES(feeling),
           updated_at  = CURRENT_TIMESTAMP`,
        [userId, areaName, date, painStatus, painScale, notes || null, feeling || null]
      );

      // Ensure focus area exists so it shows on the progress page
      await conn.execute(
        `INSERT INTO User_Focus_Area (user_id, area_name, emoji)
         VALUES (?, ?, '🩹')
         ON DUPLICATE KEY UPDATE emoji = emoji`,
        [userId, areaName]
      );
    } finally {
      conn.release();
    }
  }

  // ── Save Workout Environment ─────────────────────────────────────────────

  async saveWorkoutEnvironment(userId, environment) {
    const conn = await this.#cm.getConnection();
    try {
      await conn.execute(
        `UPDATE User_Profile SET workout_environment = ? WHERE user_id = ?`,
        [environment, userId]
      );
    } finally {
      conn.release();
    }
  }

  // ── Get Filtered Exercises for Injury Flow ───────────────────────────────

  async getInjuryExercises({ bodyArea, goal, isGymOnly, equipment }) {
    const conn = await this.#cm.getConnection();
    try {
      // Goal → preferred categories (primary + fallback)
      const categoryMap = {
        strengthen:    ['strengthen', 'stability', 'stretch'],
        eliminate_pain: ['stretch', 'stability', 'strengthen'],
        mobility:      ['stretch', 'stability', 'strengthen'],
        stability:     ['stability', 'strengthen', 'stretch'],
        stretch:       ['stretch', 'stability', 'strengthen']
      };
      const preferredCats = categoryMap[goal] || ['strengthen', 'stretch', 'stability'];

      const buildQuery = (cats, gymFilter, eqFilter) => {
        const params = [];
        let q = `SELECT id, name, category, \`sets\`, reps, hold_time_sec,
                        duration_seconds, tips, common_mistakes, emoji,
                        equipment_needed, body_part, skill_level
                 FROM exercise WHERE 1=1`;

        if (bodyArea && bodyArea !== 'other') {
          q += ` AND (body_part LIKE ? OR injury LIKE ?)`;
          params.push(`%${bodyArea}%`, `%${bodyArea}%`);
        }

        if (cats && cats.length > 0) {
          q += ` AND category IN (${cats.map(() => '?').join(',')})`;
          params.push(...cats);
        }

        if (gymFilter !== undefined) {
          q += ` AND is_gym_only = ?`;
          params.push(gymFilter ? 1 : 0);
        }

        if (eqFilter && eqFilter.length > 0 && !eqFilter.includes('full_gym')) {
          q += ` AND (equipment_needed IS NULL OR equipment_needed = ''`;
          for (const eq of eqFilter) {
            q += ` OR equipment_needed LIKE ?`;
            params.push(`%${eq}%`);
          }
          q += `)`;
        }

        // Sort preferred category first, then by skill level
        if (cats && cats.length > 1) {
          q += ` ORDER BY FIELD(category, ${cats.map(() => '?').join(',')}) ASC, skill_level ASC, name ASC`;
          params.push(...cats);
        } else {
          q += ` ORDER BY skill_level ASC, name ASC`;
        }
        q += ` LIMIT 12`;
        return { q, params };
      };

      // Try 1: full filters
      let { q, params } = buildQuery(preferredCats, isGymOnly, equipment);
      let [rows] = await conn.execute(q, params);

      // Try 2: drop equipment filter
      if (rows.length === 0) {
        ({ q, params } = buildQuery(preferredCats, isGymOnly, null));
        [rows] = await conn.execute(q, params);
      }

      // Try 3: drop gym filter too
      if (rows.length === 0) {
        ({ q, params } = buildQuery(preferredCats, undefined, null));
        [rows] = await conn.execute(q, params);
      }

      // Try 4: body area only, no other filters
      if (rows.length === 0 && bodyArea && bodyArea !== 'other') {
        ({ q, params } = buildQuery(null, undefined, null));
        [rows] = await conn.execute(q, params);
      }

      // Try 5: category only — ignore body area entirely (handles missing body_part data)
      if (rows.length === 0) {
        const conn2 = await this.#cm.getConnection();
        try {
          const [r] = await conn2.execute(
            `SELECT id, name, category, \`sets\`, reps, hold_time_sec,
                    duration_seconds, tips, common_mistakes, emoji,
                    equipment_needed, body_part, skill_level
             FROM exercise
             WHERE category IN (${preferredCats.map(() => '?').join(',')})
             ORDER BY FIELD(category, ${preferredCats.map(() => '?').join(',')}), skill_level ASC, name ASC
             LIMIT 12`,
            [...preferredCats, ...preferredCats]
          );
          rows = r;
        } finally {
          conn2.release();
        }
      }

      return rows;
    } finally {
      conn.release();
    }
  }

  // ── Get Recovery Exercises ───────────────────────────────────────────────

  async getRecoveryExercises(type) {
    const conn = await this.#cm.getConnection();
    try {
      const categoryMap = {
        recovery: 'stretch',
        mobility: 'stretch',
        stretch: 'stretch'
      };
      const cat = categoryMap[type] || 'stretch';

      const [rows] = await conn.execute(
        `SELECT id, name, category, \`sets\`, reps, hold_time_sec,
                duration_seconds, tips, emoji, equipment_needed, skill_level
         FROM exercise
         WHERE category = ? AND is_gym_only = 0
         ORDER BY skill_level ASC, name ASC
         LIMIT 10`,
        [cat]
      );
      return rows;
    } finally {
      conn.release();
    }
  }
}

module.exports = CheckinDAO;
