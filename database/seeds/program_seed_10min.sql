-- Program Seed Data – 10-MINUTE PROGRAMS
-- Run AFTER migration 013_create_programs.sql
-- Safe to re-run: deletes existing 10-min programs first

DELETE pe FROM `Program_Exercise` pe
INNER JOIN `Program` p ON pe.program_id = p.id
WHERE p.duration_min = 10;
DELETE FROM `Program` WHERE duration_min = 10;

INSERT INTO `Program` (name, description, duration_min, activity, routine_type, emoji) VALUES
('Ski/Skate – Injury Prevention',              'Pre-activity routine to strengthen hips, legs, and ankles for skiing and skating.',        10, 'Skiing/Skating', 'prevention', '⛷️'),
('Post-Ski/Skate Recovery',                    'Recovery routine to ease stiffness and restore mobility after skiing or skating.',          10, 'Skiing/Skating', 'recovery',   '🏂'),
('Hiking – Injury Prevention',                 'Pre-hike routine targeting glutes, hips, and ankles to prevent common hiking injuries.',    10, 'Hiking',          'prevention', '🥾'),
('Hiking – Post-Injury Recovery',              'Gentle recovery routine for knees, quads, and shoulders after hiking.',                    10, 'Hiking',          'recovery',   '🏔️'),
('Winter Sidewalk Slip Prevention',            'Balance and strength routine to prevent falls on icy sidewalks.',                          10, 'Winter',          'prevention', '🧊'),
('Gardening & Outdoor Cleanup',                'Routine to protect your back, hips, and legs during spring gardening.',                    10, 'Spring',          'lifestyle',  '🌱'),
('Bar Stool Back Saver',                       'Quick posture and back reset for after a night out sitting on bar stools.',                10, 'Lifestyle',       'lifestyle',  '🪑'),
('Work-From-Couch Core Reset',                 'Core and posture reset for remote workers spending too much time on the couch.',            10, 'Lifestyle',       'lifestyle',  '💻'),
('Netflix Binge Survival Stretch',             'Stretch routine to undo the damage from hours of binge-watching.',                        10, 'Lifestyle',       'lifestyle',  '📺'),
('Restaurant Chair Rescue',                    'Quick mobility routine for after long restaurant dinners on uncomfortable chairs.',        10, 'Lifestyle',       'lifestyle',  '🍽️'),
('Long Car Ride Reset',                        'Mobility and stretch routine to relieve tightness after long drives.',                     10, 'Lifestyle',       'lifestyle',  '🚗'),
('Pickup Basketball – ACL & Ankle Prevention', 'Quick ACL and ankle injury prevention routine for pickup basketball players.',             10, 'Basketball',      'prevention', '🏀'),
('Gym Newbie – Lower Back Strain Prevention',  'Lower back strain prevention routine for gym beginners learning to lift.',                 10, 'Lifestyle',       'prevention', '🏋️'),
('Office Worker – Shoulder Impingement',       'Quick shoulder impingement prevention routine for office workers.',                       10, 'Lifestyle',       'prevention', '💼'),
('Tennis Elbow Prevention',                    'Quick routine to prevent tennis elbow from repetitive forearm overuse.',                  10, 'Lifestyle',       'prevention', '🎾'),
('Runner''s Knee (PFPS) Prevention',           'Quick routine to prevent runner''s knee and patellofemoral pain.',                        10, 'Running',         'prevention', '🏃'),
('Shoulder Dislocation Prevention',            'Shoulder stability routine for contact sport athletes to reduce dislocation risk.',        10, 'Lifestyle',       'prevention', '🤸');

