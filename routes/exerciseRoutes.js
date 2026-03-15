const express = require('express');
const router = express.Router();
const { isAuthenticated } = require('../middleware/auth');
const ctrl = require('../controllers/exerciseController');

// All routes require authentication
router.get('/library', isAuthenticated, ctrl.getLibrary);
router.get('/library/search', isAuthenticated, ctrl.searchExercises);
router.get('/library/suggestions', isAuthenticated, ctrl.getSuggestions);
router.get('/library/:id', isAuthenticated, ctrl.getExerciseDetail);

module.exports = router;
