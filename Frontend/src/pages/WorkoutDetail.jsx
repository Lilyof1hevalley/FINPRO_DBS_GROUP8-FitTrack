import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { ArrowLeft, Calendar, Clock, Weight, Trash2, Plus, Search } from 'lucide-react'
import { workoutApi, exerciseApi } from '../api'
import AppLayout from '../components/AppLayout'

function formatDate(d) {
  if (!d) return ''
  return new Date(d).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })
}

export default function WorkoutDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [session, setSession] = useState(null)
  const [logs, setLogs] = useState([])
  const [loading, setLoading] = useState(true)
  const [showAddLog, setShowAddLog] = useState(false)
  const [allExercises, setAllExercises] = useState([])
  const [search, setSearch] = useState('')
  const [addForm, setAddForm] = useState({ exercise_id: '', reps: '', weight_kg: '', set_number: '' })
  const [adding, setAdding] = useState(false)
  const [deleting, setDeleting] = useState(null)

  const load = async () => {
    try {
      const { data } = await workoutApi.getById(id)
      setSession(data.session)
      setLogs(data.logs)
    } catch (_) {}
    setLoading(false)
  }

  useEffect(() => {
    load()
    exerciseApi.getAll().then(({ data }) => setAllExercises(data)).catch(() => {})
  }, [id])

  const grouped = logs.reduce((acc, log) => {
    const key = log.exercise_id
    if (!acc[key]) acc[key] = { name: log.exercise_name, muscle: log.muscle_group, logs: [] }
    acc[key].logs.push(log)
    return acc
  }, {})

  const totalVolume = logs.reduce((sum, l) => sum + (l.weight_kg || 0) * (l.reps || 0), 0)

  const handleAddLog = async (e) => {
    e.preventDefault()
    setAdding(true)
    try {
      await workoutApi.addLog(id, {
        exercise_id: parseInt(addForm.exercise_id),
        reps: addForm.reps ? parseInt(addForm.reps) : null,
        weight_kg: addForm.weight_kg ? parseFloat(addForm.weight_kg) : null,
        set_number: addForm.set_number ? parseInt(addForm.set_number) : (logs.length + 1),
      })
      setAddForm({ exercise_id: '', reps: '', weight_kg: '', set_number: '' })
      setShowAddLog(false)
      load()
    } catch (_) {}
    setAdding(false)
  }

  const handleDeleteLog = async (sessionId, logId) => {
    if (!confirm('Delete this set?')) return
    setDeleting(logId)
    try {
      await workoutApi.deleteLog(sessionId, logId)
      setLogs((prev) => prev.filter((l) => l.id !== logId))
    } catch (_) {}
    setDeleting(null)
  }

  const handleDeleteSession = async () => {
    if (!confirm('Delete this entire workout session?')) return
    try {
      await workoutApi.remove(id)
      navigate('/workouts')
    } catch (_) {}
  }

  const filteredEx = allExercises.filter((e) => e.name.toLowerCase().includes(search.toLowerCase()))

  if (loading) {
    return (
      <AppLayout>
        <div className="p-8">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-bg-border rounded w-64" />
            <div className="h-4 bg-bg-border rounded w-40" />
            <div className="card mt-6 space-y-3">
              {[...Array(4)].map((_, i) => <div key={i} className="h-10 bg-bg-border rounded" />)}
            </div>
          </div>
        </div>
      </AppLayout>
    )
  }

  if (!session) {
    return (
      <AppLayout>
        <div className="p-8 text-center py-20">
          <p className="text-text-muted">Session not found.</p>
          <Link to="/workouts" className="btn-secondary mt-4 mx-auto text-sm">Back to Workouts</Link>
        </div>
      </AppLayout>
    )
  }

  return (
    <AppLayout>
      <div className="p-8 max-w-3xl">
        <Link to="/workouts" className="btn-ghost text-sm mb-6 -ml-2 inline-flex">
          <ArrowLeft size={16} />
          Back
        </Link>

        <div className="flex items-start justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-text-primary">{session.title || 'Untitled Workout'}</h1>
            <div className="flex items-center gap-4 mt-2">
              <span className="flex items-center gap-1.5 text-sm text-text-muted">
                <Calendar size={14} />
                {formatDate(session.started_at)}
              </span>
              {session.duration_min && (
                <span className="flex items-center gap-1.5 text-sm text-text-muted">
                  <Clock size={14} />
                  {session.duration_min} min
                </span>
              )}
            </div>
          </div>
          <button onClick={handleDeleteSession} className="btn-danger text-sm">
            <Trash2 size={14} />
            Delete
          </button>
        </div>

        <div className="grid grid-cols-3 gap-3 mb-6">
          <div className="bg-bg-card border border-bg-border rounded-xl p-4 text-center">
            <p className="font-mono text-2xl font-bold text-accent">{logs.length}</p>
            <p className="text-xs text-text-muted mt-1">Sets</p>
          </div>
          <div className="bg-bg-card border border-bg-border rounded-xl p-4 text-center">
            <p className="font-mono text-2xl font-bold text-text-primary">{Object.keys(grouped).length}</p>
            <p className="text-xs text-text-muted mt-1">Exercises</p>
          </div>
          <div className="bg-bg-card border border-bg-border rounded-xl p-4 text-center">
            <p className="font-mono text-2xl font-bold text-text-primary">{Math.round(totalVolume).toLocaleString()}</p>
            <p className="text-xs text-text-muted mt-1">Volume (kg)</p>
          </div>
        </div>

        {session.notes && (
          <div className="card mb-6">
            <p className="text-xs text-text-muted uppercase tracking-wider mb-2">Notes</p>
            <p className="text-sm text-text-secondary">{session.notes}</p>
          </div>
        )}

        <div className="space-y-4 mb-6">
          {Object.values(grouped).map(({ name, muscle, logs: exLogs }) => (
            <div key={name} className="card">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="font-semibold text-text-primary">{name}</p>
                  <p className="text-xs text-text-muted">{muscle}</p>
                </div>
                <span className="badge-green text-xs">{exLogs.length} sets</span>
              </div>
              <div className="space-y-2">
                <div className="grid grid-cols-12 gap-2 text-xs text-text-muted px-1 mb-1">
                  <div className="col-span-1">Set</div>
                  <div className="col-span-4">Weight</div>
                  <div className="col-span-4">Reps</div>
                  <div className="col-span-2">Volume</div>
                  <div className="col-span-1" />
                </div>
                {exLogs.map((log) => (
                  <div key={log.id} className="grid grid-cols-12 gap-2 items-center px-1 py-1.5 rounded-lg hover:bg-bg-elevated transition-colors group">
                    <div className="col-span-1">
                      <span className="font-mono text-sm text-text-muted">{log.set_number}</span>
                    </div>
                    <div className="col-span-4">
                      <span className="font-mono text-sm text-text-primary">{log.weight_kg ?? '—'} kg</span>
                    </div>
                    <div className="col-span-4">
                      <span className="font-mono text-sm text-text-primary">{log.reps ?? '—'}</span>
                    </div>
                    <div className="col-span-2">
                      <span className="font-mono text-xs text-text-muted">
                        {log.weight_kg && log.reps ? Math.round(log.weight_kg * log.reps) : '—'}
                      </span>
                    </div>
                    <div className="col-span-1 flex justify-end">
                      <button
                        onClick={() => handleDeleteLog(session.id, log.id)}
                        disabled={deleting === log.id}
                        className="p-1 text-text-muted hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}

          {logs.length === 0 && (
            <div className="border-2 border-dashed border-bg-border rounded-xl p-8 text-center">
              <p className="text-text-muted text-sm">No sets logged yet.</p>
            </div>
          )}
        </div>

        <button onClick={() => setShowAddLog((v) => !v)} className="btn-secondary text-sm">
          <Plus size={15} />
          Add Set
        </button>

        {showAddLog && (
          <div className="card mt-4">
            <h3 className="text-sm font-semibold text-text-primary mb-4">Add Set</h3>
            <form onSubmit={handleAddLog} className="space-y-3">
              <div>
                <label className="label">Exercise</label>
                <div className="relative mb-2">
                  <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
                  <input className="input pl-9 py-2 text-sm" placeholder="Search…" value={search} onChange={(e) => setSearch(e.target.value)} />
                </div>
                <select
                  className="select text-sm"
                  value={addForm.exercise_id}
                  onChange={(e) => setAddForm((p) => ({ ...p, exercise_id: e.target.value }))}
                  required
                >
                  <option value="">Select exercise</option>
                  {filteredEx.map((ex) => (
                    <option key={ex.id} value={ex.id}>{ex.name}</option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="label">Set #</label>
                  <input type="number" className="input py-2 text-sm" placeholder="1" value={addForm.set_number} onChange={(e) => setAddForm((p) => ({ ...p, set_number: e.target.value }))} min={1} />
                </div>
                <div>
                  <label className="label">Weight (kg)</label>
                  <input type="number" className="input py-2 text-sm" placeholder="0" value={addForm.weight_kg} onChange={(e) => setAddForm((p) => ({ ...p, weight_kg: e.target.value }))} step="0.5" min={0} />
                </div>
                <div>
                  <label className="label">Reps</label>
                  <input type="number" className="input py-2 text-sm" placeholder="0" value={addForm.reps} onChange={(e) => setAddForm((p) => ({ ...p, reps: e.target.value }))} min={0} />
                </div>
              </div>
              <div className="flex gap-2">
                <button type="submit" disabled={adding} className="btn-primary text-sm disabled:opacity-50">
                  {adding ? 'Adding…' : 'Add Set'}
                </button>
                <button type="button" onClick={() => setShowAddLog(false)} className="btn-ghost text-sm">Cancel</button>
              </div>
            </form>
          </div>
        )}
      </div>
    </AppLayout>
  )
}