-- ── Ski/Skate – Injury Prevention ──
SET @p = (SELECT id FROM `Program` WHERE name = 'Ski/Skate – Injury Prevention' AND duration_min = 10 LIMIT 1);
INSERT INTO `Program_Exercise` (program_id, exercise_name, exercise_type, body_part, equipment, tips, common_mistakes, position, contraction_type, bilateral, tempo, skill_level, sets, reps, rest_time_sec, tendon_used, ligament_used, common_causes, sort_order) VALUES
(@p, 'Monster Walk',                   'strengthen', 'Hips',   'Band',  'Keep band tight',    'Jerking',          'Standing',   'Con/Ecc',  'Bilateral',  '2:2',    'Beginner',     1, '12',     20, 'Glute med',        'Hip ligaments',     'Weak abductors',     1),
(@p, 'Lateral Step Downs',             'strengthen', 'Hips',   'Step',  'Control descent',    'Knee collapse',    'Standing',   'Con/Ecc',  'Unilateral', '2:2',    'Intermediate', 1, '10',     20, 'Glute',            'Knee ligaments',    'Weak hip control',   2),
(@p, 'Wall Sits',                      'strengthen', 'Legs',   'Wall',  'Knees stacked',      'Leaning forward',  'Standing',   'Isometric','Bilateral',  '30s',    'Beginner',     1, '1',      20, 'Patellar',         'Patellar ligament', 'Weak quads',         3),
(@p, 'Glute Bridge',                   'strengthen', 'Glutes', 'Mat',   'Squeeze glutes',     'Arching',          'Supine',     'Con/Ecc',  'Bilateral',  '2:2',    'Beginner',     1, '15',     20, 'Glute',            'Hip ligament',      'Weak posterior chain',4),
(@p, 'Calf Raises',                    'strengthen', 'Ankle',  'None',  'Pause at top',       'Bouncing',         'Standing',   'Con/Ecc',  'Bilateral',  '2:2',    'Beginner',     1, '20',     20, 'Achilles',         'Ankle ligaments',   'Weak calves',        5),
(@p, 'Spanish Squat',                  'strengthen', 'Knees',  'Band',  'Sit back into band', 'Knees collapsing', 'Standing',   'Con/Ecc',  'Bilateral',  '3-1-2003','Beginner',    2, '12',     30, 'Patellar tendon',  'ACL, PCL',          'Weak quads',         6),
(@p, 'Single-Leg Calf Raise',          'strengthen', 'Ankles', 'None',  'Slow lower',         'Bouncing',         'Standing',   'Con/Ecc',  'Unilateral', '3-1-2002','Beginner',    2, '12',     30, 'Achilles tendon',  'ATFL',              'Weak ankle',         7),
(@p, 'Copenhagen Plank',               'strengthen', 'Hips',   'Bench', 'Keep hips high',     'Dropping hips',    'Side plank', 'Isometric','Unilateral', '20-30s', 'Intermediate', 2, '2 holds',30, 'Adductor tendon',  'Pubofemoral',       'Weak groin',         8);

-- ── Post-Ski/Skate Recovery ──
SET @p = (SELECT id FROM `Program` WHERE name = 'Post-Ski/Skate Recovery' AND duration_min = 10 LIMIT 1);
INSERT INTO `Program_Exercise` (program_id, exercise_name, exercise_type, body_part, equipment, tips, common_mistakes, position, contraction_type, bilateral, tempo, skill_level, sets, reps, rest_time_sec, tendon_used, ligament_used, common_causes, sort_order) VALUES
(@p, 'Heel Slides',                    'mobility',   'Knee',     'Towel', 'Gentle',             'Forcing',          'Supine',   'Dynamic',        'Unilateral', '2:2',      'Beginner',     1, '12', 20, 'Hamstring',       'Knee ligaments',     'Stiff knee',          1),
(@p, 'IT Band Stretch',                'stretch',    'IT Band',  'None',  'Gentle',             'Twisting',         'Standing', 'Static',         'Bilateral',  '30s',      'Beginner',     1, '1',  20, 'TFL tendon',      'Hip ligaments',      'Tight ITB',           2),
(@p, 'Glute Bridge',                   'strengthen', 'Glutes',   'Mat',   'Gentle lift',        'Overarching',      'Supine',   'Con/Ecc',        'Bilateral',  '2:2',      'Beginner',     1, '12', 20, 'Glute',           'Hip ligaments',      'Weak posterior chain',3),
(@p, 'Straight Leg Raise',             'strengthen', 'Quads',    'None',  'Keep leg straight',  'Swinging',         'Supine',   'Con/Ecc',        'Unilateral', '2:2',      'Beginner',     1, '12', 20, 'Patellar tendon', 'Knee ligaments',     'Weak quads',          4),
(@p, 'Wall Angels',                    'mobility',   'Shoulder', 'None',  'Slow & controlled',  'Arching',          'Standing', 'Dynamic',        'Bilateral',  '2:2',      'Beginner',     1, '12', 20, 'Rotator cuff',    'Shoulder ligaments', 'Post-fall tightness', 5),
(@p, 'Ankle Dorsiflexion Stretch',     'stretch',    'Ankle',    'Wall',  'Heel stays down',    'Bouncing',         'Standing', 'Static',         'Unilateral', '30s',      'Beginner',     1, '1',  20, 'Achilles',        'ATFL',               'Tight calves',        6),
(@p, 'Reverse Nordic',                 'strengthen', 'Quads',    'Mat',   'Lean back slowly',   'Arching',          'Kneeling', 'Eccentric focus','Bilateral',  '3-1-2003', 'Intermediate', 2, '8',  30, 'Patellar tendon', 'ACL',                'Quad strain',         7);

