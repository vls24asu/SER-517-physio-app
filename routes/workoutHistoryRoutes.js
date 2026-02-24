const express = require('express');
const router = express.Router();
const { isAuthenticated } = require('../middleware/auth');
const { getWorkoutHistory } = require('../controllers/workoutHistoryController');

router.get('/', isAuthenticated, getWorkoutHistory);

module.exports = router;
