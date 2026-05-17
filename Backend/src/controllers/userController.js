const pool = require('../db/pool');

// GET /api/users/me
const getProfile = async (req, res, next) => {
  try {
    const { rows } = await pool.query(
      `SELECT id, username, email, full_name, age, weight_kg, height_cm,
              experience_level, fitness_goal, created_at, updated_at
       FROM users WHERE id = $1`,
      [req.user.id]
    );
    
    if (rows.length === 0) return res.status(404).json({ error: 'User not found' });
    
    return res.json(rows[0]);
  } catch (err) {
    next(err);
  }
};

// PATCH /api/users/me
const updateProfile = async (req, res, next) => {
  try {
    const { full_name, age, weight_kg, height_cm, experience_level, fitness_goal } = req.body;

    const { rows } = await pool.query(
      `UPDATE users SET
         full_name        = COALESCE($1, full_name),
         age              = COALESCE($2, age),
         weight_kg        = COALESCE($3, weight_kg),
         height_cm        = COALESCE($4, height_cm),
         experience_level = COALESCE($5, experience_level),
         fitness_goal     = COALESCE($6, fitness_goal),
         updated_at       = NOW()
       WHERE id = $7
       RETURNING id, username, email, full_name, age, weight_kg, height_cm,
                 experience_level, fitness_goal, updated_at`,
      [full_name, age, weight_kg, height_cm, experience_level, fitness_goal, req.user.id]
    );

    return res.json(rows[0]);
  } catch (err) {
    next(err);
  }
};

// GET /api/users/me/stats  — aggregated progress numbers
const getStats = async (req, res, next) => {
  try {
    const userId = req.user.id;

    const [sessionsRes, volumeRes, topExercisesRes] = await Promise.all([
      // total sessions + total duration
      pool.query(
        `SELECT COUNT(*) AS total_sessions,
                COALESCE(SUM(duration_min), 0) AS total_minutes
         FROM workout_sessions WHERE user_id = $1`,
        [userId]
      ),
      // total volume lifted (weight × reps) across all logs
      pool.query(
        `SELECT COALESCE(SUM(wl.weight_kg * wl.reps), 0) AS total_volume_kg
         FROM workout_logs wl
         JOIN workout_sessions ws ON ws.id = wl.session_id
         WHERE ws.user_id = $1`,
        [userId]
      ),
      // top 5 most-trained exercises
      pool.query(
        `SELECT e.name, COUNT(*) AS sets_logged
         FROM workout_logs wl
         JOIN workout_sessions ws ON ws.id = wl.session_id
         JOIN exercises e ON e.id = wl.exercise_id
         WHERE ws.user_id = $1
         GROUP BY e.name
         ORDER BY sets_logged DESC
         LIMIT 5`,
        [userId]
      ),
    ]);

    return res.json({
      total_sessions: parseInt(sessionsRes.rows[0].total_sessions),
      total_minutes: parseInt(sessionsRes.rows[0].total_minutes),
      total_volume_kg: parseFloat(volumeRes.rows[0].total_volume_kg),
      top_exercises: topExercisesRes.rows,
    });
  } catch (err) {
    next(err);
  }
};

// DELETE /api/users/me — delete user account
const deleteAccount = async (req, res, next) => {
  try {
    await pool.query('DELETE FROM users WHERE id = $1', [req.user.id]);
    
    res.json({ message: 'Account deleted successfully' });
  } catch (err) {
    next(err);
  }
};

module.exports = { getProfile, updateProfile, getStats, deleteAccount };