const express = require('express');
const { getProfile, updateProfile, getStats } = require('../controllers/userController');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

router.use(authenticate);

router.get('/me',       getProfile);
router.patch('/me',     updateProfile);
router.get('/me/stats', getStats);

module.exports = router;
