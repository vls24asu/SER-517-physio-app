const db = require('./db');

async function hasTable(tableName) {
  const [rows] = await db.query(
    `SELECT 1
     FROM information_schema.tables
     WHERE table_schema = DATABASE() AND table_name = ?
     LIMIT 1`,
    [tableName]
  );

  return rows.length > 0;
}

async function hasColumn(tableName, columnName) {
  const [rows] = await db.query(
    `SELECT 1
     FROM information_schema.columns
     WHERE table_schema = DATABASE() AND table_name = ? AND column_name = ?
     LIMIT 1`,
    [tableName, columnName]
  );

  return rows.length > 0;
}

async function isColumnNullable(tableName, columnName) {
  const [rows] = await db.query(
    `SELECT is_nullable
     FROM information_schema.columns
     WHERE table_schema = DATABASE() AND table_name = ? AND column_name = ?
     LIMIT 1`,
    [tableName, columnName]
  );

  return rows[0]?.is_nullable === 'YES';
}

async function hasConstraint(tableName, constraintName, constraintType) {
  const [rows] = await db.query(
    `SELECT 1
     FROM information_schema.table_constraints
     WHERE table_schema = DATABASE()
       AND table_name = ?
       AND constraint_name = ?
       AND constraint_type = ?
     LIMIT 1`,
    [tableName, constraintName, constraintType]
  );

  return rows.length > 0;
}

async function renameTableIfNeeded(fromName, toName) {
  if ((await hasTable(toName)) || !(await hasTable(fromName))) {
    return;
  }

  await db.query(`RENAME TABLE \`${fromName}\` TO \`${toName}\``);
}

async function addColumnIfMissing(tableName, columnName, definitionSql) {
  if (await hasColumn(tableName, columnName)) {
    return;
  }

  await db.query(`ALTER TABLE \`${tableName}\` ADD COLUMN ${definitionSql}`);
}

async function addForeignKeyIfMissing(tableName, constraintName, definitionSql) {
  if (await hasConstraint(tableName, constraintName, 'FOREIGN KEY')) {
    return;
  }

  await db.query(`ALTER TABLE \`${tableName}\` ADD CONSTRAINT \`${constraintName}\` ${definitionSql}`);
}

async function addIndexIfMissing(tableName, indexName, definitionSql) {
  if (await hasConstraint(tableName, indexName, 'UNIQUE')) {
    return;
  }

  const [rows] = await db.query(
    `SELECT 1
     FROM information_schema.statistics
     WHERE table_schema = DATABASE()
       AND table_name = ?
       AND index_name = ?
     LIMIT 1`,
    [tableName, indexName]
  );

  if (rows.length > 0) {
    return;
  }

  await db.query(`ALTER TABLE \`${tableName}\` ADD ${definitionSql}`);
}

