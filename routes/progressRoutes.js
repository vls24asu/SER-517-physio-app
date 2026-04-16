const express = require('express');
const router = express.Router();
const { isAuthenticated } = require('../middleware/auth');
const { getProgress, addFocusArea, removeFocusArea, getCheckin, getCheckinData, saveCheckin } = require('../controllers/progressController');

router.get('/', isAuthenticated, getProgress);
router.post('/focus-area', isAuthenticated, addFocusArea);
router.delete('/focus-area', isAuthenticated, removeFocusArea);
router.get('/checkin/:area/data', isAuthenticated, getCheckinData);
router.get('/checkin/:area', isAuthenticated, getCheckin);
router.post('/checkin/:area', isAuthenticated, saveCheckin);

module.exports = router;
