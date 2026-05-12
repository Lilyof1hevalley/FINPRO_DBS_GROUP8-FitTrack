require('dotenv').config();
const express = require('express');
const helmet  = require('helmet');
const cors    = require('cors');

const authRoutes    = require('./routes/auth');
const userRoutes    = require('./routes/users');
const workoutRoutes = require('./routes/workouts');
const progressRoutes = require('./routes/progress');
const { recRouter, exRouter } = require('./routes/misc');
const { errorHandler } = require('./middleware/errorHandler');

const app = express();

// ─── Global Middleware ─────────────────────────────────────────────────────────
app.use(helmet());
app.use(cors());
app.use(express.json());

// ─── Health Check ──────────────────────────────────────────────────────────────
app.get('/health', (req, res) => res.json({ status: 'ok', timestamp: new Date() }));

// ─── Routes ────────────────────────────────────────────────────────────────────
app.use('/api/auth',            authRoutes);
app.use('/api/users',           userRoutes);
app.use('/api/workouts',        workoutRoutes);
app.use('/api/progress',        progressRoutes);
app.use('/api/recommendations', recRouter);
app.use('/api/exercises',       exRouter);

// ─── 404 ───────────────────────────────────────────────────────────────────────
app.use((req, res) => res.status(404).json({ error: 'Route not found' }));

// ─── Error Handler ────────────────────────────────────────────────────────────
app.use(errorHandler);

// ─── Start ─────────────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 FitTrack API running on http://localhost:${PORT}`);
  console.log(`📋 Environment: ${process.env.NODE_ENV || 'development'}`);
});

module.exports = app;
