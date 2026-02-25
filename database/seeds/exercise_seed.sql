-- Muscle Group Seeds
INSERT INTO Muscle_Group (name) VALUES ('Hip');
INSERT INTO Muscle_Group (name) VALUES ('Ankle');
INSERT INTO Muscle_Group (name) VALUES ('Knee');
INSERT INTO Muscle_Group (name) VALUES ('Lower Back');
INSERT INTO Muscle_Group (name) VALUES ('Neck');
INSERT INTO Muscle_Group (name) VALUES ('Shoulder');
INSERT INTO Muscle_Group (name) VALUES ('Wrist');
INSERT INTO Muscle_Group (name) VALUES ('Elbow');
INSERT INTO Muscle_Group (name) VALUES ('Foot');
INSERT INTO Muscle_Group (name) VALUES ('Hand');
INSERT INTO Muscle_Group (name) VALUES ('Outer Thigh');
INSERT INTO Muscle_Group (name) VALUES ('Hamstring');
INSERT INTO Muscle_Group (name) VALUES ('Shin');
INSERT INTO Muscle_Group (name) VALUES ('Groin');
INSERT INTO Muscle_Group (name) VALUES ('Spine');
INSERT INTO Muscle_Group (name) VALUES ('Core');
INSERT INTO Muscle_Group (name) VALUES ('Glutes');
INSERT INTO Muscle_Group (name) VALUES ('Biceps');
INSERT INTO Muscle_Group (name) VALUES ('Chest');
INSERT INTO Muscle_Group (name) VALUES ('Pelvis');
INSERT INTO Muscle_Group (name) VALUES ('Lumbar Spine');
INSERT INTO Muscle_Group (name) VALUES ('Forearm');
INSERT INTO Muscle_Group (name) VALUES ('Tailbone');
INSERT INTO Muscle_Group (name) VALUES ('Jaw');
INSERT INTO Muscle_Group (name) VALUES ('Back');

-- Exercise Seeds (First 30 exercises converted to new format)
INSERT INTO Exercise (name, category, description, tips, common_mistakes, position, equipment_needed, skill_level, difficulty, tempo, sets, reps, duration_seconds, is_gym_only, emoji, sessions_count) VALUES ('Step Downs', 'strengthen', 'Engage core, squeeze glutes at top. Common mistake: Arching the back, pushing with feet', 'Engage core, squeeze glutes at top', 'Arching the back, pushing with feet', 'Supine', 'Mat', 'Beginner', 'easy', '2–1–2 / 5 sec hold at top', 3, '12', 180, 0, '💪', 12);

INSERT INTO Exercise (name, category, description, tips, common_mistakes, position, equipment_needed, skill_level, difficulty, tempo, sets, reps, duration_seconds, is_gym_only, emoji, sessions_count) VALUES ('Fire Hydrants', 'strengthen', 'Tuck pelvis under, keep upright posture. Common mistake: Overarching the back, leaning forward too far', 'Tuck pelvis under, keep upright posture', 'Overarching the back, leaning forward too far', 'Standing', '', 'Beginner', 'easy', 'Hold 30 sec', 2, '30s each side', 60, 0, '💪', 15);

INSERT INTO Exercise (name, category, description, tips, common_mistakes, position, equipment_needed, skill_level, difficulty, tempo, sets, reps, duration_seconds, is_gym_only, emoji, sessions_count) VALUES ('Figure 4 Stretch', 'stretch', 'Move slowly, hold at top, balance with wall. Common mistake: Rushing reps, heels not dropping fully', 'Move slowly, hold at top, balance with wall', 'Rushing reps, heels not dropping fully', 'Standing', 'Step or Stairs', 'Beginner', 'easy', '2–1–2', 3, '15', 150, 0, '🧘', 9);

