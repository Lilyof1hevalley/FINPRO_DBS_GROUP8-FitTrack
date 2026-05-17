import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Mail } from 'lucide-react'
import { authAPI } from '../api/services'
import toast from 'react-hot-toast'
import styles from './Login.module.css'

export default function ForgotPassword() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!email) { toast.error('Please enter your email'); return }
    setLoading(true)
    try {
      await authAPI.forgotPassword(email)
      setSent(true)
    } catch {
      toast.error('Something went wrong. Try again.')
    } finally {
      setLoading(false)
    }
  }

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
            <p>Reset your password</p>
          </div>

          {sent ? (
            <div style={{ textAlign: 'center', padding: '20px 0' }}>
              <p style={{ color: 'var(--text-2)', fontSize: 14, lineHeight: 1.6 }}>
                If that email exists in our system, a reset link has been sent. Check your inbox!
              </p>
              <Link to="/login" style={{ color: 'var(--gold)', fontWeight: 600, fontSize: 14, marginTop: 16, display: 'block' }}>
                Back to Sign In
              </Link>
            </div>
          ) : (
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
              <button className={styles.btnPrimary} type="submit" disabled={loading}>
                {loading ? 'Sending…' : 'Send Reset Link'}
              </button>
              <p className={styles.switchLink} style={{ marginTop: 16 }}>
                <Link to="/login">Back to Sign In</Link>
              </p>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}