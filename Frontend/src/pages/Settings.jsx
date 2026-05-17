import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { useNavigate } from 'react-router-dom'
import { userAPI } from '../api/services'
import toast from 'react-hot-toast'
import { Lock, Trash2, LogOut } from 'lucide-react'
import styles from './Profile.module.css'

export default function Settings() {
  const { logout } = useAuth()
  const navigate = useNavigate()
  const [passwords, setPasswords] = useState({ current: '', newPass: '', confirm: '' })
  const [saving, setSaving] = useState(false)

  const set = (k) => (e) => setPasswords(p => ({ ...p, [k]: e.target.value }))

  const handleChangePassword = async () => {
    if (!passwords.current || !passwords.newPass || !passwords.confirm) {
      toast.error('Please fill in all fields'); return
    }
    if (passwords.newPass !== passwords.confirm) {
      toast.error('New passwords do not match'); return
    }
    if (passwords.newPass.length < 8) {
      toast.error('Password must be at least 8 characters'); return
    }
    setSaving(true)
    try {
      await userAPI.updateProfile({ current_password: passwords.current, password: passwords.newPass })
      toast.success('Password updated!')
      setPasswords({ current: '', newPass: '', confirm: '' })
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to update password')
    } finally {
      setSaving(false)
    }
  }

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <div className={styles.page}>
      <div className={styles.content}>
        <div className={styles.head}>
          <h1>Settings</h1>
          <p>Manage your account security and preferences.</p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 20, maxWidth: 720 }}>

          {/* Change Password */}
          <div className={styles.formCard}>
            <div className={styles.sectionHead}>
              <Lock size={18} color="var(--gold)" />
              <h2>Change Password</h2>
            </div>
            <div className={styles.field} style={{ marginBottom: 16 }}>
              <label>Current Password</label>
              <input type="password" value={passwords.current} onChange={set('current')} placeholder="••••••••" />
            </div>
            <div className={styles.row2} style={{ marginBottom: 20 }}>
              <div className={styles.field}>
                <label>New Password</label>
                <input type="password" value={passwords.newPass} onChange={set('newPass')} placeholder="••••••••" />
              </div>
              <div className={styles.field}>
                <label>Confirm New Password</label>
                <input type="password" value={passwords.confirm} onChange={set('confirm')} placeholder="••••••••" />
              </div>
            </div>
            <button className={styles.saveBtn} onClick={handleChangePassword} disabled={saving}>
              {saving && <span className={styles.spinner} />}
              {saving ? 'Saving…' : 'Update Password'}
            </button>
          </div>

          {/* Account actions */}
          <div className={styles.formCard}>
            <div className={styles.sectionHead}>
              <LogOut size={18} color="var(--gold)" />
              <h2>Account</h2>
            </div>
            <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
              <button className={styles.discardBtn} onClick={handleLogout}>
                Log Out
              </button>
              <button
                style={{ background: 'none', border: '1.5px solid #e24b4a', color: '#e24b4a', borderRadius: 10, padding: '13px 20px', fontSize: 14, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}
                onClick={async () => {
                  if (window.confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
                    try {
                      await userAPI.deleteAccount();
                      toast.success('Account deleted successfully');
                      handleLogout(); // Log out otomatis setelah akun dihapus
                    } catch (err) {
                      toast.error('Failed to delete account');
                    }
                  }
                }}
              >
                <Trash2 size={14} />
                Delete Account
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}