INSERT INTO Exercise (name, category, description, tips, common_mistakes, position, equipment_needed, skill_level, difficulty, tempo, sets, reps, duration_seconds, is_gym_only, emoji, sessions_count) VALUES ('Single-Leg Balance on Foam Pad', 'strengthen', 'Sit comfortably, trace letters with big toe. Common mistake: Using whole leg instead of ankle', 'Sit comfortably, trace letters with big toe', 'Using whole leg instead of ankle', 'Seated', '', 'Beginner', 'easy', 'Slow, controlled', 2, 'Full alphabet x2', 120, 0, '💪', 18);

INSERT INTO Exercise (name, category, description, tips, common_mistakes, position, equipment_needed, skill_level, difficulty, tempo, sets, reps, duration_seconds, is_gym_only, emoji, sessions_count) VALUES ('Resisted Dorsiflexion with Band', 'strengthen', 'Stand tall, control movement both directions. Common mistake: Leaning body, swinging leg too fast', 'Stand tall, control movement both directions', 'Leaning body, swinging leg too fast', 'Standing', 'Cable machine with ankle strap', 'Intermediate', 'medium', '2–1–2', 3, '12 each side', 180, 1, '💪', 14);

INSERT INTO Exercise (name, category, description, tips, common_mistakes, position, equipment_needed, skill_level, difficulty, tempo, sets, reps, duration_seconds, is_gym_only, emoji, sessions_count) VALUES ('Heel-to-Toe Walk', 'strengthen', 'Keep toes straight, full range (drop + lift heels). Common mistake: Bouncing reps, shallow range', 'Keep toes straight, full range (drop + lift heels)', 'Bouncing reps, shallow range', 'Seated', 'Seated calf raise machine', 'Intermediate', 'medium', '2–1–2', 3, '15', 150, 1, '💪', 11);

INSERT INTO Exercise (name, category, description, tips, common_mistakes, position, equipment_needed, skill_level, difficulty, tempo, sets, reps, duration_seconds, is_gym_only, emoji, sessions_count) VALUES ('Short Arc Quad', 'strengthen', 'Keep knee slightly bent, squeeze quad hard at top. Common mistake: Letting hip flex, lifting heel too high', 'Keep knee slightly bent, squeeze quad hard at top', 'Letting hip flex, lifting heel too high', 'Supine', 'Towel or Foam Roller', 'Beginner', 'easy', 'Hold 5s at top', 3, '12 each side', 180, 0, '💪', 7);

INSERT INTO Exercise (name, category, description, tips, common_mistakes, position, equipment_needed, skill_level, difficulty, tempo, sets, reps, duration_seconds, is_gym_only, emoji, sessions_count) VALUES ('Leg Press (Light Resistance)', 'strengthen', 'Keep knees tracking over toes, don''t lock knees. Common mistake: Flexing lower back, excessive load', 'Keep knees tracking over toes, don''t lock knees', 'Flexing lower back, excessive load', 'Seated', 'Leg Press Machine', 'Beginner', 'easy', '2–1–2', 3, '10–12', 150, 1, '💪', 16);

INSERT INTO Exercise (name, category, description, tips, common_mistakes, position, equipment_needed, skill_level, difficulty, tempo, sets, reps, duration_seconds, is_gym_only, emoji, sessions_count) VALUES ('IT Band Stretch (Standing)', 'stretch', 'Cross legs and lean away from tight side. Common mistake: Rotating trunk or bending forward', 'Cross legs and lean away from tight side', 'Rotating trunk or bending forward', 'Standing', '', 'Beginner', 'easy', 'Hold 30s each side', 2, '30s each side', 60, 0, '🧘', 13);

INSERT INTO Exercise (name, category, description, tips, common_mistakes, position, equipment_needed, skill_level, difficulty, tempo, sets, reps, duration_seconds, is_gym_only, emoji, sessions_count) VALUES ('Child''s Pose', 'stretch', 'Sink hips toward heels, reach long with arms. Common mistake: Bouncing, shrugging shoulders', 'Sink hips toward heels, reach long with arms', 'Bouncing, shrugging shoulders', 'Quadruped → Hips to heels', 'Mat', 'Beginner', 'easy', 'Hold 30s', 2, '30s', 60, 0, '🧘', 8);

