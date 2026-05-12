const express = require('express');
const { createSession, getSessions, getSession, updateSession, deleteSession } = require('../controllers/workoutController');
const { addLog, addLogsBulk, deleteLog } = require('../controllers/logController');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

router.use(authenticate);

// Sessions
router.post('/',         createSession);
router.get('/',          getSessions);
router.get('/:id',       getSession);
router.patch('/:id',     updateSession);
router.delete('/:id',    deleteSession);

// Logs (sets) within a session
router.post('/:sessionId/logs',       addLog);
router.post('/:sessionId/logs/bulk',  addLogsBulk);
router.delete('/:sessionId/logs/:logId', deleteLog);

module.exports = router;