-- ── Hiking – Injury Prevention ──
SET @p = (SELECT id FROM `Program` WHERE name = 'Hiking – Injury Prevention' AND duration_min = 10 LIMIT 1);
INSERT INTO `Program_Exercise` (program_id, exercise_name, exercise_type, body_part, equipment, tips, common_mistakes, position, contraction_type, bilateral, tempo, skill_level, sets, reps, rest_time_sec, tendon_used, ligament_used, common_causes, sort_order) VALUES
(@p, 'Step-Ups',                       'strengthen', 'Glutes', 'Step', 'Push through heel',  'Leaning forward', 'Standing', 'Con/Ecc',        'Unilateral', '2:2',      'Beginner',     1, '12', 20, 'Glute',           'Knee ligaments',  'Weak quads',       1),
(@p, 'Lateral Step Downs',             'strengthen', 'Hips',   'Step', 'Control descent',    'Knee collapsing', 'Standing', 'Con/Ecc',        'Unilateral', '2:2',      'Beginner',     1, '10', 20, 'Glute med',       'Knee ligaments',  'Weak abductors',   2),
(@p, 'Ankle Circles',                  'mobility',   'Ankles', 'None', 'Slow circles',       'Jerking',         'Seated',   'Dynamic',        'Unilateral', '—',        'Beginner',     1, '10 each',20,'Tibialis',        'ATFL',            'Stiff ankle',      3),
(@p, 'Hip Flexor Stretch',             'stretch',    'Hips',   'None', 'Keep pelvis neutral','Overarching',     'Kneeling', 'Static',         'Unilateral', '30s',      'Beginner',     1, '1',  20, 'Hip flexor',      'Hip ligaments',   'Tight hip flexors',4),
(@p, 'Glute Bridge',                   'strengthen', 'Glutes', 'Mat',  'Squeeze glutes',     'Arching',         'Supine',   'Con/Ecc',        'Bilateral',  '2:2',      'Beginner',     1, '15', 20, 'Glute',           'Hip ligaments',   'Weak posterior chain',5),
(@p, 'Step-Down (Slow Eccentric)',     'strengthen', 'Knees',  'Step', '3 sec lower',        'Knee collapse',   'Standing', 'Eccentric focus','Unilateral', '3-1-2001', 'Intermediate', 2, '8',  30, 'Patellar tendon', 'ACL',             'Downhill stress',  6),
(@p, 'Tibialis Raises',                'strengthen', 'Ankles', 'Wall', 'Lift toes high',     'Leaning back',    'Standing', 'Con/Ecc',        'Bilateral',  '2-1-2002', 'Beginner',     2, '15', 30, 'Tibialis tendon', 'ATFL',            'Shin splints',     7);

-- ── Hiking – Post-Injury Recovery ──
SET @p = (SELECT id FROM `Program` WHERE name = 'Hiking – Post-Injury Recovery' AND duration_min = 10 LIMIT 1);
INSERT INTO `Program_Exercise` (program_id, exercise_name, exercise_type, body_part, equipment, tips, common_mistakes, position, contraction_type, bilateral, tempo, skill_level, sets, reps, rest_time_sec, tendon_used, ligament_used, common_causes, sort_order) VALUES
(@p, 'Heel Slides',                    'mobility',   'Knee',      'Towel', 'Gentle',            'Overstretch',  'Supine',   'Dynamic', 'Unilateral', '2:2', 'Beginner', 1, '12', 20, 'Hamstring',       'Knee ligaments',     'Knee stiffness',          1),
(@p, 'IT Band Stretch',                'stretch',    'IT Band',   'None',  'Gentle stretch',    'Twisting',     'Standing', 'Static',  'Bilateral',  '30s', 'Beginner', 1, '1',  20, 'TFL',             'Hip ligaments',      'ITB tightness',           2),
(@p, 'Straight Leg Raise',             'strengthen', 'Quads',     'None',  'Leg straight',      'Swinging',     'Supine',   'Con/Ecc', 'Unilateral', '2:2', 'Beginner', 1, '12', 20, 'Patellar tendon', 'Knee ligaments',     'Weak quads',              3),
(@p, 'Glute Bridge',                   'strengthen', 'Glutes',    'Mat',   'Lift gently',       'Arching',      'Supine',   'Con/Ecc', 'Bilateral',  '2:2', 'Beginner', 1, '12', 20, 'Glute',           'Hip ligaments',      'Weak posterior chain',    4),
(@p, 'Wall Angels',                    'mobility',   'Shoulders', 'None',  'Controlled motion', 'Arching back', 'Standing', 'Dynamic', 'Bilateral',  '2:2', 'Beginner', 1, '10', 20, 'RC tendon',       'Shoulder ligaments', 'Post-exercise tightness', 5);

