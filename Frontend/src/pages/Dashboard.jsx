import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Dumbbell, Clock, Weight, Plus, TrendingUp, Trophy, ArrowRight, Flame } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { userApi, workoutApi } from '../api'
import AppLayout from '../components/AppLayout'

function StatCard({ icon: Icon, label, value, unit, color = 'accent' }) {
  const colorMap = {
    accent: 'text-accent bg-accent/10 border-accent/20',
    blue: 'text-blue-400 bg-blue-500/10 border-blue-500/20',
    orange: 'text-orange-400 bg-orange-500/10 border-orange-500/20',
  }
  return (
    <div className="stat-card">
      <div className={`w-10 h-10 rounded-lg border flex items-center justify-center ${colorMap[color]}`}>
        <Icon size={20} />
      </div>
      <div>
        <p className="text-xs text-text-muted uppercase tracking-wider">{label}</p>
        <p className="text-3xl font-mono font-bold text-text-primary mt-0.5">
          {value ?? '—'}
          {unit && <span className="text-base font-sans text-text-muted ml-1">{unit}</span>}
        </p>
      </div>
    </div>
  )
}

function formatDate(dateStr) {
  if (!dateStr) return ''
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

export default function Dashboard() {
  const { user } = useAuth()
  const [stats, setStats] = useState(null)
  const [recentWorkouts, setRecentWorkouts] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      try {
        const [statsRes, workoutsRes] = await Promise.all([
          userApi.getStats(),
          workoutApi.getAll({ page: 1, limit: 5 }),
        ])
        setStats(statsRes.data)
        setRecentWorkouts(workoutsRes.data.data)
      } catch (_) {}
      setLoading(false)
    }
    load()
  }, [])

  const goalLabel = (g) =>
    ({ weight_loss: 'Weight Loss', muscle_gain: 'Muscle Gain', endurance: 'Endurance', flexibility: 'Flexibility', general_fitness: 'General Fitness', strength: 'Strength' }[g] || g)

  return (
    <AppLayout>
      <div className="p-8">
        <div className="flex items-start justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-text-primary">
              Good day, {user?.full_name || user?.username} 👋
            </h1>
            <p className="text-text-secondary mt-1 text-sm">Here's what your training looks like.</p>
          </div>
          <Link to="/workouts/new" className="btn-primary">
            <Plus size={16} />
            New Workout
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="stat-card animate-pulse">
                <div className="w-10 h-10 bg-bg-border rounded-lg" />
                <div className="space-y-2">
                  <div className="h-3 bg-bg-border rounded w-20" />
                  <div className="h-7 bg-bg-border rounded w-16" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <StatCard icon={Dumbbell} label="Total Sessions" value={stats?.total_sessions ?? 0} color="accent" />
            <StatCard icon={Clock} label="Total Minutes" value={stats?.total_minutes ?? 0} unit="min" color="blue" />
            <StatCard icon={Weight} label="Total Volume" value={stats?.total_volume_kg ? Math.round(stats.total_volume_kg).toLocaleString() : 0} unit="kg" color="orange" />
            <StatCard icon={Trophy} label="Exercises" value={stats?.top_exercises?.length ?? 0} color="accent" />
          </div>
        )}

        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-text-primary">Recent Workouts</h2>
              <Link to="/workouts" className="text-sm text-accent hover:text-accent-light transition-colors flex items-center gap-1">
                View all <ArrowRight size={14} />
              </Link>
            </div>
            <div className="space-y-3">
              {recentWorkouts.length === 0 && !loading && (
                <div className="card text-center py-10">
                  <Dumbbell size={32} className="text-text-muted mx-auto mb-3" />
                  <p className="text-text-secondary text-sm">No workouts yet.</p>
                  <Link to="/workouts/new" className="btn-primary mt-4 mx-auto text-sm">
                    <Plus size={14} />
                    Start First Workout
                  </Link>
                </div>
              )}
              {recentWorkouts.map((w) => (
                <Link
                  key={w.id}
                  to={`/workouts/${w.id}`}
                  className="card block hover:border-accent/30 transition-colors duration-200 group"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-text-primary group-hover:text-accent transition-colors">
                        {w.title || 'Untitled Workout'}
                      </p>
                      <p className="text-xs text-text-muted mt-1">{formatDate(w.started_at)}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-text-secondary">{w.total_sets} sets</p>
                      {w.duration_min && (
                        <p className="text-xs text-text-muted mt-1">{w.duration_min} min</p>
                      )}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <div className="card">
              <h3 className="text-sm font-semibold text-text-primary mb-4 flex items-center gap-2">
                <Flame size={16} className="text-orange-400" />
                Your Profile
              </h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-text-muted">Level</span>
                  <span className="capitalize text-text-secondary">{user?.experience_level}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-muted">Goal</span>
                  <span className="text-text-secondary">{goalLabel(user?.fitness_goal)}</span>
                </div>
                {user?.weight_kg && (
                  <div className="flex justify-between">
                    <span className="text-text-muted">Weight</span>
                    <span className="font-mono text-text-secondary">{user.weight_kg} kg</span>
                  </div>
                )}
                {user?.height_cm && (
                  <div className="flex justify-between">
                    <span className="text-text-muted">Height</span>
                    <span className="font-mono text-text-secondary">{user.height_cm} cm</span>
                  </div>
                )}
              </div>
              <Link to="/profile" className="btn-ghost text-xs mt-4 w-full justify-center">
                Edit Profile
              </Link>
            </div>

            {stats?.top_exercises?.length > 0 && (
              <div className="card">
                <h3 className="text-sm font-semibold text-text-primary mb-4 flex items-center gap-2">
                  <TrendingUp size={16} className="text-accent" />
                  Top Exercises
                </h3>
                <div className="space-y-2.5">
                  {stats.top_exercises.map((ex, i) => (
                    <div key={ex.name} className="flex items-center gap-3">
                      <span className="font-mono text-xs text-text-muted w-4">{i + 1}</span>
                      <div className="flex-1">
                        <p className="text-xs font-medium text-text-secondary">{ex.name}</p>
                        <div className="mt-1 h-1 bg-bg-border rounded-full overflow-hidden">
                          <div
                            className="h-full bg-accent rounded-full transition-all"
                            style={{ width: `${(parseInt(ex.sets_logged) / parseInt(stats.top_exercises[0].sets_logged)) * 100}%` }}
                          />
                        </div>
                      </div>
                      <span className="font-mono text-xs text-text-muted">{ex.sets_logged}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </AppLayout>
  )
}
