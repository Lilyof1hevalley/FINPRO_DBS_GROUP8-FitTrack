import { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { Plus, Dumbbell, Clock, Weight, ChevronLeft, ChevronRight, Trash2, Calendar } from 'lucide-react'
import { workoutApi } from '../api'
import AppLayout from '../components/AppLayout'

function formatDate(dateStr) {
  if (!dateStr) return ''
  return new Date(dateStr).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
}

export default function Workouts() {
  const [sessions, setSessions] = useState([])
  const [pagination, setPagination] = useState({ page: 1, total_pages: 1, total: 0 })
  const [loading, setLoading] = useState(true)
  const [deleting, setDeleting] = useState(null)

  const load = useCallback(async (page = 1) => {
    setLoading(true)
    try {
      const { data } = await workoutApi.getAll({ page, limit: 10 })
      setSessions(data.data)
      setPagination(data.pagination)
    } catch (_) {}
    setLoading(false)
  }, [])

  useEffect(() => { load(1) }, [load])

  const handleDelete = async (e, id) => {
    e.preventDefault()
    if (!confirm('Delete this workout session?')) return
    setDeleting(id)
    try {
      await workoutApi.remove(id)
      load(pagination.page)
    } catch (_) {}
    setDeleting(null)
  }

  return (
    <AppLayout>
      <div className="p-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-text-primary">Workouts</h1>
            <p className="text-text-secondary mt-1 text-sm">
              {pagination.total} session{pagination.total !== 1 ? 's' : ''} logged
            </p>
          </div>
          <Link to="/workouts/new" className="btn-primary">
            <Plus size={16} />
            New Workout
          </Link>
        </div>

        {loading ? (
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="card animate-pulse">
                <div className="flex justify-between">
                  <div className="space-y-2">
                    <div className="h-4 bg-bg-border rounded w-40" />
                    <div className="h-3 bg-bg-border rounded w-24" />
                  </div>
                  <div className="h-4 bg-bg-border rounded w-20" />
                </div>
              </div>
            ))}
          </div>
        ) : sessions.length === 0 ? (
          <div className="card text-center py-16">
            <Dumbbell size={40} className="text-text-muted mx-auto mb-4" />
            <h3 className="text-text-secondary font-medium mb-2">No workouts yet</h3>
            <p className="text-text-muted text-sm mb-6">Start your first session to build your history.</p>
            <Link to="/workouts/new" className="btn-primary mx-auto text-sm">
              <Plus size={14} />
              Start First Workout
            </Link>
          </div>
        ) : (
          <>
            <div className="space-y-3">
              {sessions.map((s) => (
                <Link
                  key={s.id}
                  to={`/workouts/${s.id}`}
                  className="card block hover:border-accent/30 transition-all duration-200 group"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-lg bg-accent/10 border border-accent/20 flex items-center justify-center shrink-0">
                      <Dumbbell size={18} className="text-accent" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-text-primary group-hover:text-accent transition-colors truncate">
                        {s.title || 'Untitled Workout'}
                      </p>
                      <div className="flex items-center gap-3 mt-1">
                        <span className="flex items-center gap-1 text-xs text-text-muted">
                          <Calendar size={12} />
                          {formatDate(s.started_at)}
                        </span>
                        {s.duration_min && (
                          <span className="flex items-center gap-1 text-xs text-text-muted">
                            <Clock size={12} />
                            {s.duration_min} min
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-6 shrink-0">
                      <div className="text-right hidden sm:block">
                        <p className="text-sm font-medium text-text-secondary">{s.total_sets} sets</p>
                        {parseFloat(s.total_volume_kg) > 0 && (
                          <p className="text-xs text-text-muted font-mono">{Math.round(parseFloat(s.total_volume_kg)).toLocaleString()} kg</p>
                        )}
                      </div>
                      <button
                        onClick={(e) => handleDelete(e, s.id)}
                        disabled={deleting === s.id}
                        className="p-2 text-text-muted hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </div>
                </Link>
              ))}
            </div>

            {pagination.total_pages > 1 && (
              <div className="flex items-center justify-between mt-6">
                <p className="text-sm text-text-muted">
                  Page {pagination.page} of {pagination.total_pages}
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={() => load(pagination.page - 1)}
                    disabled={pagination.page <= 1}
                    className="btn-secondary py-2 px-3 disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    <ChevronLeft size={16} />
                  </button>
                  <button
                    onClick={() => load(pagination.page + 1)}
                    disabled={pagination.page >= pagination.total_pages}
                    className="btn-secondary py-2 px-3 disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    <ChevronRight size={16} />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </AppLayout>
  )
}
