/**
 * Auth Store — Merged Zustand store combining AuthContext + use-auth.
 *
 * Pure Zustand (no React Context). Provides:
 * - JWT decode & session initialization (offline-capable)
 * - OAuth2 PKCE sign-in / sign-out
 * - Auth code exchange (exported standalone for callback page)
 * - Token & user state management
 * - Persistence of user + isAuthenticated via zustand/persist
 *
 * Profile fetching is NOT included here — components should use a
 * separate React hook/effect to call the profile API and update the store.
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { UserRole } from '@/lib/types';
import { generatePKCE } from '@/lib/pkce';
import { getToken, setToken, removeToken } from '@/lib/api';

// ── Configuration ─────────────────────────────────────────────────

const BACKEND_BASE = process.env.NEXT_PUBLIC_BACKEND_URL ?? 'http://localhost:8080';
const AUTH_BASE = `${BACKEND_BASE}/oauth2`;
const CLIENT_ID = process.env.NEXT_PUBLIC_AUTH_CLIENT_ID ?? 'marketplace-web-client';
const REDIRECT_URI = process.env.NEXT_PUBLIC_AUTH_REDIRECT_URI ??
  (typeof window !== 'undefined' ? `${window.location.origin}/auth/callback` : '');
const TOKEN_PROXY_ENDPOINT = '/api/auth/token';
const PKCE_VERIFIER_KEY = 'marketplace_pkce_verifier';

// ── User Interface ────────────────────────────────────────────────

export interface User {
  id: string;
  displayName: string;
  email: string;
  image?: string;
  role: UserRole;
  phone?: string;
}

// ── Store Interface ───────────────────────────────────────────────

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  accessToken: string | null;
  role: UserRole;
  isOfflineSession: boolean;

  // Actions
  login: (user: User, token?: string) => void;
  logout: () => void;
  setLoading: (loading: boolean) => void;
  updateUser: (data: Partial<User>) => void;
  setAccessToken: (token: string | null) => void;
  setRole: (role: UserRole) => void;
  setOfflineSession: (offline: boolean) => void;
  signIn: () => Promise<void>;
  signOut: () => Promise<void>;
  initializeFromToken: () => void;
}

// ── JWT Decode ────────────────────────────────────────────────────

interface JwtPayload {
  sub?: string;
  email?: string;
  name?: string;
  preferred_username?: string;
  roles?: string[];
  exp?: number;
  iat?: number;
  [key: string]: unknown;
}

function decodeJwt(token: string): JwtPayload | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    const payload = parts[1];
    const decoded = atob(payload.replace(/-/g, '+').replace(/_/g, '/'));
    return JSON.parse(decoded) as JwtPayload;
  } catch {
    return null;
  }
}

/** Extract the primary role from JWT claims or infer from username */
function extractRole(payload: JwtPayload): UserRole {
  const roles = payload.roles;
  if (Array.isArray(roles)) {
    if (roles.includes('ADMIN')) return 'ADMIN';
    if (roles.includes('PROVIDER')) return 'PROVIDER';
    if (roles.includes('CONSUMER')) return 'CONSUMER';
  }
  // Fallback: infer role from username (sub claim)
  const sub = payload.sub ?? '';
  if (sub === 'admin') return 'ADMIN';
  if (sub.startsWith('provider-')) return 'PROVIDER';
  return 'CONSUMER';
}

// ── PKCE Session Storage Helpers ──────────────────────────────────

function savePKCEVerifier(verifier: string): void {
  if (typeof window === 'undefined') return;
  sessionStorage.setItem(PKCE_VERIFIER_KEY, verifier);
}

function loadPKCEVerifier(): string | null {
  if (typeof window === 'undefined') return null;
  return sessionStorage.getItem(PKCE_VERIFIER_KEY);
}

function clearPKCEVerifier(): void {
  if (typeof window === 'undefined') return;
  sessionStorage.removeItem(PKCE_VERIFIER_KEY);
}

// ── Auth Code Exchange (standalone export) ────────────────────────

/**
 * Exchange an OAuth2 authorization code for an access token.
 * Exported as a standalone function so the /auth/callback page can
 * call it directly without needing the store hook.
 */
export async function exchangeAuthCode(code: string): Promise<string> {
  const verifier = loadPKCEVerifier();
  if (!verifier) {
    throw new Error('PKCE verifier not found. Please try signing in again.');
  }

  const params = new URLSearchParams({
    grant_type: 'authorization_code',
    code,
    redirect_uri: REDIRECT_URI,
    client_id: CLIENT_ID,
    code_verifier: verifier,
  });

  // Use the Next.js proxy route to avoid CORS issues
  const response = await fetch(TOKEN_PROXY_ENDPOINT, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: params.toString(),
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`Token exchange failed: ${response.status} — ${errorBody}`);
  }

  const data = await response.json();
  const accessToken = data.access_token as string;

  if (!accessToken) {
    throw new Error('No access_token in token response');
  }

  setToken(accessToken);
  clearPKCEVerifier();

  return accessToken;
}

