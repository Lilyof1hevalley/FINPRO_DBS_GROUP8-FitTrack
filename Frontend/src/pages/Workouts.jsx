import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { workoutAPI } from '../api/services'
import { Plus, Clock, Zap, Search, SlidersHorizontal, MoreVertical, ArrowRight } from 'lucide-react'
import styles from './Workouts.module.css'

const FEATURED = [
  {
    key: 'strength',
    badge: 'Professional',
    title: 'Strength Training',
    desc: 'Build explosive power and muscle endurance with our advanced lifting programs.',
    duration: '45-60 min',
    level: 'Hard',
    grad: 'linear-gradient(135deg, #2a1f08 0%, #6b5210 60%, #c8940d 100%)',
  },
  {
    key: 'cardio',
    badge: null,
    title: 'Cardio Blast',
    desc: 'Improve heart health and burn calories with dynamic high-intensity routines.',
    duration: '20-30 min',
    level: 'Moderate',
    grad: 'linear-gradient(135deg, #1a2a3a 0%, #c97a3a 60%, #f0b86a 100%)',
  },
]

function difficultyDots(level) {
  const map = { Strength: 2, Cardio: 3, Yoga: 1 }
  return map[level] ?? 2
}

function relativeDate(dateStr) {
  if (!dateStr) return '—'
  const d = new Date(dateStr)
  const diff = Math.floor((Date.now() - d.getTime()) / 86400000)
  if (diff === 0) return 'Today'
  if (diff === 1) return 'Yesterday'
  if (diff < 7) return `${diff} days ago`
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

export default function Workouts() {
  const navigate = useNavigate()
  const [sessions, setSessions] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  useEffect(() => {
    workoutAPI.getSessions({ limit: 20 })
      .then(res => setSessions(res.data.data || []))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const filtered = sessions.filter(s =>
    !search || (s.title || '').toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className={styles.page}>
      <div className={styles.content}>
        <div className={styles.head}>
          <div>
            <h1>Workout Library</h1>
            <p>Choose from over 200 professional training routines or create your own custom workout plan designed for your goals.</p>
          </div>
          <button className={styles.createBtn} onClick={() => navigate('/workouts/new')}>
            <Plus size={18} /> Create New Workout
          </button>
        </div>

        <div className={styles.featuredGrid}>
          {FEATURED.map(f => (
            <div key={f.key} className={styles.featCard} style={{ background: f.grad }}>
              <div className={styles.featInner}>
                {f.badge && <span className={styles.featBadge}>{f.badge}</span>}
                <h2>{f.title}</h2>
                <p>{f.desc}</p>
                <div className={styles.featMeta}>
                  <span><Clock size={15} /> {f.duration}</span>
                  <span><Zap size={15} /> {f.level}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className={styles.wideCard}>
          <div className={styles.wideInner}>
            <h2>Mindfulness &amp; Yoga</h2>
            <p>Recover and restore your body with expert-led mobility and flexibility sessions.</p>
            <button className={styles.exploreBtn} onClick={() => navigate('/exercises')}>
              Explore Yoga <ArrowRight size={15} />
            </button>
          </div>
        </div>

        <div className={styles.existingHead}>
          <h2>Existing Workouts</h2>
          <div className={styles.tools}>
            <div className={styles.searchWrap}>
              <Search size={15} className={styles.searchIcon} />
              <input
                placeholder="Search workouts..."
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>
            <button className={styles.filterBtn}>
              <SlidersHorizontal size={15} /> Filter
            </button>
          </div>
        </div>

        <div className={styles.tableCard}>
          {loading ? (
            <div className={styles.loading}><span className={styles.spinner} /></div>
          ) : filtered.length === 0 ? (
            <div className={styles.empty}>
              <p>No workouts yet. Create your first session to get started.</p>
            </div>
          ) : (
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>WORKOUT NAME</th>
                  <th>CATEGORY</th>
                  <th>DURATION</th>
                  <th>DIFFICULTY</th>
                  <th>LAST COMPLETED</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(s => {
                  const cat = s.total_sets > 8 ? 'Strength' : s.duration_min && s.duration_min < 30 ? 'Cardio' : 'Yoga'
                  const dots = difficultyDots(cat)
                  return (
                    <tr key={s.id} onClick={() => navigate(`/workouts/${s.id}`)}>
                      <td>
                        <div className={styles.nameCell}>
                          <div className={styles.thumb} />
                          <div>
                            <div className={styles.wName}>{s.title || 'Workout Session'}</div>
                            <div className={styles.wSub}>
                              {s.total_sets || 0} exercises • Session
                            </div>
                          </div>
                        </div>
                      </td>
                      <td><span className={styles.catPill}>{cat}</span></td>
                      <td className={styles.muted}>{s.duration_min ? `${s.duration_min} min` : '—'}</td>
                      <td>
                        <div className={styles.dots}>
                          {[0, 1, 2].map(i => (
                            <span
                              key={i}
                              className={styles.dot}
                              style={{ background: i < dots ? (cat === 'Cardio' ? 'var(--danger)' : 'var(--gold)') : 'var(--border)' }}
                            />
                          ))}
                        </div>
                      </td>
                      <td className={styles.muted}>{relativeDate(s.started_at)}</td>
                      <td><button className={styles.rowMenu}><MoreVertical size={16} /></button></td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  )
}