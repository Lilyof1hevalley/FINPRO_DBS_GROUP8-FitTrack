import { Link } from 'react-router-dom'
import { Zap, TrendingUp, Dumbbell, BarChart3, ArrowRight, CheckCircle2 } from 'lucide-react'

const features = [
  {
    icon: Dumbbell,
    title: 'Log Workouts',
    desc: 'Track every set, rep, and weight with precision. Build a complete history of your training.',
  },
  {
    icon: TrendingUp,
    title: 'Track Progress',
    desc: 'Visualize your strength gains, weekly volume, and workout consistency over time.',
  },
  {
    icon: BarChart3,
    title: 'Personal Records',
    desc: 'Automatically track your best lifts per exercise. Break records and celebrate milestones.',
  },
]

const steps = [
  { n: '01', title: 'Create Account', desc: 'Sign up with your fitness goals and experience level.' },
  { n: '02', title: 'Log Sessions', desc: 'Start a workout, pick exercises, and log your sets.' },
  { n: '03', title: 'Track & Improve', desc: 'Review charts and personal records to keep progressing.' },
]

export default function Home() {
  return (
    <div className="min-h-screen bg-bg-base">
      <header className="border-b border-bg-border bg-bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-accent flex items-center justify-center">
              <Zap className="w-4 h-4 text-bg-base" fill="currentColor" />
            </div>
            <span className="text-xl font-bold tracking-tight">FitTrack</span>
          </div>
          <div className="flex items-center gap-3">
            <Link to="/login" className="btn-ghost text-sm">Sign In</Link>
            <Link to="/register" className="btn-primary text-sm">Get Started</Link>
          </div>
        </div>
      </header>

      <section className="max-w-6xl mx-auto px-6 pt-24 pb-20">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <div>
            <div className="badge-green mb-6 text-xs">Track. Improve. Dominate.</div>
            <h1 className="text-5xl lg:text-6xl font-extrabold leading-[1.1] tracking-tight mb-6">
              Your Fitness Journey{' '}
              <span className="text-gradient">Starts Here</span>
            </h1>
            <p className="text-lg text-text-secondary leading-relaxed mb-10 max-w-md">
              Log workouts, track strength progress, and hit personal records. Built for athletes who are serious about results.
            </p>
            <div className="flex items-center gap-4">
              <Link to="/register" className="btn-primary text-base px-7 py-3.5">
                Start Free <ArrowRight size={18} />
              </Link>
              <Link to="/login" className="btn-secondary text-base px-7 py-3.5">
                Sign In
              </Link>
            </div>
            <div className="mt-10 flex flex-col gap-2.5">
              {['No credit card required', 'Free to use', 'Track unlimited workouts'].map((t) => (
                <div key={t} className="flex items-center gap-2 text-sm text-text-secondary">
                  <CheckCircle2 size={15} className="text-accent shrink-0" />
                  {t}
                </div>
              ))}
            </div>
          </div>

          <div className="relative hidden lg:block">
            <div className="absolute inset-0 bg-gradient-radial from-accent/20 via-transparent to-transparent rounded-full blur-3xl" />
            <div className="relative bg-bg-card border border-bg-border rounded-2xl p-6 space-y-4">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-semibold text-text-primary">Today's Session</p>
                <span className="badge-green text-xs">Active</span>
              </div>
              {[
                { name: 'Bench Press', sets: '4 × 8', weight: '80 kg' },
                { name: 'Squat', sets: '4 × 6', weight: '100 kg' },
                { name: 'Deadlift', sets: '3 × 5', weight: '120 kg' },
                { name: 'Pull-Up', sets: '3 × 10', weight: 'BW' },
              ].map((e, i) => (
                <div key={i} className="flex items-center justify-between p-3 bg-bg-elevated rounded-lg border border-bg-border">
                  <div>
                    <p className="text-sm font-medium text-text-primary">{e.name}</p>
                    <p className="text-xs text-text-muted mt-0.5">{e.sets}</p>
                  </div>
                  <span className="font-mono text-sm text-accent font-medium">{e.weight}</span>
                </div>
              ))}
              <div className="pt-2 flex items-center gap-3 text-xs text-text-muted border-t border-bg-border">
                <span>Duration: <span className="text-text-secondary font-medium">52 min</span></span>
                <span>Volume: <span className="text-text-secondary font-medium">4,820 kg</span></span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="border-t border-bg-border bg-bg-card/30 py-20">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-3xl font-bold text-center mb-3">Everything You Need</h2>
          <p className="text-text-secondary text-center mb-12">Tools designed to make your training smarter.</p>
          <div className="grid md:grid-cols-3 gap-6">
            {features.map(({ icon: Icon, title, desc }) => (
              <div key={title} className="card hover:border-accent/30 transition-colors duration-200">
                <div className="w-10 h-10 rounded-lg bg-accent/10 border border-accent/20 flex items-center justify-center mb-4">
                  <Icon size={20} className="text-accent" />
                </div>
                <h3 className="font-semibold text-text-primary mb-2">{title}</h3>
                <p className="text-sm text-text-secondary leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20">
        <div className="max-w-4xl mx-auto px-6">
          <h2 className="text-3xl font-bold text-center mb-3">How It Works</h2>
          <p className="text-text-secondary text-center mb-12">Get started in minutes.</p>
          <div className="grid md:grid-cols-3 gap-8">
            {steps.map(({ n, title, desc }) => (
              <div key={n} className="text-center">
                <div className="w-14 h-14 rounded-2xl bg-accent/10 border border-accent/20 flex items-center justify-center mx-auto mb-4">
                  <span className="font-mono text-lg font-bold text-accent">{n}</span>
                </div>
                <h3 className="font-semibold text-text-primary mb-2">{title}</h3>
                <p className="text-sm text-text-secondary leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="border-t border-bg-border bg-bg-card/30 py-20">
        <div className="max-w-xl mx-auto px-6 text-center">
          <h2 className="text-4xl font-extrabold mb-4">
            Ready to <span className="text-gradient">Level Up?</span>
          </h2>
          <p className="text-text-secondary mb-8">
            Join FitTrack and start building the physique you've always wanted.
          </p>
          <Link to="/register" className="btn-primary text-base px-8 py-3.5">
            Create Free Account <ArrowRight size={18} />
          </Link>
        </div>
      </section>

      <footer className="border-t border-bg-border py-6">
        <div className="max-w-6xl mx-auto px-6 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-accent flex items-center justify-center">
              <Zap className="w-3 h-3 text-bg-base" fill="currentColor" />
            </div>
            <span className="text-sm font-bold">FitTrack</span>
          </div>
          <p className="text-xs text-text-muted">© 2025 FitTrack. Built by Group 8.</p>
        </div>
      </footer>
    </div>
  )
}
