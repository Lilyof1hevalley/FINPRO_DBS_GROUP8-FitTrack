const pool = require('../db/pool');

// POST /api/workouts  — start / create a session
const createSession = async (req, res, next) => {
  try {
    const { title, notes, duration_min, started_at, ended_at } = req.body;
    const { rows } = await pool.query(
      `INSERT INTO workout_sessions (user_id, title, notes, duration_min, started_at, ended_at)
       VALUES ($1,$2,$3,$4,$5,$6)
       RETURNING *`,
      [req.user.id, title, notes, duration_min,
       started_at || new Date(), ended_at || null]
    );
    return res.status(201).json(rows[0]);
  } catch (err) {
    next(err);
  }
};

// GET /api/workouts  — paginated history
const getSessions = async (req, res, next) => {
  try {
    const page  = Math.max(parseInt(req.query.page  || '1'),  1);
    const limit = Math.min(parseInt(req.query.limit || '10'), 50);
    const offset = (page - 1) * limit;

    const [dataRes, countRes] = await Promise.all([
      pool.query(
        `SELECT ws.*,
                COUNT(wl.id) AS total_sets,
                COALESCE(SUM(wl.weight_kg * wl.reps), 0) AS total_volume_kg
         FROM workout_sessions ws
         LEFT JOIN workout_logs wl ON wl.session_id = ws.id
         WHERE ws.user_id = $1
         GROUP BY ws.id
         ORDER BY ws.started_at DESC
         LIMIT $2 OFFSET $3`,
        [req.user.id, limit, offset]
      ),
      pool.query(
        'SELECT COUNT(*) FROM workout_sessions WHERE user_id = $1',
        [req.user.id]
      ),
    ]);

    return res.json({
      data: dataRes.rows,
      pagination: {
        page,
        limit,
        total: parseInt(countRes.rows[0].count),
        total_pages: Math.ceil(countRes.rows[0].count / limit),
      },
    });
  } catch (err) {
    next(err);
  }
};

// GET /api/workouts/:id
const getSession = async (req, res, next) => {
  try {
    const sessionRes = await pool.query(
      'SELECT * FROM workout_sessions WHERE id = $1 AND user_id = $2',
      [req.params.id, req.user.id]
    );
    if (sessionRes.rows.length === 0) return res.status(404).json({ error: 'Session not found' });

    const logsRes = await pool.query(
      `SELECT wl.*, e.name AS exercise_name, e.muscle_group, e.category
       FROM workout_logs wl
       JOIN exercises e ON e.id = wl.exercise_id
       WHERE wl.session_id = $1
       ORDER BY wl.set_number`,
      [req.params.id]
    );

    return res.json({ session: sessionRes.rows[0], logs: logsRes.rows });
  } catch (err) {
    next(err);
  }
};

// PATCH /api/workouts/:id
const updateSession = async (req, res, next) => {
  try {
    const { title, notes, duration_min, ended_at } = req.body;
    const { rows } = await pool.query(
      `UPDATE workout_sessions SET
         title        = COALESCE($1, title),
         notes        = COALESCE($2, notes),
         duration_min = COALESCE($3, duration_min),
         ended_at     = COALESCE($4, ended_at)
       WHERE id = $5 AND user_id = $6
       RETURNING *`,
      [title, notes, duration_min, ended_at, req.params.id, req.user.id]
    );
    if (rows.length === 0) return res.status(404).json({ error: 'Session not found' });
    return res.json(rows[0]);
  } catch (err) {
    next(err);
  }
};

// DELETE /api/workouts/:id
const deleteSession = async (req, res, next) => {
  try {
    const { rowCount } = await pool.query(
      'DELETE FROM workout_sessions WHERE id = $1 AND user_id = $2',
      [req.params.id, req.user.id]
    );
    if (rowCount === 0) return res.status(404).json({ error: 'Session not found' });
    return res.status(204).send();
  } catch (err) {
    next(err);
  }
};

module.exports = { createSession, getSessions, getSession, updateSession, deleteSession };
