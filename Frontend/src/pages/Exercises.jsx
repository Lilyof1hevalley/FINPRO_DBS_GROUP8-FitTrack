import { useEffect, useState } from 'react'
import { exerciseAPI } from '../api/services'
import { Search, SlidersHorizontal, Heart, Dumbbell, Clock, ChevronDown } from 'lucide-react'
import styles from './Exercises.module.css'

const MUSCLES = ['All', 'Chest', 'Back', 'Legs', 'Shoulders', 'Arms', 'Core', 'Cardio']

const GRADIENTS = [
  'linear-gradient(135deg, #2a1f08, #8a6a18)',
  'linear-gradient(135deg, #1a2230, #6a7a8a)',
  'linear-gradient(135deg, #2a2010, #c8940d)',
  'linear-gradient(135deg, #101820, #4a5a6a)',
  'linear-gradient(135deg, #2a1f12, #b8884a)',
  'linear-gradient(135deg, #1f2418, #8a9a6a)',
]

function levelFor(ex) {
  if (ex.difficulty) return ex.difficulty
  const id = ex.id || 0
  return ['Beginner', 'Intermediate', 'Advanced'][id % 3]
}

function durationFor(ex) {
  const id = ex.id || 1
  return `${5 + (id % 4) * 5} mins`
}

function equipmentFor(ex) {
  if (ex.equipment) return ex.equipment
  const id = ex.id || 0
  return ['Barbell', 'Dumbbell', 'None', 'Bar', 'Machine'][id % 5]
}

export default function Exercises() {
  const [exercises, setExercises] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [muscle, setMuscle] = useState('All')
  const [favorites, setFavorites] = useState({})
  const [limit, setLimit] = useState(6)

  useEffect(() => {
    exerciseAPI.getAll()
      .then(res => setExercises(res.data))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const toggleFav = (id) => setFavorites(f => ({ ...f, [id]: !f[id] }))

  const filtered = exercises.filter(e => {
    const q = search.toLowerCase()
    const matchSearch = !q || e.name.toLowerCase().includes(q) || (e.muscle_group || '').toLowerCase().includes(q)
    const matchMuscle = muscle === 'All' || e.muscle_group === muscle
    return matchSearch && matchMuscle
  })

  const shown = filtered.slice(0, limit)

  return (
    <div className={styles.page}>
      <div className={styles.content}>
        <div className={styles.head}>
          <div>
            <h1>Exercises</h1>
            <p>Browse and filter exercises by muscle group.</p>
          </div>
          <div className={styles.searchTop}>
            <Search size={15} className={styles.searchIcon} />
            <input
              placeholder="Search exercises..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
        </div>

        <div className={styles.pills}>
          {MUSCLES.map(m => (
            <button
              key={m}
              className={`${styles.pill} ${muscle === m ? styles.pillActive : ''}`}
              onClick={() => setMuscle(m)}
            >
              {m}
            </button>
          ))}
        </div>

        {loading ? (
          <div className={styles.loading}><span className={styles.spinner} /></div>
        ) : shown.length === 0 ? (
          <div className={styles.empty}>No exercises found.</div>
        ) : (
          <>
            <div className={styles.grid}>
              {shown.map((ex, i) => (
                <div key={ex.id} className={styles.card}>
                  <div className={styles.cardImg} style={{ background: GRADIENTS[i % GRADIENTS.length] }}>
                    <div className={styles.cardBadges}>
                      {ex.muscle_group && <span className={styles.mgBadge}>{ex.muscle_group}</span>}
                      <span className={styles.lvlBadge}>{levelFor(ex)}</span>
                    </div>
                  </div>
                  <div className={styles.cardBody}>
                    <div className={styles.cardTitleRow}>
                      <h3>{ex.name}</h3>
                      <button
                        className={`${styles.favBtn} ${favorites[ex.id] ? styles.favActive : ''}`}
                        onClick={() => toggleFav(ex.id)}
                      >
                        <Heart size={18} fill={favorites[ex.id] ? 'currentColor' : 'none'} />
                      </button>
                    </div>
                    <p className={styles.cardDesc}>
                      {ex.description || 'A focused training movement to build strength, control, and muscular endurance.'}
                    </p>
                    <div className={styles.cardMeta}>
                      <span><Dumbbell size={14} /> {equipmentFor(ex)}</span>
                      <span><Clock size={14} /> {durationFor(ex)}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {filtered.length > limit && (
              <div className={styles.moreWrap}>
                <button className={styles.moreBtn} onClick={() => setLimit(l => l + 6)}>
                  View More Exercises <ChevronDown size={16} />
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}