-- ── Winter Sidewalk Slip Prevention ──
SET @p = (SELECT id FROM `Program` WHERE name = 'Winter Sidewalk Slip Prevention' AND duration_min = 10 LIMIT 1);
INSERT INTO `Program_Exercise` (program_id, exercise_name, exercise_type, body_part, equipment, tips, common_mistakes, position, contraction_type, bilateral, tempo, skill_level, sets, reps, rest_time_sec, tendon_used, ligament_used, common_causes, sort_order) VALUES
(@p, 'Side Lunges',                    'strengthen', 'Legs',    'None',     'Keep toes forward', 'Overstretching', 'Standing',  'Con/Ecc',  'Bilateral',  '2:2', 'Beginner', 1, '12', 20, 'Adductor',       'Hip ligaments', 'Weak groin muscles',  1),
(@p, 'Standing Balance Reach',         'strengthen', 'Balance', 'None',     'Reach slowly',      'Swinging leg',   'Standing',  'Con/Ecc',  'Unilateral', '2:2', 'Beginner', 1, '10', 20, 'Glute med',      'Ankle ligaments','Poor balance',         2),
(@p, 'Clamshell',                      'strengthen', 'Hip',     'Band',     'Keep hips stacked', 'Rolling backward','Side-lying','Con/Ecc',  'Unilateral', '2:2', 'Beginner', 1, '12', 20, 'Glute med',      'Hip ligament',  'Weak stabilizers',    3),
(@p, 'Adductor Stretch',               'stretch',    'Groin',   'None',     'Gentle stretch',    'Forcing split',  'Standing',  'Static',   'Bilateral',  '30s', 'Beginner', 1, '1',  20, 'Adductor tendon','Hip ligament',  'Tight groin',         4),
(@p, 'Single-Leg Balance',             'stability',  'Balance', 'Foam pad', 'Slight knee bend',  'Locking knee',   'Standing',  'Isometric','Unilateral', '30s', 'Beginner', 1, '1',  20, 'Peroneal tendon','ATFL',          'Instability on ice',  5);

-- ── Gardening & Outdoor Cleanup ──
SET @p = (SELECT id FROM `Program` WHERE name = 'Gardening & Outdoor Cleanup' AND duration_min = 10 LIMIT 1);
INSERT INTO `Program_Exercise` (program_id, exercise_name, exercise_type, body_part, equipment, tips, common_mistakes, position, contraction_type, bilateral, tempo, skill_level, sets, reps, rest_time_sec, tendon_used, ligament_used, common_causes, sort_order) VALUES
(@p, 'Glute Bridge',                   'strengthen', 'Glutes',      'Mat',  'Squeeze glutes', 'Overarching',   'Supine',   'Con/Ecc', 'Bilateral',  '2:2', 'Beginner', 1, '15', 20, 'Glute tendon',    'Hip ligament',     'Weak glutes',       1),
(@p, 'Bird Dog',                       'strengthen', 'Core',        'Mat',  'Keep hips level','Rotating',      'Quadruped','Con/Ecc', 'Unilateral', '2:2', 'Beginner', 1, '10', 20, 'Spinal tendon',   'Spinal ligaments', 'Weak core',         2),
(@p, 'Hamstring Stretch',              'stretch',    'Hamstrings',  'None', 'Gentle',         'Bouncing',      'Seated',   'Static',  'Bilateral',  '30s', 'Beginner', 1, '1',  20, 'Hamstring tendon','Knee ligaments',   'Tight hamstrings',  3),
(@p, 'Hip Flexor Stretch',             'stretch',    'Hips',        'None', 'Soft stretch',   'Over-leaning',  'Kneeling', 'Static',  'Unilateral', '30s', 'Beginner', 1, '1',  20, 'Hip flexor tendon','Hip ligaments',  'Tight hip flexors', 4),
(@p, 'Goblet Squat',                   'strengthen', 'Legs',        'None', 'Chest tall',     'Rounding back', 'Standing', 'Con/Ecc', 'Bilateral',  '2:2', 'Beginner', 1, '12', 20, 'Patellar tendon', 'Knee ligaments',   'Weak legs',         5);

