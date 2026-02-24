-- Migration: Add extended profile fields to User_Profile
-- Run this if your database already exists (created from the old DDL)
-- NOTE: If columns already exist this will error — that means you already have them, skip it.

USE `physio`;

ALTER TABLE `User_Profile`
    ADD COLUMN `age` INT NULL AFTER `user_id`,
    ADD COLUMN `gender` ENUM('male', 'female', 'non-binary', 'prefer_not_to_say') NULL AFTER `age`,
    ADD COLUMN `height_cm` DECIMAL(5,1) NULL AFTER `gender`,
    ADD COLUMN `weight_kg` DECIMAL(5,1) NULL AFTER `height_cm`,
    ADD COLUMN `workout_duration_min` INT NULL DEFAULT 30 AFTER `goals`,
    ADD COLUMN `pain_areas` TEXT NULL AFTER `workout_duration_min`;
