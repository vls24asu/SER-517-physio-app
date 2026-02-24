-- Migration: Add Workout_Session table
-- Run this if your database already exists (created from the old DDL)

USE `physio`;

CREATE TABLE IF NOT EXISTS `Workout_Session` (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    title VARCHAR(150) NOT NULL,
    duration_min INT NOT NULL DEFAULT 0,
    exercise_count INT NOT NULL DEFAULT 0,
    tags VARCHAR(255) NULL,
    emoji VARCHAR(10) NULL DEFAULT '🏋️',
    session_date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES User(id) ON DELETE CASCADE
);
