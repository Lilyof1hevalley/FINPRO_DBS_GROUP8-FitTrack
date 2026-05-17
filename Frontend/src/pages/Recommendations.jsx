import { useEffect, useState } from 'react'
import { recommendationAPI, userAPI } from '../api/services'
import { useAuth } from '../context/AuthContext'
import styles from './Recommendations.module.css'

const LEVELS = ['Beginner', 'Intermediate', 'Advanced']

const GOAL_LABEL = {
  weight_loss: 'Weight Loss',
  muscle_gain: 'Muscle Gain',
  endurance: 'Endurance',
  flexibility: 'Flexibility',
  general_fitness: 'General Fitness',
  strength: 'Strength',
}

// Capitalize first letter of a string
const capitalize = (str) => str ? str.charAt(0).toUpperCase() + str.slice(1) : ''

export default function Recommendations() {
  const { user } = useAuth()
  const [videos, setVideos] = useState([])
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [level, setLevel] = useState(null) // null until user data is ready
  const [muscle, setMuscle] = useState('')

  // Set level from user profile once user data is available
  useEffect(() => {
    if (user?.experience_level && level === null) {
      setLevel(capitalize(user.experience_level))
    }
  }, [user])

  // Fetch user stats for the progress banner
  useEffect(() => {
    userAPI.getStats().then(res => setStats(res.data)).catch(() => {})
  }, [])

  // Fetch recommendations filtered by muscle group, fitness goal, and experience level
  const load = (muscleGroup, currentLevel) => {
    setLoading(true)
    const params = {
      ...(muscleGroup ? { muscle_group: muscleGroup } : {}),
      fitness_goal: user?.fitness_goal,
      experience_level: (currentLevel || 'beginner').toLowerCase(),
    }
    recommendationAPI.fetch(params)
      .then(res => {
        const data = res.data
        if (Array.isArray(data)) setVideos(data)
        else if (data.videos) setVideos(data.videos)
        else setVideos([])
      })
      .catch(() => {
        // Fall back to cached recommendations on error
        recommendationAPI.getCached()
          .then(res => setVideos(res.data.videos || []))
          .catch(() => setVideos([]))
      })
      .finally(() => setLoading(false))
  }

  // Re-fetch when muscle filter or level changes, but only after level is initialized
  useEffect(() => {
    if (level !== null) load(muscle, level)
  }, [muscle, level])

  const featured = videos[0]
  const rest = videos.slice(1, 4)
  const activeLevel = level || capitalize(user?.experience_level) || 'Beginner'

  return (
    <div className={styles.page}>
      <div className={styles.content}>
        <div className={styles.mainCol}>
          <div className={styles.head}>
            <div>
              <h1>Smart Recommendations</h1>
              <p className={styles.subtitle}>
                Curated playlists based on your goal —{' '}
                <strong>{GOAL_LABEL[user?.fitness_goal] || user?.fitness_goal || 'General Fitness'}</strong>
              </p>
            </div>
          </div>

          {/* Level tabs — only the user's profile level is clickable */}
          <div className={styles.levelTabs}>
            {LEVELS.map(l => {
              const isUserLevel = l.toLowerCase() === user?.experience_level?.toLowerCase()
              return (
                <button
                  key={l}
                  className={`${styles.levelTab} ${activeLevel === l ? styles.levelActive : ''} ${!isUserLevel ? styles.levelDisabled : ''}`}
                  onClick={() => isUserLevel && setLevel(l)}
                  disabled={!isUserLevel}
                >
                  {l}
                </button>
              )
            })}
          </div>

          {loading ? (
            <div className={styles.loading}><span className={styles.spinner} /></div>
          ) : (
            <>
              {/* Featured playlist card */}
              {featured ? (
                <div className={styles.featuredCard}>
                  <div className={styles.featuredImg}>
                    {featured.thumbnail && <img src={featured.thumbnail} alt={featured.title} />}
                    <div className={styles.featuredOverlay}>
                      <span className={styles.nextLabel}>RECOMMENDED FOR YOU</span>
                      <h2>{featured.title}</h2>
                      <p>{featured.description}</p>
                      {featured.url && (
                        <a href={featured.url} target="_blank" rel="noopener noreferrer" className={styles.startBtn}>
                          Watch Playlist
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                <div className={styles.emptyFeatured}>
                  <p>No recommendations available yet. Keep logging workouts to get personalized suggestions!</p>
                </div>
              )}

              {/* Additional playlist cards */}
              <div className={styles.videoGrid}>
                {rest.map((v, i) => (
                  <a key={i} href={v.url} target="_blank" rel="noopener noreferrer" className={styles.videoCard}>
                    <div className={styles.videoThumb}>
                      {v.thumbnail && <img src={v.thumbnail} alt={v.title} />}
                    </div>
                    <div className={styles.videoInfo}>
                      <div className={styles.videoTitle}>{v.title}</div>
                      <div className={styles.videoDesc}>{v.description}</div>
                      <div className={styles.videoLevel}>
                        <span className={styles.levelBadge}>{activeLevel}</span>
                      </div>
                    </div>
                  </a>
                ))}
                {rest.length === 0 && !featured && (
                  <p className={styles.noVideos}>No video recommendations found.</p>
                )}
              </div>
            </>
          )}

          {/* Progress banner using real stats from DB */}
          {stats && (
            <div className={styles.progressBanner}>
              <div>
                <h3>You're on a roll, {user?.full_name?.split(' ')[0] || user?.username}!</h3>
                <p>Keep tracking your workouts to unlock better recommendations.</p>
                <div className={styles.bannerStats}>
                  <div>
                    <span className={styles.bannerVal}>{stats.total_sessions ?? 0}</span>
                    <span className={styles.bannerLabel}>TOTAL SESSIONS</span>
                  </div>
                  <div>
                    <span className={styles.bannerVal}>{stats.total_minutes ?? 0}</span>
                    <span className={styles.bannerLabel}>TOTAL MINUTES</span>
                  </div>
                  <div>
                    <span className={styles.bannerVal}>{stats.total_volume_kg?.toLocaleString() ?? 0}</span>
                    <span className={styles.bannerLabel}>VOLUME (KG)</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className={styles.sideCol}>
          {/* User profile summary pulled from DB */}
          <div className={styles.userGoalCard}>
            <h3>Your Profile</h3>
            <div className={styles.goalRow}>
              <span className={styles.goalLabel}>Fitness Goal</span>
              <span className={styles.goalVal}>{GOAL_LABEL[user?.fitness_goal] || '—'}</span>
            </div>
            <div className={styles.goalRow}>
              <span className={styles.goalLabel}>Experience</span>
              <span className={styles.goalVal}>{capitalize(user?.experience_level) || '—'}</span>
            </div>
            <div className={styles.goalRow}>
              <span className={styles.goalLabel}>Weight</span>
              <span className={styles.goalVal}>{user?.weight_kg ? `${user.weight_kg} kg` : '—'}</span>
            </div>
            <div className={styles.goalRow}>
              <span className={styles.goalLabel}>Height</span>
              <span className={styles.goalVal}>{user?.height_cm ? `${user.height_cm} cm` : '—'}</span>
            </div>
          </div>

          {/* Muscle group filter */}
          <div className={styles.muscleFilter}>
            <h3>Filter by Muscle</h3>
            <div className={styles.muscleButtons}>
              {['', 'Chest', 'Back', 'Legs', 'Shoulders', 'Arms', 'Core'].map(m => (
                <button
                  key={m}
                  className={`${styles.muscleBtn} ${muscle === m ? styles.muscleBtnActive : ''}`}
                  onClick={() => setMuscle(m)}
                >
                  {m || 'All'}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}