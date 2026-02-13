-- PhysioApp Database Schema

DROP SCHEMA IF EXISTS `physio`;
CREATE SCHEMA `physio`;
USE `physio`;

-- =============================================
-- CORE TABLES
-- =============================================

CREATE TABLE `Exercise` (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    category ENUM('stretch', 'strengthen') NOT NULL,
    is_gym_only BOOLEAN NOT NULL DEFAULT FALSE,
    tips TEXT NULL,
    common_mistakes TEXT NULL,
    image_link VARCHAR(255) NULL,
    video_link VARCHAR(255) NULL,
    position VARCHAR(100) NULL,
    equipment_needed TEXT NULL,
    skill_level ENUM('Beginner', 'Intermediate', 'Advanced') NULL,
    tempo VARCHAR(100) NULL,
    sets INT NULL,
    reps VARCHAR(45) NULL,
    hold_time_sec INT NULL,
    rest_time_sec INT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE `User` (
    id INT PRIMARY KEY AUTO_INCREMENT,
    username VARCHAR(45) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role ENUM('patient', 'physio') NOT NULL DEFAULT 'patient',
    twofa_enabled BOOLEAN NOT NULL DEFAULT FALSE,
    twofa_secret VARCHAR(64) NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE `Muscle_Group` (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(45) NOT NULL UNIQUE
);

CREATE TABLE `Exercise_Muscle_Group` (
    exercise_id INT NOT NULL,
    muscle_group_id INT NOT NULL,
    PRIMARY KEY (exercise_id, muscle_group_id),
    FOREIGN KEY (exercise_id) REFERENCES Exercise(id) ON DELETE CASCADE,
    FOREIGN KEY (muscle_group_id) REFERENCES Muscle_Group(id) ON DELETE CASCADE
);

CREATE TABLE `Favourites` (
    user_id INT NOT NULL,
    exercise_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (user_id, exercise_id),
    FOREIGN KEY (user_id) REFERENCES User(id) ON DELETE CASCADE,
    FOREIGN KEY (exercise_id) REFERENCES Exercise(id) ON DELETE CASCADE
);

CREATE TABLE `Routine_Entry` (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    exercise_id INT NOT NULL,
    is_completed BOOLEAN NOT NULL DEFAULT FALSE,
    sort_order INT NOT NULL DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES User(id) ON DELETE CASCADE,
    FOREIGN KEY (exercise_id) REFERENCES Exercise(id) ON DELETE CASCADE
);

-- =============================================
-- NEW TABLES
-- =============================================

CREATE TABLE `User_Profile` (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL UNIQUE,
    fitness_level ENUM('beginner', 'intermediate', 'advanced') NULL DEFAULT 'beginner',
    exercise_preference ENUM('stretch', 'strengthen', 'both') NULL DEFAULT 'both',
    available_equipment TEXT NULL,
    goals TEXT NULL,
    notes TEXT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES User(id) ON DELETE CASCADE
);

CREATE TABLE `Injury` (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    body_part VARCHAR(100) NOT NULL,
    injury_type VARCHAR(100) NULL,
    severity ENUM('mild', 'moderate', 'severe') NOT NULL DEFAULT 'moderate',
    injury_date DATE NULL,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    notes TEXT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES User(id) ON DELETE CASCADE
);

CREATE TABLE `Physio_Patient` (
    id INT PRIMARY KEY AUTO_INCREMENT,
    physio_id INT NOT NULL,
    patient_id INT NOT NULL,
    assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    UNIQUE KEY unique_assignment (physio_id, patient_id),
    FOREIGN KEY (physio_id) REFERENCES User(id) ON DELETE CASCADE,
    FOREIGN KEY (patient_id) REFERENCES User(id) ON DELETE CASCADE
);

CREATE TABLE `Exercise_Plan` (
    id INT PRIMARY KEY AUTO_INCREMENT,
    physio_id INT NOT NULL,
    patient_id INT NOT NULL,
    plan_name VARCHAR(100) NOT NULL,
    description TEXT NULL,
    start_date DATE NULL,
    end_date DATE NULL,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (physio_id) REFERENCES User(id) ON DELETE CASCADE,
    FOREIGN KEY (patient_id) REFERENCES User(id) ON DELETE CASCADE
);

CREATE TABLE `Exercise_Plan_Item` (
    id INT PRIMARY KEY AUTO_INCREMENT,
    plan_id INT NOT NULL,
    exercise_id INT NOT NULL,
    custom_sets INT NULL,
    custom_reps VARCHAR(45) NULL,
    custom_hold_time_sec INT NULL,
    custom_notes TEXT NULL,
    sort_order INT NOT NULL DEFAULT 0,
    FOREIGN KEY (plan_id) REFERENCES Exercise_Plan(id) ON DELETE CASCADE,
    FOREIGN KEY (exercise_id) REFERENCES Exercise(id) ON DELETE CASCADE
);

CREATE TABLE `Plan_Completion_Log` (
    id INT PRIMARY KEY AUTO_INCREMENT,
    plan_item_id INT NOT NULL,
    patient_id INT NOT NULL,
    completed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    notes TEXT NULL,
    FOREIGN KEY (plan_item_id) REFERENCES Exercise_Plan_Item(id) ON DELETE CASCADE,
    FOREIGN KEY (patient_id) REFERENCES User(id) ON DELETE CASCADE
);

-- =============================================
-- DATABASE USER AND GRANTS
-- =============================================

DROP USER IF EXISTS 'physioapp'@'localhost';
CREATE USER 'physioapp'@'localhost' IDENTIFIED BY 'physioapp_pwd';
GRANT SELECT, INSERT, UPDATE, DELETE ON `physio`.* TO 'physioapp'@'localhost';
