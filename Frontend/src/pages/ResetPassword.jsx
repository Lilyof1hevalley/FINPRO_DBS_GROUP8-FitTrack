import { useState } from 'react'
import { useNavigate, useSearchParams, Link } from 'react-router-dom'
import { Eye, EyeOff, Lock } from 'lucide-react'
import { authAPI } from '../api/services'
import toast from 'react-hot-toast'
import styles from './Login.module.css'

export default function ResetPassword() {
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token')
  const navigate = useNavigate()
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!password || !confirm) { toast.error('Please fill in all fields'); return }
    if (password !== confirm) { toast.error('Passwords do not match'); return }
    if (password.length < 8) { toast.error('Password must be at least 8 characters'); return }
    
    setLoading(true)
    try {
      await authAPI.resetPassword(token, password)
      toast.success('Password reset successful!')
      navigate('/login')
    } catch (err) {
      toast.error(err.response?.data?.error || 'Invalid or expired reset link')
    } finally {
      setLoading(false)
    }
  }

  if (!token) return (
    <div className={styles.outer}>
      <div className={styles.frame}>
        <div className={styles.card}>
          <p style={{ textAlign: 'center', color: 'var(--text-2)' }}>Invalid reset link.</p>
          <Link to="/login" style={{ color: 'var(--gold)', display: 'block', textAlign: 'center', marginTop: 12 }}>Back to Sign In</Link>
        </div>
      </div>
    </div>
  )

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
            <p>Set a new password</p>
          </div>
          
          <form onSubmit={handleSubmit} noValidate>
            <div className={styles.field}>
              <label>New Password</label>
              <div className={styles.inputWrap}>
                <Lock size={15} className={styles.inputIcon} />
                <input
                  type={showPass ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                />
                <button type="button" className={styles.eyeBtn} onClick={() => setShowPass(v => !v)}>
                  {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>
            <div className={styles.field}>
              <label>Confirm New Password</label>
              <div className={styles.inputWrap}>
                <Lock size={15} className={styles.inputIcon} />
                <input
                  type={showPass ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={confirm}
                  onChange={e => setConfirm(e.target.value)}
                />
              </div>
            </div>
            <button className={styles.btnPrimary} type="submit" disabled={loading}>
              {loading ? 'Resetting…' : 'Reset Password'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}