-- ── Bar Stool Back Saver ──
SET @p = (SELECT id FROM `Program` WHERE name = 'Bar Stool Back Saver' AND duration_min = 10 LIMIT 1);
INSERT INTO `Program_Exercise` (program_id, exercise_name, exercise_type, body_part, equipment, tips, common_mistakes, position, contraction_type, bilateral, tempo, skill_level, sets, reps, rest_time_sec, tendon_used, ligament_used, common_causes, sort_order) VALUES
(@p, 'Scapular Retraction',            'strengthen', 'Upper Back', 'Band', 'Squeeze shoulder blades','Shrugging',   'Standing', 'Con/Ecc',  'Bilateral', '2:2', 'Beginner', 1, '12', 20, 'Rhomboid tendon','Shoulder ligament','Weak posture',       1),
(@p, 'Superman',                       'strengthen', 'Back',       'Mat',  'Lift gently',           'Overarching', 'Prone',    'Concentric','Bilateral', '2:2', 'Beginner', 1, '10', 20, 'Spinal tendon',  'Spine ligament',   'Weak low back',     2),
(@p, 'Wall Angels',                    'strengthen', 'Shoulders',  'None', 'Keep ribs down',        'Arching back','Standing', 'Con/Ecc',  'Bilateral', '2:2', 'Beginner', 1, '10', 20, 'Rotator cuff',   'Shoulder ligaments','Postural fatigue', 3),
(@p, 'Seated Twist Stretch',           'stretch',    'Core',       'None', 'Gentle twist',          'Forcing',     'Seated',   'Static',   'Bilateral', '30s', 'Beginner', 1, '1',  20, 'Spinal tendon',  'Spine ligament',   'Trunk tightness',   4),
(@p, 'Cat-Cow',                        'mobility',   'Spine',      'None', 'Smooth motion',         'Jerky',       'Quadruped','Dynamic',  'Bilateral', '2:2', 'Beginner', 1, '10', 20, 'Spinal tendon',  'Spine ligament',   'Stiff back',        5);

-- ── Work-From-Couch Core Reset ──
SET @p = (SELECT id FROM `Program` WHERE name = 'Work-From-Couch Core Reset' AND duration_min = 10 LIMIT 1);
INSERT INTO `Program_Exercise` (program_id, exercise_name, exercise_type, body_part, equipment, tips, common_mistakes, position, contraction_type, bilateral, tempo, skill_level, sets, reps, rest_time_sec, tendon_used, ligament_used, common_causes, sort_order) VALUES
(@p, 'Bird Dog',                       'strengthen', 'Core',  'Mat',  'Hips level',      'Rotating',     'Quadruped','Con/Ecc',  'Unilateral', '2:2', 'Beginner', 1, '10', 20, 'Spinal tendon',   'Spine ligaments',   'Weak core',            1),
(@p, 'Glute Bridge',                   'strengthen', 'Glutes','Mat',  'Squeeze glutes',  'Overarching',  'Supine',   'Con/Ecc',  'Bilateral',  '2:2', 'Beginner', 1, '15', 20, 'Glute tendon',    'Hip ligaments',     'Weak glutes',          2),
(@p, 'Chin Tucks',                     'strengthen', 'Neck',  'None', 'Tiny nod',        'Over-pushing', 'Seated',   'Isometric','Bilateral',  '5s',  'Beginner', 1, '10', 20, 'Cervical tendon', 'Neck ligaments',    'Forward head posture', 3),
(@p, 'Thread the Needle',              'mobility',   'Spine', 'None', 'Rotate gently',   'Over-rotating','Quadruped','Dynamic',  'Bilateral',  '2:2', 'Beginner', 1, '10', 20, 'Spinal tendon',   'Spine ligament',    'Thoracic tightness',   4),
(@p, 'Standing Chest Opener',          'stretch',    'Chest', 'None', 'Open arms wide',  'Shrugging',    'Standing', 'Static',   'Bilateral',  '30s', 'Beginner', 1, '1',  20, 'Pectoral tendon', 'Shoulder ligaments','Tight chest',          5);

