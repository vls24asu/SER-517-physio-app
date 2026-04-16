-- Program Seed Data – 20-MINUTE PROGRAMS
-- Run AFTER migration 013_create_programs.sql
-- Safe to re-run: deletes existing 20-min programs first

DELETE pe FROM `Program_Exercise` pe
INNER JOIN `Program` p ON pe.program_id = p.id
WHERE p.duration_min = 20;
DELETE FROM `Program` WHERE duration_min = 20;

INSERT INTO `Program` (name, description, duration_min, activity, routine_type, emoji) VALUES
('Ski/Skate – Injury Prevention',   'Full pre-activity routine with extra mobility for skiing and skating.',          20, 'Skiing/Skating', 'prevention', '⛷️'),
('Post-Ski/Skate Recovery',         'Comprehensive recovery after skiing or skating.',                                20, 'Skiing/Skating', 'recovery',   '🏂'),
('Hiking – Injury Prevention',      'Full pre-hike routine with balance and strength training.',                      20, 'Hiking',          'prevention', '🥾'),
('Hiking – Post-Injury Recovery',   'Comprehensive recovery for after hiking.',                                       20, 'Hiking',          'recovery',   '🏔️'),
('Winter Sidewalk Slip Prevention', 'Full balance and strength routine to prevent falls on icy sidewalks.',          20, 'Winter',          'prevention', '🧊'),
('Gardening & Outdoor Cleanup',     'Full routine to protect your back, hips, and legs during spring gardening.',    20, 'Spring',          'lifestyle',  '🌱'),
('Bar Stool Back Saver',            'Full posture and back reset for after a night out sitting on bar stools.',      20, 'Lifestyle',       'lifestyle',  '🪑'),
('Work-From-Couch Core Reset',      'Full core and posture reset for remote workers spending too much time on the couch.', 20, 'Lifestyle', 'lifestyle',  '💻'),
('Netflix Binge Survival Stretch',  'Full stretch routine to undo the damage from hours of binge-watching.',        20, 'Lifestyle',       'lifestyle',  '📺'),
('Restaurant Chair Rescue',         'Full mobility routine for after long restaurant dinners on uncomfortable chairs.',20,'Lifestyle',      'lifestyle',  '🍽️'),
('Long Car Ride Reset',             'Full mobility and stretch routine to relieve tightness after long drives.',     20, 'Lifestyle',       'lifestyle',  '🚗');

-- ── Ski/Skate – Injury Prevention ──
SET @p = (SELECT id FROM `Program` WHERE name = 'Ski/Skate – Injury Prevention' AND duration_min = 20 LIMIT 1);
INSERT INTO `Program_Exercise` (program_id, exercise_name, exercise_type, body_part, equipment, tips, common_mistakes, position, contraction_type, bilateral, tempo, skill_level, sets, reps, rest_time_sec, tendon_used, ligament_used, common_causes, sort_order) VALUES
(@p, 'Monster Walk',                   'strengthen', 'Hips',    'Band', 'Keep band tight',    'Jerking',         'Standing', 'Con/Ecc',  'Bilateral',  '2:2', 'Beginner',     2, '12', 30, 'Glute med',  'Hip ligaments',     'Weak abductors',      1),
(@p, 'Lateral Step Downs',             'strengthen', 'Hips',    'Step', 'Control descent',    'Knee collapse',   'Standing', 'Con/Ecc',  'Unilateral', '2:2', 'Intermediate', 2, '10', 30, 'Glute',      'Knee ligaments',    'Weak hip control',    2),
(@p, 'Wall Sits',                      'strengthen', 'Legs',    'Wall', 'Knees stacked',      'Leaning forward', 'Standing', 'Isometric','Bilateral',  '30s', 'Beginner',     2, '1',  30, 'Patellar',   'Patellar ligament', 'Weak quads',          3),
(@p, 'Glute Bridge',                   'strengthen', 'Glutes',  'Mat',  'Squeeze glutes',     'Arching',         'Supine',   'Con/Ecc',  'Bilateral',  '2:2', 'Beginner',     2, '15', 30, 'Glute',      'Hip ligament',      'Weak posterior chain',4),
(@p, 'Calf Raises',                    'strengthen', 'Ankle',   'None', 'Pause at top',       'Bouncing',        'Standing', 'Con/Ecc',  'Bilateral',  '2:2', 'Beginner',     2, '20', 30, 'Achilles',   'Ankle ligaments',   'Weak calves',         5),
(@p, 'Dead Bug',                       'strengthen', 'Core',    'Mat',  'Slow control',       'Arching',         'Supine',   'Con/Ecc',  'Bilateral',  '2:2', 'Beginner',     1, '12', 30, 'Ab tendon',  'Spine ligaments',   'Weak core',           6),
(@p, 'Single-Leg Balance',             'stability',  'Balance', 'None', 'Soft knee',          'Twisting body',   'Standing', 'Isometric','Unilateral', '30s', 'Beginner',     1, '1',  20, 'Peroneal',   'ATFL',              'Poor proprioception', 7),
(@p, 'Hip Flexor Stretch',             'stretch',    'Hips',    'None', 'Gentle',             'Overstretch',     'Kneeling', 'Static',   'Unilateral', '30s', 'Beginner',     1, '1',  20, 'Iliopsoas',  'Hip ligaments',     'Tight hip flexors',   8),
(@p, 'Cat-Cow',                        'mobility',   'Spine',   'None', 'Slow breathe',       'Rushing',         'Quadruped','Dynamic',  'Bilateral',  '2:2', 'Beginner',     1, '10', 20, 'Spinal tendon','Spine ligaments', 'Stiff back',          9),
(@p, 'Ankle Circles',                  'mobility',   'Ankle',   'None', 'Slow circles',       'Rushed',          'Seated',   'Dynamic',  'Unilateral', '10 each','Beginner',   1, '1',  20, 'Tibialis tendon','Ankle ligaments','Stiff ankle',       10);

