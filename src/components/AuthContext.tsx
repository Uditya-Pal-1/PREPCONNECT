import React, { createContext, useContext, useState } from 'react'
import { supabase } from '../utils/supabase/client'
import { projectId, publicAnonKey } from '../utils/supabase/info'

interface AuthContextType {
  login: (email: string, password: string) => Promise<any>
  signup: (userData: any) => Promise<any>
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const login = async (email: string, password: string) => {
    try {
      const { data: { session }, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) throw error

      if (session?.access_token && session?.user) {
        localStorage.setItem('prepconnect_access_token', session.access_token)
        
        // Get user profile from our server
        const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-78cb9030/profile/${session.user.id}`, {
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
          }
        })

        if (!response.ok) {
          throw new Error('Failed to fetch user profile')
        }

        const { profile } = await response.json()
        return profile
      }

      throw new Error('Login failed - no session created')
    } catch (error) {
      console.log('Login error:', error)
      throw error
    }
  }

  const signup = async (userData: any) => {
    try {
      const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-78cb9030/signup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${publicAnonKey}`,
        },
        body: JSON.stringify(userData)
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Signup failed')
      }

      const result = await response.json()
      return result.user
    } catch (error) {
      console.log('Signup error:', error)
      throw error
    }
  }

  const logout = async () => {
    try {
      await supabase.auth.signOut()
      localStorage.removeItem('prepconnect_access_token')
    } catch (error) {
      console.log('Logout error:', error)
    }
  }

  return (
    <AuthContext.Provider value={{ login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}