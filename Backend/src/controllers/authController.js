const bcrypt = require('bcryptjs');
const jwt    = require('jsonwebtoken');
const axios  = require('axios');
const pool   = require('../db/pool');
const crypto = require('crypto')
const { sendPasswordResetEmail } = require('../services/emailService')

const generateToken = (user) =>
  jwt.sign(
    { id: user.id, username: user.username, email: user.email },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );

// POST /api/auth/register
const register = async (req, res, next) => {
  try {
    const { username, email, password, full_name, age, weight_kg, height_cm, experience_level, fitness_goal } = req.body;

    const existing = await pool.query(
      'SELECT id FROM users WHERE email = $1 OR username = $2',
      [email, username]
    );
    if (existing.rows.length > 0) {
      return res.status(409).json({ error: 'Username or email already in use' });
    }

    const password_hash = await bcrypt.hash(password, 12);
    const { rows } = await pool.query(
      `INSERT INTO users
         (username, email, password_hash, full_name, age, weight_kg, height_cm, experience_level, fitness_goal)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
       RETURNING id, username, email, full_name, experience_level, fitness_goal, created_at`,
      [username, email, password_hash, full_name, age, weight_kg, height_cm,
       experience_level || 'beginner', fitness_goal || 'general_fitness']
    );

    const user = rows[0];
    return res.status(201).json({ user, token: generateToken(user) });
  } catch (err) {
    next(err);
  }
};

// POST /api/auth/login
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const { rows } = await pool.query(
      'SELECT * FROM users WHERE email = $1',
      [email]
    );
    if (rows.length === 0) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const user = rows[0];

    // Block password login for Google OAuth accounts
    if (user.password_hash === 'GOOGLE_OAUTH') {
      return res.status(401).json({ error: 'This account uses Google Sign-In. Please continue with Google.' });
    }

    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const { password_hash, ...safeUser } = user;
    return res.json({ user: safeUser, token: generateToken(user) });
  } catch (err) {
    next(err);
  }
};

// POST /api/auth/google
const googleLogin = async (req, res, next) => {
  try {
    const { accessToken } = req.body;
    if (!accessToken) {
      return res.status(422).json({ error: 'accessToken is required' });
    }

    // Verify token with Google and retrieve user info
    const { data } = await axios.get('https://www.googleapis.com/oauth2/v3/userinfo', {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    const { email, name, sub } = data;
    if (!email) {
      return res.status(401).json({ error: 'Failed to retrieve email from Google' });
    }

    // Check if user already exists
    let { rows } = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    let user = rows[0];

    if (!user) {
      // Auto-register new user from Google
      const username = email.split('@')[0].replace(/[^a-z0-9_]/gi, '_') + '_' + sub.slice(-4);
      const result = await pool.query(
        `INSERT INTO users (username, email, password_hash, full_name)
         VALUES ($1, $2, $3, $4)
         RETURNING id, username, email, full_name, experience_level, fitness_goal, created_at`,
        [username, email, 'GOOGLE_OAUTH', name]
      );
      user = result.rows[0];
    }

    const { password_hash, ...safeUser } = user;
    return res.json({ user: safeUser, token: generateToken(user) });
  } catch (err) {
    // Handle invalid/expired Google token
    if (err.response?.status === 401) {
      return res.status(401).json({ error: 'Invalid Google token' });
    }
    next(err);
  }
};

// POST /api/auth/forgot-password
const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body
    if (!email) return res.status(422).json({ error: 'Email is required' })

    const { rows } = await pool.query('SELECT * FROM users WHERE email = $1', [email])
    const user = rows[0]

    // Always return success to prevent email enumeration
    if (!user) return res.json({ message: 'If that email exists, a reset link has been sent.' })

    // Block Google OAuth accounts
    if (user.password_hash === 'GOOGLE_OAUTH') {
      return res.json({ message: 'If that email exists, a reset link has been sent.' })
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex')
    const expires = new Date(Date.now() + 60 * 60 * 1000) // 1 hour

    await pool.query(
      'UPDATE users SET reset_token = $1, reset_token_expires = $2 WHERE id = $3',
      [resetToken, expires, user.id]
    )

    await sendPasswordResetEmail(email, resetToken)

    return res.json({ message: 'If that email exists, a reset link has been sent.' })
  } catch (err) {
    next(err)
  }
}

// POST /api/auth/reset-password
const resetPassword = async (req, res, next) => {
  try {
    const { token, password } = req.body
    
    if (!token || !password) return res.status(422).json({ error: 'Token and password are required' })
    if (password.length < 8) return res.status(422).json({ error: 'Password must be at least 8 characters' })

    const { rows } = await pool.query(
      'SELECT * FROM users WHERE reset_token = $1 AND reset_token_expires > NOW()',
      [token]
    )
    const user = rows[0]

    if (!user) return res.status(400).json({ error: 'Invalid or expired reset token' })

    const password_hash = await bcrypt.hash(password, 12)

    await pool.query(
      'UPDATE users SET password_hash = $1, reset_token = NULL, reset_token_expires = NULL WHERE id = $2',
      [password_hash, user.id]
    )

    return res.json({ message: 'Password reset successful' })
  } catch (err) {
    next(err)
  }
}

module.exports = { register, login, googleLogin, forgotPassword, resetPassword };