-- Migration 005: Create Saved_Routine and Saved_Routine_Entry tables
-- Supports named saved routines (separate from the draft Routine_Entry builder)

USE `physio`;

CREATE TABLE IF NOT EXISTS `Saved_Routine` (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  name VARCHAR(150) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES User(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS `Saved_Routine_Entry` (
  id INT PRIMARY KEY AUTO_INCREMENT,
  routine_id INT NOT NULL,
  exercise_id INT NOT NULL,
  sort_order INT NOT NULL DEFAULT 0,
  FOREIGN KEY (routine_id) REFERENCES Saved_Routine(id) ON DELETE CASCADE,
  FOREIGN KEY (exercise_id) REFERENCES Exercise(id) ON DELETE CASCADE
);