// ── Zustand Store ─────────────────────────────────────────────────

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      accessToken: null,
      role: 'CONSUMER' as UserRole,
      isOfflineSession: false,

      // ── Simple state setters ────────────────────────────────────

      login: (user: User, token?: string) =>
        set({
          user,
          isAuthenticated: true,
          isLoading: false,
          ...(token !== undefined ? { accessToken: token } : {}),
        }),

      logout: () => {
        removeToken();
        set({
          user: null,
          isAuthenticated: false,
          isLoading: false,
          accessToken: null,
          role: 'CONSUMER' as UserRole,
          isOfflineSession: false,
        });
      },

      setLoading: (loading: boolean) => set({ isLoading: loading }),

      updateUser: (data: Partial<User>) =>
        set((state) => ({
          user: state.user ? { ...state.user, ...data } : null,
        })),

      setAccessToken: (token: string | null) => set({ accessToken: token }),

      setRole: (role: UserRole) => set({ role }),

      setOfflineSession: (offline: boolean) => set({ isOfflineSession: offline }),

      // ── OAuth2 PKCE Sign In ─────────────────────────────────────

      signIn: async () => {
        const { verifier, challenge } = await generatePKCE();
        savePKCEVerifier(verifier);

        const params = new URLSearchParams({
          response_type: 'code',
          client_id: CLIENT_ID,
          redirect_uri: REDIRECT_URI,
          code_challenge: challenge,
          code_challenge_method: 'S256',
          scope: 'openid profile',
        });

        const authUrl = `${AUTH_BASE}/authorize?${params.toString()}`;
        window.location.href = authUrl;
      },

      // ── OAuth2 Sign Out ─────────────────────────────────────────

      signOut: async () => {
        const currentToken = get().accessToken;

        // 1. Attempt to revoke the token at the authorization server
        if (currentToken) {
          try {
            await fetch(`${BACKEND_BASE}/oauth2/revoke`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
              body: new URLSearchParams({
                token: currentToken,
                token_type_hint: 'access_token',
              }),
            });
          } catch {
            // Revocation may fail (network error, server down) — still clear locally
          }
        }

        // 2. Clear local state
        removeToken();
        set({
          user: null,
          isAuthenticated: false,
          isLoading: false,
          accessToken: null,
          role: 'CONSUMER' as UserRole,
          isOfflineSession: false,
        });

        // 3. Redirect to backend's logout endpoint to clear server session
        const logoutUrl = `${AUTH_BASE}/logout?client_id=${CLIENT_ID}&post_logout_redirect_uri=${encodeURIComponent(typeof window !== 'undefined' ? window.location.origin : '')}`;
        window.location.href = logoutUrl;
      },

      // ── Initialize from JWT Token ───────────────────────────────

      initializeFromToken: () => {
        if (typeof window === 'undefined') return;

        const token = getToken();
        if (!token) {
          // No token — ensure clean state
          set({
            accessToken: null,
            user: null,
            role: 'CONSUMER' as UserRole,
            isAuthenticated: false,
            isOfflineSession: false,
          });
          return;
        }

        const payload = decodeJwt(token);

        // Check if token is expired
        if (payload?.exp && payload.exp * 1000 < Date.now()) {
          removeToken();
          set({
            accessToken: null,
            user: null,
            role: 'CONSUMER' as UserRole,
            isAuthenticated: false,
            isOfflineSession: false,
          });
          return;
        }

        // Build user from JWT claims — this works offline
        const role = payload ? extractRole(payload) : 'CONSUMER';
        const user: User | null = payload
          ? {
              id: payload.sub ?? '',
              email: payload.email ?? '',
              displayName: payload.name ?? payload.preferred_username ?? '',
              role,
            }
          : null;

        set({
          accessToken: token,
          user,
          role,
          isAuthenticated: !!user && !!token,
        });
      },
    }),
    {
      name: 'nabd-auth',
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);

// ── Convenience Hook ──────────────────────────────────────────────

/**
 * Convenience hook that returns the full auth state + actions.
 * Equivalent to `useAuthStore()` but can be swapped or wrapped
 * in the future without touching consumer components.
 */
export function useAuth() {
  return useAuthStore();
}
