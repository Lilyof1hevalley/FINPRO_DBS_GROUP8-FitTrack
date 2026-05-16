import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { workoutAPI, exerciseAPI } from '../api/services'
import { ChevronLeft, Plus, Trash2 } from 'lucide-react'
import toast from 'react-hot-toast'
import styles from './WorkoutNew.module.css'

export default function WorkoutNew() {
  const navigate = useNavigate()
  const [title, setTitle] = useState('')
  const [notes, setNotes] = useState('')
  const [duration, setDuration] = useState('')
  const [exercises, setExercises] = useState([])
  const [logs, setLogs] = useState([])
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    exerciseAPI.getAll()
      .then(res => setExercises(res.data))
      .catch(() => {})
  }, [])

  const addLog = () => {
    setLogs(prev => [...prev, { exercise_id: '', set_number: prev.length + 1, reps: '', weight_kg: '', duration_sec: '', notes: '' }])
  }

  const updateLog = (i, field, val) => {
    setLogs(prev => prev.map((l, idx) => idx === i ? { ...l, [field]: val } : l))
  }

  const removeLog = (i) => {
    setLogs(prev => prev.filter((_, idx) => idx !== i).map((l, idx) => ({ ...l, set_number: idx + 1 })))
  }

  const handleSave = async () => {
    if (!title.trim()) { toast.error('Please add a session title'); return }
    setSaving(true)
    try {
      const sessionRes = await workoutAPI.createSession({
        title,
        notes: notes || undefined,
        duration_min: duration ? parseInt(duration) : undefined,
        started_at: new Date().toISOString(),
      })
      const sessionId = sessionRes.data.id

      const validLogs = logs.filter(l => l.exercise_id)
      if (validLogs.length > 0) {
        await workoutAPI.addLogsBulk(sessionId, validLogs.map(l => ({
          exercise_id: parseInt(l.exercise_id),
          set_number: l.set_number,
          reps: l.reps ? parseInt(l.reps) : undefined,
          weight_kg: l.weight_kg ? parseFloat(l.weight_kg) : undefined,
          duration_sec: l.duration_sec ? parseInt(l.duration_sec) : undefined,
          notes: l.notes || undefined,
        })))
      }

      toast.success('Workout session saved!')
      navigate(`/workouts/${sessionId}`)
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to save session')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <button className={styles.back} onClick={() => navigate('/workouts')}>
          <ChevronLeft size={18} /> Back
        </button>
        <button className={styles.saveBtn} onClick={handleSave} disabled={saving}>
          {saving && <span className={styles.spinner} />}
          {saving ? 'Saving…' : 'Save Session'}
        </button>
      </div>

      <div className={styles.section}>
        <h1>New Workout Session</h1>
        <p className={styles.sub}>Log your training session with exercises and sets.</p>
      </div>

      <div className={styles.card}>
        <div className={styles.field}>
          <label>Session Title</label>
          <input
            type="text"
            placeholder="e.g. Upper Body Strength"
            value={title}
            onChange={e => setTitle(e.target.value)}
          />
        </div>
        <div className={styles.row2}>
          <div className={styles.field}>
            <label>Duration (minutes)</label>
            <input
              type="number"
              placeholder="45"
              min="1"
              value={duration}
              onChange={e => setDuration(e.target.value)}
            />
          </div>
          <div className={styles.field}>
            <label>Notes</label>
            <input
              type="text"
              placeholder="Optional notes…"
              value={notes}
              onChange={e => setNotes(e.target.value)}
            />
          </div>
        </div>
      </div>

      <div className={styles.card}>
        <div className={styles.logsHeader}>
          <h2>Exercises & Sets</h2>
          <button className={styles.addBtn} onClick={addLog} type="button">
            <Plus size={15} /> Add Set
          </button>
        </div>

        {logs.length === 0 ? (
          <div className={styles.emptyLogs}>
            <p>No exercises added yet.</p>
            <button className={styles.addBtn} onClick={addLog} type="button">
              <Plus size={15} /> Add your first set
            </button>
          </div>
        ) : (
          <div className={styles.logsTable}>
            <div className={styles.logsHead}>
              <span>Set</span>
              <span>Exercise</span>
              <span>Reps</span>
              <span>Weight (kg)</span>
              <span>Duration (s)</span>
              <span></span>
            </div>
            {logs.map((log, i) => (
              <div key={i} className={styles.logRow}>
                <span className={styles.setNum}>{log.set_number}</span>
                <select
                  value={log.exercise_id}
                  onChange={e => updateLog(i, 'exercise_id', e.target.value)}
                >
                  <option value="">Select exercise</option>
                  {exercises.map(ex => (
                    <option key={ex.id} value={ex.id}>{ex.name}</option>
                  ))}
                </select>
                <input
                  type="number"
                  placeholder="10"
                  min="0"
                  value={log.reps}
                  onChange={e => updateLog(i, 'reps', e.target.value)}
                />
                <input
                  type="number"
                  placeholder="60"
                  min="0"
                  step="0.5"
                  value={log.weight_kg}
                  onChange={e => updateLog(i, 'weight_kg', e.target.value)}
                />
                <input
                  type="number"
                  placeholder="—"
                  min="0"
                  value={log.duration_sec}
                  onChange={e => updateLog(i, 'duration_sec', e.target.value)}
                />
                <button className={styles.removeBtn} onClick={() => removeLog(i)} type="button">
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
