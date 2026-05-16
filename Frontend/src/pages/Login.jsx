import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Eye, EyeOff, Zap, AlertCircle } from 'lucide-react'
import { useAuth } from '../context/AuthContext'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPw, setShowPw] = useState(false)
  const [error, setError] = useState('')
  const { login, loading } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    const res = await login(email, password)
    if (res.success) {
      navigate('/dashboard')
    } else {
      setError(res.error)
    }
  }

  return (
    <div className="min-h-screen flex">
      <div className="hidden lg:flex w-1/2 bg-bg-card border-r border-bg-border flex-col p-12 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-accent/10 rounded-full blur-3xl" />
          <div className="absolute top-20 right-20 w-32 h-32 bg-accent/5 rounded-full blur-2xl" />
        </div>
        <Link to="/" className="flex items-center gap-2 relative z-10">
          <div className="w-8 h-8 rounded-lg bg-accent flex items-center justify-center">
            <Zap className="w-4 h-4 text-bg-base" fill="currentColor" />
          </div>
          <span className="text-xl font-bold">FitTrack</span>
        </Link>
        <div className="flex-1 flex flex-col justify-center relative z-10">
          <h2 className="text-4xl font-extrabold leading-tight mb-4">
            Welcome back,<br />
            <span className="text-gradient">Athlete.</span>
          </h2>
          <p className="text-text-secondary leading-relaxed max-w-xs">
            Your progress is waiting. Log in to continue tracking your workouts and crushing your goals.
          </p>
          <div className="mt-10 grid grid-cols-3 gap-4">
            {[
              { label: 'Workouts Logged', val: '1.2M+' },
              { label: 'PRs Broken', val: '840K+' },
              { label: 'Active Users', val: '50K+' },
            ].map(({ label, val }) => (
              <div key={label} className="bg-bg-elevated border border-bg-border rounded-xl p-4 text-center">
                <p className="font-mono text-2xl font-bold text-accent">{val}</p>
                <p className="text-xs text-text-muted mt-1">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center p-8 bg-bg-base">
        <div className="w-full max-w-md">
          <div className="lg:hidden mb-10">
            <Link to="/" className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-accent flex items-center justify-center">
                <Zap className="w-4 h-4 text-bg-base" fill="currentColor" />
              </div>
              <span className="text-xl font-bold">FitTrack</span>
            </Link>
          </div>

          <h1 className="text-3xl font-bold mb-2">Sign In</h1>
          <p className="text-text-secondary mb-8">
            Don't have an account?{' '}
            <Link to="/register" className="text-accent hover:text-accent-light font-medium transition-colors">
              Create one
            </Link>
          </p>

          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="flex items-center gap-3 p-4 bg-red-500/10 border border-red-500/30 rounded-lg text-sm text-red-400">
                <AlertCircle size={16} className="shrink-0" />
                {error}
              </div>
            )}

            <div>
              <label className="label">Email Address</label>
              <input
                type="email"
                className="input"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
              />
            </div>

            <div>
              <label className="label">Password</label>
              <div className="relative">
                <input
                  type={showPw ? 'text' : 'password'}
                  className="input pr-12"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="current-password"
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

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full justify-center py-3.5 text-base disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Signing in…' : 'Sign In'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
