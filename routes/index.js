const express = require('express');
const router = express.Router();

// Landing Page Route
router.get('/', (req, res) => {
    res.render('landing');
});

// Privacy Policy (public, no auth required)
router.get('/privacy-policy', (req, res) => {
    res.render('privacy-policy');
});

// Terms of Service (public, no auth required)
router.get('/terms-of-service', (req, res) => {
    res.render('terms-of-service');
});

// Mount sub-routers here as they are built:
const authRoutes = require('./authRoutes');
const dashboardRoutes = require('./dashboardRoutes');
const exerciseRoutes = require('./exerciseRoutes');
const routineRoutes = require('./routineRoutes');
// const favouritesRoutes = require('./favouritesRoutes');
const profileRoutes = require('./profileRoutes');
const physioRoutes = require('./physioRoutes');
const userRoutes = require('./userRoutes');
const settingsRoutes = require('./settingsRoutes');
const achievementsRoutes = require('./achievementsRoutes');
const workoutHistoryRoutes = require('./workoutHistoryRoutes');
const progressRoutes = require('./progressRoutes');
const helpRoutes = require('./helpRoutes');
const notificationRoutes = require('./notificationRoutes');
const checkinRoutes = require('./checkinRoutes');

router.use('/', authRoutes);
router.use('/', userRoutes);

router.use('/dashboard', dashboardRoutes);
router.use('/', exerciseRoutes);
router.use('/routines', routineRoutes);
// router.use('/favourites', favouritesRoutes);
router.use('/profile', profileRoutes);
router.use('/settings', settingsRoutes);
router.use('/achievements', achievementsRoutes);
router.use('/workout-history', workoutHistoryRoutes);
router.use('/progress', progressRoutes);
router.use('/help', helpRoutes);
router.use('/notifications', notificationRoutes);
router.use('/checkin', checkinRoutes);
router.use('/physio', physioRoutes);

module.exports = router;
