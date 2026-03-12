ALTER TABLE User_Profile
  ADD COLUMN pain_status ENUM('yes', 'no') NULL AFTER pain_areas,
  ADD COLUMN pain_intensity INT NULL AFTER pain_status;
