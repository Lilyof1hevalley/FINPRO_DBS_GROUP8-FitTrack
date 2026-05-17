import { createContext, useContext, useState, useCallback } from 'react'
import { authAPI } from '../api/services'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try { return JSON.parse(sessionStorage.getItem('fittrack_user')) } catch { return null }
  })
  const [token, setToken] = useState(() => sessionStorage.getItem('fittrack_token'))

  const login = useCallback(async (email, password) => {
    const res = await authAPI.login({ email, password })
    const { user, token } = res.data
    sessionStorage.setItem('fittrack_token', token)
    sessionStorage.setItem('fittrack_user', JSON.stringify(user))
    setUser(user)
    setToken(token)
    return user
  }, [])

  const register = useCallback(async (payload) => {
    const res = await authAPI.register(payload)
    const { user, token } = res.data
    sessionStorage.setItem('fittrack_token', token)
    sessionStorage.setItem('fittrack_user', JSON.stringify(user))
    setUser(user)
    setToken(token)
    return user
  }, [])

  const googleLogin = useCallback(async (accessToken) => {
    const res = await authAPI.googleLogin(accessToken)
    const { user, token } = res.data
    sessionStorage.setItem('fittrack_token', token)
    sessionStorage.setItem('fittrack_user', JSON.stringify(user))
    setUser(user)
    setToken(token)
    return user
  }, [])

  const logout = useCallback(() => {
    sessionStorage.removeItem('fittrack_token')
    sessionStorage.removeItem('fittrack_user')
    setUser(null)
    setToken(null)
  }, [])

  const updateUser = useCallback((data) => {
    setUser(prev => {
      const updated = { ...prev, ...data }
      sessionStorage.setItem('fittrack_user', JSON.stringify(updated))
      return updated
    })
  }, [])

  return (
    <AuthContext.Provider value={{ user, token, login, register, googleLogin, logout, updateUser, isAuthenticated: !!token }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}