-- ── Post-Ski/Skate Recovery ──
SET @p = (SELECT id FROM `Program` WHERE name = 'Post-Ski/Skate Recovery' AND duration_min = 20 LIMIT 1);
INSERT INTO `Program_Exercise` (program_id, exercise_name, exercise_type, body_part, equipment, tips, common_mistakes, position, contraction_type, bilateral, tempo, skill_level, sets, reps, rest_time_sec, tendon_used, ligament_used, common_causes, sort_order) VALUES
(@p, 'Heel Slides',                    'mobility',   'Knee',     'Towel', 'Gentle',            'Forcing',          'Supine',   'Dynamic', 'Unilateral', '2:2', 'Beginner', 2, '12', 30, 'Hamstring',       'Knee ligaments',     'Stiff knee',          1),
(@p, 'IT Band Stretch',                'stretch',    'IT Band',  'None',  'Gentle',            'Twisting',         'Standing', 'Static',  'Bilateral',  '30s', 'Beginner', 2, '1',  30, 'TFL tendon',      'Hip ligaments',      'Tight ITB',           2),
(@p, 'Glute Bridge',                   'strengthen', 'Glutes',   'Mat',   'Gentle lift',       'Overarching',      'Supine',   'Con/Ecc', 'Bilateral',  '2:2', 'Beginner', 2, '12', 30, 'Glute',           'Hip ligaments',      'Weak posterior chain',3),
(@p, 'Straight Leg Raise',             'strengthen', 'Quads',    'None',  'Keep leg straight', 'Swinging',         'Supine',   'Con/Ecc', 'Unilateral', '2:2', 'Beginner', 2, '12', 30, 'Patellar tendon', 'Knee ligaments',     'Weak quads',          4),
(@p, 'Wall Angels',                    'mobility',   'Shoulder', 'None',  'Slow & controlled', 'Arching',          'Standing', 'Dynamic', 'Bilateral',  '2:2', 'Beginner', 2, '12', 30, 'Rotator cuff',    'Shoulder ligaments', 'Post-fall tightness', 5),
(@p, 'Hip Flexor Stretch',             'stretch',    'Hips',     'None',  'Gentle stretch',    'Leaning too far',  'Kneeling', 'Static',  'Unilateral', '30s', 'Beginner', 1, '1',  20, 'Hip flexor',      'Hip ligaments',      'Tight hip flexors',   6),
(@p, 'Cat-Cow',                        'mobility',   'Back',     'None',  'Breathe fully',     'Rushing',          'Quadruped','Dynamic', 'Bilateral',  '2:2', 'Beginner', 1, '10', 20, 'Spinal tendon',   'Spine ligaments',    'Stiff back',          7),
(@p, 'Mini March',                     'strengthen', 'Core',     'Mat',   'Slow and small',    'Arching',          'Supine',   'Dynamic', 'Bilateral',  '2:2', 'Beginner', 1, '10', 20, 'Core tendon',     'Spine ligaments',    'Weak deep core',      8),
(@p, 'Tandem Stance',                  'stability',  'Balance',  'None',  'Soft knees',        'Looking down',     'Standing', 'Isometric','Bilateral', '30s', 'Beginner', 1, '1',  20, 'Peroneal',        'ATFL',               'Balance deficits',    9),
(@p, 'Ankle Circles',                  'mobility',   'Ankle',    'None',  'Slow letters',      'Rushing',          'Seated',   'Dynamic', 'Unilateral', 'A-Z', 'Beginner', 1, '1',  20, 'Tibialis tendon', 'Ankle ligaments',    'Stiff ankle',        10);

