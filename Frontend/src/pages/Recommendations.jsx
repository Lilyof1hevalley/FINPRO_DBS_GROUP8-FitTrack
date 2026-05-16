import { useEffect, useState } from 'react'
import { recommendationAPI } from '../api/services'
import { useAuth } from '../context/AuthContext'
import styles from './Recommendations.module.css'

const LEVELS = ['Beginner', 'Intermediate', 'Advanced']

export default function Recommendations() {
  const { user } = useAuth()
  const [videos, setVideos] = useState([])
  const [loading, setLoading] = useState(true)
  const [level, setLevel] = useState('Beginner')
  const [muscle, setMuscle] = useState('')

  const load = (muscleGroup) => {
    setLoading(true)
    const params = muscleGroup ? { muscle_group: muscleGroup } : {}
    recommendationAPI.fetch(params)
      .then(res => {
        const data = res.data
        if (Array.isArray(data)) setVideos(data)
        else if (data.videos) setVideos(data.videos)
        else setVideos([])
      })
      .catch(() => {
        recommendationAPI.getCached()
          .then(res => setVideos(res.data.videos || []))
          .catch(() => setVideos([]))
      })
      .finally(() => setLoading(false))
  }

  useEffect(() => { load(muscle) }, [muscle])

  const featured = videos[0]
  const rest = videos.slice(1, 4)

  return (
    <div className={styles.page}>
      <div className={styles.topNav}>
        <div className={styles.navTabs}>
          <button className={styles.navTab}>Overview</button>
          <button className={styles.navTab}>Activity</button>
          <button className={styles.navTab}>Nutrition</button>
          <button className={styles.navTab}>Sleep</button>
          <button className={styles.navTab}>Goals</button>
        </div>
        <div className={styles.navRight}>
          <span>🔔</span>
          <span>⚙️</span>
          <div className={styles.avatar}>{(user?.full_name || user?.username || 'U')[0].toUpperCase()}</div>
        </div>
      </div>

      <div className={styles.content}>
        <div className={styles.mainCol}>
          <h1>Smart Recommendations</h1>
          <p className={styles.subtitle}>AI-powered insights tailored to your biometrics, recent performance, and long-term health goals.</p>

          <div className={styles.levelTabs}>
            {LEVELS.map(l => (
              <button
                key={l}
                className={`${styles.levelTab} ${level === l ? styles.levelActive : ''}`}
                onClick={() => setLevel(l)}
              >
                {l}
              </button>
            ))}
          </div>

          {loading ? (
            <div className={styles.loading}><span className={styles.spinner} /></div>
          ) : (
            <>
              {featured ? (
                <div className={styles.featuredCard}>
                  <div className={styles.featuredImg}>
                    {featured.thumbnail && <img src={featured.thumbnail} alt={featured.title} />}
                    <div className={styles.featuredOverlay}>
                      <span className={styles.nextLabel}>NEXT SESSION IDEA</span>
                      <h2>{featured.title}</h2>
                      <p>{featured.description}</p>
                      <div className={styles.featuredMeta}>
                        <span>⏱ 45 Minutes</span>
                        <span>🔥 320 kcal</span>
                        <span>⚡ Low Intensity</span>
                      </div>
                      {featured.url && (
                        <a href={featured.url} target="_blank" rel="noopener noreferrer" className={styles.startBtn}>
                          Start Workout Plan
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                <div className={styles.emptyFeatured}>
                  <p>No recommendations available. Try fetching fresh suggestions below.</p>
                </div>
              )}

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
                        <span className={styles.levelBadge}>Level: Beginner</span>
                        <span className={styles.addBtn}>+</span>
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

          <div className={styles.progressBanner}>
            <div>
              <h3>You're on a roll, {user?.full_name?.split(' ')[0] || user?.username}!</h3>
              <p>Keep tracking your workouts to unlock better recommendations.</p>
              <div className={styles.bannerStats}>
                <div>
                  <span className={styles.bannerVal}>86%</span>
                  <span className={styles.bannerLabel}>GOAL COMPLETION</span>
                </div>
                <div>
                  <span className={styles.bannerVal}>12.4k</span>
                  <span className={styles.bannerLabel}>AVG CALORIES</span>
                </div>
              </div>
            </div>
            <div className={styles.bigCircle}>
              <svg width="90" height="90" viewBox="0 0 90 90">
                <circle cx="45" cy="45" r="38" fill="none" stroke="var(--border)" strokeWidth="7"/>
                <circle cx="45" cy="45" r="38" fill="none" stroke="var(--gold)" strokeWidth="7"
                  strokeDasharray={`${2*Math.PI*38*0.75} ${2*Math.PI*38*0.25}`}
                  strokeDashoffset={2*Math.PI*38*0.25}
                  transform="rotate(-90 45 45)"
                />
                <text x="45" y="50" textAnchor="middle" fontSize="16" fontWeight="700" fill="var(--text)">75%</text>
              </svg>
            </div>
          </div>
        </div>

        <div className={styles.sideCol}>
          <div className={styles.insightCard}>
            <h3>Recovery Insight</h3>
            <p>Your HRV (Heart Rate Variability) is lower than usual today. We suggest prioritizing sleep tonight.</p>
          </div>

          <div className={styles.mealCard}>
            <div className={styles.mealIcon}>🍽</div>
            <div>
              <h3>Post-Workout Meal</h3>
              <p>Grilled Salmon with Quinoa and Avocado. High in Omega-3 to reduce muscle inflammation.</p>
              <a href="#" className={styles.recipeLink}>View Full Recipe →</a>
            </div>
          </div>

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
