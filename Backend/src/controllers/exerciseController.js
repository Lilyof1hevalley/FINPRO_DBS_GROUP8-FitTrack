const pool = require('../db/pool');

// GET /api/exercises?category=strength&muscle_group=Chest
const getExercises = async (req, res, next) => {
  try {
    const { category, muscle_group, search } = req.query;
    let query = 'SELECT * FROM exercises WHERE 1=1';
    const params = [];

    if (category) {
      params.push(category);
      query += ` AND category = $${params.length}`;
    }
    if (muscle_group) {
      params.push(muscle_group);
      query += ` AND muscle_group = $${params.length}`;
    }
    if (search) {
      params.push(`%${search}%`);
      query += ` AND name ILIKE $${params.length}`;
    }

    query += ' ORDER BY name';
    const { rows } = await pool.query(query, params);
    return res.json(rows);
  } catch (err) {
    next(err);
  }
};

// GET /api/exercises/:id
const getExercise = async (req, res, next) => {
  try {
    const { rows } = await pool.query('SELECT * FROM exercises WHERE id = $1', [req.params.id]);
    if (rows.length === 0) return res.status(404).json({ error: 'Exercise not found' });
    return res.json(rows[0]);
  } catch (err) {
    next(err);
  }
};

module.exports = { getExercises, getExercise };
