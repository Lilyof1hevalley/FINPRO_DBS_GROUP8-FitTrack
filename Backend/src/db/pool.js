const { Pool } = require('pg');

const pool = new Pool({
  ssl: { rejectUnauthorized: false },
});

pool.on('connect', () => {
  console.log('✅ Connected to PostgreSQL database');
});

pool.on('error', (err) => {
  console.error('❌ Unexpected PostgreSQL error:', err);
  process.exit(-1);
});

module.exports = pool;