-- ── Hiking – Injury Prevention ──
SET @p = (SELECT id FROM `Program` WHERE name = 'Hiking – Injury Prevention' AND duration_min = 20 LIMIT 1);
INSERT INTO `Program_Exercise` (program_id, exercise_name, exercise_type, body_part, equipment, tips, common_mistakes, position, contraction_type, bilateral, tempo, skill_level, sets, reps, rest_time_sec, tendon_used, ligament_used, common_causes, sort_order) VALUES
(@p, 'Step-Ups',                       'strengthen', 'Glutes',     'Step', 'Push through heel',  'Leaning forward', 'Standing', 'Con/Ecc', 'Unilateral', '2:2', 'Beginner', 2, '12',     30, 'Glute',      'Knee ligaments', 'Weak quads',          1),
(@p, 'Lateral Step Downs',             'strengthen', 'Hips',       'Step', 'Control descent',    'Knee collapsing', 'Standing', 'Con/Ecc', 'Unilateral', '2:2', 'Beginner', 2, '10',     30, 'Glute med',  'Knee ligaments', 'Weak abductors',       2),
(@p, 'Ankle Circles',                  'mobility',   'Ankles',     'None', 'Slow circles',       'Jerking',         'Seated',   'Dynamic', 'Unilateral', '—',   'Beginner', 2, '10 each',20, 'Tibialis',   'ATFL',           'Stiff ankle',          3),
(@p, 'Hip Flexor Stretch',             'stretch',    'Hips',       'None', 'Keep pelvis neutral','Overarching',     'Kneeling', 'Static',  'Unilateral', '30s', 'Beginner', 2, '1',      20, 'Hip flexor', 'Hip ligaments',  'Tight hip flexors',    4),
(@p, 'Glute Bridge',                   'strengthen', 'Glutes',     'Mat',  'Squeeze glutes',     'Arching',         'Supine',   'Con/Ecc', 'Bilateral',  '2:2', 'Beginner', 2, '15',     20, 'Glute',      'Hip ligaments',  'Weak posterior chain', 5),
(@p, 'Calf Raises',                    'strengthen', 'Calves',     'None', 'Pause at top',       'Bouncing',        'Standing', 'Con/Ecc', 'Bilateral',  '2:2', 'Beginner', 1, '15',     20, 'Achilles',   'ATFL',           'Weak calves',          6),
(@p, 'Bird Dog',                       'strengthen', 'Core',       'Mat',  'Keep pelvis level',  'Arching',         'Quadruped','Con/Ecc', 'Unilateral', '2:2', 'Beginner', 1, '10',     20, 'Spine',      'Ligament',       'Weak core',            7),
(@p, 'Single-Leg Balance',             'stability',  'Balance',    'None', 'Soft bend',          'Locking knee',    'Standing', 'Isometric','Unilateral','30s', 'Beginner', 1, '1',      20, 'Peroneal',   'Ankle ligaments','Fall risk',            8),
(@p, 'Standing Hip Abduction',         'strengthen', 'Hips',       'None', 'Toes forward',       'Leaning trunk',   'Standing', 'Con/Ecc', 'Unilateral', '2:2', 'Beginner', 1, '12',     20, 'Glute med',  'Hip ligaments',  'Weak abductors',       9),
(@p, 'Hamstring Stretch',              'stretch',    'Hamstrings', 'None', 'Gentle',             'Bouncing',        'Standing', 'Static',  'Bilateral',  '30s', 'Beginner', 1, '1',      20, 'Hamstring',  'Knee ligaments', 'Tight hamstrings',    10);

-- ── Hiking – Post-Injury Recovery ──
SET @p = (SELECT id FROM `Program` WHERE name = 'Hiking – Post-Injury Recovery' AND duration_min = 20 LIMIT 1);
INSERT INTO `Program_Exercise` (program_id, exercise_name, exercise_type, body_part, equipment, tips, common_mistakes, position, contraction_type, bilateral, tempo, skill_level, sets, reps, rest_time_sec, tendon_used, ligament_used, common_causes, sort_order) VALUES
(@p, 'Heel Slides',                    'mobility',   'Knee',     'Towel', 'Gentle',            'Overstretch',  'Supine',    'Dynamic', 'Unilateral', '2:2', 'Beginner', 2, '12', 20, 'Hamstring',          'Knee ligaments',     'Knee stiffness',          1),
(@p, 'IT Band Stretch',                'stretch',    'IT Band',  'None',  'Gentle stretch',    'Twisting',     'Standing',  'Static',  'Bilateral',  '30s', 'Beginner', 2, '1',  20, 'TFL',                'Hip ligaments',      'ITB tightness',           2),
(@p, 'Straight Leg Raise',             'strengthen', 'Quads',    'None',  'Leg straight',      'Swinging',     'Supine',    'Con/Ecc', 'Unilateral', '2:2', 'Beginner', 2, '12', 20, 'Patellar tendon',    'Knee ligaments',     'Weak quads',              3),
(@p, 'Glute Bridge',                   'strengthen', 'Glutes',   'Mat',   'Lift gently',       'Arching',      'Supine',    'Con/Ecc', 'Bilateral',  '2:2', 'Beginner', 2, '12', 20, 'Glute',              'Hip ligaments',      'Weak glutes',             4),
(@p, 'Wall Angels',                    'mobility',   'Shoulders','None',  'Smooth motion',     'Arching back', 'Standing',  'Dynamic', 'Bilateral',  '2:2', 'Beginner', 2, '10', 20, 'RC tendon',          'Shoulder ligaments', 'Post-exercise tightness', 5),
(@p, 'Cat-Cow',                        'mobility',   'Back',     'None',  'Smooth motion',     'Rushing',      'Quadruped', 'Dynamic', 'Bilateral',  '2:2', 'Beginner', 1, '10', 20, 'Spinal tendon',      'Spine ligament',     'Stiff spine',             6),
(@p, 'Clamshell',                      'strengthen', 'Glutes',   'Band',  'Small range',       'Twisting',     'Side-lying','Con/Ecc', 'Unilateral', '2:2', 'Beginner', 1, '12', 20, 'Glute med tendon',   'Hip ligament',       'Weak stabilizers',        7),
(@p, 'Tandem Stance',                  'stability',  'Balance',  'None',  'Eyes forward',      'Leaning',      'Standing',  'Isometric','Bilateral', '30s', 'Beginner', 1, '1',  20, 'Peroneal',           'ATFL',               'Instability',             8),
(@p, 'Ankle Circles',                  'mobility',   'Ankle',    'None',  'Slow',              'Rushing',      'Seated',    'Dynamic', 'Unilateral', 'A-Z', 'Beginner', 1, '1',  20, 'Tibialis tendon',    'Ankle ligaments',    'Post-hike stiffness',     9),
(@p, 'Seated Piriformis Stretch',      'stretch',    'Hips',     'None',  'Gentle',            'Forcing',      'Seated',    'Static',  'Unilateral', '30s', 'Beginner', 1, '1',  20, 'Piriformis tendon',  'Hip ligament',       'Tight hips',             10);

