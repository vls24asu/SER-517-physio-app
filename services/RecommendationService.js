/**
 * RecommendationService — Content-Based Filtering ML Engine
 *
 * Algorithm overview:
 *   1. Load user profile (fitness level, preference, equipment, pain areas) and injury history.
 *   2. Load all exercises with muscle-group associations and recent workout history.
 *   3. Score every exercise using a weighted feature vector:
 *        • therapeutic_relevance (0.40) — does the exercise target the user's pain/injury areas?
 *        • difficulty_match      (0.30) — does the skill level align with the user's fitness level?
 *        • equipment_match       (0.20) — can the user actually do this exercise with their gear?
 *        • category_match        (0.10) — does the category match the user's preference?
 *      Multiply total by a freshness multiplier (0.3–1.0) to penalise recently-done exercises.
 *   4. Hard-filter out exercises with equipment_score = 0 (user cannot perform them).
 *   5. Sort by score, then greedily assemble a routine that fits the target duration,
 *      balancing stretch/strengthen when preference is 'both'.
 */

'use strict';

const RecommendationDAO = require('../dao/RecommendationDAO');

const dao = new RecommendationDAO();

// ── Feature Maps ──────────────────────────────────────────────────────────────

// Maps user pain_area keywords → related Muscle_Group names (lowercase)
const PAIN_TO_MUSCLES = {
  neck:      ['neck', 'jaw', 'cervical'],
  back:      ['lower back', 'back', 'spine', 'lumbar spine', 'tailbone'],
  shoulders: ['shoulder', 'chest', 'scapul'],
  knees:     ['knee', 'hamstring', 'outer thigh', 'shin'],
  hips:      ['hip', 'glutes', 'pelvis', 'groin'],
  ankles:    ['ankle', 'foot', 'shin'],
  wrists:    ['wrist', 'hand', 'forearm'],
  elbows:    ['elbow', 'forearm', 'biceps'],
  core:      ['core', 'lumbar spine', 'spine'],
};

// Numeric skill-level ordering
const USER_LEVEL  = { beginner: 1, intermediate: 2, advanced: 3 };
const EXER_LEVEL  = { Beginner: 1, Intermediate: 2, Advanced: 3 };

// Common household/bodyweight items that are always "available"
const ALWAYS_AVAILABLE = ['mat', 'wall', 'chair', 'step', 'stair', 'towel',
                          'floor', 'door', 'body weight', 'bodyweight', ''];

// ── Helpers ───────────────────────────────────────────────────────────────────

function parseCSV(raw) {
  if (!raw) return [];
  // Try JSON array first (some clients may send JSON)
  try {
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) return parsed.map(s => String(s).toLowerCase().trim()).filter(Boolean);
  } catch (_) { /* fall through */ }
  return raw.split(',').map(s => s.toLowerCase().trim()).filter(Boolean);
}

function exerciseMuscles(ex) {
  return ex.muscle_groups ? ex.muscle_groups.split(',').map(s => s.toLowerCase().trim()) : [];
}

// Does `haystack` contain any word from `needles`?
function anyMatch(haystack, needles) {
  return needles.some(n => haystack.some(h => h.includes(n) || n.includes(h)));
}

// ── Individual Feature Scorers ────────────────────────────────────────────────

/**
 * therapeuticScore — How well does this exercise address the user's pain/injury areas?
 * Range: 0.50 (no overlap) → 1.00 (directly targets a pain area)
 */
function therapeuticScore(ex, allPainAreas) {
  if (allPainAreas.length === 0) return 0.55; // no pain info → slight positive default
  const muscles = exerciseMuscles(ex);
  if (muscles.length === 0) return 0.50;

  for (const area of allPainAreas) {
    const keywords = PAIN_TO_MUSCLES[area] || [area.toLowerCase()];
    if (anyMatch(muscles, keywords)) return 1.0;
  }
  return 0.50;
}

/**
 * difficultyScore — How well does the exercise skill level match the user's fitness level?
 * Range: 0.20 (2 levels away) → 1.00 (exact match)
 */
function difficultyScore(ex, fitnessLevel) {
  const uLevel = USER_LEVEL[fitnessLevel] || 1;
  const eLevel = EXER_LEVEL[ex.skill_level] || 1;
  const gap    = Math.abs(uLevel - eLevel);
  if (gap === 0) return 1.0;
  if (gap === 1) return 0.60;
  return 0.20;
}

