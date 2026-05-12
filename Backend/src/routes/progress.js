const express = require('express');
const { strengthOverTime, weeklyVolume, personalRecords, workoutFrequency } = require('../controllers/progressController');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

router.use(authenticate);

router.get('/strength',         strengthOverTime);
router.get('/volume',           weeklyVolume);
router.get('/personal-records', personalRecords);
router.get('/frequency',        workoutFrequency);

module.exports = router;