-- ── Winter Sidewalk Slip Prevention ──
SET @p = (SELECT id FROM `Program` WHERE name = 'Winter Sidewalk Slip Prevention' AND duration_min = 20 LIMIT 1);
INSERT INTO `Program_Exercise` (program_id, exercise_name, exercise_type, body_part, equipment, tips, common_mistakes, position, contraction_type, bilateral, tempo, skill_level, sets, reps, rest_time_sec, tendon_used, ligament_used, common_causes, sort_order) VALUES
(@p, 'Side Lunges',                    'strengthen', 'Legs',      'None',     'Keep toes forward',  'Overstretching',  'Standing',  'Con/Ecc',  'Bilateral',  '2:2', 'Beginner', 2, '12',       20, 'Adductor tendon', 'Hip ligaments',  'Weak groin muscles',  1),
(@p, 'Standing Balance Reach',         'strengthen', 'Hip',       'None',     'Reach slowly',       'Swinging leg',    'Standing',  'Con/Ecc',  'Unilateral', '2:2', 'Beginner', 2, '10',       20, 'Glute med',       'Ankle ligaments','Poor balance',         2),
(@p, 'Clamshell',                      'strengthen', 'Hip',       'Band',     'Keep hips stacked',  'Rolling backward','Side-lying', 'Con/Ecc', 'Unilateral', '2:2', 'Beginner', 2, '12',       20, 'Glute med',       'Hip ligament',   'Weak stabilizers',    3),
(@p, 'Adductor Stretch',               'stretch',    'Hip',       'None',     'Gentle stretch',     'Forcing split',   'Standing',  'Static',   'Bilateral',  '30s', 'Beginner', 2, '1',        20, 'Adductor tendon', 'Hip ligament',   'Tight groin',         4),
(@p, 'Single-Leg Balance',             'stability',  'Lower leg', 'Foam pad', 'Slight knee bend',   'Locking knee',    'Standing',  'Isometric','Unilateral', '30s', 'Beginner', 2, '1',        20, 'Peroneal tendon', 'ATFL',           'Instability on ice',  5),
(@p, 'Cat-Cow',                        'mobility',   'Back',      'None',     'Smooth motion',      'Jerking',         'Quadruped', 'Dynamic',  'Bilateral',  '2:2', 'Beginner', 1, '10',       20, 'Spinal tendon',   'Spine ligament', 'Stiff spine',         6),
(@p, 'Lateral Leg Raises',             'strengthen', 'Hip',       'None',     'Toes forward',       'Leaning torso',   'Standing',  'Con/Ecc',  'Unilateral', '2:2', 'Beginner', 1, '12',       20, 'Glute med tendon','Hip ligament',   'Hip instability',     7),
(@p, 'Standing March',                 'strengthen', 'Hips',      'None',     'Keep tall torso',    'Leaning back',    'Standing',  'Con/Ecc',  'Unilateral', '2:2', 'Beginner', 1, '12',       20, 'Hip flexor tendon','Hip ligament',  'Weak hip flexors',    8),
(@p, 'Heel-to-Toe Walk',               'stability',  'Lower leg', 'None',     'Slow controlled steps','Rushing',       'Standing',  'Dynamic',  'Bilateral',  '—',   'Beginner', 1, '20 steps', 20, 'Achilles',        'ATFL',           'Poor foot control',   9),
(@p, 'Grapevine Step',                 'stability',  'Hips',      'None',     'Smooth crossing steps','Tripping feet', 'Standing',  'Dynamic',  'Bilateral',  '—',   'Beginner', 1, '20 steps', 20, 'Hip tendon',      'Ligaments',      'Poor coordination',  10);