/**
 * equipmentScore — Can the user actually perform this exercise?
 * Returns 0.0 (hard block) if gym-only and user has no gym access,
 * 1.0 if all required items are available, 0.50 if uncertain.
 */
function equipmentScore(ex, userEquipment) {
  const needed = (ex.equipment_needed || '').toLowerCase().trim();

  // No equipment needed → always doable
  if (!needed || needed === 'none') return 1.0;

  // Gym-only exercises need explicit gym access
  if (ex.is_gym_only) {
    const hasGym = userEquipment.some(e =>
      e.includes('gym') || e.includes('machine') || e.includes('cable') ||
      e.includes('leg press') || e.includes('weight'));
    return hasGym ? 1.0 : 0.0;
  }

  // Split multi-item requirements (e.g. "Mat or Resistance Band")
  const neededItems = needed.split(/[,\/]|( or )/i)
    .map(s => (s || '').trim())
    .filter(s => s && s !== 'or');

  for (const item of neededItems) {
    if (ALWAYS_AVAILABLE.some(a => item.includes(a))) continue; // household item
    const hasItem = userEquipment.some(ue => ue.includes(item) || item.includes(ue));
    if (!hasItem) return 0.50; // might still be possible but not ideal
  }
  return 1.0;
}

/**
 * categoryScore — How well does the exercise category match the user's preference?
 * Range: 0.20 → 1.00
 */
function categoryScore(ex, preference) {
  if (preference === 'both')         return 0.90; // both categories equally valued
  if (ex.category === preference)    return 1.00;
  return 0.20; // wrong category
}

/**
 * freshnessMultiplier — Penalise exercises the user did very recently.
 * Range: 0.30 (done < 2 days ago) → 1.00 (not recently done)
 */
function freshnessMultiplier(exerciseId, recentHistory) {
  const record = recentHistory.find(r => r.exercise_id === exerciseId);
  if (!record) return 1.0;

  const daysSince = (Date.now() - new Date(record.last_done).getTime()) / 86_400_000;
  if (daysSince < 2)  return 0.30;
  if (daysSince < 5)  return 0.60;
  if (daysSince < 10) return 0.80;
  return 1.0;
}

// ── Time Estimation ───────────────────────────────────────────────────────────

/**
 * Estimates total exercise time in seconds (across all sets, including rest).
 */
function estimateExerciseTimeSec(ex) {
  const sets    = Math.max(1, Math.round(Number(ex.sets) || 2));
  const rest    = ex.rest_time_sec || 30;
  const hold    = ex.hold_time_sec;

  if (hold && hold > 0) {
    return sets * (hold + rest);
  }
  // Reps-based: ~3 seconds per rep
  const repsNum = parseInt(ex.reps) || 10;
  return sets * (repsNum * 3 + rest);
}

// ── Routine Assembly ──────────────────────────────────────────────────────────

// Maps goal → preferred category for check-in context override
const GOAL_TO_CATEGORY = {
  strengthen:    'strengthen',
  stability:     'stability',
  stretch:       'stretch',
  eliminate_pain: 'stretch',
  mobility:      'stretch',
  recovery:      'stretch',
};

/**
 * generateRecommendedRoutine — Main entry point.
 *
 * @param {number} userId
 * @param {{ bodyArea?: string, goal?: string, recoveryType?: string, issueType?: string }} [checkinContext]
 * @returns {{ exercises, totalEstMin, reason, fitnessLevel, preference, painAreas }}
 */
