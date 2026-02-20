/**
 * routes/userRoutes.js
 */

const express       = require('express'); //import express module
const router        = express.Router();//create router instance
const path          = require('path'); //import path module
const registerController = require('../controllers/registerController'); //import register controller
const loginController    = require('../controllers/loginController');    //import login controller
const logoutController   = require('../controllers/logoutController');   //import logout controller
const {checkAuthenticated} = require('../middleware/auth');              //import authentication middleware
const dashboardController = require('../controllers/dashboardController'); //import dashboard controller
const locationSelectorController = require('../controllers/locationSelectorController'); //import location controller
const categorySelectorController = require('../controllers/categorySelectorController'); //import category controller
const muscleGroupSelectorController = require("../controllers/muscleGroupSelectorController"); //import muscle group controller
const exerciseSearchController = require('../controllers/exerciseSearchController'); //import exercise search controller
const {convertMuscleGroupAndCategoryInSessionToArray, resetMuscleGroupAndCategoryInSession} = require('../middleware/muscleSessionHandler'); //import muscle session handler middleware
const exerciseRoutineController = require('../controllers/exerciseRoutineController'); //import exercise routine controller
const favouriteExercisesController = require('../controllers/favouriteExercisesController'); //import favourite exercises controller
const twofaCtrl     = require('../controllers/twofacontroller');                //import 2FA controller

// — Setup 2FA —
router.get( '/twofa/setup',  checkAuthenticated, twofaCtrl.getTwofaSetup);
router.post('/twofa/setup',  checkAuthenticated, twofaCtrl.postTwofaSetup);

// — Verify 2FA at login —
router.get( '/twofa/verify', twofaCtrl.getTwofaVerify);
router.post('/twofa/verify', twofaCtrl.postTwofaVerify);

// — Disable 2FA —
router.get( '/twofa/disable', checkAuthenticated, twofaCtrl.disableTwofa);

/**
 * route to register view.
 */
// router.get('/register', (req, res) => {
//     res.sendFile(path.join(__dirname, "../views/register.html"));
// })

// /**
//  * route to post to register with new account info
//  */
// router.post('/register', registerController.register);

// /**
//  * route to get login view.
//  */
// router.get('/login', (req, res) => {
//     res.sendFile(path.join(__dirname, "../views/login.html"));
// });

/**
 * route to post to login with existing account info
 */
router.post('/login', loginController.login);

/**
 * route to logout user and clear session
 */
router.get('/logout', logoutController.logout);

/**
 * route to get dashboard view but checks session first
 */
// router.get('/dashboard', checkAuthenticated, dashboardController.showDashboard);

// /**
//  * route to start a workout. goes to locationController.js which links to whereView.ejs
//  */
// router.get('/workouts', checkAuthenticated, locationSelectorController.showWhereView);

// /**
//  * route for selecting a location from the where view.
//  */
// router.post('/whereSelect', checkAuthenticated, locationSelectorController.whereSelect);

// /**
//  * route to category selector controller which renders categoryView.ejs
//  */
// router.get('/category', checkAuthenticated, categorySelectorController.showCategoryView);

// /**
//  * route for saving muscle group and category in session to session array, and redirecting to category view.
//  */
// router.get('/saveAndNewSearch', checkAuthenticated, convertMuscleGroupAndCategoryInSessionToArray, categorySelectorController.showCategoryView);

/**
 * route for resetting the session array of muscle groups and categories, and the muscle group and category session variables and redirecting to category view.
 */
// router.get('/resetAndNewSearch', checkAuthenticated, resetMuscleGroupAndCategoryInSession, categorySelectorController.showCategoryView);

// /**
//  * route for selecting a category from the category view.
//  */
// router.post('/categorySelect', checkAuthenticated, categorySelectorController.categorySelect);

// /**
//  * muscle group selector controller which renders muscleGroupView.ejs
//  */
// router.get('/muscleGroup', checkAuthenticated, muscleGroupSelectorController.showMuscleGroupView);

// /**
//  * route for selecting a muscle group from the muscle group view.
//  */
// router.post('/muscleGroupSelect', checkAuthenticated, muscleGroupSelectorController.muscleGroupSelect);

// /**
//  * route for searching exercises based on muscle group, location, and category.
//  */
// router.get('/exerciseSearch', checkAuthenticated, convertMuscleGroupAndCategoryInSessionToArray, exerciseSearchController.searchExercise);

// /**
//  * route for showing exercise routine view with exercises from search.
//  */
// router.post('/showExerciseRoutine', checkAuthenticated, exerciseRoutineController.showExerciseRoutineView);

// router.post('/removeExerciseFromRoutine', checkAuthenticated, exerciseRoutineController.removeExerciseFromRoutine);

// router.post('/markExerciseAsFinished', checkAuthenticated, exerciseRoutineController.markExerciseAsFinished);

// router.post('/restartRoutine', checkAuthenticated, exerciseRoutineController.restartRoutine);

// router.get('/showRoutine', checkAuthenticated, exerciseRoutineController.justShowTheView);

// router.get('/getAndShowFavourites', checkAuthenticated, favouriteExercisesController.getAndShowFavourites);

// router.post('/submitFavouritesForm', checkAuthenticated, favouriteExercisesController.submitFavouritesForm);

// router.post('/addExerciseToFavouritesThenShowFavourites', checkAuthenticated, favouriteExercisesController.addExerciseToFavouritesThenShowFavourites);


module.exports = router; //export router instance