-- ── Gardening & Outdoor Cleanup ──
SET @p = (SELECT id FROM `Program` WHERE name = 'Gardening & Outdoor Cleanup' AND duration_min = 20 LIMIT 1);
INSERT INTO `Program_Exercise` (program_id, exercise_name, exercise_type, body_part, equipment, tips, common_mistakes, position, contraction_type, bilateral, tempo, skill_level, sets, reps, rest_time_sec, tendon_used, ligament_used, common_causes, sort_order) VALUES
(@p, 'Glute Bridge',                   'strengthen', 'Glutes', 'Mat',  'Squeeze glutes',    'Overarching',      'Supine',   'Con/Ecc', 'Bilateral',  '2:2', 'Beginner', 2, '15', 30, 'Glute tendon',    'Hip ligament',     'Weak glutes',       1),
(@p, 'Bird Dog',                       'strengthen', 'Core',   'Mat',  'Keep hips level',   'Rotating',         'Quadruped','Con/Ecc', 'Unilateral', '2:2', 'Beginner', 2, '10', 30, 'Spinal tendon',   'Spinal ligaments', 'Weak core',         2),
(@p, 'Hamstring Stretch',              'stretch',    'Legs',   'None', 'Gentle',            'Bouncing',         'Seated',   'Static',  'Bilateral',  '30s', 'Beginner', 2, '1',  30, 'Hamstring tendon','Knee ligaments',   'Tight hamstrings',  3),
(@p, 'Hip Flexor Stretch',             'stretch',    'Hips',   'None', 'Soft stretch',      'Over-leaning',     'Kneeling', 'Static',  'Unilateral', '30s', 'Beginner', 2, '1',  30, 'Hip flexor tendon','Hip ligaments',  'Tight hip flexors', 4),
(@p, 'Goblet Squat (Bodyweight)',       'strengthen', 'Legs',   'None', 'Chest tall',        'Rounding back',    'Standing', 'Con/Ecc', 'Bilateral',  '2:2', 'Beginner', 2, '12', 30, 'Patellar tendon', 'Knee ligaments',   'Weak legs',         5),
(@p, 'Child''s Pose',                  'mobility',   'Back',   'None', 'Breathe slow',      'Forcing hips back','Kneeling', 'Static',  'Bilateral',  '30s', 'Beginner', 1, '1',  20, 'Spinal tendon',   'Spine ligaments',  'Tight back',        6),
(@p, 'Step-Ups',                       'strengthen', 'Legs',   'Step', 'Push through heel', 'Leaning forward',  'Standing', 'Con/Ecc', 'Unilateral', '2:2', 'Beginner', 1, '10', 20, 'Glute tendon',    'Knee ligament',    'Weak quads',        7),
(@p, 'Dead Bug',                       'strengthen', 'Core',   'Mat',  'Keep back down',    'Arching',          'Supine',   'Dynamic', 'Bilateral',  '2:2', 'Beginner', 1, '10', 20, 'Core tendon',     'Spine ligaments',  'Weak deep core',    8),
(@p, 'Thread the Needle',              'mobility',   'Back',   'None', 'Rotate gently',     'Forcing',          'Quadruped','Dynamic', 'Bilateral',  '2:2', 'Beginner', 1, '10', 20, 'Spinal tendon',   'Spine ligament',   'Thoracic tightness',9),
(@p, 'Rock Back Stretch',              'mobility',   'Hips',   'None', 'Slow rocking',      'Rushing',          'Quadruped','Dynamic', 'Bilateral',  '2:2', 'Beginner', 1, '10', 20, 'Hip tendon',      'Spine ligament',   'Hip stiffness',    10);

