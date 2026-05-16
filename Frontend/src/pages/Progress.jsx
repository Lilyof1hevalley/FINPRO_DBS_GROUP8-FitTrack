import { useState, useEffect } from 'react'
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts'
import { Trophy, TrendingUp, BarChart2, Activity, ChevronDown } from 'lucide-react'
import { progressApi, exerciseApi } from '../api'
import AppLayout from '../components/AppLayout'

const CustomTooltip = ({ active, payload, label, unit = '' }) => {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-bg-elevated border border-bg-border rounded-lg px-4 py-3 shadow-xl">
      <p className="text-xs text-text-muted mb-2">{label}</p>
      {payload.map((p, i) => (
        <p key={i} className="text-sm font-mono font-medium" style={{ color: p.color }}>
          {p.value?.toLocaleString()}{unit && ` ${unit}`}
        </p>
      ))}
    </div>
  )
}

const chartProps = {
  stroke: '#1E2A3D',
  axisProps: { tick: { fill: '#4A5568', fontSize: 11, fontFamily: 'DM Mono' }, axisLine: false, tickLine: false },
}

function formatWeek(dateStr) {
  if (!dateStr) return ''
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

export default function Progress() {
  const [exercises, setExercises] = useState([])
  const [selectedExercise, setSelectedExercise] = useState('')
  const [weeks, setWeeks] = useState(8)

  const [strengthData, setStrengthData] = useState([])
  const [volumeData, setVolumeData] = useState([])
  const [freqData, setFreqData] = useState([])
  const [prs, setPrs] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    exerciseApi.getAll().then(({ data }) => {
      setExercises(data)
      if (data.length > 0) setSelectedExercise(data[0].id)
    }).catch(() => {})
  }, [])

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      try {
        const [volRes, freqRes, prRes] = await Promise.all([
          progressApi.volume({ weeks }),
          progressApi.frequency({ weeks }),
          progressApi.personalRecords(),
        ])
        setVolumeData(volRes.data.map((d) => ({ ...d, week: formatWeek(d.week_start), vol: parseFloat(d.total_volume_kg) })))
        setFreqData(freqRes.data.map((d) => ({ ...d, week: formatWeek(d.week_start), sessions: parseInt(d.session_count), mins: parseInt(d.total_minutes) })))
        setPrs(prRes.data)
      } catch (_) {}
      setLoading(false)
    }
    load()
  }, [weeks])

  useEffect(() => {
    if (!selectedExercise) return
    progressApi.strength({ exercise_id: selectedExercise, weeks })
      .then(({ data }) => {
        setStrengthData(data.map((d) => ({
          date: new Date(d.workout_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
          max: parseFloat(d.max_weight_kg),
          reps: parseInt(d.total_reps),
        })))
      })
      .catch(() => {})
  }, [selectedExercise, weeks])

  const weekOptions = [
    { value: 4, label: '4 weeks' },
    { value: 8, label: '8 weeks' },
    { value: 12, label: '12 weeks' },
    { value: 24, label: '24 weeks' },
  ]

  return (
    <AppLayout>
      <div className="p-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-text-primary">Progress</h1>
            <p className="text-text-secondary mt-1 text-sm">Track your performance over time.</p>
          </div>
          <div className="relative">
            <select
              className="select text-sm py-2 pr-8"
              value={weeks}
              onChange={(e) => setWeeks(parseInt(e.target.value))}
            >
              {weekOptions.map(({ value, label }) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </select>
            <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none" />
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-6 mb-6">
          <div className="card">
            <div className="flex items-center gap-2 mb-5">
              <TrendingUp size={16} className="text-accent" />
              <h2 className="text-sm font-semibold text-text-primary">Weekly Volume</h2>
            </div>
            {loading ? (
              <div className="h-48 bg-bg-border rounded animate-pulse" />
            ) : volumeData.length === 0 ? (
              <div className="h-48 flex items-center justify-center">
                <p className="text-text-muted text-sm">No data yet.</p>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={volumeData}>
                  <CartesianGrid vertical={false} stroke={chartProps.stroke} />
                  <XAxis dataKey="week" {...chartProps.axisProps} />
                  <YAxis {...chartProps.axisProps} />
                  <Tooltip content={<CustomTooltip unit="kg" />} />
                  <Bar dataKey="vol" fill="#22C55E" radius={[4, 4, 0, 0]} opacity={0.9} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>

          <div className="card">
            <div className="flex items-center gap-2 mb-5">
              <Activity size={16} className="text-blue-400" />
              <h2 className="text-sm font-semibold text-text-primary">Workout Frequency</h2>
            </div>
            {loading ? (
              <div className="h-48 bg-bg-border rounded animate-pulse" />
            ) : freqData.length === 0 ? (
              <div className="h-48 flex items-center justify-center">
                <p className="text-text-muted text-sm">No data yet.</p>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={freqData}>
                  <CartesianGrid vertical={false} stroke={chartProps.stroke} />
                  <XAxis dataKey="week" {...chartProps.axisProps} />
                  <YAxis {...chartProps.axisProps} allowDecimals={false} />
                  <Tooltip content={<CustomTooltip unit="sessions" />} />
                  <Bar dataKey="sessions" fill="#60A5FA" radius={[4, 4, 0, 0]} opacity={0.9} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        <div className="card mb-6">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2">
              <BarChart2 size={16} className="text-orange-400" />
              <h2 className="text-sm font-semibold text-text-primary">Strength Over Time</h2>
            </div>
            {exercises.length > 0 && (
              <div className="relative">
                <select
                  className="select text-xs py-1.5 pr-7 min-w-36"
                  value={selectedExercise}
                  onChange={(e) => setSelectedExercise(e.target.value)}
                >
                  {exercises.map((ex) => (
                    <option key={ex.id} value={ex.id}>{ex.name}</option>
                  ))}
                </select>
                <ChevronDown size={13} className="absolute right-2 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none" />
              </div>
            )}
          </div>
          {strengthData.length === 0 ? (
            <div className="h-52 flex items-center justify-center">
              <p className="text-text-muted text-sm">No strength data for this exercise.</p>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={strengthData}>
                <CartesianGrid stroke={chartProps.stroke} />
                <XAxis dataKey="date" {...chartProps.axisProps} />
                <YAxis {...chartProps.axisProps} unit=" kg" />
                <Tooltip content={<CustomTooltip unit="kg" />} />
                <Line type="monotone" dataKey="max" stroke="#F97316" strokeWidth={2.5} dot={{ fill: '#F97316', r: 4, strokeWidth: 0 }} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className="card">
          <div className="flex items-center gap-2 mb-5">
            <Trophy size={16} className="text-yellow-400" />
            <h2 className="text-sm font-semibold text-text-primary">Personal Records</h2>
          </div>
          {loading ? (
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => <div key={i} className="h-10 bg-bg-border rounded animate-pulse" />)}
            </div>
          ) : prs.length === 0 ? (
            <p className="text-text-muted text-sm text-center py-6">No personal records yet. Start logging to set your first PR!</p>
          ) : (
            <div className="space-y-2">
              <div className="grid grid-cols-12 gap-4 text-xs text-text-muted px-3 mb-1">
                <div className="col-span-4">Exercise</div>
                <div className="col-span-2">Muscle</div>
                <div className="col-span-2">Max Weight</div>
                <div className="col-span-2">Reps</div>
                <div className="col-span-2">Last Performed</div>
              </div>
              {prs.map((pr) => (
                <div key={pr.exercise_id} className="grid grid-cols-12 gap-4 items-center px-3 py-3 rounded-lg hover:bg-bg-elevated transition-colors">
                  <div className="col-span-4">
                    <p className="text-sm font-medium text-text-primary">{pr.exercise_name}</p>
                  </div>
                  <div className="col-span-2">
                    <span className="badge-blue text-xs">{pr.muscle_group}</span>
                  </div>
                  <div className="col-span-2">
                    <span className="font-mono text-sm font-bold text-accent">{pr.max_weight_kg} kg</span>
                  </div>
                  <div className="col-span-2">
                    <span className="font-mono text-sm text-text-secondary">{pr.reps_at_max ?? '—'}</span>
                  </div>
                  <div className="col-span-2">
                    <span className="text-xs text-text-muted">
                      {pr.last_performed ? new Date(pr.last_performed).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : '—'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  )
}
