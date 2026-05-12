const axios = require('axios');
const pool  = require('../db/pool');

const YOUTUBE_SEARCH_URL = 'https://www.googleapis.com/youtube/v3/search';

// Map user profile to a YouTube search query
const buildQuery = (fitnessGoal, experienceLevel, muscleGroup) => {
  const goalMap = {
    weight_loss:      'fat loss workout',
    muscle_gain:      'muscle building workout',
    endurance:        'cardio endurance training',
    flexibility:      'flexibility stretching routine',
    general_fitness:  'full body workout',
    strength:         'strength training workout',
  };

  const levelMap = {
    beginner:     'beginner',
    intermediate: 'intermediate',
    advanced:     'advanced',
  };

  const base  = goalMap[fitnessGoal] || 'workout routine';
  const level = levelMap[experienceLevel] || '';
  const focus = muscleGroup ? `${muscleGroup} ` : '';

  return `${focus}${level} ${base}`.trim();
};

// Fetch from YouTube Data API v3
const fetchFromYouTube = async (query, maxResults = 8) => {
  const { data } = await axios.get(YOUTUBE_SEARCH_URL, {
    params: {
      key:        process.env.YOUTUBE_API_KEY,
      q:          query,
      part:       'snippet',
      type:       'video',
      maxResults,
      relevanceLanguage: 'en',
      videoCategoryId:   '17',   // Sports category
    },
  });

  return data.items.map((item) => ({
    video_id:  item.id.videoId,
    title:     item.snippet.title,
    channel:   item.snippet.channelTitle,
    thumbnail: item.snippet.thumbnails?.medium?.url || item.snippet.thumbnails?.default?.url,
  }));
};

// Cache results in DB (delete old, insert new)
const cacheRecommendations = async (userId, query, videos) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    await client.query(
      'DELETE FROM youtube_recommendations WHERE user_id = $1',
      [userId]
    );
    for (const v of videos) {
      await client.query(
        `INSERT INTO youtube_recommendations (user_id, query_used, video_id, title, channel, thumbnail)
         VALUES ($1,$2,$3,$4,$5,$6)`,
        [userId, query, v.video_id, v.title, v.channel, v.thumbnail]
      );
    }
    await client.query('COMMIT');
  } catch (e) {
    await client.query('ROLLBACK');
    throw e;
  } finally {
    client.release();
  }
};

// Main service function
const getRecommendations = async (userId, muscleGroup = null) => {
  // Fetch user profile
  const { rows } = await pool.query(
    'SELECT fitness_goal, experience_level FROM users WHERE id = $1',
    [userId]
  );
  if (rows.length === 0) throw { status: 404, message: 'User not found' };

  const { fitness_goal, experience_level } = rows[0];
  const query = buildQuery(fitness_goal, experience_level, muscleGroup);

  const videos = await fetchFromYouTube(query);
  await cacheRecommendations(userId, query, videos);

  return { query_used: query, videos };
};

// Return cached recommendations (no API call)
const getCachedRecommendations = async (userId) => {
  const { rows } = await pool.query(
    `SELECT video_id, title, channel, thumbnail, query_used, fetched_at
     FROM youtube_recommendations
     WHERE user_id = $1
     ORDER BY fetched_at DESC`,
    [userId]
  );
  return rows;
};

module.exports = { getRecommendations, getCachedRecommendations };