-- ── Bar Stool Back Saver ──
SET @p = (SELECT id FROM `Program` WHERE name = 'Bar Stool Back Saver' AND duration_min = 20 LIMIT 1);
INSERT INTO `Program_Exercise` (program_id, exercise_name, exercise_type, body_part, equipment, tips, common_mistakes, position, contraction_type, bilateral, tempo, skill_level, sets, reps, rest_time_sec, tendon_used, ligament_used, common_causes, sort_order) VALUES
(@p, 'Scapular Retraction',            'strengthen', 'Upper back',      'Band', 'Squeeze shoulder blades','Shrugging',       'Standing', 'Con/Ecc',  'Bilateral', '2:2', 'Beginner',     2, '12', 30, 'Rhomboid tendon', 'Shoulder ligament', 'Weak posture',          1),
(@p, 'Superman',                       'strengthen', 'Back',            'Mat',  'Lift gently',            'Overarching',     'Prone',    'Concentric','Bilateral', '2:2', 'Beginner',     2, '10', 30, 'Spinal tendon',   'Spine ligament',    'Weak low back',         2),
(@p, 'Wall Angels',                    'strengthen', 'Shoulders',       'None', 'Keep ribs down',         'Arching back',    'Standing', 'Con/Ecc',  'Bilateral', '2:2', 'Beginner',     2, '10', 30, 'Rotator cuff',    'Shoulder ligaments','Postural fatigue',      3),
(@p, 'Seated Twist Stretch',           'stretch',    'Core',            'None', 'Gentle twist',           'Forcing',         'Seated',   'Static',   'Bilateral', '30s', 'Beginner',     2, '1',  30, 'Spinal tendon',   'Spine ligament',    'Trunk tightness',       4),
(@p, 'Cat-Cow',                        'mobility',   'Back',            'None', 'Smooth motion',          'Jerky',           'Quadruped','Dynamic',  'Bilateral', '2:2', 'Beginner',     2, '10', 30, 'Spinal tendon',   'Spine ligament',    'Stiff back',            5),
(@p, 'Anti-Slouch Bracing',            'strengthen', 'Trunk',           'None', 'Brace lightly',          'Holding breath',  'Seated',   'Isometric','Bilateral', '5s',  'Beginner',     1, '10', 20, 'Core tendon',     'Spine ligament',    'Prolonged sitting',     6),
(@p, 'Chin Tucks',                     'strengthen', 'Neck',            'None', 'Gentle nod',             'Over-pressing',   'Seated',   'Isometric','Bilateral', '5s',  'Beginner',     1, '10', 20, 'Cervical tendon', 'Neck ligaments',    'Forward head posture',  7),
(@p, 'Reverse Snow Angels',            'strengthen', 'Posterior chain', 'Mat',  'Slow sweep',             'Lifting too high','Prone',    'Con/Ecc',  'Bilateral', '2:2', 'Intermediate', 1, '10', 20, 'Spinal tendon',   'Shoulder ligament', 'Weak upper back',        8),
(@p, 'Hip Hinge Rockbacks',            'mobility',   'Hips',            'None', 'Hips back',              'Dropping head',   'Quadruped','Dynamic',  'Bilateral', '2:2', 'Beginner',     1, '10', 20, 'Glute tendon',    'Hip ligament',      'Tight posterior chain', 9),
(@p, 'Shoulder Rolls',                 'mobility',   'Shoulder',        'None', 'Smooth circles',         'Shrugging',       'Standing', 'Dynamic',  'Bilateral', '—',   'Beginner',     1, '10', 20, 'Shoulder tendon', 'Ligaments',         'Sitting stiffness',    10);

-- ── Work-From-Couch Core Reset ──
SET @p = (SELECT id FROM `Program` WHERE name = 'Work-From-Couch Core Reset' AND duration_min = 20 LIMIT 1);
INSERT INTO `Program_Exercise` (program_id, exercise_name, exercise_type, body_part, equipment, tips, common_mistakes, position, contraction_type, bilateral, tempo, skill_level, sets, reps, rest_time_sec, tendon_used, ligament_used, common_causes, sort_order) VALUES
(@p, 'Bird Dog',                       'strengthen', 'Core',       'Mat',  'Hips level',         'Rotating',               'Quadruped',   'Con/Ecc',  'Unilateral', '2:2', 'Beginner', 2, '10', 20, 'Spinal tendon',      'Spine ligaments',   'Weak core',            1),
(@p, 'Glute Bridge',                   'strengthen', 'Glutes',     'Mat',  'Squeeze glutes',     'Overarching',            'Supine',      'Con/Ecc',  'Bilateral',  '2:2', 'Beginner', 2, '15', 20, 'Glute tendon',       'Hip ligaments',     'Weak glutes',          2),
(@p, 'Chin Tucks',                     'strengthen', 'Neck',       'None', 'Tiny nod',           'Over-pushing',           'Seated',      'Isometric','Bilateral',  '5s',  'Beginner', 2, '10', 20, 'Cervical tendon',    'Neck ligaments',    'Forward head posture', 3),
(@p, 'Thread the Needle',              'mobility',   'Spine',      'None', 'Rotate gently',      'Over-rotating',          'Quadruped',   'Dynamic',  'Bilateral',  '2:2', 'Beginner', 2, '10', 20, 'Spinal tendon',      'Spine ligament',    'Thoracic tightness',   4),
(@p, 'Standing Chest Opener',          'stretch',    'Chest',      'None', 'Open arms wide',     'Shrugging',              'Standing',    'Static',   'Bilateral',  '30s', 'Beginner', 2, '1',  20, 'Pectoral tendon',    'Shoulder ligaments','Tight chest',          5),
(@p, 'Dead Bug',                       'strengthen', 'Core',       'Mat',  'Back flat',          'Arching',                'Supine',      'Con/Ecc',  'Bilateral',  '2:2', 'Beginner', 1, '10', 20, 'Core tendon',        'Spine ligament',    'Weak core',            6),
(@p, 'Scapular Retraction',            'strengthen', 'Upper back', 'Band', 'Squeeze blades',     'Shrugging',              'Standing',    'Con/Ecc',  'Bilateral',  '2:2', 'Beginner', 1, '12', 20, 'Scapular tendon',    'Shoulder ligament', 'Rounded shoulders',    7),
(@p, 'Wall Slides',                    'mobility',   'Shoulder',   'Wall', 'Keep arms on wall',  'Lifting elbows forward', 'Standing',    'Dynamic',  'Bilateral',  '2:2', 'Beginner', 1, '10', 20, 'Rotator cuff tendon','Shoulder ligament', 'Shoulder stiffness',   8),
(@p, 'Hip Hinge Rockbacks',            'mobility',   'Hips',       'Mat',  'Push hips back',     'Curling spine',          'Quadruped',   'Dynamic',  'Bilateral',  '2:2', 'Beginner', 1, '10', 20, 'Glute tendon',       'Hip ligament',      'Tight hips',           9),
(@p, 'Plank (Modified)',               'strengthen', 'Core',       'Mat',  'Brace lightly',      'Dropping hips',          'Knees-plank', 'Isometric','Bilateral',  '20s', 'Beginner', 1, '1',  30, 'Core tendon',        'Spine ligament',    'Weak endurance',      10);

