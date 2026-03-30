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

async function hasForeignKey(tableName, constraintName) {
  const [rows] = await db.query(
    `SELECT 1
     FROM information_schema.table_constraints
     WHERE table_schema = DATABASE()
       AND table_name = ?
       AND constraint_type = 'FOREIGN KEY'
       AND constraint_name = ?
     LIMIT 1`,
    [tableName, constraintName]
  );

  return rows.length > 0;
}

async function ensureSavedRoutineTables() {
  await db.query(
    `CREATE TABLE IF NOT EXISTS Saved_Routine (
      id INT PRIMARY KEY AUTO_INCREMENT,
      user_id INT NOT NULL,
      name VARCHAR(150) NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES User(id) ON DELETE CASCADE
    )`
  );

  await db.query(
    `CREATE TABLE IF NOT EXISTS Saved_Routine_Entry (
      id INT PRIMARY KEY AUTO_INCREMENT,
      routine_id INT NOT NULL,
      exercise_id INT NOT NULL,
      sort_order INT NOT NULL DEFAULT 0,
      FOREIGN KEY (routine_id) REFERENCES Saved_Routine(id) ON DELETE CASCADE,
      FOREIGN KEY (exercise_id) REFERENCES exercise(id) ON DELETE CASCADE
    )`
  );
}

async function ensureWorkoutSessionSchema() {
  if (!(await hasTable('Workout_Session'))) {
    return;
  }

  if (!(await hasColumn('Workout_Session', 'routine_id'))) {
    await db.query(
      `ALTER TABLE Workout_Session
       ADD COLUMN routine_id INT NULL AFTER user_id`
    );
  }

  if (!(await hasForeignKey('Workout_Session', 'fk_ws_saved_routine'))) {
    await db.query(
      `ALTER TABLE Workout_Session
       ADD CONSTRAINT fk_ws_saved_routine
       FOREIGN KEY (routine_id) REFERENCES Saved_Routine(id) ON DELETE SET NULL`
    );
  }

  await db.query(
    `CREATE TABLE IF NOT EXISTS Workout_Session_Exercise (
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
}

async function ensureSchema() {
  await ensureSavedRoutineTables();
  await ensureWorkoutSessionSchema();
}

module.exports = ensureSchema;
