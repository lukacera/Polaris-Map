import React, { createContext, useContext, useState, useEffect } from 'react'

interface User {
  id: string
  name: string
  email: string
  image: string
}

interface AuthContextType {
  isLoggedIn: boolean
  loading: boolean
  user: User | null
  login: () => void
  logout: () => Promise<void>
  checkAuth: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | null>(null)

const apiURL = import.meta.env.VITE_API_URL
export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

interface AuthProviderProps {
  children: React.ReactNode
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<User | null>(null)

  // Function to check authentication status
  const checkAuth = async () => {
    setLoading(true) // Start loading
    try {
      const response = await fetch(`${apiURL}/auth/verify-token`, {
        credentials: 'include',
      })
      if (response.ok) {
        const data = await response.json()
        setIsLoggedIn(true)
        setUser(data.user)
      } else {
        setIsLoggedIn(false)
        setUser(null)
      }
    } catch (error) {
      console.error('Auth check failed:', error)
      setIsLoggedIn(false)
      setUser(null)
    } finally {
      setLoading(false) // End loading
    }
  }

  // Function to log out
  const logout = async () => {
    setLoading(true) // Start loading
    try {
      await fetch(`${apiURL}/auth/logout`, {
        method: 'POST',
        credentials: 'include',
      })
      setIsLoggedIn(false)
      setUser(null)
    } catch (error) {
      console.error('Logout failed:', error)
    } finally {
      setLoading(false) // End loading
    }
  }

  const login = () => {
    window.location.href = `${apiURL}/auth/google`
  }

  useEffect(() => {
    checkAuth()
  }, [])

  return (
    <AuthContext.Provider
      value={{
        isLoggedIn,
        loading,
        user,
        login,
        logout,
        checkAuth,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}
