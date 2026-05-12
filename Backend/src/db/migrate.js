require('dotenv').config();
const pool = require('./pool');

const migrate = async () => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // ─── ENUM TYPES ────────────────────────────────────────────────────────────
    await client.query(`
      DO $$ BEGIN
        CREATE TYPE experience_level AS ENUM ('beginner', 'intermediate', 'advanced');
      EXCEPTION WHEN duplicate_object THEN NULL;
      END $$;
    `);

    await client.query(`
      DO $$ BEGIN
        CREATE TYPE fitness_goal AS ENUM (
          'weight_loss', 'muscle_gain', 'endurance',
          'flexibility', 'general_fitness', 'strength'
        );
      EXCEPTION WHEN duplicate_object THEN NULL;
      END $$;
    `);

    // ─── USERS ─────────────────────────────────────────────────────────────────
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id            SERIAL PRIMARY KEY,
        username      VARCHAR(50)  UNIQUE NOT NULL,
        email         VARCHAR(255) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        full_name     VARCHAR(100),
        age           INTEGER CHECK (age > 0 AND age < 120),
        weight_kg     NUMERIC(5,2),
        height_cm     NUMERIC(5,2),
        experience_level experience_level DEFAULT 'beginner',
        fitness_goal  fitness_goal DEFAULT 'general_fitness',
        created_at    TIMESTAMPTZ DEFAULT NOW(),
        updated_at    TIMESTAMPTZ DEFAULT NOW()
      );
    `);

    // ─── EXERCISES ─────────────────────────────────────────────────────────────
    await client.query(`
      CREATE TABLE IF NOT EXISTS exercises (
        id           SERIAL PRIMARY KEY,
        name         VARCHAR(100) UNIQUE NOT NULL,
        muscle_group VARCHAR(50),
        category     VARCHAR(50),  -- e.g. 'strength', 'cardio', 'flexibility'
        description  TEXT,
        created_at   TIMESTAMPTZ DEFAULT NOW()
      );
    `);

    // ─── WORKOUT SESSIONS ──────────────────────────────────────────────────────
    await client.query(`
      CREATE TABLE IF NOT EXISTS workout_sessions (
        id           SERIAL PRIMARY KEY,
        user_id      INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        title        VARCHAR(100),
        notes        TEXT,
        duration_min INTEGER,           -- total session duration in minutes
        started_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        ended_at     TIMESTAMPTZ,
        created_at   TIMESTAMPTZ DEFAULT NOW()
      );
    `);

    // ─── WORKOUT LOGS (sets per exercise per session) ──────────────────────────
    await client.query(`
      CREATE TABLE IF NOT EXISTS workout_logs (
        id           SERIAL PRIMARY KEY,
        session_id   INTEGER NOT NULL REFERENCES workout_sessions(id) ON DELETE CASCADE,
        exercise_id  INTEGER NOT NULL REFERENCES exercises(id),
        set_number   INTEGER NOT NULL,
        reps         INTEGER,
        weight_kg    NUMERIC(6,2),
        duration_sec INTEGER,            -- for time-based exercises
        notes        TEXT,
        logged_at    TIMESTAMPTZ DEFAULT NOW()
      );
    `);

    // ─── YOUTUBE PLAYLIST CACHE ────────────────────────────────────────────────
    await client.query(`
      CREATE TABLE IF NOT EXISTS youtube_recommendations (
        id           SERIAL PRIMARY KEY,
        user_id      INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        query_used   VARCHAR(255),
        video_id     VARCHAR(20)  NOT NULL,
        title        VARCHAR(255),
        channel      VARCHAR(100),
        thumbnail    TEXT,
        fetched_at   TIMESTAMPTZ DEFAULT NOW()
      );
    `);

    // ─── INDEXES ───────────────────────────────────────────────────────────────
    await client.query(`CREATE INDEX IF NOT EXISTS idx_workout_sessions_user  ON workout_sessions(user_id);`);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_workout_logs_session   ON workout_logs(session_id);`);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_workout_logs_exercise  ON workout_logs(exercise_id);`);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_yt_recs_user           ON youtube_recommendations(user_id);`);

    // ─── SEED EXERCISES ────────────────────────────────────────────────────────
    await client.query(`
      INSERT INTO exercises (name, muscle_group, category) VALUES
        ('Bench Press',      'Chest',     'strength'),
        ('Squat',            'Legs',      'strength'),
        ('Deadlift',         'Back',      'strength'),
        ('Pull-Up',          'Back',      'strength'),
        ('Overhead Press',   'Shoulders', 'strength'),
        ('Barbell Row',      'Back',      'strength'),
        ('Bicep Curl',       'Arms',      'strength'),
        ('Tricep Dip',       'Arms',      'strength'),
        ('Leg Press',        'Legs',      'strength'),
        ('Plank',            'Core',      'strength'),
        ('Running',          'Cardio',    'cardio'),
        ('Cycling',          'Cardio',    'cardio'),
        ('Jump Rope',        'Cardio',    'cardio'),
        ('Yoga Flow',        'Full Body', 'flexibility'),
        ('Stretching',       'Full Body', 'flexibility')
      ON CONFLICT (name) DO NOTHING;
    `);

    await client.query('COMMIT');
    console.log('✅ Migration complete — all tables created and seeded.');
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('❌ Migration failed:', err);
    throw err;
  } finally {
    client.release();
    pool.end();
  }
};

migrate();
