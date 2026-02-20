/**
 * routes/userRoutes.js
 */

const express       = require('express'); //import express module
const router        = express.Router();//create router instance
const path          = require('path'); //import path module
// const registerController = require('../controllers/registerController'); //import register controller
// const loginController    = require('../controllers/loginController');    //import login controller
// const logoutController   = require('../controllers/logoutController');   //import logout controller
const {isAuthenticated} = require('../middleware/auth');              //import authentication middleware
const dashboardController = require('../controllers/dashboardController'); //import dashboard controller
// const locationSelectorController = require('../controllers/locationSelectorController'); //import location controller
// const categorySelectorController = require('../controllers/categorySelectorController'); //import category controller
// const muscleGroupSelectorController = require("../controllers/muscleGroupSelectorController"); //import muscle group controller
// const exerciseSearchController = require('../controllers/exerciseSearchController'); //import exercise search controller
// const {convertMuscleGroupAndCategoryInSessionToArray, resetMuscleGroupAndCategoryInSession} = require('../middleware/muscleSessionHandler'); //import muscle session handler middleware
// const exerciseRoutineController = require('../controllers/exerciseRoutineController'); //import exercise routine controller/
// const favouriteExercisesController = require('../controllers/favouriteExercisesController'); //import favourite exercises controller
const twofaCtrl     = require('../controllers/twofacontroller');                //import 2FA controller

// — Setup 2FA —
router.get( '/twofa/setup',  isAuthenticated, twofaCtrl.getTwofaSetup);
router.post('/twofa/setup',  isAuthenticated, twofaCtrl.postTwofaSetup);

// — Verify 2FA at login —
router.get( '/twofa/verify', twofaCtrl.getTwofaVerify);
router.post('/twofa/verify', twofaCtrl.postTwofaVerify);

// — Disable 2FA —
router.get( '/twofa/disable', isAuthenticated, twofaCtrl.disableTwofa);

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
//  */
// router.post('/login', loginController.login);

// /**
//  * route to logout user and clear session
//  */
// router.get('/logout', logoutController.logout);

/**
 * route to get dashboard view but iss session first
 */
// router.get('/dashboard', isAuthenticated, dashboardController.showDashboard);

// /**
//  * route to start a workout. goes to locationController.js which links to whereView.ejs
//  */
// router.get('/workouts', isAuthenticated, locationSelectorController.showWhereView);

// /**
//  * route for selecting a location from the where view.
//  */
// router.post('/whereSelect', isAuthenticated, locationSelectorController.whereSelect);

// /**
//  * route to category selector controller which renders categoryView.ejs
//  */
// router.get('/category', isAuthenticated, categorySelectorController.showCategoryView);

// /**
//  * route for saving muscle group and category in session to session array, and redirecting to category view.
//  */
// router.get('/saveAndNewSearch', isAuthenticated, convertMuscleGroupAndCategoryInSessionToArray, categorySelectorController.showCategoryView);

/**
 * route for resetting the session array of muscle groups and categories, and the muscle group and category session variables and redirecting to category view.
 */
// router.get('/resetAndNewSearch', isAuthenticated, resetMuscleGroupAndCategoryInSession, categorySelectorController.showCategoryView);

// /**
//  * route for selecting a category from the category view.
//  */
// router.post('/categorySelect', isAuthenticated, categorySelectorController.categorySelect);

// /**
//  * muscle group selector controller which renders muscleGroupView.ejs
//  */
// router.get('/muscleGroup', isAuthenticated, muscleGroupSelectorController.showMuscleGroupView);

// /**
//  * route for selecting a muscle group from the muscle group view.
//  */
// router.post('/muscleGroupSelect', isAuthenticated, muscleGroupSelectorController.muscleGroupSelect);

// /**
//  * route for searching exercises based on muscle group, location, and category.
//  */
// router.get('/exerciseSearch', isAuthenticated, convertMuscleGroupAndCategoryInSessionToArray, exerciseSearchController.searchExercise);

// /**
//  * route for showing exercise routine view with exercises from search.
//  */
// router.post('/showExerciseRoutine', isAuthenticated, exerciseRoutineController.showExerciseRoutineView);

// router.post('/removeExerciseFromRoutine', isAuthenticated, exerciseRoutineController.removeExerciseFromRoutine);

// router.post('/markExerciseAsFinished', isAuthenticated, exerciseRoutineController.markExerciseAsFinished);

// router.post('/restartRoutine', isAuthenticated, exerciseRoutineController.restartRoutine);

// router.get('/showRoutine', isAuthenticated, exerciseRoutineController.justShowTheView);

// router.get('/getAndShowFavourites', isAuthenticated, favouriteExercisesController.getAndShowFavourites);

// router.post('/submitFavouritesForm', isAuthenticated, favouriteExercisesController.submitFavouritesForm);

// router.post('/addExerciseToFavouritesThenShowFavourites', isAuthenticated, favouriteExercisesController.addExerciseToFavouritesThenShowFavourites);


module.exports = router; //export router instance
