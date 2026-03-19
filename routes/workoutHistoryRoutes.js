const express = require('express');
const router = express.Router();
const { isAuthenticated } = require('../middleware/auth');
const { getWorkoutHistory, getWorkoutHistoryDetail } = require('../controllers/workoutHistoryController');

router.get('/', isAuthenticated, getWorkoutHistory);
router.get('/:id', isAuthenticated, getWorkoutHistoryDetail);

module.exports = router;