async function ensureLowercaseExerciseTables() {
  await renameTableIfNeeded('Exercise', 'exercise');
  await renameTableIfNeeded('Muscle_Group', 'muscle_group');
  await renameTableIfNeeded('Exercise_Muscle_Group', 'exercise_muscle_group');

  await db.query(
    `CREATE TABLE IF NOT EXISTS \`muscle_group\` (
      id INT PRIMARY KEY AUTO_INCREMENT,
      name VARCHAR(100) NOT NULL UNIQUE,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`
  );

  await db.query(
    `CREATE TABLE IF NOT EXISTS \`exercise\` (
      id INT PRIMARY KEY AUTO_INCREMENT,
      name VARCHAR(255) NOT NULL,
      category ENUM('strengthen', 'stretch', 'avoid') NOT NULL,
      description TEXT NULL,
      tips TEXT NULL,
      common_mistakes TEXT NULL,
      position VARCHAR(100) NULL,
      equipment_needed VARCHAR(255) NULL,
      skill_level ENUM('Beginner', 'Intermediate', 'Advanced') DEFAULT 'Beginner',
      difficulty ENUM('easy', 'medium', 'hard') DEFAULT 'easy',
      tempo VARCHAR(100) NULL,
      \`sets\` DECIMAL(5,1) NULL,
      reps VARCHAR(50) NULL,
      hold_time_sec INT NULL,
      rest_time_sec INT NULL,
      duration_seconds INT NULL,
      is_gym_only BOOLEAN DEFAULT 0,
      emoji VARCHAR(10) DEFAULT '💪',
      image_url VARCHAR(500) NULL,
      video_url VARCHAR(500) NULL,
      sessions_count INT DEFAULT 0,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    )`
  );

  await db.query(
    `CREATE TABLE IF NOT EXISTS \`exercise_muscle_group\` (
      id INT PRIMARY KEY AUTO_INCREMENT,
      exercise_id INT NOT NULL,
      muscle_group_id INT NOT NULL,
      UNIQUE KEY unique_exercise_muscle (exercise_id, muscle_group_id),
      FOREIGN KEY (exercise_id) REFERENCES exercise(id) ON DELETE CASCADE,
      FOREIGN KEY (muscle_group_id) REFERENCES muscle_group(id) ON DELETE CASCADE
    )`
  );

  await addColumnIfMissing('exercise', 'description', 'description TEXT NULL');
  await addColumnIfMissing('exercise', 'tips', 'tips TEXT NULL');
  await addColumnIfMissing('exercise', 'common_mistakes', 'common_mistakes TEXT NULL');
  await addColumnIfMissing('exercise', 'position', 'position VARCHAR(100) NULL');
  await addColumnIfMissing('exercise', 'equipment_needed', 'equipment_needed VARCHAR(255) NULL');
  await addColumnIfMissing('exercise', 'skill_level', "skill_level ENUM('Beginner', 'Intermediate', 'Advanced') DEFAULT 'Beginner'");
  await addColumnIfMissing('exercise', 'difficulty', "difficulty ENUM('easy', 'medium', 'hard') DEFAULT 'easy'");
  await addColumnIfMissing('exercise', 'tempo', 'tempo VARCHAR(100) NULL');
  await addColumnIfMissing('exercise', 'sets', '`sets` DECIMAL(5,1) NULL');
  await addColumnIfMissing('exercise', 'reps', 'reps VARCHAR(50) NULL');
  await addColumnIfMissing('exercise', 'hold_time_sec', 'hold_time_sec INT NULL');
  await addColumnIfMissing('exercise', 'rest_time_sec', 'rest_time_sec INT NULL');
  await addColumnIfMissing('exercise', 'duration_seconds', 'duration_seconds INT NULL');
  await addColumnIfMissing('exercise', 'is_gym_only', 'is_gym_only BOOLEAN DEFAULT 0');
  await addColumnIfMissing('exercise', 'emoji', "emoji VARCHAR(10) DEFAULT '💪'");
  await addColumnIfMissing('exercise', 'image_url', 'image_url VARCHAR(500) NULL');
  await addColumnIfMissing('exercise', 'video_url', 'video_url VARCHAR(500) NULL');
  await addColumnIfMissing('exercise', 'sessions_count', 'sessions_count INT DEFAULT 0');
  await addColumnIfMissing('exercise', 'updated_at', 'updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP');
  await addColumnIfMissing('muscle_group', 'created_at', 'created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP');
  await addIndexIfMissing('exercise', 'idx_exercise_category', 'INDEX `idx_exercise_category` (category)');
  await addIndexIfMissing('exercise', 'idx_exercise_skill_level', 'INDEX `idx_exercise_skill_level` (skill_level)');
  await addIndexIfMissing('exercise', 'idx_exercise_difficulty', 'INDEX `idx_exercise_difficulty` (difficulty)');
  await addIndexIfMissing('exercise', 'idx_exercise_gym_only', 'INDEX `idx_exercise_gym_only` (is_gym_only)');

  // Expand category ENUM to include 'stability'
  await db.query(
    `ALTER TABLE exercise MODIFY COLUMN category ENUM('strengthen','stretch','avoid','stability') NOT NULL`
  );

  // New columns for injury/body-part data from Excel
  await addColumnIfMissing('exercise', 'body_part', 'body_part VARCHAR(100) NULL');
  await addColumnIfMissing('exercise', 'injury', 'injury VARCHAR(255) NULL');
  await addColumnIfMissing('exercise', 'contraction_type', 'contraction_type VARCHAR(100) NULL');
  await addColumnIfMissing('exercise', 'bilateral', "bilateral ENUM('Bilateral','Unilateral','Both') NULL");
  await addColumnIfMissing('exercise', 'tendon_used', 'tendon_used VARCHAR(255) NULL');
  await addColumnIfMissing('exercise', 'ligament_used', 'ligament_used VARCHAR(255) NULL');
  await addIndexIfMissing('exercise', 'idx_exercise_body_part', 'INDEX `idx_exercise_body_part` (body_part)');
  await addIndexIfMissing('exercise', 'idx_exercise_injury', 'INDEX `idx_exercise_injury` (injury)');

  // Add role to exercise_muscle_group so we can distinguish targeted vs secondary vs all muscles
  await addColumnIfMissing('exercise_muscle_group', 'role', "role ENUM('targeted','secondary','all') NOT NULL DEFAULT 'targeted'");
}

