import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { LayoutDashboard, Dumbbell, TrendingUp, Zap, Sparkles, User, Settings } from 'lucide-react'
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

  const handleUpgrade = () => {
    navigate('/recommendations')
  }

  return (
    <aside className={styles.sidebar}>
      <div className={styles.brand}>
        <div className={styles.brandName}>FitTrack Pro</div>
        <div className={styles.brandSub}>Premium Member</div>
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

      <button className={styles.upgradeBtn} onClick={handleUpgrade}>
        Upgrade to Gold
      </button>
    </aside>
  )
}
