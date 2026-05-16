import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Eye, EyeOff, Zap, AlertCircle, ChevronDown } from 'lucide-react'
import { useAuth } from '../context/AuthContext'

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

export default function Register() {
  const [form, setForm] = useState({
    username: '',
    email: '',
    password: '',
    full_name: '',
    age: '',
    weight_kg: '',
    height_cm: '',
    experience_level: 'beginner',
    fitness_goal: 'general_fitness',
  })
  const [showPw, setShowPw] = useState(false)
  const [error, setError] = useState('')
  const { register, loading } = useAuth()
  const navigate = useNavigate()

  const set = (k, v) => setForm((p) => ({ ...p, [k]: v }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    const payload = {
      ...form,
      age: form.age ? parseInt(form.age) : undefined,
      weight_kg: form.weight_kg ? parseFloat(form.weight_kg) : undefined,
      height_cm: form.height_cm ? parseFloat(form.height_cm) : undefined,
    }
    const res = await register(payload)
    if (res.success) {
      navigate('/dashboard')
    } else {
      setError(res.error)
    }
  }

  return (
    <div className="min-h-screen flex">
      <div className="hidden lg:flex w-5/12 bg-bg-card border-r border-bg-border flex-col p-12 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute bottom-1/3 left-1/2 -translate-x-1/2 w-80 h-80 bg-accent/10 rounded-full blur-3xl" />
        </div>
        <Link to="/" className="flex items-center gap-2 relative z-10">
          <div className="w-8 h-8 rounded-lg bg-accent flex items-center justify-center">
            <Zap className="w-4 h-4 text-bg-base" fill="currentColor" />
          </div>
          <span className="text-xl font-bold">FitTrack</span>
        </Link>
        <div className="flex-1 flex flex-col justify-center relative z-10">
          <h2 className="text-4xl font-extrabold leading-tight mb-4">
            Start Your<br />
            <span className="text-gradient">Fitness Journey.</span>
          </h2>
          <p className="text-text-secondary leading-relaxed max-w-xs mb-8">
            Create a free account to start logging workouts, tracking progress, and achieving your goals.
          </p>
          <ul className="space-y-3">
            {[
              'Unlimited workout sessions',
              'Progress charts & analytics',
              'Personal record tracking',
              'Exercise library access',
            ].map((item) => (
              <li key={item} className="flex items-center gap-2.5 text-sm text-text-secondary">
                <div className="w-5 h-5 rounded-full bg-accent/20 border border-accent/30 flex items-center justify-center shrink-0">
                  <div className="w-2 h-2 rounded-full bg-accent" />
                </div>
                {item}
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="flex-1 overflow-auto flex items-start justify-center p-8 bg-bg-base">
        <div className="w-full max-w-lg py-4">
          <div className="lg:hidden mb-8">
            <Link to="/" className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-accent flex items-center justify-center">
                <Zap className="w-4 h-4 text-bg-base" fill="currentColor" />
              </div>
              <span className="text-xl font-bold">FitTrack</span>
            </Link>
          </div>

          <h1 className="text-3xl font-bold mb-2">Create Account</h1>
          <p className="text-text-secondary mb-8">
            Already have an account?{' '}
            <Link to="/login" className="text-accent hover:text-accent-light font-medium transition-colors">
              Sign in
            </Link>
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="flex items-center gap-3 p-4 bg-red-500/10 border border-red-500/30 rounded-lg text-sm text-red-400">
                <AlertCircle size={16} className="shrink-0" />
                {error}
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label">Username *</label>
                <input className="input" placeholder="johndoe" value={form.username} onChange={(e) => set('username', e.target.value)} required minLength={3} />
              </div>
              <div>
                <label className="label">Full Name</label>
                <input className="input" placeholder="John Doe" value={form.full_name} onChange={(e) => set('full_name', e.target.value)} />
              </div>
            </div>

            <div>
              <label className="label">Email Address *</label>
              <input type="email" className="input" placeholder="you@example.com" value={form.email} onChange={(e) => set('email', e.target.value)} required />
            </div>

            <div>
              <label className="label">Password *</label>
              <div className="relative">
                <input
                  type={showPw ? 'text' : 'password'}
                  className="input pr-12"
                  placeholder="Min. 8 characters"
                  value={form.password}
                  onChange={(e) => set('password', e.target.value)}
                  required
                  minLength={8}
                />
                <button
                  type="button"
                  onClick={() => setShowPw(!showPw)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-secondary transition-colors"
                >
                  {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="label">Age</label>
                <input type="number" className="input" placeholder="25" value={form.age} onChange={(e) => set('age', e.target.value)} min={1} max={119} />
              </div>
              <div>
                <label className="label">Weight (kg)</label>
                <input type="number" className="input" placeholder="70" value={form.weight_kg} onChange={(e) => set('weight_kg', e.target.value)} step="0.1" />
              </div>
              <div>
                <label className="label">Height (cm)</label>
                <input type="number" className="input" placeholder="175" value={form.height_cm} onChange={(e) => set('height_cm', e.target.value)} step="0.1" />
              </div>
            </div>

            <div>
              <label className="label">Experience Level</label>
              <div className="relative">
                <select className="select" value={form.experience_level} onChange={(e) => set('experience_level', e.target.value)}>
                  {experienceLevels.map(({ value, label }) => (
                    <option key={value} value={value}>{label}</option>
                  ))}
                </select>
                <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none" />
              </div>
            </div>

            <div>
              <label className="label">Fitness Goal</label>
              <div className="relative">
                <select className="select" value={form.fitness_goal} onChange={(e) => set('fitness_goal', e.target.value)}>
                  {fitnessGoals.map(({ value, label }) => (
                    <option key={value} value={value}>{label}</option>
                  ))}
                </select>
                <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none" />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full justify-center py-3.5 text-base mt-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Creating account…' : 'Create Account'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
