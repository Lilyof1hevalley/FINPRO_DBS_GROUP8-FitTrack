const express = require('express');
const { body } = require('express-validator');
const { register, login, googleLogin } = require('../controllers/authController');
const { validate } = require('../middleware/errorHandler');

const router = express.Router();

router.post('/register',
  [
    body('username').trim().isLength({ min: 3, max: 50 }).withMessage('Username must be 3–50 chars'),
    body('email').isEmail().normalizeEmail(),
    body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters'),
    body('experience_level').optional().isIn(['beginner','intermediate','advanced']),
    body('fitness_goal').optional().isIn(['weight_loss','muscle_gain','endurance','flexibility','general_fitness','strength']),
  ],
  validate,
  register
);

router.post('/login',
  [
    body('email').isEmail().normalizeEmail(),
    body('password').notEmpty(),
  ],
  validate,
  login
);

// Tambahan baru
router.post('/google', googleLogin);

module.exports = router;