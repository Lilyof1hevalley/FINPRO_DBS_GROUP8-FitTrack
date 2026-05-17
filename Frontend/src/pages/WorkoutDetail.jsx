import { useEffect, useState, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { workoutAPI, exerciseAPI } from '../api/services'
import { useAuth } from '../context/AuthContext'
import { Bell, Timer, Dumbbell, Check, CheckCircle2, Plus, History, Lightbulb } from 'lucide-react'
import toast from 'react-hot-toast'
import styles from './WorkoutDetail.module.css'

function fmt(sec) {
  const m = String(Math.floor(sec / 60)).padStart(2, '0')
  const s = String(sec % 60).padStart(2, '0')
  return `${m}:${s}`
}

function fmtRest(sec) {
  const m = String(Math.floor(sec / 60)).padStart(2, '0')
  const s = String(sec % 60).padStart(2, '0')
  return `${m}:${s}`
}

export default function WorkoutDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const [session, setSession] = useState(null)
  const [logs, setLogs] = useState([])
  const [exercises, setExercises] = useState([])
  const [loading, setLoading] = useState(true)
  const [done, setDone] = useState({})
  const [elapsed, setElapsed] = useState(0)
  const [rest, setRest] = useState(72)
  const [newEx, setNewEx] = useState({ exercise_id: '', sets: '', reps: '', weight_kg: '' })
  const timerRef = useRef(null)

  useEffect(() => {
    Promise.all([workoutAPI.getSession(id), exerciseAPI.getAll()])
      .then(([sRes, eRes]) => {
        setSession(sRes.data.session)
        setLogs(sRes.data.logs || [])
        setExercises(eRes.data)
        const start = sRes.data.session?.started_at
        if (start) {
          setElapsed(Math.max(0, Math.floor((Date.now() - new Date(start).getTime()) / 1000)))
        }
      })
      .catch(() => toast.error('Failed to load session'))
      .finally(() => setLoading(false))
  }, [id])

  useEffect(() => {
    timerRef.current = setInterval(() => {
      setElapsed(e => e + 1)
      setRest(r => (r > 0 ? r - 1 : 0))
    }, 1000)
    return () => clearInterval(timerRef.current)
  }, [])

  const grouped = logs.reduce((acc, log) => {
    const key = log.exercise_name || 'Exercise'
    if (!acc[key]) acc[key] = { logs: [], muscle: log.muscle_group || log.category || '' }
    acc[key].logs.push(log)
    return acc
  }, {})

  const rows = Object.entries(grouped).map(([name, g]) => {
    const sets = g.logs.length
    const reps = g.logs[0]?.reps ?? '-'
    const weight = g.logs[0]?.weight_kg ?? '-'
    const lid = g.logs[0]?.id
    return { name, muscle: g.muscle, sets, reps, weight, lid }
  })

  const totalVolume = logs.reduce((sum, l) => sum + (parseFloat(l.weight_kg) || 0) * (parseInt(l.reps) || 0), 0)
  const workSets = logs.length
  const targetSets = Math.max(workSets, 12)
  const progress = Math.min(100, Math.round((Object.keys(done).filter(k => done[k]).length / Math.max(rows.length, 1)) * 100)) || 0

  const toggleDone = (key) => setDone(d => ({ ...d, [key]: !d[key] }))

  const handleAddExercise = async () => {
    if (!newEx.exercise_id) { toast.error('Select an exercise first'); return }
    try {
      const created = await workoutAPI.addLog(id, {
        exercise_id: parseInt(newEx.exercise_id),
        set_number: logs.length + 1,
        reps: newEx.reps ? parseInt(newEx.reps) : undefined,
        weight_kg: newEx.weight_kg ? parseFloat(newEx.weight_kg) : undefined,
      })
      const ex = exercises.find(e => e.id === parseInt(newEx.exercise_id))
      setLogs(prev => [...prev, { ...created.data, exercise_name: ex?.name, muscle_group: ex?.muscle_group, category: ex?.category }])
      setNewEx({ exercise_id: '', sets: '', reps: '', weight_kg: '' })
      toast.success('Exercise added')
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to add exercise')
    }
  }

  const handleComplete = async () => {
    try {
      await workoutAPI.updateSession(id, {
        ended_at: new Date().toISOString(),
        duration_min: Math.round(elapsed / 60),
      })
      toast.success('Session completed!')
      navigate('/workouts')
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to complete session')
    }
  }

  if (loading) return <div className={styles.page}><div className={styles.loadWrap}><span className={styles.spinner} /></div></div>
  if (!session) return <div className={styles.page}><div className={styles.loadWrap}><p>Session not found.</p></div></div>

  return (
    <div className={styles.page}>
      <header className={styles.topbar}>
        <div className={styles.sessionTitle}>
          <h2>{session.title || 'Workout Session'}</h2>
          <div className={styles.liveTime}>
            <span className={styles.dot} /> {fmt(elapsed)}
          </div>
        </div>
        <div className={styles.topRight}>
          <button className={styles.iconBtn}><Bell size={18} /></button>
          <div className={styles.avatar}>{(user?.full_name || user?.username || 'U')[0].toUpperCase()}</div>
        </div>
      </header>

      <div className={styles.content}>
        <div className={styles.mainCol}>
          <div className={styles.statsRow}>
            <div className={styles.statCard}>
              <div className={styles.statIcon}><Timer size={18} color="var(--gold)" /></div>
              <div>
                <span className={styles.statLabel}>Duration</span>
                <span className={styles.statVal}>{session.duration_min ?? Math.floor(elapsed / 60)} min</span>
              </div>
            </div>
            <div className={styles.statCard}>
              <div className={styles.statIcon}><Dumbbell size={18} color="var(--text-2)" /></div>
              <div>
                <span className={styles.statLabel}>Total Volume</span>
                <span className={styles.statVal}>{totalVolume ? totalVolume.toLocaleString() : '0'} kg</span>
              </div>
            </div>
            <div className={styles.statCard}>
              <div className={styles.statIcon}><CheckCircle2 size={18} color="var(--gold)" /></div>
              <div>
                <span className={styles.statLabel}>Sets Done</span>
                <span className={styles.statVal}>{workSets}</span>
              </div>
            </div>
          </div>

          <div className={styles.setsCard}>
            <div className={styles.setsHead}>
              <h2>Active Sets</h2>
              <button className={styles.histLink}><History size={15} /> Session History</button>
            </div>

            <div className={styles.setsTable}>
              <div className={styles.setsHeadRow}>
                <span>Exercise</span>
                <span>Sets</span>
                <span>Reps</span>
                <span>Weight (kg)</span>
                <span>Action</span>
              </div>

              {rows.length === 0 ? (
                <div className={styles.noRows}>No sets logged yet. Add an exercise below.</div>
              ) : (
                rows.map(r => (
                  <div key={r.name} className={styles.setRow}>
                    <div className={styles.exCell}>
                      <div className={styles.exThumb} />
                      <div>
                        <div className={styles.exName}>{r.name}</div>
                        <div className={styles.exMuscle}>{r.muscle}</div>
                      </div>
                    </div>
                    <span className={styles.cellBox}>{r.sets}</span>
                    <span className={styles.cellBox}>{r.reps}</span>
                    <span className={styles.cellBox}>{r.weight}</span>
                    <button
                      className={`${styles.checkBtn} ${done[r.name] ? styles.checkOn : ''}`}
                      onClick={() => toggleDone(r.name)}
                    >
                      {done[r.name] ? <CheckCircle2 size={20} /> : <CheckCircle2 size={20} className={styles.checkOff} />}
                    </button>
                  </div>
                ))
              )}

              <div className={styles.addRow}>
                <div className={styles.exCell}>
                  <div className={styles.addThumb}><Plus size={16} /></div>
                  <select
                    className={styles.addSelect}
                    value={newEx.exercise_id}
                    onChange={e => setNewEx(n => ({ ...n, exercise_id: e.target.value }))}
                  >
                    <option value="">Add new exercise...</option>
                    {exercises.map(ex => <option key={ex.id} value={ex.id}>{ex.name}</option>)}
                  </select>
                </div>
                <input className={styles.cellInput} placeholder="-" value={newEx.sets} onChange={e => setNewEx(n => ({ ...n, sets: e.target.value }))} />
                <input className={styles.cellInput} placeholder="-" value={newEx.reps} onChange={e => setNewEx(n => ({ ...n, reps: e.target.value }))} />
                <input className={styles.cellInput} placeholder="-" value={newEx.weight_kg} onChange={e => setNewEx(n => ({ ...n, weight_kg: e.target.value }))} />
                <button className={styles.addBtnSm} onClick={handleAddExercise}>Add</button>
              </div>
            </div>

            <div className={styles.actionsRow}>
              <button className={styles.addExBtn} onClick={handleAddExercise}>
                <Plus size={16} /> Add Exercise
              </button>
              <button className={styles.completeBtn} onClick={handleComplete}>
                <Check size={16} /> Complete Session
              </button>
            </div>
          </div>
        </div>

        <div className={styles.sideCol}>
          <div className={styles.restCard}>
            <span className={styles.restLabel}>Rest Timer</span>
            <div className={styles.restTime}>{fmtRest(rest)}</div>
            <div className={styles.restBtns}>
              <button className={styles.rest30} onClick={() => setRest(r => r + 30)}>+30s</button>
              <button className={styles.restSkip} onClick={() => setRest(0)}>Skip</button>
            </div>
            <div className={styles.restGlyph}><Timer size={56} /></div>
          </div>

          <div className={styles.formCard}>
            <div className={styles.formHead}>
              <div className={styles.formIcon}><Lightbulb size={18} color="var(--gold)" /></div>
              <h3>Tips</h3>
            </div>
            <p>Stay hydrated and rest between sets. Log your weight and reps accurately for better progress tracking.</p>
          </div>

          <div className={styles.progCard}>
            <h3>Session Progress</h3>
            <div className={styles.progLabelRow}>
              <span>Workout Volume</span>
              <span className={styles.progPct}>{progress}%</span>
            </div>
            <div className={styles.progBar}>
              <div className={styles.progFill} style={{ width: `${progress}%` }} />
            </div>
            <div className={styles.progStats}>
              <div className={styles.progStat}>
                <span className={styles.progStatLabel}>Work Sets</span>
                <span className={styles.progStatVal}>{workSets} / {targetSets}</span>
              </div>
              <div className={styles.progStat}>
                <span className={styles.progStatLabel}>Cals Burned</span>
                <span className={styles.progStatVal}>{Math.round(elapsed / 8)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}