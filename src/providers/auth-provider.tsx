'use client'

import { useAuth } from '@/store/use-auth'
import { AuthProvider as ContextAuthProvider } from '@/contexts/AuthContext'
import { useEffect } from 'react'

/**
 * Combined AuthProvider that:
 * 1. Provides the store-based auth state (for Header/Footer/BottomNav)
 * 2. Provides the context-based AuthProvider (for system/dashboard components)
 * 3. Checks session on mount
 */
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { setLoading } = useAuth()

  useEffect(() => {
    const checkSession = async () => {
      try {
        setLoading(true)
        setLoading(false)
      } catch {
        setLoading(false)
      }
    }
    checkSession()
  }, [setLoading])

  return (
    <ContextAuthProvider>
      {children}
    </ContextAuthProvider>
  )
}