async function ensureUserProfileSchema() {
  if (!(await hasTable('User_Profile'))) {
    return;
  }

  await addColumnIfMissing('User_Profile', 'age', 'age INT NULL');
  await addColumnIfMissing('User_Profile', 'gender', "gender ENUM('male', 'female', 'non-binary', 'prefer_not_to_say') NULL");
  await addColumnIfMissing('User_Profile', 'height_cm', 'height_cm DECIMAL(5,1) NULL');
  await addColumnIfMissing('User_Profile', 'weight_kg', 'weight_kg DECIMAL(5,1) NULL');
  await addColumnIfMissing('User_Profile', 'workout_duration_min', 'workout_duration_min INT NULL DEFAULT 30');
  await addColumnIfMissing('User_Profile', 'pain_areas', 'pain_areas TEXT NULL');
  await addColumnIfMissing('User_Profile', 'pain_status', "pain_status ENUM('yes', 'no') NULL");
  await addColumnIfMissing('User_Profile', 'pain_intensity', 'pain_intensity INT NULL');
  await addColumnIfMissing('User_Profile', 'selected_injuries', 'selected_injuries TEXT NULL');
}

async function ensureUserAuthSchema() {
  if (!(await hasTable('User')) || !(await hasColumn('User', 'password'))) {
    return;
  }

  if (!(await isColumnNullable('User', 'password'))) {
    await db.query('ALTER TABLE `User` MODIFY COLUMN `password` VARCHAR(255) NULL');
  }
}

async function ensureSavedRoutineSchema() {
  await db.query(
    `CREATE TABLE IF NOT EXISTS \`Saved_Routine\` (
      id INT PRIMARY KEY AUTO_INCREMENT,
      user_id INT NOT NULL,
      name VARCHAR(150) NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES User(id) ON DELETE CASCADE
    )`
  );

  await db.query(
    `CREATE TABLE IF NOT EXISTS \`Saved_Routine_Entry\` (
      id INT PRIMARY KEY AUTO_INCREMENT,
      routine_id INT NOT NULL,
      exercise_id INT NOT NULL,
      sort_order INT NOT NULL DEFAULT 0,
      FOREIGN KEY (routine_id) REFERENCES Saved_Routine(id) ON DELETE CASCADE,
      FOREIGN KEY (exercise_id) REFERENCES exercise(id) ON DELETE CASCADE
    )`
  );

  await addColumnIfMissing(
    'Saved_Routine',
    'routine_type',
    "routine_type ENUM('custom','injury','fitness','lifestyle','activity') NOT NULL DEFAULT 'custom'"
  );
}

async function ensureWorkoutSessionSchema() {
  await db.query(
    `CREATE TABLE IF NOT EXISTS \`Workout_Session\` (
      id INT PRIMARY KEY AUTO_INCREMENT,
      user_id INT NOT NULL,
      title VARCHAR(150) NOT NULL,
      duration_min INT NOT NULL DEFAULT 0,
      exercise_count INT NOT NULL DEFAULT 0,
      tags VARCHAR(255) NULL,
      emoji VARCHAR(10) NULL DEFAULT '🏋️',
      session_date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES User(id) ON DELETE CASCADE
    )`
  );

  await addColumnIfMissing('Workout_Session', 'routine_id', 'routine_id INT NULL');
  await addForeignKeyIfMissing(
    'Workout_Session',
    'fk_ws_saved_routine',
    'FOREIGN KEY (routine_id) REFERENCES Saved_Routine(id) ON DELETE SET NULL'
  );

  await db.query(
    `CREATE TABLE IF NOT EXISTS \`Workout_Session_Exercise\` (
      id INT PRIMARY KEY AUTO_INCREMENT,
      session_id INT NOT NULL,
      exercise_id INT NOT NULL,
      name VARCHAR(255) NOT NULL,
      category VARCHAR(100) NULL,
      \`sets\` DECIMAL(5,1) NULL,
      reps VARCHAR(50) NULL,
      hold_time_sec INT NULL,
      sort_order INT NOT NULL DEFAULT 0,
      FOREIGN KEY (session_id) REFERENCES Workout_Session(id) ON DELETE CASCADE
    )`
  );

  await addColumnIfMissing('Workout_Session_Exercise', 'weight_used',          'weight_used DECIMAL(6,2) NULL');
  await addColumnIfMissing('Workout_Session_Exercise', 'reps_completed',       'reps_completed INT NULL');
  await addColumnIfMissing('Workout_Session_Exercise', 'sets_completed',       'sets_completed INT NULL');
  await addColumnIfMissing('Workout_Session_Exercise', 'pain_during_exercise', 'pain_during_exercise TINYINT NULL');
  await addColumnIfMissing('Workout_Session_Exercise', 'skipped',              'skipped TINYINT(1) NOT NULL DEFAULT 0');
}

