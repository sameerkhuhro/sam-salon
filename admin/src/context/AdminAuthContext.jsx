/**
 * SalonHub Admin Authentication Context
 * Live JWT session verification, database authentication, and persistent authorization.
 */

import { createContext, useContext, useState, useEffect } from 'react'

const AdminAuthContext = createContext(null)

const TOKEN_KEY = 'salonhub:admin_token'
const USER_KEY = 'salonhub:admin_user'
const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

export function AdminAuthProvider({ children }) {
  const [adminUser, setAdminUser] = useState(() => {
    try {
      const stored = localStorage.getItem(USER_KEY)
      return stored ? JSON.parse(stored) : null
    } catch {
      return null
    }
  })
  const [token, setToken] = useState(() => localStorage.getItem(TOKEN_KEY) || null)
  const [loading, setLoading] = useState(true)

  // Verify and re-authenticate active session on mount
  useEffect(() => {
    const verifySession = async () => {
      const savedToken = localStorage.getItem(TOKEN_KEY)
      if (!savedToken) {
        setLoading(false)
        return
      }

      try {
        const res = await fetch(`${API_BASE}/auth/me`, {
          headers: {
            Authorization: `Bearer ${savedToken}`,
          },
        })

        const data = await res.json()
        if (data.success && data.admin) {
          setAdminUser(data.admin)
          setToken(savedToken)
          localStorage.setItem(USER_KEY, JSON.stringify(data.admin))
        } else {
          // Token expired or deactivated
          logout()
        }
      } catch (err) {
        console.warn('[AuthContext] Backend session verification warning:', err.message)
        // Keep existing cached user if network temporarily offline
      } finally {
        setLoading(false)
      }
    }

    verifySession()
  }, [])

  const login = async (email, password) => {
    setLoading(true)
    try {
      const res = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), password }),
      })

      const data = await res.json()

      if (!res.ok || !data.success) {
        setLoading(false)
        return {
          success: false,
          error: data.message || 'Invalid administrative credentials.',
        }
      }

      // Save token and user details to localStorage
      localStorage.setItem(TOKEN_KEY, data.token)
      localStorage.setItem(USER_KEY, JSON.stringify(data.admin))
      setToken(data.token)
      setAdminUser(data.admin)
      setLoading(false)

      return { success: true }
    } catch (err) {
      setLoading(false)
      return {
        success: false,
        error: `Could not connect to authentication server at ${API_BASE}. Please ensure server is running.`,
      }
    }
  }

  const logout = () => {
    localStorage.removeItem(TOKEN_KEY)
    localStorage.removeItem(USER_KEY)
    setToken(null)
    setAdminUser(null)
  }

  return (
    <AdminAuthContext.Provider
      value={{
        adminUser,
        token,
        isAuthenticated: !!adminUser && !!token,
        loading,
        login,
        logout,
      }}
    >
      {children}
    </AdminAuthContext.Provider>
  )
}

export function useAdminAuth() {
  const context = useContext(AdminAuthContext)
  if (!context) {
    throw new Error('useAdminAuth must be used within an AdminAuthProvider')
  }
  return context
}
