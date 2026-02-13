const { body, validationResult } = require('express-validator');

const validateRegistration = [
  body('username').trim().notEmpty().withMessage('Username is required'),
  body('email').trim().isEmail().withMessage('Valid email is required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('confirmPassword').custom((value, { req }) => {
    if (value !== req.body.password) {
      throw new Error('Passwords do not match');
    }
    return true;
  })
];

const validateLogin = [
  body('username').trim().notEmpty().withMessage('Username is required'),
  body('password').notEmpty().withMessage('Password is required')
];

const validateProfile = [
  body('fitnessLevel').optional().isIn(['beginner', 'intermediate', 'advanced']).withMessage('Invalid fitness level'),
  body('exercisePreference').optional().isIn(['stretch', 'strengthen', 'both']).withMessage('Invalid preference')
];

const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    req.flash('error', errors.array().map(e => e.msg).join(', '));
    return res.redirect('back');
  }
  next();
};

module.exports = {
  validateRegistration,
  validateLogin,
  validateProfile,
  handleValidationErrors
};
