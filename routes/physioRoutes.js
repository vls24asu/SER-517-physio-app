const express = require('express');
const router = express.Router();
const { isAuthenticated } = require('../middleware/auth');
const { requireRole } = require('../middleware/role');
const physioCtrl = require('../controllers/physioController');

const isPhysio = [isAuthenticated, requireRole('physio')];

router.get('/dashboard',          ...isPhysio, physioCtrl.getDashboard);
router.get('/patients',           ...isPhysio, physioCtrl.getPatients);
router.get('/patients/:id',       ...isPhysio, physioCtrl.getPatientProfile);
router.post('/patients/:id/assign', ...isPhysio, physioCtrl.assignPatient);

module.exports = router;
