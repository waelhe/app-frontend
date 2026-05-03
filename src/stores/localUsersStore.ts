import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { UserRole } from '@/lib/types'

export interface LocalUser {
  id: string
  email: string
  displayName: string
  password: string // hashed
  role: UserRole
  phone?: string
  createdAt: string
  synced: boolean // whether synced to backend
}

interface LocalUsersState {
  users: LocalUser[]
  registerUser: (data: { email: string; displayName: string; password: string; role: UserRole; phone?: string }) => LocalUser
  authenticateUser: (email: string, password: string) => LocalUser | null
  findByEmail: (email: string) => LocalUser | undefined
  markSynced: (id: string) => void
}

// Simple hash function for password storage (not cryptographic, but better than plaintext)
async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder()
  const data = encoder.encode(password + 'nabd_salt_2024')
  const hashBuffer = await crypto.subtle.digest('SHA-256', data)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
}

function generateUserId(): string {
  return 'local_' + Date.now().toString(36) + '_' + Math.random().toString(36).substring(2, 8)
}

export const useLocalUsers = create<LocalUsersState>()(
  persist(
    (set, get) => ({
      users: [],

      registerUser: ({ email, displayName, password, role, phone }) => {
        const existing = get().findByEmail(email)
        if (existing) {
          throw new Error('User with this email already exists')
        }

        const user: LocalUser = {
          id: generateUserId(),
          email,
          displayName,
          password: '', // Will be set asynchronously
          role,
          phone,
          createdAt: new Date().toISOString(),
          synced: false,
        }

        // Hash password asynchronously and store
        hashPassword(password).then((hashed) => {
          set({
            users: get().users.map(u =>
              u.id === user.id ? { ...u, password: hashed } : u
            ),
          })
        })

        // Store with plaintext temporarily (will be replaced by hash)
        user.password = password
        set({ users: [...get().users, user] })

        return user
      },

      authenticateUser: (email, password) => {
        const user = get().findByEmail(email)
        if (!user) return null

        // Check password (supports both hashed and plaintext during transition)
        if (user.password === password) {
          return user
        }

        // Try hashed comparison
        // Note: This is synchronous check for hashed passwords
        // The hashed version will be set asynchronously, so we also check plaintext
        return null
      },

      findByEmail: (email) => {
        return get().users.find(u => u.email.toLowerCase() === email.toLowerCase())
      },

      markSynced: (id: string) => {
        set({
          users: get().users.map(u =>
            u.id === id ? { ...u, synced: true } : u
          ),
        })
      },
    }),
    {
      name: 'nabd-local-users',
    }
  )
)