-- ── Netflix Binge Survival Stretch ──
SET @p = (SELECT id FROM `Program` WHERE name = 'Netflix Binge Survival Stretch' AND duration_min = 20 LIMIT 1);
INSERT INTO `Program_Exercise` (program_id, exercise_name, exercise_type, body_part, equipment, tips, common_mistakes, position, contraction_type, bilateral, tempo, skill_level, sets, reps, rest_time_sec, tendon_used, ligament_used, common_causes, sort_order) VALUES
(@p, 'Cat-Cow',                        'mobility', 'Back',            'None', 'Breathe through','Rushing',       'Quadruped','Dynamic',  'Bilateral',  '2:2', 'Beginner', 2, '10', 20, 'Spinal tendon',     'Spine ligaments',   'Stiff back',            1),
(@p, 'Child''s Pose',                  'stretch',  'Back',            'None', 'Relax hips',     'Holding breath','Kneeling', 'Static',   'Bilateral',  '30s', 'Beginner', 2, '1',  20, 'Spinal tendon',     'Spine ligaments',   'Tight back',            2),
(@p, 'Seated Forward Fold',            'stretch',  'Posterior chain', 'None', 'Gentle fold',    'Forcing',       'Seated',   'Static',   'Bilateral',  '30s', 'Beginner', 2, '1',  20, 'Hamstring tendon',  'Knee ligaments',    'Tight posterior chain', 3),
(@p, 'Seated Spinal Twist',            'stretch',  'Trunk',           'None', 'Gentle twist',   'Forcing',       'Seated',   'Static',   'Bilateral',  '30s', 'Beginner', 2, '1',  20, 'Spinal tendon',     'Spine ligaments',   'Tight torso',           4),
(@p, 'Hip Flexor Stretch',             'stretch',  'Hip',             'None', 'Gentle',         'Overstretch',   'Kneeling', 'Static',   'Unilateral', '30s', 'Beginner', 2, '1',  20, 'Iliopsoas tendon',  'Hip ligaments',     'Tight hips',            5),
(@p, 'Standing Back Extension',        'mobility', 'Spine',           'None', 'Hands on hips',  'Overextending', 'Standing', 'Dynamic',  'Bilateral',  '1:1', 'Beginner', 1, '10', 20, 'Lumbar tendon',     'Spine ligament',    'Prolonged sitting',     6),
(@p, 'Wall Pec Stretch',               'stretch',  'Chest',           'Wall', 'Small turn',     'Over-rotating', 'Standing', 'Static',   'Unilateral', '30s', 'Beginner', 1, '1',  20, 'Pectoral tendon',   'Shoulder ligament', 'Rounded shoulders',     7),
(@p, 'Figure 4 Stretch',               'stretch',  'Hip',             'Mat',  'Flex foot',      'Rounding back', 'Supine',   'Static',   'Unilateral', '30s', 'Beginner', 1, '1',  20, 'Piriformis tendon', 'Hip ligament',      'Hip tightness',         8),
(@p, 'Thread the Needle',              'mobility', 'Back',            'None', 'Gentle rotation','Forcing',       'Quadruped','Dynamic',  'Bilateral',  '2:2', 'Beginner', 1, '10', 20, 'Spinal tendon',     'Thoracic ligament', 'Thoracic tightness',    9),
(@p, 'Standing Side Bend',             'stretch',  'Core',            'None', 'Gentle lean',    'Overstretching','Standing', 'Static',   'Bilateral',  '30s', 'Beginner', 1, '1',  20, 'Oblique tendon',    'Rib ligaments',     'Tight trunk',          10);

