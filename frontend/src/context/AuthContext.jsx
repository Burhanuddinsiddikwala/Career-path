import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import api from '../api/client'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [token, setToken] = useState(() => localStorage.getItem('careerpath_token'))
  const [loading, setLoading] = useState(true)

  const fetchCurrentUser = useCallback(async () => {
    const savedToken = localStorage.getItem('careerpath_token')
    if (!savedToken) {
      setUser(null)
      setLoading(false)
      return
    }
    try {
      const resp = await api.get('/api/auth/me')
      setUser(resp.data.user)
    } catch (err) {
      localStorage.removeItem('careerpath_token')
      setToken(null)
      setUser(null)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchCurrentUser()
  }, [fetchCurrentUser])

  const login = async (email, password) => {
    const resp = await api.post('/api/auth/login', { email, password })
    const { token: newToken, user: userData } = resp.data
    localStorage.setItem('careerpath_token', newToken)
    setToken(newToken)
    setUser(userData)
    await fetchCurrentUser()
    return resp.data
  }

  const register = async (payload) => {
    const resp = await api.post('/api/auth/register', payload)
    const { token: newToken, user: userData } = resp.data
    localStorage.setItem('careerpath_token', newToken)
    setToken(newToken)
    setUser(userData)
    await fetchCurrentUser()
    return resp.data
  }

  const logout = () => {
    localStorage.removeItem('careerpath_token')
    localStorage.removeItem('careerpath_user')
    setToken(null)
    setUser(null)
  }

  const refreshUser = async () => {
    await fetchCurrentUser()
  }

  return (
    <AuthContext.Provider value={{
      user,
      token,
      loading,
      isAuthenticated: !!token && !!user,
      login,
      register,
      logout,
      refreshUser
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
