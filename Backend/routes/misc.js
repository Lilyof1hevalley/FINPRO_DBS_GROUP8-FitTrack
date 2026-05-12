const express = require('express');
const { fetchRecommendations, cachedRecommendations } = require('../controllers/recommendationController');
const { getExercises, getExercise } = require('../controllers/exerciseController');
const { authenticate } = require('../middleware/auth');

const recRouter = express.Router();
recRouter.use(authenticate);
recRouter.get('/',        fetchRecommendations);
recRouter.get('/cached',  cachedRecommendations);

const exRouter = express.Router();
exRouter.use(authenticate);
exRouter.get('/',     getExercises);
exRouter.get('/:id',  getExercise);

module.exports = { recRouter, exRouter };
