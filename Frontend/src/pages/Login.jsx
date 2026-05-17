import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Eye, EyeOff, Mail, Lock } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useGoogleLogin } from '@react-oauth/google'
import toast from 'react-hot-toast'
import styles from './Login.module.css'

export default function Login() {
  const navigate = useNavigate()
  const { login, googleLogin } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [stayLogged, setStayLogged] = useState(false)
  const [loading, setLoading] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!email || !password) { toast.error('Please fill in all fields'); return }
    setLoading(true)
    try {
      const user = await login(email, password)
      toast.success(`Welcome back, ${user.full_name || user.username}!`)
      navigate('/dashboard')
    } catch (err) {
      toast.error(err.response?.data?.error || 'Login failed. Check your credentials.')
    } finally {
      setLoading(false)
    }
  }

  const handleGoogle = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      setGoogleLoading(true)
      try {
        const user = await googleLogin(tokenResponse.access_token)
        toast.success(`Welcome back, ${user.full_name || user.username}!`)
        navigate('/dashboard')
      } catch (err) {
        toast.error(err.response?.data?.error || 'Google login failed')
      } finally {
        setGoogleLoading(false)
      }
    },
    onError: () => toast.error('Google login failed'),
  })

  return (
    <div className={styles.outer}>
      <div className={styles.frame}>
        <div className={styles.card}>
          <div className={styles.logo}>
            <div className={styles.iconBox}>
              <svg viewBox="0 0 24 24" fill="white" width="26" height="26">
                <path d="M20.57 14.86L22 13.43 20.57 12 17 15.57 8.43 7 12 3.43 10.57 2 9.14 3.43 7.71 2 5.57 4.14 4.14 2.71 2.71 4.14l1.43 1.43L2 7.71l1.43 1.43L2 10.57 3.43 12 7 8.43 15.57 17 12 20.57 13.43 22l1.43-1.43L16.29 22l2.14-2.14 1.43 1.43 1.43-1.43-1.43-1.43L22 16.29l-1.43-1.43z"/>
              </svg>
            </div>
            <h1>FitTrack</h1>
            <p>Elevate your wellness journey.</p>
          </div>

          <form onSubmit={handleSubmit} noValidate>
            <div className={styles.field}>
              <label>Email Address</label>
              <div className={styles.inputWrap}>
                <Mail size={15} className={styles.inputIcon} />
                <input
                  type="email"
                  placeholder="name@example.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  autoComplete="email"
                />
              </div>
            </div>

            <div className={styles.field}>
              <div className={styles.fieldRow}>
                <label>Password</label>
                <a href="#" className={styles.forgot}>Forgot password?</a>
              </div>
              <div className={styles.inputWrap}>
                <Lock size={15} className={styles.inputIcon} />
                <input
                  type={showPass ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  autoComplete="current-password"
                />
                <button type="button" className={styles.eyeBtn} onClick={() => setShowPass(v => !v)}>
                  {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            <label className={styles.stayLogged}>
              <input
                type="checkbox"
                checked={stayLogged}
                onChange={e => setStayLogged(e.target.checked)}
              />
              <span>Stay logged in for 30 days</span>
            </label>

            <button className={styles.btnPrimary} type="submit" disabled={loading}>
              {loading ? <span className={styles.spinner} /> : null}
              {loading ? 'Signing in…' : 'Sign In'}
            </button>
          </form>

          <div className={styles.orDivider}><span>OR CONTINUE WITH</span></div>
          <div className={styles.socialRow}>
            <button className={styles.socialBtn} type="button" onClick={() => handleGoogle()} disabled={googleLoading}>
              <GoogleIcon /> {googleLoading ? 'Signing in…' : 'Google'}
            </button>
          </div>

          <p className={styles.switchLink}>
            New to the community?{' '}
            <Link to="/signup">Create an account</Link>
          </p>
        </div>

        <div className={styles.footer}>
          <a href="#">Privacy Policy</a>
          <a href="#">Terms of Service</a>
          <a href="#">Help Center</a>
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