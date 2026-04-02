-- Migration 010: Body Check-In feature
-- Creates tables to persist user focus areas and daily pain logs

-- Stores which body-part focus areas a user has added
CREATE TABLE IF NOT EXISTS `User_Focus_Area` (
  id         INT PRIMARY KEY AUTO_INCREMENT,
  user_id    INT NOT NULL,
  area_name  VARCHAR(100) NOT NULL,
  emoji      VARCHAR(10)  NOT NULL DEFAULT '🩹',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY unique_user_area (user_id, area_name),
  FOREIGN KEY (user_id) REFERENCES User(id) ON DELETE CASCADE
);

-- Stores one pain log entry per user + area + date
CREATE TABLE IF NOT EXISTS `Body_Checkin_Log` (
  id           INT PRIMARY KEY AUTO_INCREMENT,
  user_id      INT NOT NULL,
  area_name    VARCHAR(100) NOT NULL,
  log_date     DATE NOT NULL,
  pain_status  ENUM('red', 'yellow', 'green') NOT NULL,
  pain_scale   INT NOT NULL DEFAULT 0,
  notes        TEXT NULL,
  created_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY unique_log (user_id, area_name, log_date),
  FOREIGN KEY (user_id) REFERENCES User(id) ON DELETE CASCADE
);
