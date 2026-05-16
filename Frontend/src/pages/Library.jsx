import { useState, useEffect } from 'react'
import { Search, BookOpen, ChevronDown } from 'lucide-react'
import { exerciseApi } from '../api'
import AppLayout from '../components/AppLayout'

const categoryColors = {
  strength: 'badge-green',
  cardio: 'badge-blue',
  flexibility: 'badge-orange',
}

const muscleGroups = ['All', 'Chest', 'Back', 'Legs', 'Shoulders', 'Arms', 'Core', 'Cardio']
const categories = ['All', 'strength', 'cardio', 'flexibility']

export default function Library() {
  const [exercises, setExercises] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [muscle, setMuscle] = useState('All')
  const [category, setCategory] = useState('All')
  const [selected, setSelected] = useState(null)

  const load = async () => {
    setLoading(true)
    try {
      const params = {}
      if (muscle !== 'All') params.muscle_group = muscle
      if (category !== 'All') params.category = category
      if (search) params.search = search
      const { data } = await exerciseApi.getAll(params)
      setExercises(data)
    } catch (_) {}
    setLoading(false)
  }

  useEffect(() => {
    const timer = setTimeout(load, 300)
    return () => clearTimeout(timer)
  }, [search, muscle, category])

  return (
    <AppLayout>
      <div className="p-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-text-primary">Exercise Library</h1>
          <p className="text-text-secondary mt-1 text-sm">Browse all available exercises.</p>
        </div>

        <div className="flex flex-wrap gap-3 mb-6">
          <div className="relative flex-1 min-w-60">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
            <input
              className="input pl-9 py-2.5 text-sm"
              placeholder="Search exercises…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="relative">
            <select className="select text-sm py-2.5 pr-8 min-w-36" value={muscle} onChange={(e) => setMuscle(e.target.value)}>
              {muscleGroups.map((g) => <option key={g} value={g}>{g === 'All' ? 'All Muscles' : g}</option>)}
            </select>
            <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none" />
          </div>
          <div className="relative">
            <select className="select text-sm py-2.5 pr-8 min-w-36" value={category} onChange={(e) => setCategory(e.target.value)}>
              {categories.map((c) => <option key={c} value={c}>{c === 'All' ? 'All Types' : c.charAt(0).toUpperCase() + c.slice(1)}</option>)}
            </select>
            <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none" />
          </div>
        </div>

        <p className="text-xs text-text-muted mb-4">{exercises.length} exercise{exercises.length !== 1 ? 's' : ''}</p>

        {loading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(9)].map((_, i) => (
              <div key={i} className="card animate-pulse">
                <div className="h-5 bg-bg-border rounded w-32 mb-2" />
                <div className="h-3 bg-bg-border rounded w-20" />
              </div>
            ))}
          </div>
        ) : exercises.length === 0 ? (
          <div className="text-center py-16">
            <BookOpen size={36} className="text-text-muted mx-auto mb-3" />
            <p className="text-text-muted text-sm">No exercises found.</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {exercises.map((ex) => (
              <button
                key={ex.id}
                onClick={() => setSelected(selected?.id === ex.id ? null : ex)}
                className={`card text-left transition-all duration-200 hover:border-accent/30 ${selected?.id === ex.id ? 'border-accent/50 bg-accent/5' : ''}`}
              >
                <div className="flex items-start justify-between mb-2">
                  <p className="font-semibold text-text-primary text-sm">{ex.name}</p>
                  <span className={`${categoryColors[ex.category] || 'badge'} ml-2 shrink-0 text-xs`}>
                    {ex.category}
                  </span>
                </div>
                <p className="text-xs text-text-muted">{ex.muscle_group}</p>
                {selected?.id === ex.id && ex.description && (
                  <p className="text-xs text-text-secondary mt-3 pt-3 border-t border-bg-border leading-relaxed">
                    {ex.description}
                  </p>
                )}
              </button>
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  )
}
