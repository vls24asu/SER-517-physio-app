const { body, validationResult } = require('express-validator');

const validateRegistration = [
  body('fullName').trim().notEmpty().withMessage('Full name is required'),
  body('email').trim().isEmail().withMessage('Valid email is required'),
  body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters'),
];

const validateLogin = [
  body('email').trim().isEmail().withMessage('Valid email is required'),
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
