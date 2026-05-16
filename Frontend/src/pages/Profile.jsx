import { useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { userAPI } from '../api/services'
import TopBar from '../components/TopBar'
import toast from 'react-hot-toast'
import { User, Ruler, Dumbbell, Lock, RefreshCw } from 'lucide-react'
import styles from './Profile.module.css'

const GOALS = [
  { value: 'strength', label: 'Strength' },
  { value: 'muscle_gain', label: 'Muscle Gain' },
  { value: 'weight_loss', label: 'Weight Loss' },
  { value: 'endurance', label: 'Endurance' },
  { value: 'flexibility', label: 'Flexibility' },
  { value: 'general_fitness', label: 'General Fitness' },
]

const LEVELS = [
  { value: 'beginner', label: 'Beginner' },
  { value: 'intermediate', label: 'Intermediate' },
  { value: 'advanced', label: 'Advanced' },
]

export default function Profile() {
  const { user, updateUser } = useAuth()
  const [form, setForm] = useState({ full_name: '', age: '', weight_kg: '', height_cm: '', experience_level: 'beginner', fitness_goal: 'strength' })
  const [initial, setInitial] = useState(null)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    userAPI.getProfile().then(res => {
      const u = res.data
      const f = {
        full_name: u.full_name || '',
        age: u.age || '',
        weight_kg: u.weight_kg || '',
        height_cm: u.height_cm || '',
        experience_level: u.experience_level || 'beginner',
        fitness_goal: u.fitness_goal || 'strength',
      }
      setForm(f)
      setInitial(f)
    }).catch(() => {})
  }, [])

  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }))

  const handleSave = async () => {
    setSaving(true)
    try {
      const res = await userAPI.updateProfile({
        full_name: form.full_name || undefined,
        age: form.age ? parseInt(form.age) : undefined,
        weight_kg: form.weight_kg ? parseFloat(form.weight_kg) : undefined,
        height_cm: form.height_cm ? parseFloat(form.height_cm) : undefined,
        experience_level: form.experience_level || undefined,
        fitness_goal: form.fitness_goal || undefined,
      })
      updateUser(res.data)
      setInitial(form)
      toast.success('Profile updated!')
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to update profile')
    } finally {
      setSaving(false)
    }
  }

  const handleDiscard = () => {
    if (initial) setForm(initial)
    toast('Changes discarded')
  }

  const filled = Object.values(form).filter(v => v !== '' && v != null).length
  const strength = Math.round((filled / 6) * 100)

  return (
    <div className={styles.page}>
      <TopBar active="Overview" />

      <div className={styles.content}>
        <div className={styles.head}>
          <h1>Profile Settings</h1>
          <p>Manage your biometric data and fitness preferences to optimize your health journey.</p>
        </div>

        <div className={styles.layout}>
          <div className={styles.profileCard}>
            <div className={styles.avatarRing}>
              <div className={styles.bigAvatar}>{(form.full_name || user?.username || 'U')[0].toUpperCase()}</div>
            </div>
            <div className={styles.pName}>{form.full_name || user?.username}</div>
            <div className={styles.pEmail}>{user?.email}</div>

            <button className={styles.uploadBtn}>Upload New Photo</button>
            <button className={styles.removeBtn}>Remove Photo</button>

            <div className={styles.divider} />

            <div className={styles.strengthRow}>
              <span>Profile Strength</span>
              <span className={styles.strengthPct}>{strength}%</span>
            </div>
            <div className={styles.strengthBar}>
              <div className={styles.strengthFill} style={{ width: `${strength}%` }} />
            </div>
          </div>

          <div className={styles.formCard}>
            <div className={styles.section}>
              <div className={styles.sectionHead}>
                <User size={18} color="var(--gold)" />
                <h2>Personal Details</h2>
              </div>
              <div className={styles.row2}>
                <div className={styles.field}>
                  <label>Full Name</label>
                  <input type="text" value={form.full_name} onChange={set('full_name')} placeholder="Alex Johnson" />
                </div>
                <div className={styles.field}>
                  <label>Age</label>
                  <input type="number" value={form.age} onChange={set('age')} placeholder="28" min="1" max="120" />
                </div>
              </div>
            </div>

            <div className={styles.section}>
              <div className={styles.sectionHead}>
                <Ruler size={18} color="var(--gold)" />
                <h2>Biometric Measurements</h2>
              </div>
              <div className={styles.row2}>
                <div className={styles.field}>
                  <label>Height (cm)</label>
                  <input type="number" value={form.height_cm} onChange={set('height_cm')} placeholder="175" />
                </div>
                <div className={styles.field}>
                  <label>Weight (kg)</label>
                  <input type="number" value={form.weight_kg} onChange={set('weight_kg')} placeholder="72.5" step="0.1" />
                </div>
              </div>
            </div>

            <div className={styles.section}>
              <div className={styles.sectionHead}>
                <Dumbbell size={18} color="var(--gold)" />
                <h2>Fitness Profile</h2>
              </div>
              <div className={styles.row2}>
                <div className={styles.field}>
                  <label>Primary Fitness Goal</label>
                  <select value={form.fitness_goal} onChange={set('fitness_goal')}>
                    {GOALS.map(g => <option key={g.value} value={g.value}>{g.label}</option>)}
                  </select>
                </div>
                <div className={styles.field}>
                  <label>Experience Level</label>
                  <select value={form.experience_level} onChange={set('experience_level')}>
                    {LEVELS.map(l => <option key={l.value} value={l.value}>{l.label}</option>)}
                  </select>
                </div>
              </div>
            </div>

            <div className={styles.divider} />

            <div className={styles.formActions}>
              <button className={styles.discardBtn} onClick={handleDiscard}>Discard Changes</button>
              <button className={styles.saveBtn} onClick={handleSave} disabled={saving}>
                {saving && <span className={styles.spinner} />}
                {saving ? 'Saving…' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>

        <div className={styles.infoGrid}>
          <div className={styles.infoCard}>
            <div className={styles.infoIcon}><Lock size={16} color="var(--gold)" /></div>
            <div>
              <h3>Privacy Focused</h3>
              <p>Your biometric data is encrypted and only visible to you.</p>
            </div>
          </div>
          <div className={styles.infoCard}>
            <div className={styles.infoIcon}><RefreshCw size={16} color="var(--gold)" /></div>
            <div>
              <h3>Auto-Synchronization</h3>
              <p>Changes here will update your macro goals instantly.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
