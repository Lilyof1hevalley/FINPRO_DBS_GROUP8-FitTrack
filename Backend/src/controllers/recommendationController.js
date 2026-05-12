const { getRecommendations, getCachedRecommendations } = require('../services/youtubeService');

// GET /api/recommendations?muscle_group=Chest  (fresh fetch from YouTube)
const fetchRecommendations = async (req, res, next) => {
  try {
    const muscleGroup = req.query.muscle_group || null;
    const result = await getRecommendations(req.user.id, muscleGroup);
    return res.json(result);
  } catch (err) {
    next(err);
  }
};

// GET /api/recommendations/cached  (return saved results, no API quota used)
const cachedRecommendations = async (req, res, next) => {
  try {
    const videos = await getCachedRecommendations(req.user.id);
    return res.json({ videos });
  } catch (err) {
    next(err);
  }
};

module.exports = { fetchRecommendations, cachedRecommendations };