INSERT INTO Exercise (name, category, description, tips, common_mistakes, position, equipment_needed, skill_level, difficulty, tempo, sets, reps, duration_seconds, is_gym_only, emoji, sessions_count) VALUES ('Standing Lumbar Extension', 'stretch', 'Extend gently without forcing end range. Common mistake: Overarching or bending knees', 'Extend gently without forcing end range', 'Overarching or bending knees', 'Standing', '', 'Beginner', 'easy', 'Hold 10–15s', 2, '10–15s', 30, 0, '🧘', 19);

INSERT INTO Exercise (name, category, description, tips, common_mistakes, position, equipment_needed, skill_level, difficulty, tempo, sets, reps, duration_seconds, is_gym_only, emoji, sessions_count) VALUES ('Bridge Marches', 'strengthen', 'Keep hips level while marching. Common mistake: Letting hips drop, excessive arching', 'Keep hips level while marching', 'Letting hips drop, excessive arching', 'Supine', 'Mat', 'Intermediate', 'medium', '2–1–2 / 3s hold at top', 3, '10 each leg', 180, 0, '💪', 10);

INSERT INTO Exercise (name, category, description, tips, common_mistakes, position, equipment_needed, skill_level, difficulty, tempo, sets, reps, duration_seconds, is_gym_only, emoji, sessions_count) VALUES ('Cervical Rotation Stretch', 'stretch', 'Turn slowly until a mild stretch, shoulders relaxed. Common mistake: Forcing range, elevating shoulders', 'Turn slowly until a mild stretch, shoulders relaxed', 'Forcing range, elevating shoulders', 'Seated / Standing', '', 'Beginner', 'easy', 'Hold 20s each side', 2, '20s each side', 40, 0, '🧘', 6);

INSERT INTO Exercise (name, category, description, tips, common_mistakes, position, equipment_needed, skill_level, difficulty, tempo, sets, reps, duration_seconds, is_gym_only, emoji, sessions_count) VALUES ('Neck Isometric Side Hold', 'strengthen', 'Gently press head into hand without moving neck. Common mistake: Holding breath, pushing too hard', 'Gently press head into hand without moving neck', 'Holding breath, pushing too hard', 'Seated / Standing', '', 'Beginner', 'easy', 'Hold 10s', 2, '5 each side', 50, 0, '💪', 17);

INSERT INTO Exercise (name, category, description, tips, common_mistakes, position, equipment_needed, skill_level, difficulty, tempo, sets, reps, duration_seconds, is_gym_only, emoji, sessions_count) VALUES ('Wall Chin Retractions', 'strengthen', 'Slide head straight back, keep chin level. Common mistake: Tilting chin up/down, shrugging shoulders', 'Slide head straight back, keep chin level', 'Tilting chin up/down, shrugging shoulders', 'Standing against wall', 'Wall', 'Beginner', 'easy', 'Hold 5s', 2, '12', 60, 0, '💪', 5);

INSERT INTO Exercise (name, category, description, tips, common_mistakes, position, equipment_needed, skill_level, difficulty, tempo, sets, reps, duration_seconds, is_gym_only, emoji, sessions_count) VALUES ('Prone Y-T-I Raises', 'strengthen', 'Move slow, control scapula, no shrugging. Common mistake: Overarching low back, fast reps', 'Move slow, control scapula, no shrugging', 'Overarching low back, fast reps', 'Prone', 'Mat or Bench', 'Intermediate', 'medium', '2–1–2', 3, '10 each (Y, T, I)', 180, 0, '💪', 20);

INSERT INTO Exercise (name, category, description, tips, common_mistakes, position, equipment_needed, skill_level, difficulty, tempo, sets, reps, duration_seconds, is_gym_only, emoji, sessions_count) VALUES ('Shoulder Pulley Flexion', 'stretch', 'Use pain-free range, relax neck. Common mistake: Compensating with trunk lean or shrugging', 'Use pain-free range, relax neck', 'Compensating with trunk lean or shrugging', 'Seated / Standing', 'Shoulder Pulley System', 'Beginner', 'easy', 'Hold 30s', 2, '30s', 60, 0, '🧘', 14);

