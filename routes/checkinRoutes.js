const express = require('express');
const router = express.Router();
const { isAuthenticated } = require('../middleware/auth');
const checkinController = require('../controllers/checkinController');

// Daily check-in gate — "How are you feeling today?"
router.get('/', isAuthenticated, checkinController.getCheckin);
router.post('/', isAuthenticated, checkinController.postCheckin);

// Not good — "What is bothering you today?"
router.get('/not-good', isAuthenticated, checkinController.getNotGood);
router.post('/not-good', isAuthenticated, checkinController.postNotGood);

// Injury detail questions (body area, pain level, goal, environment, equipment)
router.get('/injury', isAuthenticated, checkinController.getInjury);
router.post('/injury', isAuthenticated, checkinController.postInjury);

// Recovery / light day options
router.get('/recovery', isAuthenticated, checkinController.getRecovery);
router.post('/recovery', isAuthenticated, checkinController.postRecovery);

// Filtered exercise recommendation
router.get('/recommend', isAuthenticated, checkinController.getRecommend);

// Save recommended routine and go straight to its preview/start page
router.post('/save-and-start', isAuthenticated, checkinController.saveAndStart);

module.exports = router;
