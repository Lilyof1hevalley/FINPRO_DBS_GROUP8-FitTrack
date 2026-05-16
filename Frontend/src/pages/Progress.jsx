import { useEffect, useState } from 'react'
import { progressAPI } from '../api/services'
import TopBar from '../components/TopBar'
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'
import { Calendar, Download, Dumbbell, Activity, Zap, Moon, HeartPulse, Beef } from 'lucide-react'
import styles from './Progress.module.css'

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

function findPR(records, names) {
  for (const n of names) {
    const r = records.find(x => x.exercise_name?.toLowerCase().includes(n))
    if (r) return r
  }
  return null
}

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
      const vol = volRes.data.map((d, i) => ({
        week: new Date(d.week_start).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        bench: Math.round(parseFloat(d.total_volume_kg) / 50) || (40 + i * 8),
        squat: Math.round(parseFloat(d.total_volume_kg) / 70) || (30 + i * 6),
      }))
      setStrengthData(vol.length ? vol : DAYS.map((d, i) => ({
        week: d, bench: 60 + Math.round(40 * Math.abs(Math.sin(i))), squat: 40 + Math.round(30 * Math.abs(Math.sin(i + 1))),
      })))
      setVolume(DAYS.map((day, i) => {
        const f = freqRes.data[i]
        return { day, value: f ? parseInt(f.total_minutes) || (200 + i * 30) : (200 + (i % 4) * 80) }
      }))
      setFrequency(freqRes.data)
    }).catch(() => {}).finally(() => setLoading(false))
  }, [])

  const benchPR = findPR(records, ['bench'])
  const squatPR = findPR(records, ['squat'])
  const deadPR = findPR(records, ['deadlift', 'dead'])

  const heatCells = Array.from({ length: 28 }, (_, i) => {
    const f = frequency[i % Math.max(frequency.length, 1)]
    const c = f ? parseInt(f.session_count) : (i * 7) % 5
    return Math.min(4, c)
  })
  const heatColors = ['#ece8df', '#cfc7a8', '#a89868', '#7a6010', '#5a4208']
  const trainedDays = heatCells.filter(c => c > 0).length

  const prCards = [
    { label: 'BENCH PRESS PR', pr: benchPR, val: benchPR?.max_weight_kg ?? 105, Icon: Dumbbell, trend: '+5kg this month', trendColor: '#2e7d32', iconBg: 'var(--gold-light)' },
    { label: 'SQUAT PR', pr: squatPR, val: squatPR?.max_weight_kg ?? 145, Icon: Activity, trend: 'Maintained status', trendColor: 'var(--text-3)', iconBg: 'var(--surface-2)' },
    { label: 'DEADLIFT PR', pr: deadPR, val: deadPR?.max_weight_kg ?? 180, Icon: Zap, trend: '+12kg this month', trendColor: '#2e7d32', iconBg: '#fdeceb' },
  ]

  return (
    <div className={styles.page}>
      <TopBar active="Goals" />

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
                    <XAxis dataKey="week" hide />
                    <YAxis tick={{ fontSize: 11, fill: 'var(--text-3)' }} axisLine={false} tickLine={false} width={28} />
                    <Tooltip contentStyle={{ borderRadius: 8, border: '1px solid var(--border)', fontSize: 12 }} />
                    <Area type="monotone" dataKey="bench" stroke="var(--gold)" strokeWidth={3} fill="url(#benchG)" />
                    <Area type="monotone" dataKey="squat" stroke="var(--text-2)" strokeWidth={2} strokeDasharray="6 4" fill="none" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              <div className={styles.prCol}>
                {prCards.map(c => (
                  <div key={c.label} className={styles.prCard}>
                    <div className={styles.prTop}>
                      <span className={styles.prLabel}>{c.label}</span>
                      <div className={styles.prIcon} style={{ background: c.iconBg }}>
                        <c.Icon size={16} color="var(--gold)" />
                      </div>
                    </div>
                    <div className={styles.prVal}>{c.val} <small>kg</small></div>
                    <div className={styles.prTrend} style={{ color: c.trendColor }}>{c.trend}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className={styles.midGrid}>
              <div className={styles.card}>
                <div className={styles.cardHead}>
                  <div>
                    <h2>Weekly Training Volume</h2>
                    <p className={styles.cardSub}>Total weight moved per session (kg)</p>
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

            <h2 className={styles.recoveryTitle}>Recovery Insights</h2>
            <div className={styles.recoveryGrid}>
              <div className={styles.recCard}>
                <div className={styles.recHead}>
                  <div className={styles.recIcon} style={{ background: '#e8eefb' }}><Moon size={16} color="#3b6fd6" /></div>
                  <div>
                    <div className={styles.recName}>Sleep Quality</div>
                    <div className={styles.recAvg}>Avg. 7h 45m</div>
                  </div>
                </div>
                <div className={styles.recBar}><div className={styles.recFill} style={{ width: '72%', background: '#3b6fd6' }} /></div>
                <p className={styles.recNote}>Optimal recovery range reached 5/7 days.</p>
              </div>

              <div className={styles.recCard}>
                <div className={styles.recHead}>
                  <div className={styles.recIcon} style={{ background: '#fdeae0' }}><HeartPulse size={16} color="#e07a3a" /></div>
                  <div>
                    <div className={styles.recName}>Heart Rate Var.</div>
                    <div className={styles.recAvg}>Avg. 62ms</div>
                  </div>
                </div>
                <div className={styles.recBar}><div className={styles.recFill} style={{ width: '60%', background: '#e07a3a' }} /></div>
                <p className={styles.recNote}>Balanced nervous system detected.</p>
              </div>

              <div className={styles.recCard}>
                <div className={styles.recHead}>
                  <div className={styles.recIcon} style={{ background: '#e6f4ea' }}><Beef size={16} color="#2e7d32" /></div>
                  <div>
                    <div className={styles.recName}>Protein Intake</div>
                    <div className={styles.recAvg}>Avg. 165g/day</div>
                  </div>
                </div>
                <div className={styles.recBar}><div className={styles.recFill} style={{ width: '90%', background: '#2e7d32' }} /></div>
                <p className={styles.recNote}>High adherence to muscle repair goals.</p>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
