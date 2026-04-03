-- Migration 011: Focus Area Options
USE physio;
-- Stores the list of selectable body-part options shown in the "Add Focus Area" modal.
-- Decoupled from the UI so new areas can be added/removed without touching view files.

CREATE TABLE IF NOT EXISTS `Focus_Area_Option` (
  id         INT PRIMARY KEY AUTO_INCREMENT,
  name       VARCHAR(100) NOT NULL UNIQUE,
  emoji      VARCHAR(10)  NOT NULL DEFAULT '🩹',
  sort_order INT          NOT NULL DEFAULT 0
);

INSERT INTO `Focus_Area_Option` (name, emoji, sort_order) VALUES
  ('Neck',             '🫶', 1),
  ('Shoulder',         '💪', 2),
  ('Upper Back',       '🔙', 3),
  ('Back',             '🧍', 4),
  ('Lower Back',       '🪑', 5),
  ('Chest',            '🫁', 6),
  ('Core',             '🎯', 7),
  ('Spine',            '🦴', 8),
  ('Hip',              '🕺', 9),
  ('Glutes',           '🍑', 10),
  ('Arms',             '💪', 11),
  ('Elbow',            '🦾', 12),
  ('Forearm',          '🖐️', 13),
  ('Wrist',            '🖐️', 14),
  ('Quads',            '🦵', 15),
  ('Hamstring',        '🦵', 16),
  ('Inner Thigh',      '🦵', 17),
  ('Adductors',        '🦵', 18),
  ('Knee',             '🦵', 19),
  ('Thigh/Outer Knee', '🦵', 20),
  ('Lower Leg',        '🦵', 21),
  ('Calves',           '🦵', 22),
  ('Ankle',            '🦶', 23),
  ('Foot',             '🦶', 24),
  ('Legs',             '🦵', 25),
  ('Full Body',        '🏃', 26)
AS new_vals
ON DUPLICATE KEY UPDATE sort_order = new_vals.sort_order;