async function ensureNotificationSchema() {
  await db.query(
    `CREATE TABLE IF NOT EXISTS \`Notification\` (
      id INT PRIMARY KEY AUTO_INCREMENT,
      user_id INT NOT NULL,
      type ENUM('session_completed', 'achievement_unlocked', 'streak_active', 'streak_broken', 'progress_milestone', 'pain_checkin', 'workout_reminder') NOT NULL,
      title VARCHAR(150) NOT NULL,
      message TEXT NOT NULL,
      is_read BOOLEAN NOT NULL DEFAULT FALSE,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES User(id) ON DELETE CASCADE
    )`
  );

  await db.query(
    `CREATE TABLE IF NOT EXISTS \`Push_Subscription\` (
      id INT PRIMARY KEY AUTO_INCREMENT,
      user_id INT NOT NULL,
      endpoint TEXT NOT NULL,
      p256dh VARCHAR(500) NOT NULL,
      auth VARCHAR(255) NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES User(id) ON DELETE CASCADE
    )`
  );

  await db.query(
    `CREATE TABLE IF NOT EXISTS \`Notification_Preferences\` (
      user_id INT PRIMARY KEY,
      in_app_enabled BOOLEAN NOT NULL DEFAULT TRUE,
      push_enabled BOOLEAN NOT NULL DEFAULT TRUE,
      type_session_completed BOOLEAN NOT NULL DEFAULT TRUE,
      type_achievement_unlocked BOOLEAN NOT NULL DEFAULT TRUE,
      type_streak_active BOOLEAN NOT NULL DEFAULT TRUE,
      type_streak_broken BOOLEAN NOT NULL DEFAULT TRUE,
      type_progress_milestone BOOLEAN NOT NULL DEFAULT TRUE,
      type_pain_checkin BOOLEAN NOT NULL DEFAULT TRUE,
      type_workout_reminder BOOLEAN NOT NULL DEFAULT TRUE,
      reminder_time VARCHAR(5) NOT NULL DEFAULT '09:00',
      timezone VARCHAR(50) NOT NULL DEFAULT 'UTC',
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES User(id) ON DELETE CASCADE
    )`
  );

  await addColumnIfMissing('Notification_Preferences', 'timezone', "timezone VARCHAR(50) NOT NULL DEFAULT 'UTC'");

  // Add session_reminder to Notification ENUM if not present
  const [[enumRow]] = await db.query(
    `SELECT COLUMN_TYPE FROM information_schema.COLUMNS
     WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'Notification' AND COLUMN_NAME = 'type'`
  );
  if (enumRow && !enumRow.COLUMN_TYPE.includes('session_reminder')) {
    await db.query(
      `ALTER TABLE \`Notification\` MODIFY COLUMN \`type\`
       ENUM('session_completed','achievement_unlocked','streak_active','streak_broken',
            'progress_milestone','pain_checkin','workout_reminder','session_reminder') NOT NULL`
    );
  }

  await addColumnIfMissing('Notification_Preferences', 'type_session_reminder', 'type_session_reminder BOOLEAN NOT NULL DEFAULT TRUE');
}

async function ensureScheduledSessionSchema() {
  await db.query(
    `CREATE TABLE IF NOT EXISTS \`Scheduled_Session\` (
      id INT PRIMARY KEY AUTO_INCREMENT,
      user_id INT NOT NULL,
      routine_id INT NOT NULL,
      routine_name VARCHAR(200) NOT NULL,
      scheduled_at DATETIME NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES User(id) ON DELETE CASCADE
    )`
  );
}

