import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, Minus, Search, Trash2, ChevronDown, Check } from 'lucide-react'
import { workoutApi, exerciseApi } from '../api'
import AppLayout from '../components/AppLayout'

export default function NewWorkout() {
  const [title, setTitle] = useState('')
  const [notes, setNotes] = useState('')
  const [durationMin, setDurationMin] = useState('')
  const [exercises, setExercises] = useState([])
  const [allExercises, setAllExercises] = useState([])
  const [search, setSearch] = useState('')
  const [showPicker, setShowPicker] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const navigate = useNavigate()

  useEffect(() => {
    exerciseApi.getAll().then(({ data }) => setAllExercises(data)).catch(() => {})
  }, [])

  const filtered = allExercises.filter(
    (e) =>
      !exercises.find((ex) => ex.exercise_id === e.id) &&
      e.name.toLowerCase().includes(search.toLowerCase())
  )

  const addExercise = (ex) => {
    setExercises((prev) => [
      ...prev,
      { exercise_id: ex.id, exercise_name: ex.name, muscle_group: ex.muscle_group, sets: [{ reps: '', weight_kg: '' }] },
    ])
    setShowPicker(false)
    setSearch('')
  }

  const removeExercise = (idx) => setExercises((prev) => prev.filter((_, i) => i !== idx))

  const addSet = (exIdx) =>
    setExercises((prev) =>
      prev.map((ex, i) => (i === exIdx ? { ...ex, sets: [...ex.sets, { reps: '', weight_kg: '' }] } : ex))
    )

  const removeSet = (exIdx, sIdx) =>
    setExercises((prev) =>
      prev.map((ex, i) =>
        i === exIdx && ex.sets.length > 1 ? { ...ex, sets: ex.sets.filter((_, j) => j !== sIdx) } : ex
      )
    )

  const updateSet = (exIdx, sIdx, field, val) =>
    setExercises((prev) =>
      prev.map((ex, i) =>
        i === exIdx
          ? { ...ex, sets: ex.sets.map((s, j) => (j === sIdx ? { ...s, [field]: val } : s)) }
          : ex
      )
    )

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (exercises.length === 0) { setError('Add at least one exercise.'); return }
    setSaving(true)
    setError('')
    try {
      const { data: session } = await workoutApi.create({
        title: title || undefined,
        notes: notes || undefined,
        duration_min: durationMin ? parseInt(durationMin) : undefined,
        started_at: new Date().toISOString(),
      })

      const logs = []
      exercises.forEach((ex) => {
        ex.sets.forEach((s, sIdx) => {
          logs.push({
            exercise_id: ex.exercise_id,
            set_number: sIdx + 1,
            reps: s.reps ? parseInt(s.reps) : null,
            weight_kg: s.weight_kg ? parseFloat(s.weight_kg) : null,
          })
        })
      })

      if (logs.length > 0) {
        await workoutApi.addLogsBulk(session.id, { logs })
      }

      navigate(`/workouts/${session.id}`)
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to save workout.')
    }
    setSaving(false)
  }

  return (
    <AppLayout>
      <div className="p-8 max-w-3xl">
        <h1 className="text-2xl font-bold text-text-primary mb-8">New Workout</h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-lg text-sm text-red-400">{error}</div>
          )}

          <div className="card space-y-4">
            <h2 className="text-sm font-semibold text-text-primary uppercase tracking-wider">Session Details</h2>
            <div>
              <label className="label">Workout Title</label>
              <input className="input" placeholder="e.g. Push Day, Leg Day…" value={title} onChange={(e) => setTitle(e.target.value)} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label">Duration (min)</label>
                <input type="number" className="input" placeholder="60" value={durationMin} onChange={(e) => setDurationMin(e.target.value)} min={1} />
              </div>
            </div>
            <div>
              <label className="label">Notes</label>
              <textarea className="input resize-none" rows={2} placeholder="Any notes…" value={notes} onChange={(e) => setNotes(e.target.value)} />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-semibold text-text-primary uppercase tracking-wider">Exercises</h2>
              <button
                type="button"
                onClick={() => setShowPicker((v) => !v)}
                className="btn-secondary text-sm py-2"
              >
                <Plus size={15} />
                Add Exercise
              </button>
            </div>

            {showPicker && (
              <div className="card mb-4">
                <div className="relative mb-3">
                  <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
                  <input
                    className="input pl-9"
                    placeholder="Search exercises…"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    autoFocus
                  />
                </div>
                <div className="max-h-52 overflow-y-auto space-y-1">
                  {filtered.length === 0 && <p className="text-sm text-text-muted text-center py-4">No results.</p>}
                  {filtered.map((ex) => (
                    <button
                      key={ex.id}
                      type="button"
                      onClick={() => addExercise(ex)}
                      className="w-full flex items-center justify-between px-3 py-2.5 rounded-lg hover:bg-bg-elevated text-left transition-colors"
                    >
                      <div>
                        <p className="text-sm font-medium text-text-primary">{ex.name}</p>
                        <p className="text-xs text-text-muted">{ex.muscle_group} · {ex.category}</p>
                      </div>
                      <Plus size={14} className="text-accent shrink-0" />
                    </button>
                  ))}
                </div>
              </div>
            )}

            {exercises.length === 0 && (
              <div className="border-2 border-dashed border-bg-border rounded-xl p-10 text-center">
                <p className="text-text-muted text-sm">No exercises added yet.</p>
              </div>
            )}

            <div className="space-y-4">
              {exercises.map((ex, exIdx) => (
                <div key={exIdx} className="card">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <p className="font-semibold text-text-primary">{ex.exercise_name}</p>
                      <p className="text-xs text-text-muted">{ex.muscle_group}</p>
                    </div>
                    <button type="button" onClick={() => removeExercise(exIdx)} className="p-1.5 text-text-muted hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all">
                      <Trash2 size={15} />
                    </button>
                  </div>

                  <div className="space-y-2">
                    <div className="grid grid-cols-12 gap-2 text-xs text-text-muted px-1 mb-1">
                      <div className="col-span-1">Set</div>
                      <div className="col-span-5">Weight (kg)</div>
                      <div className="col-span-5">Reps</div>
                      <div className="col-span-1" />
                    </div>

                    {ex.sets.map((s, sIdx) => (
                      <div key={sIdx} className="grid grid-cols-12 gap-2 items-center">
                        <div className="col-span-1">
                          <span className="font-mono text-sm text-text-muted">{sIdx + 1}</span>
                        </div>
                        <div className="col-span-5">
                          <input
                            type="number"
                            className="input py-2 text-sm"
                            placeholder="0"
                            value={s.weight_kg}
                            onChange={(e) => updateSet(exIdx, sIdx, 'weight_kg', e.target.value)}
                            step="0.5"
                            min={0}
                          />
                        </div>
                        <div className="col-span-5">
                          <input
                            type="number"
                            className="input py-2 text-sm"
                            placeholder="0"
                            value={s.reps}
                            onChange={(e) => updateSet(exIdx, sIdx, 'reps', e.target.value)}
                            min={0}
                          />
                        </div>
                        <div className="col-span-1 flex justify-center">
                          <button
                            type="button"
                            onClick={() => removeSet(exIdx, sIdx)}
                            className="p-1 text-text-muted hover:text-red-400 transition-colors"
                          >
                            <Minus size={14} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  <button type="button" onClick={() => addSet(exIdx)} className="btn-ghost text-xs mt-3 w-full justify-center">
                    <Plus size={13} />
                    Add Set
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button type="submit" disabled={saving} className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed">
              {saving ? 'Saving…' : 'Save Workout'}
            </button>
            <button type="button" onClick={() => navigate('/workouts')} className="btn-secondary">
              Cancel
            </button>
          </div>
        </form>
      </div>
    </AppLayout>
  )
}
