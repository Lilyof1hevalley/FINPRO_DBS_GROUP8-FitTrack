const pool = require('../db/pool');

// Helper — verify session belongs to user
const ownsSession = async (sessionId, userId) => {
  const { rows } = await pool.query(
    'SELECT id FROM workout_sessions WHERE id = $1 AND user_id = $2',
    [sessionId, userId]
  );
  return rows.length > 0;
};

// POST /api/workouts/:sessionId/logs
const addLog = async (req, res, next) => {
  try {
    const sessionId = parseInt(req.params.sessionId);
    if (!(await ownsSession(sessionId, req.user.id))) {
      return res.status(404).json({ error: 'Session not found' });
    }

    const { exercise_id, set_number, reps, weight_kg, duration_sec, notes } = req.body;
    const { rows } = await pool.query(
      `INSERT INTO workout_logs (session_id, exercise_id, set_number, reps, weight_kg, duration_sec, notes)
       VALUES ($1,$2,$3,$4,$5,$6,$7)
       RETURNING *`,
      [sessionId, exercise_id, set_number, reps, weight_kg, duration_sec, notes]
    );
    return res.status(201).json(rows[0]);
  } catch (err) {
    next(err);
  }
};

// POST /api/workouts/:sessionId/logs/bulk  — add multiple sets at once
const addLogsBulk = async (req, res, next) => {
  try {
    const sessionId = parseInt(req.params.sessionId);
    if (!(await ownsSession(sessionId, req.user.id))) {
      return res.status(404).json({ error: 'Session not found' });
    }

    const { logs } = req.body; // array of { exercise_id, set_number, reps, weight_kg, ... }
    if (!Array.isArray(logs) || logs.length === 0) {
      return res.status(422).json({ error: '`logs` must be a non-empty array' });
    }

    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      const inserted = [];
      for (const log of logs) {
        const { rows } = await client.query(
          `INSERT INTO workout_logs (session_id, exercise_id, set_number, reps, weight_kg, duration_sec, notes)
           VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING *`,
          [sessionId, log.exercise_id, log.set_number, log.reps,
           log.weight_kg, log.duration_sec, log.notes]
        );
        inserted.push(rows[0]);
      }
      await client.query('COMMIT');
      return res.status(201).json(inserted);
    } catch (e) {
      await client.query('ROLLBACK');
      throw e;
    } finally {
      client.release();
    }
  } catch (err) {
    next(err);
  }
};

// DELETE /api/workouts/:sessionId/logs/:logId
const deleteLog = async (req, res, next) => {
  try {
    const sessionId = parseInt(req.params.sessionId);
    if (!(await ownsSession(sessionId, req.user.id))) {
      return res.status(404).json({ error: 'Session not found' });
    }

    const { rowCount } = await pool.query(
      'DELETE FROM workout_logs WHERE id = $1 AND session_id = $2',
      [req.params.logId, sessionId]
    );
    if (rowCount === 0) return res.status(404).json({ error: 'Log not found' });
    return res.status(204).send();
  } catch (err) {
    next(err);
  }
};

module.exports = { addLog, addLogsBulk, deleteLog };
