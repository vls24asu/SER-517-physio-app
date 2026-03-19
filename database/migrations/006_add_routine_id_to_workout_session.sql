-- Migration 006: Add routine_id to Workout_Session for exercise tracking on progress page
-- Run ONCE on local and Railway databases after migration 005

ALTER TABLE Workout_Session
  ADD COLUMN routine_id INT NULL AFTER user_id;

ALTER TABLE Workout_Session
  ADD CONSTRAINT fk_ws_saved_routine
  FOREIGN KEY (routine_id) REFERENCES Saved_Routine(id) ON DELETE SET NULL;
