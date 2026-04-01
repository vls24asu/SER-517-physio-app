/**
 * parse-exercise-excel.js
 *
 * Reads "Exercise database.xlsx" from the Downloads folder and outputs SQL seed files:
 *   database/seeds/injury_seed.sql
 *   database/seeds/exercise_seed_full.sql
 *   database/seeds/exercise_muscle_group_seed.sql
 *
 * Usage: node database/scripts/parse-exercise-excel.js
 */

const XLSX = require('xlsx');
const fs = require('fs');
const path = require('path');

const EXCEL_PATH = path.join(
  process.env.USERPROFILE || process.env.HOME,
  'Downloads',
  'Exercise database.xlsx'
);
const SEEDS_DIR = path.join(__dirname, '..', 'seeds');

// ── helpers ─────────────────────────────────────────────────────────────────

function esc(val) {
  if (val === null || val === undefined || val === '') return 'NULL';
  return `'${String(val).replace(/'/g, "''").replace(/\\/g, '\\\\')}'`;
}

function mapCategory(raw) {
  if (!raw) return 'strengthen';
  const v = raw.toLowerCase();
  if (v.includes('stretch') && v.includes('strength')) return 'stretch';
  if (v.includes('stretch') || v.includes('fascia')) return 'stretch';
  if (v.includes('strengthen') || v.includes('strength') || v.includes('agility') || v.includes('plyometric')) return 'strengthen';
  if (v.includes('mobility')) return 'strengthen';
  return 'strengthen';
}

function mapSkillLevel(raw) {
  if (!raw) return 'Beginner';
  const v = String(raw).toLowerCase();
  if (v.includes('advanced')) return 'Advanced';
  if (v.includes('intermediate')) return 'Intermediate';
  return 'Beginner';
}

function mapGymOnly(raw) {
  if (!raw) return 0;
  const v = String(raw).toLowerCase();
  return v === 'gym' ? 1 : 0;
}

function mapBilateral(raw) {
  if (!raw) return 'NULL';
  const v = String(raw).toLowerCase();
  if (v.includes('both')) return "'Both'";
  if (v.includes('unilateral')) return "'Unilateral'";
  if (v.includes('bilateral')) return "'Bilateral'";
  return 'NULL';
}

function mapEmoji(category) {
  const map = { strengthen: '💪', stretch: '🧘', avoid: '⚠️', stability: '🏃' };
  return map[category] || '💪';
}

function parseRestSec(raw) {
  if (!raw) return 'NULL';
  const s = String(raw).replace(/s$/i, '').replace(/\s/g, '');
  const n = parseInt(s, 10);
  return isNaN(n) ? 'NULL' : n;
}

function splitMuscles(raw) {
  if (!raw) return [];
  return String(raw).split(',').map(m => m.trim()).filter(Boolean);
}

function str(val) {
  if (val === null || val === undefined) return '';
  return String(val).trim();
}

// ── main ─────────────────────────────────────────────────────────────────────

const wb = XLSX.readFile(EXCEL_PATH);

// ── Sheet 1: Injury exercises ────────────────────────────────────────────────
const injurySheet = wb.Sheets['Injuries exercises'];
const injuryRows = XLSX.utils.sheet_to_json(injurySheet);

// ── Sheet 2: Gym exercises ───────────────────────────────────────────────────
const gymSheet = wb.Sheets['Gym exercises'];
const gymRows = XLSX.utils.sheet_to_json(gymSheet);

// ── 1. injury_seed.sql ───────────────────────────────────────────────────────
const injuryMap = {};
injuryRows.forEach(r => {
  const name = (r['Injury'] || '').trim();
  const bodyPart = (r['Body Part'] || '').trim();
  const causes = (r['Most Common Ways to Get This Injury'] || '').trim();
  if (name && !injuryMap[name]) injuryMap[name] = { bodyPart, causes };
});

let injurySql = `-- Injury seed data (auto-generated from Exercise database.xlsx)
-- Run once against the database

INSERT INTO Injury_Reference (name, body_part, common_causes) VALUES\n`;
const injuryEntries = Object.entries(injuryMap);
injurySql += injuryEntries
  .map(([name, { bodyPart, causes }]) => `  (${esc(name)}, ${esc(bodyPart)}, ${esc(causes)})`)
  .join(',\n');
injurySql += `\nON DUPLICATE KEY UPDATE body_part = VALUES(body_part);\n`;

fs.writeFileSync(path.join(SEEDS_DIR, 'injury_seed.sql'), injurySql);
console.log(`Written injury_seed.sql — ${injuryEntries.length} injuries`);

// ── 2. exercise_seed_full.sql + muscle group seed ───────────────────────────
const allMuscles = new Set();
const exerciseInserts = [];
const muscleRoleRows = []; // { exerciseName, muscle, role }