async function ensureInjuryTable() {
  await db.query(
    `CREATE TABLE IF NOT EXISTS \`Injury_Reference\` (
      id INT PRIMARY KEY AUTO_INCREMENT,
      name VARCHAR(255) NOT NULL UNIQUE,
      body_part VARCHAR(100) NOT NULL,
      common_causes TEXT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`
  );
  await addIndexIfMissing('Injury_Reference', 'idx_injury_ref_body_part', 'INDEX `idx_injury_ref_body_part` (body_part)');
}

async function ensureBodyCheckinSchema() {
  await db.query(
    `CREATE TABLE IF NOT EXISTS \`User_Focus_Area\` (
      id        INT PRIMARY KEY AUTO_INCREMENT,
      user_id   INT NOT NULL,
      area_name VARCHAR(100) NOT NULL,
      emoji     VARCHAR(10)  NOT NULL DEFAULT '🩹',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      UNIQUE KEY unique_user_area (user_id, area_name),
      FOREIGN KEY (user_id) REFERENCES User(id) ON DELETE CASCADE
    )`
  );

  await db.query(
    `CREATE TABLE IF NOT EXISTS \`Body_Checkin_Log\` (
      id          INT PRIMARY KEY AUTO_INCREMENT,
      user_id     INT NOT NULL,
      area_name   VARCHAR(100) NOT NULL,
      log_date    DATE NOT NULL,
      pain_status ENUM('red', 'yellow', 'green') NOT NULL,
      pain_scale  INT NOT NULL DEFAULT 0,
      notes       TEXT NULL,
      created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      UNIQUE KEY unique_log (user_id, area_name, log_date),
      FOREIGN KEY (user_id) REFERENCES User(id) ON DELETE CASCADE
    )`
  );

  // Add feeling column for daily check-in state (good / not_good)
  await addColumnIfMissing('Body_Checkin_Log', 'feeling', "feeling VARCHAR(10) NULL");
}

async function ensureCheckinFlowSchema() {
  // Track once-per-day check-in enforcement
  await addColumnIfMissing('User', 'last_checkin_date', 'last_checkin_date DATE NULL');
  // Store workout environment preference from injury flow
  await addColumnIfMissing('User_Profile', 'workout_environment', 'workout_environment VARCHAR(20) NULL');
}

async function ensureWorkoutFeedbackSchema() {
  await db.query(
    `CREATE TABLE IF NOT EXISTS \`Workout_Feedback\` (
      id          INT PRIMARY KEY AUTO_INCREMENT,
      session_id  INT NOT NULL,
      overall_pain TINYINT NOT NULL DEFAULT 0,
      difficulty  TINYINT NOT NULL DEFAULT 3,
      felt_after  ENUM('great','good','okay','tired','pain') NOT NULL DEFAULT 'okay',
      unsafe_flag TINYINT(1) NOT NULL DEFAULT 0,
      notes       TEXT NULL,
      created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (session_id) REFERENCES Workout_Session(id) ON DELETE CASCADE
    )`
  );
  await addColumnIfMissing('Workout_Session', 'unsafe_flag', 'unsafe_flag TINYINT(1) NOT NULL DEFAULT 0');
}

async function ensurePhysioSchema() {
  await addColumnIfMissing('User', 'role', "role ENUM('patient','physio','admin') NOT NULL DEFAULT 'patient'");

  await db.query(
    `CREATE TABLE IF NOT EXISTS \`Physio_Assignment\` (
      id         INT PRIMARY KEY AUTO_INCREMENT,
      physio_id  INT NOT NULL,
      patient_id INT NOT NULL,
      is_active  TINYINT(1) NOT NULL DEFAULT 1,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      UNIQUE KEY unique_assignment (physio_id, patient_id),
      FOREIGN KEY (physio_id)  REFERENCES User(id) ON DELETE CASCADE,
      FOREIGN KEY (patient_id) REFERENCES User(id) ON DELETE CASCADE
    )`
  );
}

async function ensureSchema() {
  await ensureLowercaseExerciseTables();
  await ensureUserAuthSchema();
  await ensureUserProfileSchema();
  await ensureSavedRoutineSchema();
  await ensureWorkoutSessionSchema();
  await ensureNotificationSchema();
  await ensureScheduledSessionSchema();
  await ensureInjuryTable();
  await ensureBodyCheckinSchema();
  await ensureCheckinFlowSchema();
  await ensureWorkoutFeedbackSchema();
  await ensurePhysioSchema();
}

module.exports = ensureSchema;