INSERT INTO Exercise (name, category, description, tips, common_mistakes, position, equipment_needed, skill_level, difficulty, tempo, sets, reps, duration_seconds, is_gym_only, emoji, sessions_count) VALUES ('Serratus Wall Slide', 'strengthen', 'Protract at top, maintain neutral ribs. Common mistake: Overarching lower back, winging scapula', 'Protract at top, maintain neutral ribs', 'Overarching lower back, winging scapula', 'Standing facing wall', 'Wall or Resistance Band', 'Intermediate', 'medium', '2–1–2', 3, '12', 120, 0, '💪', 11);

INSERT INTO Exercise (name, category, description, tips, common_mistakes, position, equipment_needed, skill_level, difficulty, tempo, sets, reps, duration_seconds, is_gym_only, emoji, sessions_count) VALUES ('Prayer Stretch', 'stretch', 'Palms together, gently press down. Common mistake: Locking elbows, rounding shoulders', 'Palms together, gently press down', 'Locking elbows, rounding shoulders', 'Seated / Standing', '', 'Beginner', 'easy', 'Hold 30s', 2, '30s', 60, 0, '🧘', 8);

INSERT INTO Exercise (name, category, description, tips, common_mistakes, position, equipment_needed, skill_level, difficulty, tempo, sets, reps, duration_seconds, is_gym_only, emoji, sessions_count) VALUES ('Reverse Prayer Stretch', 'stretch', 'Gently bring backs of hands together behind back. Common mistake: Forcing range, shoulder internal rotation', 'Gently bring backs of hands together behind back', 'Forcing range, shoulder internal rotation', 'Standing', '', 'Beginner', 'easy', 'Hold 30s', 2, '30s', 60, 0, '🧘', 18);

INSERT INTO Exercise (name, category, description, tips, common_mistakes, position, equipment_needed, skill_level, difficulty, tempo, sets, reps, duration_seconds, is_gym_only, emoji, sessions_count) VALUES ('Towel Twists', 'strengthen', 'Grip towel evenly, twist slowly with controlled motion. Common mistake: Using shoulder instead of wrist, jerky motion', 'Grip towel evenly, twist slowly with controlled motion', 'Using shoulder instead of wrist, jerky motion', 'Seated or Standing ', 'Towels', 'Beginner', 'easy', '2–1–2', 2, '12', 96, 0, '💪', 13);

INSERT INTO Exercise (name, category, description, tips, common_mistakes, position, equipment_needed, skill_level, difficulty, tempo, sets, reps, duration_seconds, is_gym_only, emoji, sessions_count) VALUES ('Reverse Wrist Curl with Dumbbell', 'strengthen', 'Rest forearm on table, hang wrist, move only at wrist. Common mistake: Lifting with elbow, using momentum', 'Rest forearm on table, hang wrist, move only at wrist', 'Lifting with elbow, using momentum', 'Seated', 'Light Dumbbell', 'Beginner', 'easy', '2–1–2', 3, '12', 120, 0, '💪', 9);

INSERT INTO Exercise (name, category, description, tips, common_mistakes, position, equipment_needed, skill_level, difficulty, tempo, sets, reps, duration_seconds, is_gym_only, emoji, sessions_count) VALUES ('Zottman Curls (Light Dumbbell)', 'strengthen', 'Curl up with palms facing up, rotate palms down. Common mistake: Swinging weights, not rotating wrists fully', 'Curl up with palms facing up, rotate palms down', 'Swinging weights, not rotating wrists fully', 'Standing', 'Light Dumbbell', 'Intermediate', 'medium', '2–1–2', 3, '10', 120, 0, '💪', 7);

