import { useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { userAPI, workoutAPI, progressAPI } from '../api/services'
import { Dumbbell } from 'lucide-react'
import { Link } from 'react-router-dom'
import { BarChart, Bar, XAxis, ResponsiveContainer, Tooltip } from 'recharts'
import styles from './Dashboard.module.css'

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

export default function Dashboard() {
  const { user } = useAuth()
  const [stats, setStats] = useState(null)
  const [recent, setRecent] = useState([])
  const [weeklyData, setWeeklyData] = useState([])
  const [loading, setLoading] = useState(true)

  // PINDAH KE SINI: Sekarang variabel user sudah aman dan bisa dibaca tanpa bikin crash
  const WEEKLY_GOAL = user?.experience_level === 'advanced' ? 5
    : user?.experience_level === 'intermediate' ? 4
    : 3 // beginner default

  useEffect(() => {
    Promise.all([
      userAPI.getStats(),
      workoutAPI.getSessions({ limit: 5 }),
      progressAPI.workoutFrequency({ weeks: 7 }),
    ])
      .then(([sRes, wRes, fRes]) => {
        setStats(sRes.data)
        setRecent(wRes.data.data || [])

        const freqMap = {}
        fRes.data.forEach(row => {
          const day = new Date(row.week_start).toLocaleDateString('en-US', { weekday: 'short' })
          freqMap[day] = parseInt(row.session_count)
        })
        setWeeklyData(DAYS.map(day => ({ day, value: freqMap[day] || 0 })))
      })
      .catch(() => {
        setWeeklyData(DAYS.map(day => ({ day, value: 0 })))
      })
      .finally(() => setLoading(false))
  }, [])

  const greeting = () => {
    const h = new Date().getHours()
    if (h < 12) return 'Good Morning'
    if (h < 18) return 'Good Afternoon'
    return 'Good Evening'
  }

  const bmi = user?.weight_kg && user?.height_cm
    ? (user.weight_kg / Math.pow(user.height_cm / 100, 2)).toFixed(1)
    : null

  const estimatedCalories = stats?.total_volume_kg
    ? Math.round(stats.total_volume_kg * 0.05)
    : 0

  // Weekly goal progress based on this week's sessions
  const thisWeekSessions = weeklyData.reduce((sum, d) => sum + d.value, 0)
  const goalPct = Math.min(100, Math.round((thisWeekSessions / WEEKLY_GOAL) * 100))
  const circumference = 2 * Math.PI * 50

  return (
    <div className={styles.page}>
      {loading ? (
        <div className={styles.loading}><span className={styles.spinner} /></div>
      ) : (
        <div className={styles.content}>
          <div className={styles.mainCol}>
            <div className={styles.heroCard}>
              <div className={styles.heroText}>
                <h1>{greeting()}, {user?.full_name?.split(' ')[0] || user?.username} 👋</h1>
                <p>
                  {stats?.total_sessions > 0
                    ? `You've completed ${stats.total_sessions} sessions! Your body is recovering well.`
                    : 'Start your fitness journey today!'}
                </p>
                {stats?.total_sessions > 0 && <p>Ready for your next workout?</p>}
              </div>
              <div className={styles.heroStats}>
                <div className={styles.heroStat}>
                  <span className={styles.heroStatLabel}>WEIGHT</span>
                  <span className={styles.heroStatValue}>{user?.weight_kg ?? '—'} <small>kg</small></span>
                </div>
                <div className={styles.heroStat}>
                  <span className={styles.heroStatLabel}>HEIGHT</span>
                  <span className={styles.heroStatValue}>{user?.height_cm ?? '—'} <small>cm</small></span>
                </div>
                {bmi && (
                  <div className={`${styles.heroStat} ${styles.heroStatBmi}`}>
                    <span className={styles.heroStatLabel}>BMI</span>
                    <span className={styles.heroStatValue}>{bmi}</span>
                    <span className={styles.bmiTag}>
                      {bmi < 18.5 ? 'UNDERWEIGHT'
                        : bmi < 25 ? 'HEALTHY'
                        : bmi < 30 ? 'OVERWEIGHT'
                        : 'OBESE'}
                    </span>
                  </div>
                )}
              </div>
            </div>

            <div className={styles.card}>
              <div className={styles.cardHeader}>
                <h2>Weekly Activity</h2>
                <div className={styles.periodToggle}>
                  <button className={styles.periodActive}>Week</button>
                  <button className={styles.periodBtn}>Month</button>
                </div>
              </div>
              <ResponsiveContainer width="100%" height={180}>
                <BarChart data={weeklyData} barSize={36}>
                  <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#9a9590' }} />
                  <Tooltip cursor={{ fill: 'rgba(122,96,16,0.06)' }} contentStyle={{ borderRadius: 8, border: '1px solid #e8e5df', fontSize: 12 }} />
                  <Bar dataKey="value" fill="var(--gold)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className={styles.bottomRow}>
              {/* Workout Goals — based on real weekly session data */}
              <div className={styles.card}>
                <h2>Workout Goals</h2>
                <div className={styles.goalRing}>
                  <svg width="120" height="120" viewBox="0 0 120 120">
                    <circle cx="60" cy="60" r="50" fill="none" stroke="#e8e5df" strokeWidth="10"/>
                    <circle cx="60" cy="60" r="50" fill="none" stroke="var(--gold)" strokeWidth="10"
                      strokeDasharray={`${circumference * (goalPct / 100)} ${circumference * (1 - goalPct / 100)}`}
                      strokeDashoffset={circumference * 0.25}
                      strokeLinecap="round"
                      transform="rotate(-90 60 60)"
                    />
                    <text x="60" y="60" textAnchor="middle" dy="5" fontSize="18" fontWeight="700" fill="var(--text)">{goalPct}%</text>
                    <text x="60" y="76" textAnchor="middle" fontSize="10" fill="var(--text-3)">COMPLETED</text>
                  </svg>
                </div>
                <div className={styles.goalStats}>
                  <span className={styles.goalDot} style={{ background: 'var(--gold)' }} />
                  <span>This week: {thisWeekSessions}/{WEEKLY_GOAL} sessions</span>
                </div>
              </div>

              <div className={styles.card} style={{ flex: 2 }}>
                <div className={styles.cardHeader}>
                  <h2>Recent Workouts</h2>
                  <Link to="/workouts" className={styles.viewHistory}>View History</Link>
                </div>
                {recent.length === 0 ? (
                  <div className={styles.empty}>
                    <Dumbbell size={32} className={styles.emptyIcon} />
                    <p>No workouts yet. <Link to="/workouts/new">Start your first!</Link></p>
                  </div>
                ) : (
                  <table className={styles.recentTable}>
                    <thead>
                      <tr>
                        <th>EXERCISE</th>
                        <th>DATE</th>
                        <th>DURATION</th>
                        <th>CALORIES</th>
                        <th>STATUS</th>
                      </tr>
                    </thead>
                    <tbody>
                      {recent.map(s => (
                        <tr key={s.id}>
                          <td>
                            <div className={styles.exCell}>
                              <div className={styles.exCellIcon}><Dumbbell size={14} color="var(--gold)" /></div>
                              <Link to={`/workouts/${s.id}`}>{s.title || 'Workout Session'}</Link>
                            </div>
                          </td>
                          <td>{new Date(s.started_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</td>
                          <td>{s.duration_min ? `${s.duration_min} mins` : '—'}</td>
                          <td>—</td>
                          <td><span className={styles.statusBadge}>COMPLETED</span></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          </div>

          <div className={styles.sideCol}>
            <div className={`${styles.card} ${styles.cardDark}`}>
              <div className={styles.metricRow}>
                <div>
                  <span className={styles.metricLabel}>ACTIVE CALORIES</span>
                  <div className={styles.metricVal}>{estimatedCalories.toLocaleString()} <small>kcal</small></div>
                  <div className={styles.metricSub}>Estimated from workouts</div>
                </div>
                <div className={styles.metricCircle}>
                  <svg width="50" height="50" viewBox="0 0 50 50">
                    <circle cx="25" cy="25" r="20" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="4"/>
                    <circle cx="25" cy="25" r="20" fill="none" stroke="white" strokeWidth="4"
                      strokeDasharray={`${2*Math.PI*20} ${2*Math.PI*20*0}`}
                      strokeDashoffset={2*Math.PI*20*0.25}
                      transform="rotate(-90 25 25)"
                    />
                    <text x="25" y="29" textAnchor="middle" fontSize="9" fill="white">🔥</text>
                  </svg>
                </div>
              </div>
            </div>

            <div className={styles.card}>
              <h3 className={styles.sideTitle}>Total Stats</h3>
              <div className={styles.topEx}>
                <span className={styles.topExName}>Total Sessions</span>
                <span className={styles.topExSets}>{stats?.total_sessions ?? 0}</span>
              </div>
              <div className={styles.topEx}>
                <span className={styles.topExName}>Total Minutes</span>
                <span className={styles.topExSets}>{stats?.total_minutes ?? 0} min</span>
              </div>
              <div className={styles.topEx}>
                <span className={styles.topExName}>Total Volume</span>
                <span className={styles.topExSets}>{stats?.total_volume_kg?.toLocaleString() ?? 0} kg</span>
              </div>
            </div>

            <div className={styles.card}>
              <h3 className={styles.sideTitle}>Top Exercises</h3>
              {stats?.top_exercises?.length > 0 ? (
                stats.top_exercises.map((ex, i) => (
                  <div key={ex.name} className={styles.topEx}>
                    <span className={styles.topExRank}>#{i + 1}</span>
                    <span className={styles.topExName}>{ex.name}</span>
                    <span className={styles.topExSets}>{ex.sets_logged} sets</span>
                  </div>
                ))
              ) : (
                <p className={styles.noData}>Start logging workouts to see your top exercises.</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}