const pool = require('../db/pool');

// GET /api/progress/strength?exercise_id=1&weeks=8
// Returns max weight per day for a given exercise — for strength-over-time chart
const strengthOverTime = async (req, res, next) => {
  try {
    const { exercise_id, weeks = 8 } = req.query;
    if (!exercise_id) return res.status(422).json({ error: 'exercise_id is required' });

    const { rows } = await pool.query(
      `SELECT DATE(ws.started_at) AS workout_date,
              MAX(wl.weight_kg)   AS max_weight_kg,
              SUM(wl.reps)        AS total_reps
       FROM workout_logs wl
       JOIN workout_sessions ws ON ws.id = wl.session_id
       WHERE ws.user_id = $1
         AND wl.exercise_id = $2
         AND ws.started_at >= NOW() - ($3 || ' weeks')::INTERVAL
       GROUP BY DATE(ws.started_at)
       ORDER BY workout_date ASC`,
      [req.user.id, exercise_id, weeks]
    );
    return res.json(rows);
  } catch (err) {
    next(err);
  }
};

// GET /api/progress/volume?weeks=8
// Returns weekly total volume (weight × reps) — for weekly-volume chart
const weeklyVolume = async (req, res, next) => {
  try {
    const weeks = parseInt(req.query.weeks || '8');
    const { rows } = await pool.query(
      `SELECT DATE_TRUNC('week', ws.started_at) AS week_start,
              COALESCE(SUM(wl.weight_kg * wl.reps), 0) AS total_volume_kg,
              COUNT(DISTINCT ws.id) AS sessions
       FROM workout_sessions ws
       LEFT JOIN workout_logs wl ON wl.session_id = ws.id
       WHERE ws.user_id = $1
         AND ws.started_at >= NOW() - ($2 || ' weeks')::INTERVAL
       GROUP BY week_start
       ORDER BY week_start ASC`,
      [req.user.id, weeks]
    );
    return res.json(rows);
  } catch (err) {
    next(err);
  }
};

// GET /api/progress/personal-records
// Best (max weight) set ever logged per exercise
const personalRecords = async (req, res, next) => {
  try {
    const { rows } = await pool.query(
      `SELECT e.id AS exercise_id, e.name AS exercise_name, e.muscle_group,
              MAX(wl.weight_kg) AS max_weight_kg,
              (SELECT wl2.reps FROM workout_logs wl2
               JOIN workout_sessions ws2 ON ws2.id = wl2.session_id
               WHERE ws2.user_id = $1 AND wl2.exercise_id = e.id
               ORDER BY wl2.weight_kg DESC LIMIT 1) AS reps_at_max,
              MAX(ws.started_at) AS last_performed
       FROM workout_logs wl
       JOIN workout_sessions ws ON ws.id = wl.session_id
       JOIN exercises e ON e.id = wl.exercise_id
       WHERE ws.user_id = $1 AND wl.weight_kg IS NOT NULL
       GROUP BY e.id, e.name, e.muscle_group
       ORDER BY e.name`,
      [req.user.id]
    );
    return res.json(rows);
  } catch (err) {
    next(err);
  }
};

// GET /api/progress/frequency?weeks=12
// Number of workouts per week — for consistency chart
const workoutFrequency = async (req, res, next) => {
  try {
    const weeks = parseInt(req.query.weeks || '12');
    const { rows } = await pool.query(
      `SELECT DATE_TRUNC('week', started_at) AS week_start,
              COUNT(*) AS session_count,
              COALESCE(SUM(duration_min), 0) AS total_minutes
       FROM workout_sessions
       WHERE user_id = $1
         AND started_at >= NOW() - ($2 || ' weeks')::INTERVAL
       GROUP BY week_start
       ORDER BY week_start ASC`,
      [req.user.id, weeks]
    );
    return res.json(rows);
  } catch (err) {
    next(err);
  }
};

module.exports = { strengthOverTime, weeklyVolume, personalRecords, workoutFrequency };
