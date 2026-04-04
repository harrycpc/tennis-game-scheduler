// middleware/validateMiddleware.js - Request validation rules
const { body, validationResult } = require('express-validator');

// Return validation errors as JSON
const handleValidation = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ message: errors.array()[0].msg });
  }
  next();
};

// ---------- Auth validation ----------
const validateRegister = [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('email').isEmail().withMessage('Please provide a valid email'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters'),
  handleValidation,
];

const validateLogin = [
  body('email').isEmail().withMessage('Please provide a valid email'),
  body('password').notEmpty().withMessage('Password is required'),
  handleValidation,
];

// ---------- Player validation ----------
const validatePlayer = [
  body('name').trim().notEmpty().withMessage('Player name is required'),
  handleValidation,
];

// ---------- Match validation ----------
const validateMatch = [
  body('player1').trim().notEmpty().withMessage('Player 1 is required'),
  body('player2').trim().notEmpty().withMessage('Player 2 is required'),
  body('courtName').trim().notEmpty().withMessage('Court name is required'),
  body('timeSlot').trim().notEmpty().withMessage('Time slot is required'),
  handleValidation,
];

const validateGenerateMatches = [
  body('totalCourts')
    .isInt({ min: 1, max: 10 })
    .withMessage('Total courts must be between 1 and 10'),
  body('startHour')
    .isInt({ min: 0, max: 23 })
    .withMessage('Start hour must be between 0 and 23'),
  handleValidation,
];

module.exports = {
  validateRegister,
  validateLogin,
  validatePlayer,
  validateMatch,
  validateGenerateMatches,
};
