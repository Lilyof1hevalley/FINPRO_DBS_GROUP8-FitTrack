import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useGoogleLogin } from '@react-oauth/google'
import toast from 'react-hot-toast'
import { Dumbbell, Timer, Target, Scale, Activity, Zap } from 'lucide-react'
import styles from './Signup.module.css'

const GOALS = [
  { key: 'strength', label: 'Strength', Icon: Dumbbell },
  { key: 'endurance', label: 'Endurance', Icon: Timer },
  { key: 'flexibility', label: 'Balance', Icon: Target },
  { key: 'weight_loss', label: 'Weight', Icon: Scale },
]

export default function Signup() {
  const navigate = useNavigate()
  const { register, googleLogin } = useAuth()
  const [loading, setLoading] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)
  const [goal, setGoal] = useState('strength')
  const [form, setForm] = useState({
    full_name: '', email: '', username: '', password: '',
    age: '', height_cm: '', weight_kg: '',
  })

  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    const { full_name, email, username, password } = form
    if (!full_name || !email || !username || !password) {
      toast.error('Please fill in all required fields'); return
    }
    if (password.length < 8) {
      toast.error('Password must be at least 8 characters'); return
    }
    setLoading(true)
    try {
      const payload = {
        full_name, email, username, password,
        fitness_goal: goal,
        experience_level: 'beginner',
        age: form.age ? parseInt(form.age) : undefined,
        height_cm: form.height_cm ? parseFloat(form.height_cm) : undefined,
        weight_kg: form.weight_kg ? parseFloat(form.weight_kg) : undefined,
      }
      const user = await register(payload)
      toast.success(`Welcome to FitTrack, ${user.full_name || user.username}! 💪`)
      navigate('/dashboard')
    } catch (err) {
      const msg = err.response?.data?.error
        || err.response?.data?.errors?.[0]?.msg
        || 'Registration failed'
      toast.error(msg)
    } finally {
      setLoading(false)
    }
  }

  const handleGoogle = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      setGoogleLoading(true)
      try {
        const user = await googleLogin(tokenResponse.access_token)
        toast.success(`Welcome to FitTrack, ${user.full_name || user.username}! 💪`)
        navigate('/dashboard')
      } catch (err) {
        toast.error(err.response?.data?.error || 'Google login failed')
      } finally {
        setGoogleLoading(false)
      }
    },
    onError: () => toast.error('Google signup failed'),
  })

  return (
    <div className={styles.outer}>
      <div className={styles.frame}>
        <div className={styles.left}>
          <div className={styles.brand}>FitTrack</div>
          <p className={styles.tagline}>
            Elevate your performance with precision<br />metrics and AI-driven coaching.
          </p>

          <div className={styles.featureCard}>
            <div className={styles.featureIcon}><Activity size={20} color="var(--gold)" /></div>
            <div>
              <h3>Smart Insights</h3>
              <p>Real-time biometrics tracking.</p>
            </div>
          </div>

          <div className={styles.featureCard}>
            <div className={styles.featureIcon}><Zap size={20} color="var(--gold)" /></div>
            <div>
              <h3>Personalized Plans</h3>
              <p>Workouts tailored to your biometrics.</p>
            </div>
          </div>

          <div className={styles.featureCard}>
            <div className={styles.featureIcon}><Target size={20} color="var(--gold)" /></div>
            <div>
              <h3>Goal Focused</h3>
              <p>Achieve milestones faster with AI.</p>
            </div>
          </div>

          <div className={styles.gymPhoto}>
            <svg viewBox="0 0 420 160" xmlns="http://www.w3.org/2000/svg" width="100%" height="100%">
              <defs>
                <linearGradient id="gymG" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#1a1200"/>
                  <stop offset="55%" stopColor="#5a4208"/>
                  <stop offset="100%" stopColor="#c8940d"/>
                </linearGradient>
              </defs>
              <rect width="420" height="160" fill="url(#gymG)"/>
              <rect x="220" y="0" width="200" height="160" fill="rgba(200,148,13,0.18)"/>
              <rect x="240" y="10" width="80" height="140" fill="rgba(200,148,13,0.08)"/>
              <line x1="0" y1="125" x2="420" y2="125" stroke="rgba(255,255,255,0.07)" strokeWidth="1"/>
              <ellipse cx="340" cy="122" rx="42" ry="7" fill="rgba(0,0,0,0.35)"/>
              <rect x="308" y="85" width="64" height="38" rx="5" fill="rgba(0,0,0,0.45)"/>
              <rect x="322" y="62" width="36" height="28" rx="3" fill="rgba(0,0,0,0.3)"/>
              <circle cx="345" cy="55" r="9" fill="rgba(0,0,0,0.55)"/>
              <rect x="340" y="64" width="10" height="24" rx="3" fill="rgba(0,0,0,0.55)"/>
              <rect x="330" y="76" width="30" height="4" rx="2" fill="rgba(0,0,0,0.4)"/>
            </svg>
          </div>
        </div>

        <div className={styles.card}>
          <h2>Start Your Journey</h2>
          <p className={styles.subtitle}>Join 50,000+ elite athletes optimizing their health today.</p>

          <form onSubmit={handleSubmit} noValidate>
            <div className={styles.row2}>
              <div className={styles.field}>
                <label>Full Name</label>
                <input type="text" placeholder="John Doe" value={form.full_name} onChange={set('full_name')} autoComplete="name" />
              </div>
              <div className={styles.field}>
                <label>Email Address</label>
                <input type="email" placeholder="john@example.com" value={form.email} onChange={set('email')} autoComplete="email" />
              </div>
            </div>

            <div className={styles.field}>
              <label>Username</label>
              <input type="text" placeholder="johndoe" value={form.username} onChange={set('username')} autoComplete="username" />
            </div>

            <div className={styles.field}>
              <label>Password</label>
              <input type="password" placeholder="••••••••" value={form.password} onChange={set('password')} autoComplete="new-password" />
            </div>

            <div className={styles.row3}>
              <div className={styles.field}>
                <label className={styles.labelSmall}>AGE</label>
                <input type="number" placeholder="25" min="1" max="120" value={form.age} onChange={set('age')} />
              </div>
              <div className={styles.field}>
                <label className={styles.labelSmall}>HEIGHT (CM)</label>
                <input type="number" placeholder="180" min="50" max="300" value={form.height_cm} onChange={set('height_cm')} />
              </div>
              <div className={styles.field}>
                <label className={styles.labelSmall}>WEIGHT (KG)</label>
                <input type="number" placeholder="75" min="1" max="500" value={form.weight_kg} onChange={set('weight_kg')} />
              </div>
            </div>

            <div className={styles.field}>
              <label>Fitness Goal</label>
              <div className={styles.goals}>
                {GOALS.map(({ key, label, Icon }) => (
                  <button
                    key={key}
                    type="button"
                    className={`${styles.goalBtn} ${goal === key ? styles.goalActive : ''}`}
                    onClick={() => setGoal(key)}
                  >
                    <Icon size={20} />
                    <span>{label}</span>
                  </button>
                ))}
              </div>
            </div>

            <button className={styles.btnPrimary} type="submit" disabled={loading}>
              {loading && <span className={styles.spinner} />}
              {loading ? 'Creating account…' : 'Create Account'}
            </button>
          </form>

          <p className={styles.switchLink}>
            Already have an account? <Link to="/login">Log in</Link>
          </p>

          <div className={styles.orDivider}><span>OR CONTINUE WITH</span></div>

          <div className={styles.socialRow}>
            <button className={styles.socialBtn} type="button" onClick={() => handleGoogle()} disabled={googleLoading}>
              <GoogleIcon /> {googleLoading ? 'Signing in…' : 'Google'}
            </button>
          </div>

          <p className={styles.terms}>
            By registering, you agree to FitTrack's{' '}
            <a href="#">Terms of Service</a> and <a href="#">Privacy Policy</a>.
          </p>
        </div>
      </div>
    </div>
  )
}

function GoogleIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24">
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
    </svg>
  )
}
