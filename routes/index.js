const express = require('express');
const router = express.Router();

// Mount sub-routers here as they are built:
const authRoutes = require('./authRoutes');
const dashboardRoutes = require('./dashboardRoutes');
// const exerciseRoutes = require('./exerciseRoutes');
// const routineRoutes = require('./routineRoutes');
// const favouritesRoutes = require('./favouritesRoutes');
const profileRoutes = require('./profileRoutes');
// const physioRoutes = require('./physioRoutes');
const userRoutes = require("./userRoutes");       // your big file
// or split further: const authRoutes = require("./authRoutes");

router.use("/", userRoutes);
router.use('/', authRoutes);
router.use('/dashboard', dashboardRoutes);
// router.use('/exercises', exerciseRoutes);
// router.use('/routines', routineRoutes);
// router.use('/favourites', favouritesRoutes);
router.use('/profile', profileRoutes);
// router.use('/physio', physioRoutes);

module.exports = router;
