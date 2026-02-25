-- Migration: Create Exercise and Muscle_Group tables
-- For exercise library feature

USE `physio`;

-- Muscle groups table
CREATE TABLE IF NOT EXISTS Muscle_Group (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(100) NOT NULL UNIQUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Exercise table
CREATE TABLE IF NOT EXISTS Exercise (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(255) NOT NULL,
  category ENUM('strengthen', 'stretch', 'avoid') NOT NULL,

  -- Exercise details
  description TEXT,
  tips TEXT,
  common_mistakes TEXT,
  position VARCHAR(100),
  equipment_needed VARCHAR(255),

  -- Difficulty & level
  skill_level ENUM('Beginner', 'Intermediate', 'Advanced') DEFAULT 'Beginner',
  difficulty ENUM('easy', 'medium', 'hard') DEFAULT 'easy',

  -- Workout parameters
  tempo VARCHAR(100),
  sets DECIMAL(3,1),
  reps VARCHAR(50),
  duration_seconds INT,

  -- Gym/Home
  is_gym_only BOOLEAN DEFAULT 0,

  -- UI fields
  emoji VARCHAR(10) DEFAULT '💪',
  image_url VARCHAR(500),
  video_url VARCHAR(500),

  -- Stats
  sessions_count INT DEFAULT 0,

  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Junction table for Exercise-Muscle relationship
CREATE TABLE IF NOT EXISTS Exercise_Muscle_Group (
  id INT PRIMARY KEY AUTO_INCREMENT,
  exercise_id INT NOT NULL,
  muscle_group_id INT NOT NULL,
  FOREIGN KEY (exercise_id) REFERENCES Exercise(id) ON DELETE CASCADE,
  FOREIGN KEY (muscle_group_id) REFERENCES Muscle_Group(id) ON DELETE CASCADE,
  UNIQUE KEY unique_exercise_muscle (exercise_id, muscle_group_id)
);

-- Indexes for performance
CREATE INDEX idx_exercise_category ON Exercise(category);
CREATE INDEX idx_exercise_skill_level ON Exercise(skill_level);
CREATE INDEX idx_exercise_difficulty ON Exercise(difficulty);
CREATE INDEX idx_exercise_gym_only ON Exercise(is_gym_only);
