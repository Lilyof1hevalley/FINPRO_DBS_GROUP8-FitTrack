import { useState } from 'react'
import { Bell, Settings } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import styles from './TopBar.module.css'

const TABS = ['Overview', 'Activity', 'Nutrition', 'Sleep', 'Goals']

export default function TopBar({ active = 'Overview' }) {
  const { user } = useAuth()
  const [tab, setTab] = useState(active)

  return (
    <header className={styles.topbar}>
      <nav className={styles.tabs}>
        {TABS.map(t => (
          <button
            key={t}
            className={`${styles.tab} ${tab === t ? styles.tabActive : ''}`}
            onClick={() => setTab(t)}
          >
            {t}
          </button>
        ))}
      </nav>
      <div className={styles.right}>
        <button className={styles.iconBtn}><Bell size={18} /></button>
        <button className={styles.iconBtn}><Settings size={18} /></button>
        <div className={styles.avatar}>{(user?.full_name || user?.username || 'U')[0].toUpperCase()}</div>
      </div>
    </header>
  )
}
