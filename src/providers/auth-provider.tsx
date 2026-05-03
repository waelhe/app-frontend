'use client'

import { useAuth as useAuthStore } from '@/store/use-auth'
import { AuthProvider as ContextAuthProvider, useAuth as useAuthContext } from '@/contexts/AuthContext'
import { useEffect } from 'react'

/**
 * Combined AuthProvider that:
 * 1. Provides the context-based AuthProvider (for system/dashboard components)
 * 2. Provides the store-based auth state (for Header/Footer/BottomNav)
 * 3. Syncs the AuthContext user into the Zustand store
 *
 * Resilience: Only syncs logout when the session is truly invalid (401),
 * not when the backend is temporarily unavailable.
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
  const { user: contextUser, isAuthenticated, isLoading, isOfflineSession } = useAuthContext()
  const { login, logout, setLoading } = useAuthStore()

  useEffect(() => {
    if (isLoading) {
      setLoading(true)
    } else if (contextUser && isAuthenticated) {
      // Sync the user from context to zustand store
      login({
        id: contextUser.id,
        displayName: contextUser.displayName,
        email: contextUser.email,
        role: contextUser.role ?? 'CONSUMER',
      })
    } else if (!isOfflineSession) {
      // Only logout if we're not in an offline session
      // Offline sessions mean the backend is down, not that the user is unauthenticated
      logout()
    }
  }, [contextUser, isAuthenticated, isLoading, isOfflineSession, login, logout, setLoading])

  return <>{children}</>
}
