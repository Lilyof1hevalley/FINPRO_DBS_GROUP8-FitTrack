import { useEffect, useState } from 'react'
import { progressAPI } from '../api/services'
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'
import { Calendar, Download, Dumbbell } from 'lucide-react'
import styles from './Progress.module.css'

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

export default function Progress() {
  const [records, setRecords] = useState([])
  const [volume, setVolume] = useState([])
  const [frequency, setFrequency] = useState([])
  const [strengthData, setStrengthData] = useState([])
  const [loading, setLoading] = useState(true)
  const [volMode, setVolMode] = useState('Sets')

  useEffect(() => {
    Promise.all([
      progressAPI.personalRecords(),
      progressAPI.weeklyVolume({ weeks: 12 }),
      progressAPI.workoutFrequency({ weeks: 12 }),
    ]).then(([prRes, volRes, freqRes]) => {
      setRecords(prRes.data)

      const vol = volRes.data.map(d => ({
        week: new Date(d.week_start).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        bench: Math.round(parseFloat(d.total_volume_kg) / 50) || 0,
        squat: Math.round(parseFloat(d.total_volume_kg) / 70) || 0,
      }))

      const strengthDataFinal = vol.length === 1
        ? [{ week: 'Beginning', bench: 0, squat: 0 }, { ...vol[0], week: 'Recent' }]
        : vol.length === 0
        ? [{ week: 'Beginning', bench: 0, squat: 0 }, { week: 'Recent', bench: 0, squat: 0 }]
        : vol

      setStrengthData(strengthDataFinal)

      setVolume(DAYS.map((day, i) => {
        const f = freqRes.data[i]
        return { day, value: f ? parseInt(f.session_count) || 0 : 0 }
      }))
      setFrequency(freqRes.data)
    }).catch(() => {}).finally(() => setLoading(false))
  }, [])

  const heatCells = Array.from({ length: 28 }, (_, i) => {
    const f = frequency[i]
    const c = f ? parseInt(f.session_count) : 0
    return Math.min(4, c)
  })

  const heatColors = ['#ece8df', '#cfc7a8', '#a89868', '#7a6010', '#5a4208']
  const trainedDays = heatCells.filter(c => c > 0).length

  return (
    <div className={styles.page}>
      <div className={styles.content}>
        <div className={styles.head}>
          <div>
            <h1>Progress Analytics</h1>
            <p>Visualizing your journey to peak performance.</p>
          </div>
          <div className={styles.headBtns}>
            <button className={styles.rangeBtn}><Calendar size={15} /> Last 3 Months</button>
            <button className={styles.exportBtn}><Download size={15} /> Export Data</button>
          </div>
        </div>

        {loading ? (
          <div className={styles.loading}><span className={styles.spinner} /></div>
        ) : (
          <>
            <div className={styles.topGrid}>
              <div className={styles.chartCard}>
                <div className={styles.chartHead}>
                  <h2>Strength Over Time</h2>
                  <div className={styles.legend}>
                    <span><i style={{ background: 'var(--gold)' }} /> Bench Press</span>
                    <span><i style={{ background: 'var(--text-2)' }} /> Squat</span>
                  </div>
                </div>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={strengthData}>
                    <defs>
                      <linearGradient id="benchG" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="var(--gold)" stopOpacity={0.25} />
                        <stop offset="100%" stopColor="var(--gold)" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="week" tick={{ fontSize: 11, fill: 'var(--text-3)' }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 11, fill: 'var(--text-3)' }} axisLine={false} tickLine={false} width={28} />
                    <Tooltip
                      contentStyle={{ borderRadius: 8, border: '1px solid var(--border)', fontSize: 12 }}
                      content={({ active, payload, label }) => {
                        if (!active || !payload || label === 'Beginning') return null
                        return (
                          <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 8, padding: '8px 12px', fontSize: 12 }}>
                            <p style={{ fontWeight: 600, marginBottom: 4 }}>{label}</p>
                            {payload.map((p, i) => (
                              <p key={i} style={{ color: p.stroke }}>{p.name}: {p.value}</p>
                            ))}
                          </div>
                        )
                      }}
                    />
                    <Area type="monotone" dataKey="bench" stroke="var(--gold)" strokeWidth={3} fill="url(#benchG)" dot={false} />
                    <Area type="monotone" dataKey="squat" stroke="var(--text-2)" strokeWidth={2} strokeDasharray="6 4" fill="none" dot={false} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              <div className={styles.prCol}>
                {records.length > 0 ? records.map((r, i) => (
                  <div key={i} className={styles.prCard}>
                    <div className={styles.prTop}>
                      <span className={styles.prLabel}>{r.exercise_name?.toUpperCase()} PR</span>
                      <div className={styles.prIcon} style={{ background: 'var(--gold-light)' }}>
                        <Dumbbell size={16} color="var(--gold)" />
                      </div>
                    </div>
                    <div className={styles.prVal}>{r.max_weight_kg} <small>kg</small></div>
                    <div className={styles.prTrend} style={{ color: 'var(--text-3)' }}>
                      {r.reps_at_max} reps · {new Date(r.last_performed).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </div>
                  </div>
                )) : (
                  <div className={styles.prCard}>
                    <p style={{ color: 'var(--text-3)', fontSize: 13 }}>No personal records yet. Start logging workouts!</p>
                  </div>
                )}
              </div>
            </div>

            <div className={styles.midGrid}>
              <div className={styles.card}>
                <div className={styles.cardHead}>
                  <div>
                    <h2>Weekly Training Volume</h2>
                    <p className={styles.cardSub}>Number of sessions per day</p>
                  </div>
                  <div className={styles.toggle}>
                    {['Sets', 'Volume'].map(m => (
                      <button
                        key={m}
                        className={volMode === m ? styles.toggleActive : styles.toggleBtn}
                        onClick={() => setVolMode(m)}
                      >{m}</button>
                    ))}
                  </div>
                </div>
                <ResponsiveContainer width="100%" height={240}>
                  <BarChart data={volume} barSize={32}>
                    <XAxis dataKey="day" tick={{ fontSize: 12, fill: 'var(--text-3)' }} axisLine={false} tickLine={false} />
                    <Tooltip cursor={{ fill: 'rgba(122,96,16,0.05)' }} contentStyle={{ borderRadius: 8, border: '1px solid var(--border)', fontSize: 12 }} />
                    <Bar dataKey="value" radius={[6, 6, 0, 0]} fill="var(--gold-mid)" />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div className={styles.card}>
                <h2>Workout Frequency</h2>
                <div className={styles.heatGrid}>
                  {heatCells.map((c, i) => (
                    <span key={i} className={styles.heatCell} style={{ background: heatColors[c] }} />
                  ))}
                </div>
                <div className={styles.heatLegend}>
                  <span>Less</span>
                  <div className={styles.heatDots}>
                    {heatColors.map((c, i) => <i key={i} style={{ background: c }} />)}
                  </div>
                  <span>More</span>
                </div>
                <p className={styles.heatNote}>You have trained <b>{trainedDays} days</b> out of the last 28.</p>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}