-- ── Netflix Binge Survival Stretch ──
SET @p = (SELECT id FROM `Program` WHERE name = 'Netflix Binge Survival Stretch' AND duration_min = 10 LIMIT 1);
INSERT INTO `Program_Exercise` (program_id, exercise_name, exercise_type, body_part, equipment, tips, common_mistakes, position, contraction_type, bilateral, tempo, skill_level, sets, reps, rest_time_sec, tendon_used, ligament_used, common_causes, sort_order) VALUES
(@p, 'Cat-Cow',                        'mobility', 'Spine',      'None', 'Breathe through','Rushing',      'Quadruped','Dynamic', 'Bilateral',  '2:2', 'Beginner', 1, '10', 20, 'Spinal tendon',    'Spine ligaments', 'Stiff back',            1),
(@p, 'Child''s Pose',                  'stretch',  'Back',       'None', 'Relax hips',     'Holding breath','Kneeling', 'Static',  'Bilateral',  '30s', 'Beginner', 1, '1',  20, 'Spinal tendon',    'Spine ligaments', 'Tight back',            2),
(@p, 'Seated Forward Fold',            'stretch',  'Hamstrings', 'None', 'Gentle fold',    'Forcing',      'Seated',   'Static',  'Bilateral',  '30s', 'Beginner', 1, '1',  20, 'Hamstring tendon', 'Knee ligaments',  'Tight posterior chain', 3),
(@p, 'Seated Spinal Twist',            'stretch',  'Core',       'None', 'Gentle twist',   'Forcing',      'Seated',   'Static',  'Bilateral',  '30s', 'Beginner', 1, '1',  20, 'Spinal tendon',    'Spine ligaments', 'Tight torso',           4),
(@p, 'Hip Flexor Stretch',             'stretch',  'Hips',       'None', 'Gentle',         'Overstretch',  'Kneeling', 'Static',  'Unilateral', '30s', 'Beginner', 1, '1',  20, 'Iliopsoas tendon', 'Hip ligaments',   'Tight hips',            5);

-- ── Restaurant Chair Rescue ──
SET @p = (SELECT id FROM `Program` WHERE name = 'Restaurant Chair Rescue' AND duration_min = 10 LIMIT 1);
INSERT INTO `Program_Exercise` (program_id, exercise_name, exercise_type, body_part, equipment, tips, common_mistakes, position, contraction_type, bilateral, tempo, skill_level, sets, reps, rest_time_sec, tendon_used, ligament_used, common_causes, sort_order) VALUES
(@p, 'Standing Hip Circles',           'mobility',   'Hips',    'None', 'Smooth circles', 'Rushing',       'Standing', 'Dynamic',  'Unilateral', '—',   'Beginner', 1, '10 each',20, 'Hip flexor tendon','Hip ligament',      'Tight hips',           1),
(@p, 'Standing Side Bend',             'stretch',    'Core',    'None', 'Gentle bend',    'Overstretching','Standing', 'Static',   'Bilateral',  '30s', 'Beginner', 1, '1',      20, 'Oblique tendon',   'Rib ligaments',     'Tight trunk',          2),
(@p, 'Shoulder Rolls',                 'mobility',   'Shoulders','None','Smooth movement','Shrugging',     'Standing', 'Dynamic',  'Bilateral',  '—',   'Beginner', 1, '10',     20, 'Shoulder tendon',  'Shoulder ligaments','Shoulder stiffness',   3),
(@p, 'Seated Spinal Twist',            'stretch',    'Spine',   'None', 'Gentle twist',   'Forcing',       'Seated',   'Static',   'Bilateral',  '30s', 'Beginner', 1, '1',      20, 'Spinal tendon',    'Spine ligament',    'Tight spine',          4),
(@p, 'Chin Tucks',                     'strengthen', 'Neck',    'None', 'Gentle nod',     'Over-press',    'Seated',   'Isometric','Bilateral',  '5s',  'Beginner', 1, '10',     20, 'Cervical tendon',  'Neck ligaments',    'Forward head posture', 5);

