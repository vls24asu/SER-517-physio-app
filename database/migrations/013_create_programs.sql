-- Migration 013: Programs feature
-- Creates Program and Program_Exercise tables for predefined timed routines

CREATE TABLE IF NOT EXISTS `Program` (
  id           INT PRIMARY KEY AUTO_INCREMENT,
  name         VARCHAR(255) NOT NULL,
  description  TEXT NULL,
  duration_min INT NOT NULL,
  activity     VARCHAR(150) NULL,
  routine_type ENUM('prevention','recovery','lifestyle') NOT NULL DEFAULT 'lifestyle',
  emoji        VARCHAR(10) NOT NULL DEFAULT '🏋️',
  created_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS `Program_Exercise` (
  id               INT PRIMARY KEY AUTO_INCREMENT,
  program_id       INT NOT NULL,
  exercise_name    VARCHAR(255) NOT NULL,
  exercise_type    VARCHAR(50)  NULL,
  body_part        VARCHAR(100) NULL,
  equipment        VARCHAR(255) NULL,
  tips             TEXT NULL,
  common_mistakes  TEXT NULL,
  position         VARCHAR(100) NULL,
  contraction_type VARCHAR(100) NULL,
  bilateral        VARCHAR(50)  NULL,
  tempo            VARCHAR(50)  NULL,
  skill_level      VARCHAR(50)  NULL,
  sets             INT NULL,
  reps             VARCHAR(50)  NULL,
  rest_time_sec    INT NULL,
  tendon_used      VARCHAR(255) NULL,
  ligament_used    VARCHAR(255) NULL,
  common_causes    TEXT NULL,
  sort_order       INT NOT NULL DEFAULT 0,
  FOREIGN KEY (program_id) REFERENCES Program(id) ON DELETE CASCADE
);
