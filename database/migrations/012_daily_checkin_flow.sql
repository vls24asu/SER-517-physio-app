-- Migration 012: Daily check-in flow support
-- Adds columns needed for the daily check-in and injury flow features

-- Track the last date user completed the daily check-in (prevents showing it twice per day)
ALTER TABLE `User` ADD COLUMN IF NOT EXISTS `last_checkin_date` DATE NULL;

-- Track workout environment preference (at_home, condo_gym, full_gym)
ALTER TABLE `User_Profile` ADD COLUMN IF NOT EXISTS `workout_environment` VARCHAR(20) NULL;

-- Add feeling column to Body_Checkin_Log to record good/not_good state per log
ALTER TABLE `Body_Checkin_Log` ADD COLUMN IF NOT EXISTS `feeling` VARCHAR(10) NULL;
