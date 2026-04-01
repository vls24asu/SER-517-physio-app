const express = require('express');
const router = express.Router();
const { isAuthenticated } = require('../middleware/auth');
const { getProgress, addFocusArea, getCheckin, saveCheckin } = require('../controllers/progressController');

router.get('/', isAuthenticated, getProgress);
router.post('/focus-area', isAuthenticated, addFocusArea);
router.get('/checkin/:area', isAuthenticated, getCheckin);
router.post('/checkin/:area', isAuthenticated, saveCheckin);

module.exports = router;
