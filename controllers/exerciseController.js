const ExerciseService = require('../services/ExerciseService');

const exerciseService = new ExerciseService();

/**
 * GET /library
 * Display exercise library with optional filters
 */
const getLibrary = async (req, res) => {
  try {
    const { category, difficulty, search } = req.query;

    const filters = {};
    if (category && category !== 'all') filters.category = category;
    if (difficulty) filters.difficulty = difficulty;
    if (search) filters.search = search;

    const exercises = await exerciseService.getAllExercises(filters);

    res.render('library/index', {
      exercises,
      activeCategory: category || 'all',
      searchQuery: search || ''
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

    res.render('library/detail', { exercise });
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

module.exports = {
  getLibrary,
  getExerciseDetail,
  searchExercises
};
