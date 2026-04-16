-- Migration 014: Allow NULL exercise_id in Workout_Session_Exercise
-- Needed so program sessions (which store exercises inline, not via exercise table)
-- can still snapshot their exercise list in workout history

ALTER TABLE Workout_Session_Exercise MODIFY COLUMN exercise_id INT NULL;