INSERT INTO Exercise (name, category, description, tips, common_mistakes, position, equipment_needed, skill_level, difficulty, tempo, sets, reps, duration_seconds, is_gym_only, emoji, sessions_count) VALUES ('Isometric Elbow Flexion', 'strengthen', 'Push hand into static object without moving elbow. Common mistake: Holding breath, shrugging shoulders', 'Push hand into static object without moving elbow', 'Holding breath, shrugging shoulders', 'Seated or Standing', 'Wall or static resistance', 'Beginner', 'easy', 'Hold 10s', 2, '5 each side', 50, 0, '💪', 15);

INSERT INTO Exercise (name, category, description, tips, common_mistakes, position, equipment_needed, skill_level, difficulty, tempo, sets, reps, duration_seconds, is_gym_only, emoji, sessions_count) VALUES ('Marble Pickups with Toes', 'strengthen', 'Sit tall, pick up marbles with toes and place in cup. Common mistake: Using whole leg or not isolating toes', 'Sit tall, pick up marbles with toes and place in cup', 'Using whole leg or not isolating toes', 'Seated', 'Marbles and cup', 'Beginner', 'easy', 'Controlled', 2, '20 each foot', 120, 0, '💪', 12);

INSERT INTO Exercise (name, category, description, tips, common_mistakes, position, equipment_needed, skill_level, difficulty, tempo, sets, reps, duration_seconds, is_gym_only, emoji, sessions_count) VALUES ('Standing Toe Extension Stretch', 'stretch', 'Place toes against wall and lean forward gently. Common mistake: Leaning too far, arching back', 'Place toes against wall and lean forward gently', 'Leaning too far, arching back', 'Standing', 'Wall or step', 'Beginner', 'easy', 'Hold 30s', 2, '30s each side', 60, 0, '🧘', 16);

INSERT INTO Exercise (name, category, description, tips, common_mistakes, position, equipment_needed, skill_level, difficulty, tempo, sets, reps, duration_seconds, is_gym_only, emoji, sessions_count) VALUES ('Ankle Circles', 'stretch', 'Draw large slow circles with toes. Common mistake: Moving whole leg instead of ankle', 'Draw large slow circles with toes', 'Moving whole leg instead of ankle', 'Seated or Supine', '', 'Beginner', 'easy', 'Slow and controlled', 2, '10 each direction', 60, 0, '🧘', 10);

INSERT INTO Exercise (name, category, description, tips, common_mistakes, position, equipment_needed, skill_level, difficulty, tempo, sets, reps, duration_seconds, is_gym_only, emoji, sessions_count) VALUES ('Seated Nerve Glide', 'stretch', 'Extend knee and ankle together slowly while sitting. Common mistake: Moving too quickly or forcing stretch', 'Extend knee and ankle together slowly while sitting', 'Moving too quickly or forcing stretch', 'Seated', 'Chair', 'Beginner', 'easy', 'Controlled', 2, '10 each side', 60, 0, '🧘', 19);

INSERT INTO Exercise (name, category, description, tips, common_mistakes, position, equipment_needed, skill_level, difficulty, tempo, sets, reps, duration_seconds, is_gym_only, emoji, sessions_count) VALUES ('Bridge with March', 'strengthen', 'Keep hips level while marching. Common mistake: Letting hips drop or arching back', 'Keep hips level while marching', 'Letting hips drop or arching back', 'Supine', 'Mat', 'Intermediate', 'medium', '2–1–2 / 3s hold', 3, '10 each leg', 180, 0, '💪', 6);

INSERT INTO Exercise (name, category, description, tips, common_mistakes, position, equipment_needed, skill_level, difficulty, tempo, sets, reps, duration_seconds, is_gym_only, emoji, sessions_count) VALUES ('Double Knee to Chest', 'stretch', 'Pull both knees gently towards chest while lying down. Common mistake: Lifting head/neck, bouncing', 'Pull both knees gently towards chest while lying down', 'Lifting head/neck, bouncing', 'Supine', 'Mat', 'Beginner', 'easy', 'Hold 30s', 2, '30s hold', 60, 0, '🧘', 14);
