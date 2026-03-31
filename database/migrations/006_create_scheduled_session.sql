-- Migration 006: Create Scheduled_Session table
USE `physio`;

CREATE TABLE IF NOT EXISTS `Scheduled_Session` (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  routine_id INT NOT NULL,
  routine_name VARCHAR(150) NOT NULL,
  scheduled_at DATETIME NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES User(id) ON DELETE CASCADE,
  FOREIGN KEY (routine_id) REFERENCES Saved_Routine(id) ON DELETE CASCADE
);
