import { createContext, useContext, useState, useEffect } from 'react'
import { authApi, userApi } from '../api'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('fittrack_user')
    return saved ? JSON.parse(saved) : null
  })
  const [token, setToken] = useState(() => localStorage.getItem('fittrack_token'))
  const [loading, setLoading] = useState(false)

  const login = async (email, password) => {
    setLoading(true)
    try {
      const { data } = await authApi.login({ email, password })
      localStorage.setItem('fittrack_token', data.token)
      localStorage.setItem('fittrack_user', JSON.stringify(data.user))
      setToken(data.token)
      setUser(data.user)
      return { success: true }
    } catch (err) {
      return { success: false, error: err.response?.data?.error || 'Login failed' }
    } finally {
      setLoading(false)
    }
  }

  const register = async (formData) => {
    setLoading(true)
    try {
      const { data } = await authApi.register(formData)
      localStorage.setItem('fittrack_token', data.token)
      localStorage.setItem('fittrack_user', JSON.stringify(data.user))
      setToken(data.token)
      setUser(data.user)
      return { success: true }
    } catch (err) {
      return { success: false, error: err.response?.data?.error || 'Registration failed' }
    } finally {
      setLoading(false)
    }
  }

  const logout = () => {
    localStorage.removeItem('fittrack_token')
    localStorage.removeItem('fittrack_user')
    setToken(null)
    setUser(null)
  }

  const refreshUser = async () => {
    try {
      const { data } = await userApi.getProfile()
      setUser(data)
      localStorage.setItem('fittrack_user', JSON.stringify(data))
    } catch (_) {}
  }

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