async function generateRecommendedRoutine(userId, checkinContext = {}) {
  const [profile, injuries, exercises, recentHistory] = await Promise.all([
    dao.getUserProfile(userId),
    dao.getUserInjuries(userId),
    dao.getAllExercisesWithMuscleGroups(),
    dao.getRecentExerciseHistory(userId),
  ]);

  if (!profile) {
    return { exercises: [], totalEstMin: 0, reason: 'Complete your profile to unlock recommendations.' };
  }

  const fitnessLevel     = profile.fitness_level        || 'beginner';
  const userEquipment    = checkinContext.equipmentOverride
    ? (Array.isArray(checkinContext.equipmentOverride)
        ? checkinContext.equipmentOverride.map(s => s.toLowerCase().trim())
        : parseCSV(checkinContext.equipmentOverride))
    : parseCSV(profile.available_equipment);
  const profilePainAreas = parseCSV(profile.pain_areas);
  const injuryAreas      = injuries.map(i => i.body_part.toLowerCase().trim());

  // Determine pain areas for scoring.
  // If user explicitly set body area filters, use only those (+ injuries) — do not merge with profile.
  // If no filter set, fall back to profile pain areas.
  let checkinAreas = [];
  let useProfilePainAreas = true;
  if (Array.isArray(checkinContext.bodyAreas)) {
    // bodyAreas array was explicitly provided (even if empty = user cleared all selections)
    checkinAreas = checkinContext.bodyAreas.map(s => s.toLowerCase()).filter(s => s !== 'other');
    useProfilePainAreas = false; // user's explicit selection overrides profile
  } else if (checkinContext.bodyArea && checkinContext.bodyArea !== 'other') {
    checkinAreas = [checkinContext.bodyArea.toLowerCase()];
    useProfilePainAreas = false;
  }
  const basePainAreas = useProfilePainAreas ? profilePainAreas : [];
  const allPainAreas = [...new Set([...checkinAreas, ...basePainAreas, ...injuryAreas])];

  // Determine effective category preference from check-in context or user profile
  const contextGoal = checkinContext.goal || checkinContext.recoveryType;
  const preference  = contextGoal
    ? (GOAL_TO_CATEGORY[contextGoal] || profile.exercise_preference || 'both')
    : (profile.exercise_preference || 'both');

  const targetSec = ((checkinContext.durationOverride || profile.workout_duration_min) || 30) * 60;

  // ── Score every exercise ──
  const scored = exercises
    .map(ex => {
      // Hard-block gym-only exercises if user chose home location filter
      if (checkinContext.locationFilter === 'home' && ex.is_gym_only) return null;

      const eqScore = equipmentScore(ex, userEquipment);
      if (eqScore === 0) return null; // hard block — user cannot do this

      const tScore  = therapeuticScore(ex, allPainAreas);
      const dScore  = difficultyScore(ex, fitnessLevel);
      const cScore  = categoryScore(ex, preference);
      const fresh   = freshnessMultiplier(ex.id, recentHistory);

      const total   = (tScore * 0.40 + dScore * 0.30 + eqScore * 0.20 + cScore * 0.10) * fresh;

      return { ...ex, _score: total, _tScore: tScore, _dScore: dScore };
    })
    .filter(Boolean)
    .sort((a, b) => b._score - a._score);

  // Deduplicate by name — keep highest-scored entry only (DB may have duplicate exercise records)
  const seenNames = new Set();
  const deduped = scored.filter(ex => {
    const key = (ex.name || '').toLowerCase().trim();
    if (seenNames.has(key)) return false;
    seenNames.add(key);
    return true;
  });

  // ── Greedily assemble routine to fit target duration ──
  const selected  = [];
  let totalSec    = 0;
  let stretchCnt  = 0;
  let strengthCnt = 0;
  const MAX_EXERCISES = 12;

  for (const ex of deduped) {
    if (totalSec >= targetSec || selected.length >= MAX_EXERCISES) break;

    // Balance categories when preference is 'both'
    if (preference === 'both') {
      const imbalance = stretchCnt - strengthCnt;
      if (imbalance >= 3 && ex.category === 'stretch')    continue;
      if (imbalance <= -3 && ex.category === 'strengthen') continue;
    }

    const exTimeSec = estimateExerciseTimeSec(ex);
    selected.push(ex);
    totalSec += exTimeSec;
    if (ex.category === 'stretch')    stretchCnt++;
    else                              strengthCnt++;
  }

  // Ensure a minimum of 4 exercises even if duration target already filled
  if (selected.length < 4) {
    for (const ex of deduped) {
      if (selected.find(s => s.id === ex.id)) continue;
      selected.push(ex);
      if (selected.length >= 4) break;
    }
  }

  const totalEstMin = Math.max(1, Math.round(totalSec / 60));

  // Build a descriptive reason line
  let reason;
  if (checkinAreas.length > 0) {
    const areaLabel = checkinAreas[0].charAt(0).toUpperCase() + checkinAreas[0].slice(1);
    reason = `Tailored for your ${areaLabel} · ${fitnessLevel} level · ${preference} focus`;
  } else if (allPainAreas.length > 0) {
    const areaLabels = allPainAreas.slice(0, 2).join(', ');
    reason = `Tailored for your ${areaLabels} recovery · ${fitnessLevel} level`;
  } else {
    reason = `Based on your ${fitnessLevel} fitness level · ${preference === 'both' ? 'balanced mix' : preference + ' focus'}`;
  }

  return { exercises: selected, totalEstMin, reason, fitnessLevel, preference, painAreas: allPainAreas };
}

module.exports = { generateRecommendedRoutine };