-- ── Long Car Ride Reset ──
SET @p = (SELECT id FROM `Program` WHERE name = 'Long Car Ride Reset' AND duration_min = 10 LIMIT 1);
INSERT INTO `Program_Exercise` (program_id, exercise_name, exercise_type, body_part, equipment, tips, common_mistakes, position, contraction_type, bilateral, tempo, skill_level, sets, reps, rest_time_sec, tendon_used, ligament_used, common_causes, sort_order) VALUES
(@p, 'Seated Forward Fold',            'stretch',  'Hamstrings','None', 'Gentle fold',    'Forcing',       'Seated',   'Static',  'Bilateral',  '30s', 'Beginner', 1, '1',       20, 'Hamstring tendon', 'Knee ligaments',  'Tight posterior chain from sitting', 1),
(@p, 'Hip Flexor Stretch',             'stretch',  'Hips',      'None', 'Gentle',         'Overstretch',   'Kneeling', 'Static',  'Unilateral', '30s', 'Beginner', 1, '1',       20, 'Iliopsoas tendon', 'Hip ligaments',   'Tight hip flexors from sitting',     2),
(@p, 'Cat-Cow',                        'mobility', 'Spine',     'None', 'Breathe through','Rushing',       'Quadruped','Dynamic', 'Bilateral',  '2:2', 'Beginner', 1, '10',      20, 'Spinal tendon',    'Spine ligaments', 'Stiff back after driving',           3),
(@p, 'Child''s Pose',                  'stretch',  'Back',      'None', 'Relax hips',     'Holding breath','Kneeling', 'Static',  'Bilateral',  '30s', 'Beginner', 1, '1',       20, 'Spinal tendon',    'Spine ligaments', 'Tight back after driving',           4),
(@p, 'Standing Hip Circles',           'mobility', 'Hips',      'None', 'Smooth circles', 'Rushing',       'Standing', 'Dynamic', 'Unilateral', '—',   'Beginner', 1, '10 each', 20, 'Hip flexor tendon','Hip ligament',    'Tight hips after sitting',           5);

-- ── Pickup Basketball – ACL & Ankle Prevention ──
SET @p = (SELECT id FROM `Program` WHERE name = 'Pickup Basketball – ACL & Ankle Prevention' AND duration_min = 10 LIMIT 1);
INSERT INTO `Program_Exercise` (program_id, exercise_name, exercise_type, body_part, equipment, tips, common_mistakes, position, contraction_type, bilateral, tempo, skill_level, sets, reps, rest_time_sec, tendon_used, ligament_used, common_causes, sort_order) VALUES
(@p, 'Single-Leg RDL',                 'strengthen', 'Hips',   'Dumbbell', 'Keep hips square', 'Rounding back', 'Standing', 'Con/Ecc',  'Unilateral', '3-1-2002', 'Intermediate', 2, '8',  30, 'Hamstring tendon', 'ACL',  'Poor hip control', 1),
(@p, 'Lateral Bounds (Stick Landing)', 'strengthen', 'Knees',  'None',     'Land softly',      'Knee collapse', 'Standing', 'Plyometric','Unilateral','Explosive', 'Intermediate', 2, '6',  45, 'Patellar tendon',  'MCL',  'Cutting injuries', 2),
(@p, 'Band Eversion',                  'strengthen', 'Ankles', 'Band',     'Slow outward pull','Snapping band', 'Seated',   'Con/Ecc',  'Unilateral', '2-1-2002', 'Beginner',     2, '15', 30, 'Peroneal tendon',  'ATFL', 'Ankle roll',        3);

-- ── Gym Newbie – Lower Back Strain Prevention ──
SET @p = (SELECT id FROM `Program` WHERE name = 'Gym Newbie – Lower Back Strain Prevention' AND duration_min = 10 LIMIT 1);
INSERT INTO `Program_Exercise` (program_id, exercise_name, exercise_type, body_part, equipment, tips, common_mistakes, position, contraction_type, bilateral, tempo, skill_level, sets, reps, rest_time_sec, tendon_used, ligament_used, common_causes, sort_order) VALUES
(@p, 'Dead Bug',                       'strengthen', 'Core', 'None',  'Keep spine neutral', 'Arching',       'Supine',   'Isometric', 'Unilateral', '2-1-2002', 'Beginner', 2, '10', 30, 'Rectus tendon',   'PLL',        'Weak core',  1),
(@p, 'Hip Hinge Drill',                'strengthen', 'Hips', 'Stick', 'Push hips back',     'Bending spine', 'Standing', 'Con/Ecc',   'Bilateral',  '3-1-2002', 'Beginner', 2, '12', 30, 'Hamstring tendon','SI ligament','Poor hinge',  2);

