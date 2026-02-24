const express = require('express');
const router = express.Router();
const { isAuthenticated } = require('../middleware/auth');
const ctrl = require('../controllers/settingsController');

router.get('/', isAuthenticated, ctrl.getSettings);

router.get('/personal-info', isAuthenticated, ctrl.getPersonalInfo);
router.post('/personal-info', isAuthenticated, ctrl.postPersonalInfo);

router.get('/body-metrics', isAuthenticated, ctrl.getBodyMetrics);
router.post('/body-metrics', isAuthenticated, ctrl.postBodyMetrics);

router.get('/password', isAuthenticated, ctrl.getPassword);
router.post('/password', isAuthenticated, ctrl.postPassword);

router.get('/goals', isAuthenticated, ctrl.getGoals);
router.post('/goals', isAuthenticated, ctrl.postGoals);

router.get('/pain-management', isAuthenticated, ctrl.getPainManagement);
router.post('/pain-management', isAuthenticated, ctrl.postPainManagement);

module.exports = router;
