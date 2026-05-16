import { useState, useEffect } from 'react'
import { User, Save, CheckCircle, AlertCircle, ChevronDown } from 'lucide-react'
import { userApi } from '../api'
import { useAuth } from '../context/AuthContext'
import AppLayout from '../components/AppLayout'

const experienceLevels = [
  { value: 'beginner', label: 'Beginner' },
  { value: 'intermediate', label: 'Intermediate' },
  { value: 'advanced', label: 'Advanced' },
]

const fitnessGoals = [
  { value: 'weight_loss', label: 'Weight Loss' },
  { value: 'muscle_gain', label: 'Muscle Gain' },
  { value: 'endurance', label: 'Endurance' },
  { value: 'flexibility', label: 'Flexibility' },
  { value: 'general_fitness', label: 'General Fitness' },
  { value: 'strength', label: 'Strength' },
]

export default function Profile() {
  const { user, refreshUser } = useAuth()
  const [form, setForm] = useState({
    full_name: '',
    age: '',
    weight_kg: '',
    height_cm: '',
    experience_level: 'beginner',
    fitness_goal: 'general_fitness',
  })
  const [saving, setSaving] = useState(false)
  const [status, setStatus] = useState(null)
  const [stats, setStats] = useState(null)

  useEffect(() => {
    const load = async () => {
      try {
        const [profileRes, statsRes] = await Promise.all([
          userApi.getProfile(),
          userApi.getStats(),
        ])
        const p = profileRes.data
        setForm({
          full_name: p.full_name || '',
          age: p.age || '',
          weight_kg: p.weight_kg || '',
          height_cm: p.height_cm || '',
          experience_level: p.experience_level || 'beginner',
          fitness_goal: p.fitness_goal || 'general_fitness',
        })
        setStats(statsRes.data)
      } catch (_) {}
    }
    load()
  }, [])

  const set = (k, v) => setForm((p) => ({ ...p, [k]: v }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    setStatus(null)
    try {
      await userApi.updateProfile({
        ...form,
        age: form.age ? parseInt(form.age) : null,
        weight_kg: form.weight_kg ? parseFloat(form.weight_kg) : null,
        height_cm: form.height_cm ? parseFloat(form.height_cm) : null,
      })
      await refreshUser()
      setStatus('success')
    } catch (_) {
      setStatus('error')
    }
    setSaving(false)
    setTimeout(() => setStatus(null), 3000)
  }

  const bmi = form.weight_kg && form.height_cm
    ? (parseFloat(form.weight_kg) / Math.pow(parseFloat(form.height_cm) / 100, 2)).toFixed(1)
    : null

  const bmiLabel = (b) => {
    if (!b) return ''
    const n = parseFloat(b)
    if (n < 18.5) return 'Underweight'
    if (n < 25) return 'Normal'
    if (n < 30) return 'Overweight'
    return 'Obese'
  }

  return (
    <AppLayout>
      <div className="p-8 max-w-3xl">
        <h1 className="text-2xl font-bold text-text-primary mb-8">Profile</h1>

        <div className="flex items-center gap-5 mb-8 p-6 bg-bg-card border border-bg-border rounded-xl">
          <div className="w-16 h-16 rounded-full bg-accent/20 border-2 border-accent/30 flex items-center justify-center">
            <span className="text-2xl font-bold text-accent">
              {user?.username?.[0]?.toUpperCase() || 'U'}
            </span>
          </div>
          <div>
            <h2 className="text-xl font-bold text-text-primary">{user?.full_name || user?.username}</h2>
            <p className="text-text-muted text-sm">{user?.email}</p>
            <p className="text-text-muted text-xs mt-1">
              Member since {user?.created_at ? new Date(user.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) : '—'}
            </p>
          </div>
        </div>

        {stats && (
          <div className="grid grid-cols-3 gap-3 mb-8">
            {[
              { label: 'Sessions', value: stats.total_sessions },
              { label: 'Minutes', value: stats.total_minutes },
              { label: 'Volume (kg)', value: Math.round(stats.total_volume_kg).toLocaleString() },
            ].map(({ label, value }) => (
              <div key={label} className="bg-bg-card border border-bg-border rounded-xl p-4 text-center">
                <p className="font-mono text-2xl font-bold text-text-primary">{value}</p>
                <p className="text-xs text-text-muted mt-1">{label}</p>
              </div>
            ))}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {status === 'success' && (
            <div className="flex items-center gap-3 p-4 bg-accent/10 border border-accent/30 rounded-lg text-sm text-accent">
              <CheckCircle size={16} />
              Profile updated successfully.
            </div>
          )}
          {status === 'error' && (
            <div className="flex items-center gap-3 p-4 bg-red-500/10 border border-red-500/30 rounded-lg text-sm text-red-400">
              <AlertCircle size={16} />
              Failed to update profile.
            </div>
          )}

          <div className="card space-y-4">
            <h3 className="text-sm font-semibold text-text-primary uppercase tracking-wider">Personal Info</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label">Full Name</label>
                <input className="input" placeholder="Your name" value={form.full_name} onChange={(e) => set('full_name', e.target.value)} />
              </div>
              <div>
                <label className="label">Age</label>
                <input type="number" className="input" placeholder="25" value={form.age} onChange={(e) => set('age', e.target.value)} min={1} max={119} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label">Weight (kg)</label>
                <input type="number" className="input" placeholder="70" value={form.weight_kg} onChange={(e) => set('weight_kg', e.target.value)} step="0.1" />
              </div>
              <div>
                <label className="label">Height (cm)</label>
                <input type="number" className="input" placeholder="175" value={form.height_cm} onChange={(e) => set('height_cm', e.target.value)} step="0.1" />
              </div>
            </div>
            {bmi && (
              <div className="flex items-center gap-3 p-3 bg-bg-elevated rounded-lg">
                <span className="text-xs text-text-muted">BMI:</span>
                <span className="font-mono text-sm font-bold text-text-primary">{bmi}</span>
                <span className="text-xs text-text-secondary">{bmiLabel(bmi)}</span>
              </div>
            )}
          </div>

          <div className="card space-y-4">
            <h3 className="text-sm font-semibold text-text-primary uppercase tracking-wider">Fitness Settings</h3>
            <div>
              <label className="label">Experience Level</label>
              <div className="relative">
                <select className="select" value={form.experience_level} onChange={(e) => set('experience_level', e.target.value)}>
                  {experienceLevels.map(({ value, label }) => <option key={value} value={value}>{label}</option>)}
                </select>
                <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none" />
              </div>
            </div>
            <div>
              <label className="label">Fitness Goal</label>
              <div className="relative">
                <select className="select" value={form.fitness_goal} onChange={(e) => set('fitness_goal', e.target.value)}>
                  {fitnessGoals.map(({ value, label }) => <option key={value} value={value}>{label}</option>)}
                </select>
                <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none" />
              </div>
            </div>
          </div>

          <button type="submit" disabled={saving} className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed">
            <Save size={16} />
            {saving ? 'Saving…' : 'Save Changes'}
          </button>
        </form>
      </div>
    </AppLayout>
  )
}