-- ── Office Worker – Shoulder Impingement ──
SET @p = (SELECT id FROM `Program` WHERE name = 'Office Worker – Shoulder Impingement' AND duration_min = 10 LIMIT 1);
INSERT INTO `Program_Exercise` (program_id, exercise_name, exercise_type, body_part, equipment, tips, common_mistakes, position, contraction_type, bilateral, tempo, skill_level, sets, reps, rest_time_sec, tendon_used, ligament_used, common_causes, sort_order) VALUES
(@p, 'Prone Y Raise',                  'strengthen', 'Back',  'Dumbbells', 'Thumbs up',      'Shrugging', 'Prone',    'Con/Ecc', 'Bilateral', '2-1-2002', 'Beginner', 2, '12', 30, 'Trap tendon',     'AC ligament', 'Weak scap control', 1),
(@p, 'Doorway Pec Stretch',            'stretch',    'Chest', 'Doorway',   'Gentle stretch', 'Forcing',   'Standing', 'Static',  'Bilateral', '30s',      'Beginner', 1, '1',  20, 'Pectoral tendon', 'GH ligaments','Tight chest',       2);

-- ── Tennis Elbow Prevention ──
SET @p = (SELECT id FROM `Program` WHERE name = 'Tennis Elbow Prevention' AND duration_min = 10 LIMIT 1);
INSERT INTO `Program_Exercise` (program_id, exercise_name, exercise_type, body_part, equipment, tips, common_mistakes, position, contraction_type, bilateral, tempo, skill_level, sets, reps, rest_time_sec, tendon_used, ligament_used, common_causes, sort_order) VALUES
(@p, 'Wrist Extension (Eccentric)',    'strengthen', 'Forearm', 'Dumbbell', 'Slow lowering',  'Dropping weight', 'Seated',  'Eccentric focus', 'Unilateral', '3-1-2003', 'Beginner', 2, '12',     30, 'Common extensor tendon','Elbow ligaments', 'Overuse',   1),
(@p, 'Farmer Carry',                   'strengthen', 'Forearm', 'Dumbbell', 'Maintain grip',  'Slouching',       'Walking', 'Isometric',       'Bilateral',  '30s',      'Beginner', 2, '1 hold', 30, 'Forearm tendons',       'Elbow ligaments', 'Weak grip', 2);

-- ── Runner's Knee (PFPS) Prevention ──
SET @p = (SELECT id FROM `Program` WHERE name = 'Runner''s Knee (PFPS) Prevention' AND duration_min = 10 LIMIT 1);
INSERT INTO `Program_Exercise` (program_id, exercise_name, exercise_type, body_part, equipment, tips, common_mistakes, position, contraction_type, bilateral, tempo, skill_level, sets, reps, rest_time_sec, tendon_used, ligament_used, common_causes, sort_order) VALUES
(@p, 'Terminal Knee Extension',        'strengthen', 'Quads', 'Band', 'Lock out fully',  'Snapping band',  'Standing', 'Con/Ecc', 'Unilateral', '2-1-2002', 'Beginner',     2, '15', 30, 'Patellar tendon', 'ACL', 'Poor tracking',  1),
(@p, 'Side Plank Leg Lift',            'strengthen', 'Hips',  'None', 'Keep hips high',  'Dropping pelvis','Side',     'Con/Ecc', 'Unilateral', '2-1-2002', 'Intermediate', 2, '10', 30, 'Glute tendon',    'MCL', 'Weak abductors', 2);

-- ── Shoulder Dislocation Prevention ──
SET @p = (SELECT id FROM `Program` WHERE name = 'Shoulder Dislocation Prevention' AND duration_min = 10 LIMIT 1);
INSERT INTO `Program_Exercise` (program_id, exercise_name, exercise_type, body_part, equipment, tips, common_mistakes, position, contraction_type, bilateral, tempo, skill_level, sets, reps, rest_time_sec, tendon_used, ligament_used, common_causes, sort_order) VALUES
(@p, 'External Rotation',              'strengthen', 'Shoulder', 'Band',       'Elbow tucked',    'Swinging',      'Standing', 'Con/Ecc',  'Unilateral', '2-1-2002', 'Beginner', 2, '15',     30, 'RC tendon', 'GH ligament', 'Weak RC',      1),
(@p, 'Bottom-Up KB Carry',             'strengthen', 'Shoulder', 'Kettlebell', 'Keep KB upright', 'Wrist collapse','Walking',  'Isometric','Unilateral', '30s',      'Advanced', 2, '1 hold', 45, 'RC tendon', 'GH ligament', 'Instability',  2);
