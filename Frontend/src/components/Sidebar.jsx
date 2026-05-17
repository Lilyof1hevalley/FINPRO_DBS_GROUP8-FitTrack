import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { LayoutDashboard, Dumbbell, TrendingUp, Zap, Sparkles, User, Settings, Bell } from 'lucide-react'
import styles from './Sidebar.module.css'

const NAV = [
  { to: '/dashboard', label: 'Dashboard', Icon: LayoutDashboard },
  { to: '/workouts', label: 'Workouts', Icon: Dumbbell },
  { to: '/progress', label: 'Progress', Icon: TrendingUp },
  { to: '/exercises', label: 'Exercises', Icon: Zap },
  { to: '/recommendations', label: 'Recommendations', Icon: Sparkles },
]

const ACCOUNT = [
  { to: '/profile', label: 'Profile', Icon: User },
  { to: '/settings', label: 'Settings', Icon: Settings },
]

export default function Sidebar() {
  const navigate = useNavigate()
  const { user } = useAuth()

  return (
    <aside className={styles.sidebar}>
      <div className={styles.brand}>
        <div className={styles.brandName}>FitTrack</div>
        <div className={styles.brandSub}>Premium Member</div>
      </div>

      <div className={styles.userBar}>
        <div className={styles.avatar}>
          {(user?.full_name || user?.username || 'U')[0].toUpperCase()}
        </div>
        <div className={styles.userInfo}>
          <div className={styles.userName}>{user?.full_name || user?.username}</div>
          <div className={styles.userEmail}>{user?.email}</div>
        </div>
        <div className={styles.userIcons}>
          <button className={styles.iconBtn}><Bell size={16} /></button>
          <NavLink to="/settings" className={styles.iconBtn}><Settings size={16} /></NavLink>
        </div>
      </div>

      <nav className={styles.nav}>
        {NAV.map(({ to, label, Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) => `${styles.navItem} ${isActive ? styles.active : ''}`}
          >
            <Icon size={18} />
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>

      <div className={styles.accountSection}>
        {ACCOUNT.map(({ to, label, Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) => `${styles.navItem} ${isActive ? styles.active : ''}`}
          >
            <Icon size={18} />
            <span>{label}</span>
          </NavLink>
        ))}
      </div>

      <button className={styles.upgradeBtn} onClick={() => navigate('/recommendations')}>
        Upgrade to Gold
      </button>
    </aside>
  )
}