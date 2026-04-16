const express = require('express');
const router = express.Router();
const { isAuthenticated } = require('../middleware/auth');
const ctrl = require('../controllers/exerciseController');

// All routes require authentication
router.get('/library', isAuthenticated, ctrl.getLibrary);
router.get('/library/search', isAuthenticated, ctrl.searchExercises);
router.get('/library/suggestions', isAuthenticated, ctrl.getSuggestions);
router.get('/library/programs', isAuthenticated, ctrl.getPrograms);
router.get('/library/programs/:id/session', isAuthenticated, ctrl.startProgramSession);
router.post('/library/programs/:id/log-session', isAuthenticated, ctrl.logProgramSession);
router.post('/library/programs/:id/feedback', isAuthenticated, ctrl.logProgramFeedback);
router.get('/library/programs/:id', isAuthenticated, ctrl.getProgramDetail);
router.get('/library/:id', isAuthenticated, ctrl.getExerciseDetail);

module.exports = router;
