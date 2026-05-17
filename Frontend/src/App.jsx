import { Routes, Route, Navigate } from 'react-router-dom'
import AppLayout from './components/AppLayout'
import Login from './pages/Login'
import Signup from './pages/Signup'
import Dashboard from './pages/Dashboard'
import Workouts from './pages/Workouts'
import WorkoutNew from './pages/WorkoutNew'
import WorkoutDetail from './pages/WorkoutDetail'
import Progress from './pages/Progress'
import Exercises from './pages/Exercises'
import Recommendations from './pages/Recommendations'
import Profile from './pages/Profile'
import Settings from './pages/Settings'
import ForgotPassword from './pages/ForgotPassword'
import ResetPassword from './pages/ResetPassword'

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route element={<AppLayout />}>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/workouts" element={<Workouts />} />
        <Route path="/workouts/new" element={<WorkoutNew />} />
        <Route path="/workouts/:id" element={<WorkoutDetail />} />
        <Route path="/progress" element={<Progress />} />
        <Route path="/exercises" element={<Exercises />} />
        <Route path="/recommendations" element={<Recommendations />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/settings" element={<Settings />} />
      </Route>
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />
    </Routes>
  )
}
