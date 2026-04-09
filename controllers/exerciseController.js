const ExerciseService = require('../services/ExerciseService');
const db = require('../config/db');

const exerciseService = new ExerciseService();

/**
 * GET /library
 * Display exercise library with optional filters
 */
const getLibrary = async (req, res) => {
  try {
    const { category, difficulty, search, bodyPart, injury, location, skillLevel } = req.query;

    const filters = {};
    if (category && category !== 'all') filters.category = category;
    if (difficulty) filters.difficulty = difficulty;
    if (search) filters.search = search;
    if (bodyPart && bodyPart !== 'all') filters.bodyPart = bodyPart;
    if (injury && injury !== 'all') filters.injury = injury;
    if (location === 'home') filters.isGymOnly = false;
    if (location === 'gym') filters.isGymOnly = true;
    const validSkillLevels = ['Beginner', 'Intermediate', 'Advanced'];
    if (skillLevel && validSkillLevels.includes(skillLevel)) filters.difficulty = skillLevel;

    const [exercises, bodyParts, injuries] = await Promise.all([
      exerciseService.getAllExercises(filters),
      exerciseService.getAllBodyParts(),
      exerciseService.getAllInjuries()
    ]);

    res.render('library/index', {
      exercises,
      activeCategory: category || 'all',
      searchQuery: search || '',
      bodyParts,
      injuries,
      activeBodyPart: bodyPart || 'all',
      activeInjury: injury || 'all',
      activeLocation: location || 'all',
      activeSkillLevel: skillLevel || 'all'
    });
  } catch (err) {
    console.error(err);
    req.flash('error', 'Failed to load exercise library');
    res.redirect('/dashboard');
  }
};

/**
 * GET /library/:id
 * Display single exercise detail
 */
const getExerciseDetail = async (req, res) => {
  try {
    const exercise = await exerciseService.getExerciseById(req.params.id);

    if (!exercise) {
      req.flash('error', 'Exercise not found');
      return res.redirect('/library');
    }

    const userId = req.session.user.id;
    const [savedRoutines, muscles] = await Promise.all([
      db.query(`SELECT id, name FROM Saved_Routine WHERE user_id = ? ORDER BY name ASC`, [userId]).then(([r]) => r),
      exerciseService.getMusclesForExercise(req.params.id)
    ]);

    res.render('library/detail', { exercise, savedRoutines, muscles });
  } catch (err) {
    console.error(err);
    req.flash('error', 'Failed to load exercise details');
    res.redirect('/library');
  }
};

/**
 * GET /library/search
 * Search exercises by name
 */
const searchExercises = async (req, res) => {
  try {
    const { q } = req.query;

    if (!q || q.trim().length === 0) {
      return res.redirect('/library');
    }

    const exercises = await exerciseService.searchExercises(q);

    res.render('library/search', {
      exercises,
      searchQuery: q
    });
  } catch (err) {
    console.error(err);
    req.flash('error', 'Search failed');
    res.redirect('/library');
  }
};

/**
 * GET /library/suggestions?q=
 * Returns JSON array of matching exercise names for autocomplete
 */
const getSuggestions = async (req, res) => {
  try {
    const { q } = req.query;
    if (!q || q.trim().length < 2) return res.json([]);

    const exercises = await exerciseService.searchExercises(q.trim());
    const suggestions = exercises.slice(0, 8).map(e => ({
      id: e.id,
      name: e.name,
      category: e.category
    }));
    res.json(suggestions);
  } catch (err) {
    console.error(err);
    res.json([]);
  }
};

module.exports = {
  getLibrary,
  getExerciseDetail,
  searchExercises,
  getSuggestions
};
