CREATE TABLE `Notification_Preferences` (
    user_id INT PRIMARY KEY,
    in_app_enabled BOOLEAN NOT NULL DEFAULT TRUE,
    push_enabled BOOLEAN NOT NULL DEFAULT TRUE,
    type_session_completed BOOLEAN NOT NULL DEFAULT TRUE,
    type_achievement_unlocked BOOLEAN NOT NULL DEFAULT TRUE,
    type_streak_active BOOLEAN NOT NULL DEFAULT TRUE,
    type_streak_broken BOOLEAN NOT NULL DEFAULT TRUE,
    type_progress_milestone BOOLEAN NOT NULL DEFAULT TRUE,
    type_pain_checkin BOOLEAN NOT NULL DEFAULT TRUE,
    type_workout_reminder BOOLEAN NOT NULL DEFAULT TRUE,
    reminder_time VARCHAR(5) NOT NULL DEFAULT '09:00',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES User(id) ON DELETE CASCADE
);
