-- Migration 007: Snapshot exercises per workout session
-- Prevents exercise history from disappearing when a Saved_Routine is deleted
-- Run ONCE on local and Railway databases after migration 006

CREATE TABLE IF NOT EXISTS Workout_Session_Exercise (
  id           INT PRIMARY KEY AUTO_INCREMENT,
  session_id   INT NOT NULL,
  exercise_id  INT NOT NULL,
  name         VARCHAR(255) NOT NULL,
  category     VARCHAR(100) NULL,
  `sets`       DECIMAL(5,1) NULL,
  reps         VARCHAR(50)  NULL,
  hold_time_sec INT NULL,
  sort_order   INT NOT NULL DEFAULT 0,
  FOREIGN KEY (session_id) REFERENCES Workout_Session(id) ON DELETE CASCADE
);