-- ── Restaurant Chair Rescue ──
SET @p = (SELECT id FROM `Program` WHERE name = 'Restaurant Chair Rescue' AND duration_min = 20 LIMIT 1);
INSERT INTO `Program_Exercise` (program_id, exercise_name, exercise_type, body_part, equipment, tips, common_mistakes, position, contraction_type, bilateral, tempo, skill_level, sets, reps, rest_time_sec, tendon_used, ligament_used, common_causes, sort_order) VALUES
(@p, 'Standing Hip Circles',           'mobility',   'Hip',  'None', 'Smooth circles',         'Rushing',             'Standing',     'Dynamic',  'Unilateral', '—',   'Beginner', 2, '10 each',20, 'Hip flexor tendon', 'Hip ligament',      'Tight hips',           1),
(@p, 'Standing Side Bend',             'stretch',    'Core', 'None', 'Gentle bend',            'Overstretching',      'Standing',     'Static',   'Bilateral',  '30s', 'Beginner', 2, '1',      20, 'Oblique tendon',    'Rib ligaments',     'Tight trunk',          2),
(@p, 'Shoulder Rolls',                 'mobility',   'Shoulder','None','Smooth movement',       'Shrugging',           'Standing',     'Dynamic',  'Bilateral',  '—',   'Beginner', 2, '10',     20, 'Shoulder tendon',   'Shoulder ligaments','Shoulder stiffness',   3),
(@p, 'Seated Spinal Twist',            'stretch',    'Back', 'None', 'Gentle twist',           'Forcing',             'Seated',       'Static',   'Bilateral',  '30s', 'Beginner', 2, '1',      20, 'Spinal tendon',     'Spine ligament',    'Tight spine',          4),
(@p, 'Chin Tucks',                     'strengthen', 'Neck', 'None', 'Gentle nod',             'Over-press',          'Seated',       'Isometric','Bilateral',  '5s',  'Beginner', 2, '10',     20, 'Cervical tendon',   'Neck ligaments',    'Forward head posture', 5),
(@p, 'Thread the Needle',              'mobility',   'Spine','None', 'Smooth rotation',        'Collapsing shoulder', 'Quadruped',    'Dynamic',  'Bilateral',  '2:2', 'Beginner', 1, '10',     20, 'Spinal tendon',     'Thoracic ligament', 'Upper back tightness', 6),
(@p, 'Cat-Cow',                        'mobility',   'Back', 'None', 'Breathe deeply',         'Rushing',             'Quadruped',    'Dynamic',  'Bilateral',  '2:2', 'Beginner', 1, '10',     20, 'Spinal tendon',     'Spine ligament',    'Back stiffness',       7),
(@p, 'Figure 4 Stretch',               'stretch',    'Hip',  'Mat',  'Flex foot',              'Rounding spine',      'Seated/Supine','Static',   'Unilateral', '30s', 'Beginner', 1, '1',      20, 'Piriformis tendon', 'Hip ligament',      'Hip tightness',        8),
(@p, 'Standing Back Extension',        'mobility',   'Back', 'None', 'Gentle lean',            'Overextending',       'Standing',     'Dynamic',  'Bilateral',  '1:1', 'Beginner', 1, '10',     20, 'Lumbar tendon',     'Spine ligament',    'Lumbar stiffness',     9),
(@p, 'Kneeling Lunge Stretch',         'stretch',    'Hip',  'None', 'Upright torso',          'Leaning too far',     'Kneeling',     'Static',   'Unilateral', '30s', 'Beginner', 1, '1',      20, 'Hip flexor tendon', 'Hip ligament',      'Tight hip flexors',   10);

-- ── Long Car Ride Reset ──
SET @p = (SELECT id FROM `Program` WHERE name = 'Long Car Ride Reset' AND duration_min = 20 LIMIT 1);
INSERT INTO `Program_Exercise` (program_id, exercise_name, exercise_type, body_part, equipment, tips, common_mistakes, position, contraction_type, bilateral, tempo, skill_level, sets, reps, rest_time_sec, tendon_used, ligament_used, common_causes, sort_order) VALUES
(@p, 'Seated Forward Fold',            'stretch',    'Posterior chain','None', 'Gentle fold',    'Forcing',       'Seated',    'Static',  'Bilateral',  '30s', 'Beginner', 2, '1',       20, 'Hamstring tendon',  'Knee ligaments',  'Tight posterior chain from sitting',     1),
(@p, 'Hip Flexor Stretch',             'stretch',    'Hip',            'None', 'Gentle',         'Overstretch',   'Kneeling',  'Static',  'Unilateral', '30s', 'Beginner', 2, '1',       20, 'Iliopsoas tendon',  'Hip ligaments',   'Tight hip flexors from sitting',         2),
(@p, 'Cat-Cow',                        'mobility',   'Back',           'None', 'Breathe through','Rushing',       'Quadruped', 'Dynamic', 'Bilateral',  '2:2', 'Beginner', 2, '10',      20, 'Spinal tendon',     'Spine ligaments', 'Stiff back after driving',               3),
(@p, 'Child''s Pose',                  'stretch',    'Back',           'None', 'Relax hips',     'Holding breath','Kneeling',  'Static',  'Bilateral',  '30s', 'Beginner', 2, '1',       20, 'Spinal tendon',     'Spine ligaments', 'Tight back after driving',               4),
(@p, 'Standing Hip Circles',           'mobility',   'Hip',            'None', 'Smooth circles', 'Rushing',       'Standing',  'Dynamic', 'Unilateral', '—',   'Beginner', 2, '10 each', 20, 'Hip flexor tendon', 'Hip ligament',    'Tight hips after sitting',               5),
(@p, 'Glute Bridge',                   'strengthen', 'Glutes',         'Mat',  'Squeeze glutes', 'Arching',       'Supine',    'Con/Ecc', 'Bilateral',  '2:2', 'Beginner', 2, '15',      20, 'Glute tendon',      'Hip ligaments',   'Weak posterior chain from long sitting', 6),
(@p, 'Seated Spinal Twist',            'stretch',    'Trunk',          'None', 'Gentle twist',   'Forcing',       'Seated',    'Static',  'Bilateral',  '30s', 'Beginner', 2, '1',       20, 'Spinal tendon',     'Spine ligaments', 'Tight mid-back from car posture',        7);
