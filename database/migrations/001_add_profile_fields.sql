-- Migration: Add extended profile fields to User_Profile
-- Run this if your database already exists (created from the old DDL)

USE `physio`;

ALTER TABLE `User_Profile`
    ADD COLUMN IF NOT EXISTS `age` INT NULL AFTER `user_id`,
    ADD COLUMN IF NOT EXISTS `gender` ENUM('male', 'female', 'non-binary', 'prefer_not_to_say') NULL AFTER `age`,
    ADD COLUMN IF NOT EXISTS `height_cm` DECIMAL(5,1) NULL AFTER `gender`,
    ADD COLUMN IF NOT EXISTS `weight_kg` DECIMAL(5,1) NULL AFTER `height_cm`,
    ADD COLUMN IF NOT EXISTS `workout_duration_min` INT NULL DEFAULT 30 AFTER `goals`,
    ADD COLUMN IF NOT EXISTS `pain_areas` TEXT NULL AFTER `workout_duration_min`;
