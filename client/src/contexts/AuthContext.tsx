import React, { createContext, useContext, useState, useEffect } from 'react'

interface User {
  id: string
  email: string
  name: string
  picture?: string
}

interface AuthContextType {
  user: User | null
  isAuthenticated: boolean
  loading: boolean
  logout: () => void
  checkAuth: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | null>(null)

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  
  const checkAuth = async () => {
    try {
      const response = await fetch('http://localhost:3000/auth', {
        credentials: 'include'
      })
      if (response.ok) {
        const userData = await response.json()
        setUser(userData)
      } else {
        setUser(null)
      }
    } catch (error) {
      console.error('Auth check failed:', error)
      setUser(null)
    } finally {
      setLoading(false)
    }
  }
  
  const logout = async () => {
    try {
      await fetch('http://localhost:3000/auth/logout', {
        method: 'POST',
        credentials: 'include'
      })
      setUser(null)
    } catch (error) {
      console.error('Logout failed:', error)
    }
  }
  
  useEffect(() => {
    checkAuth()
  }, [])
  
  return (
    <AuthContext.Provider 
      value={{
        user,
        isAuthenticated: !!user,
        loading,
        logout,
        checkAuth
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export const Login = () => {
  const handleGoogleLogin = () => {
    window.location.href = 'http://localhost:3000/auth/google'
  }
  
  return (
    <div className="flex items-center justify-center h-screen bg-gray-100">
      <button
        onClick={handleGoogleLogin}
        className="flex items-center px-4 py-2 text-white bg-blue-600 rounded hover:bg-blue-700"
      >
        Prijavi se sa Google nalogom
      </button>
    </div>
  )
}

export const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth()
  
  if (loading) {
    return <div>Loading...</div>
  }
  
  if (!isAuthenticated) {
    return <Login />
  }
  
  return children
}