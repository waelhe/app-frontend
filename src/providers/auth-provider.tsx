'use client'

import { useAuth as useAuthStore } from '@/store/use-auth'
import { AuthProvider as ContextAuthProvider, useAuth as useAuthContext } from '@/contexts/AuthContext'
import { useEffect } from 'react'

/**
 * Combined AuthProvider that:
 * 1. Provides the context-based AuthProvider (for system/dashboard components)
 * 2. Provides the store-based auth state (for Header/Footer/BottomNav)
 * 3. Syncs the AuthContext user into the Zustand store
 */
export function AuthProvider({ children }: { children: React.ReactNode }) {
  return (
    <ContextAuthProvider>
      <AuthSync>{children}</AuthSync>
    </ContextAuthProvider>
  )
}

/**
 * Syncs the AuthContext user into the Zustand store
 * so both systems share the same auth state.
 */
function AuthSync({ children }: { children: React.ReactNode }) {
  const { user: contextUser, isAuthenticated, isLoading } = useAuthContext()
  const { login, logout, setLoading } = useAuthStore()

  useEffect(() => {
    if (isLoading) {
      setLoading(true)
    } else if (contextUser && isAuthenticated) {
      login({
        id: contextUser.id,
        displayName: contextUser.displayName,
        email: contextUser.email,
        role: contextUser.role ?? 'CONSUMER',
      })
    } else {
      logout()
    }
  }, [contextUser, isAuthenticated, isLoading, login, logout, setLoading])

  return <>{children}</>
}
