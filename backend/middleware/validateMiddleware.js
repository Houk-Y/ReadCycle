/**
 * Validation Middleware
 * Express-validator rules for all routes
 */

const { body, validationResult } = require('express-validator');

// ─── Validation Result Handler ────────────────────────────────────────────────

const handleValidation = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array().map((e) => ({ field: e.path, message: e.msg })),
    });
  }
  next();
};

// ─── Auth Validators ──────────────────────────────────────────────────────────

const validateRegister = [
  body('name').trim().notEmpty().withMessage('Name is required').isLength({ max: 50 }),
  body('email').isEmail().withMessage('Valid email is required').normalizeEmail(),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  handleValidation,
];

const validateLogin = [
  body('email').isEmail().withMessage('Valid email is required').normalizeEmail(),
  body('password').notEmpty().withMessage('Password is required'),
  handleValidation,
];

// ─── Book Validators ──────────────────────────────────────────────────────────

const validateBook = [
  body('title').trim().notEmpty().withMessage('Title is required').isLength({ max: 200 }),
  body('author').trim().notEmpty().withMessage('Author is required').isLength({ max: 100 }),
  body('price').isFloat({ min: 0 }).withMessage('Price must be a non-negative number'),
  body('condition')
    .isIn(['new', 'like-new', 'good', 'fair', 'poor'])
    .withMessage('Invalid condition value'),
  body('category')
    .isIn([
      'fiction','non-fiction','science','history','biography',
      'self-help','technology','business','children','academic',
      'art','travel','cooking','health','religion','other',
    ])
    .withMessage('Invalid category'),
  handleValidation,
];

// ─── Message Validators ───────────────────────────────────────────────────────

const validateMessage = [
  body('content').trim().notEmpty().withMessage('Message content is required').isLength({ max: 1000 }),
  handleValidation,
];

module.exports = { validateRegister, validateLogin, validateBook, validateMessage, handleValidation };