function processRow(r, isGym) {
  const name = str(r['Exercise']);
  if (!name) return;

  const rawType = str(r['Type (Stretch or Strengthen)']);
  const category = mapCategory(rawType);
  const bodyPart = str(r['Body Part']) || null;
  const injury = isGym ? null : str(r['Injury']) || null;
  const equipment = str(r['Equipment Needed']) || null;
  const targeted = str(r['Targeted Muscle (highlighted more red)']) || null;
  const secondary = str(r['Secondary Muscles (highlighted lighter red)']) || null;
  const allMusclesRaw = str(r['All Muscles Used (to avoid other injuries)']) || null;
  const gymOnly = mapGymOnly(str(r['Gym or At Home']));
  const tips = str(r['Tips to Do Exercise']) || null;
  const mistakes = str(r['Common Mistakes']) || null;
  const position = str(r['Exercise Position']) || null;
  const contraction = str(r['Contraction Type']) || null;
  const bilateral = mapBilateral(str(r['Bilateral / Unilateral']));
  const tempo = str(r['Tempo / Hold Time']) || null;
  const skillLevel = mapSkillLevel(str(r['Skill Level']));
  const rawSets = r['Sets'];
  const setsNum = rawSets != null ? parseFloat(String(rawSets)) : null;
  // Treat values > 20 as invalid (Excel date serials or data entry error)
  const sets = (setsNum !== null && !isNaN(setsNum) && setsNum <= 20) ? setsNum : null;
  const rawReps = r['Reps'];
  // Filter out Excel date serials (large numbers > 1000) stored as reps due to date cell formatting
  const repsNum = rawReps != null ? parseInt(String(rawReps), 10) : NaN;
  const reps = rawReps != null && !(repsNum > 1000) ? str(rawReps) : null;
  const restSec = parseRestSec(r['Rest Time']);
  const tendon = str(r['Tendon Used']) || null;
  const ligament = str(r['Ligaments Used']) || null;
  const emoji = mapEmoji(category);

  exerciseInserts.push(
    `  (${esc(name)}, '${category}', ${esc(tips)}, ${esc(mistakes)}, ${esc(position)},` +
    ` ${esc(equipment)}, '${skillLevel}', ${esc(tempo)}, ${sets !== null ? sets : 'NULL'},` +
    ` ${esc(reps)}, ${restSec}, ${gymOnly}, ${esc(emoji)}, ${esc(bodyPart)}, ${esc(injury)},` +
    ` ${esc(contraction)}, ${bilateral}, ${esc(tendon)}, ${esc(ligament)})`
  );

  // Muscle roles
  splitMuscles(targeted).forEach(m => { allMuscles.add(m); muscleRoleRows.push({ exerciseName: name, muscle: m, role: 'targeted' }); });
  splitMuscles(secondary).forEach(m => { allMuscles.add(m); muscleRoleRows.push({ exerciseName: name, muscle: m, role: 'secondary' }); });
  // Only add 'all' muscles that aren't already in targeted or secondary
  const targetedSet = new Set(splitMuscles(targeted));
  const secondarySet = new Set(splitMuscles(secondary));
  splitMuscles(allMusclesRaw).forEach(m => {
    allMuscles.add(m);
    if (!targetedSet.has(m) && !secondarySet.has(m)) {
      muscleRoleRows.push({ exerciseName: name, muscle: m, role: 'all' });
    }
  });
}

injuryRows.forEach(r => processRow(r, false));
gymRows.forEach(r => processRow(r, true));

// Exercise seed
let exerciseSql = `-- Exercise seed data (auto-generated from Exercise database.xlsx)
-- Includes ${injuryRows.length} injury exercises + ${gymRows.length} gym exercises
-- Run once against the database

INSERT INTO exercise
  (name, category, tips, common_mistakes, position, equipment_needed, skill_level,
   tempo, \`sets\`, reps, rest_time_sec, is_gym_only, emoji, body_part, injury,
   contraction_type, bilateral, tendon_used, ligament_used)
VALUES
`;
exerciseSql += exerciseInserts.join(',\n');
exerciseSql += `\nON DUPLICATE KEY UPDATE category = VALUES(category);\n`;

fs.writeFileSync(path.join(SEEDS_DIR, 'exercise_seed_full.sql'), exerciseSql);
console.log(`Written exercise_seed_full.sql — ${exerciseInserts.length} exercises`);

// Muscle group seed
let muscleSql = `-- Muscle group seed (auto-generated from Exercise database.xlsx)
INSERT INTO muscle_group (name) VALUES\n`;
muscleSql += [...allMuscles].map(m => `  (${esc(m)})`).join(',\n');
muscleSql += `\nON DUPLICATE KEY UPDATE name = VALUES(name);\n`;

fs.writeFileSync(path.join(SEEDS_DIR, 'muscle_group_seed.sql'), muscleSql);
console.log(`Written muscle_group_seed.sql — ${allMuscles.size} muscle groups`);

// Exercise muscle group seed (run AFTER exercise + muscle_group seeds)
let emgSql = `-- Exercise-muscle group associations (auto-generated from Exercise database.xlsx)
-- Run AFTER exercise_seed_full.sql and muscle_group_seed.sql

INSERT INTO exercise_muscle_group (exercise_id, muscle_group_id, role)
SELECT e.id, mg.id, roles.role
FROM (VALUES\n`;

// De-duplicate by (exerciseName, muscle, role)
const emgSeen = new Set();
const emgValues = [];
muscleRoleRows.forEach(({ exerciseName, muscle, role }) => {
  const key = `${exerciseName}|${muscle}|${role}`;
  if (!emgSeen.has(key)) {
    emgSeen.add(key);
    emgValues.push(`  ROW(${esc(exerciseName)}, ${esc(muscle)}, '${role}')`);
  }
});

emgSql += emgValues.join(',\n');
emgSql += `\n) AS roles(exercise_name, muscle_name, role)
JOIN exercise e ON e.name = roles.exercise_name
JOIN muscle_group mg ON mg.name = roles.muscle_name
ON DUPLICATE KEY UPDATE role = VALUES(role);\n`;

fs.writeFileSync(path.join(SEEDS_DIR, 'exercise_muscle_group_seed.sql'), emgSql);
console.log(`Written exercise_muscle_group_seed.sql — ${emgValues.length} associations`);

console.log('\nDone. Run seed files in this order:');
console.log('  1. injury_seed.sql');
console.log('  2. muscle_group_seed.sql');
console.log('  3. exercise_seed_full.sql');
console.log('  4. exercise_muscle_group_seed.sql');
