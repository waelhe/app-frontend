/**
 * AuthContext — OAuth2 PKCE authentication context.
 * Handles sign-in via Authorization Code Flow with PKCE,
 * token exchange, storage, and user identity.
 * Connects to waelhe/app-java-v3 Spring Authorization Server.
 *
 * Resilience features:
 * - JWT-based session initialization works offline
 * - Profile fetch failures don't clear auth (network errors are tolerated)
 * - Only 401 Unauthorized clears the session (invalid/expired token)
 * - Automatic session restoration from localStorage
 */

'use client';

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import type { UserResponse, UserRole } from '@/lib/types';
import { getToken, setToken, removeToken } from '@/lib/api';

// ── Configuration ─────────────────────────────────────────────────

/** Backend base URL for OAuth2 authorize redirect (browser navigates directly) */
const BACKEND_BASE = process.env.NEXT_PUBLIC_BACKEND_URL ?? 'http://localhost:8080';
const AUTH_BASE = `${BACKEND_BASE}/oauth2`;
const CLIENT_ID = process.env.NEXT_PUBLIC_AUTH_CLIENT_ID ?? 'marketplace-web-client';
// Use the backend's registered redirect URI for the browser-based OAuth2 flow
const REDIRECT_URI = process.env.NEXT_PUBLIC_AUTH_REDIRECT_URI ??
  (typeof window !== 'undefined' ? `${window.location.origin}/auth/callback` : '');

/** Token exchange uses our Next.js proxy to avoid CORS */
const TOKEN_PROXY_ENDPOINT = '/api/auth/token';

// ── PKCE Helpers ──────────────────────────────────────────────────

function generateRandomString(length = 64): string {
  const array = new Uint8Array(length);
  if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
    crypto.getRandomValues(array);
  } else {
    for (let i = 0; i < length; i++) {
      array[i] = Math.floor(Math.random() * 256);
    }
  }
  return Array.from(array, (b) => b.toString(16).padStart(2, '0')).join('');
}

async function sha256(plain: string): Promise<ArrayBuffer> {
  const encoder = new TextEncoder();
  const data = encoder.encode(plain);
  return crypto.subtle.digest('SHA-256', data);
}

function base64UrlEncode(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (const b of bytes) {
    binary += String.fromCharCode(b);
  }
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

async function generatePKCE(): Promise<{ verifier: string; challenge: string }> {
  const verifier = generateRandomString(64);
  const hash = await sha256(verifier);
  const challenge = base64UrlEncode(hash);
  return { verifier, challenge };
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

/** Extract the primary role from JWT claims */
function extractRole(payload: JwtPayload): UserRole {
  const roles = payload.roles;
  if (Array.isArray(roles)) {
    if (roles.includes('ADMIN')) return 'ADMIN';
    if (roles.includes('PROVIDER')) return 'PROVIDER';
    if (roles.includes('CONSUMER')) return 'CONSUMER';
  }
  return 'CONSUMER';
}

// ── PKCE Storage ──────────────────────────────────────────────────

const PKCE_VERIFIER_KEY = 'marketplace_pkce_verifier';

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

// ── Auth Code Exchange ────────────────────────────────────────────

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

  // Use our Next.js proxy route to avoid CORS issues
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

// ── Session Initializer ───────────────────────────────────────────

function initializeSession(): {
  token: string | null;
  user: UserResponse | null;
  role: UserRole;
  needsFetch: boolean;
} {
  if (typeof window === 'undefined') {
    return { token: null, user: null, role: 'CONSUMER', needsFetch: false };
  }

  const token = getToken();
  if (!token) {
    return { token: null, user: null, role: 'CONSUMER', needsFetch: false };
  }

  const payload = decodeJwt(token);

  // Check if token is expired
  if (payload?.exp && payload.exp * 1000 < Date.now()) {
    removeToken();
    return { token: null, user: null, role: 'CONSUMER', needsFetch: false };
  }

  // Build a user from the JWT claims — this works offline!
  const role = payload ? extractRole(payload) : 'CONSUMER';
  const user: UserResponse | null = payload
    ? {
        id: payload.sub ?? '',
        email: payload.email ?? '',
        displayName: payload.name ?? payload.preferred_username ?? '',
        role,
        createdAt: payload.iat ? new Date(payload.iat * 1000).toISOString() : '',
        updatedAt: payload.iat ? new Date(payload.iat * 1000).toISOString() : '',
      }
    : null;

  return { token, user, role, needsFetch: true };
}

// ── Context Types ─────────────────────────────────────────────────

interface AuthContextType {
  user: UserResponse | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  accessToken: string | null;
  role: UserRole;
  signIn: () => Promise<void>;
  signOut: () => void;
  /** Whether we're using a cached/offline session */
  isOfflineSession: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// ── Provider ──────────────────────────────────────────────────────

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session] = useState(initializeSession);
  const [user, setUser] = useState<UserResponse | null>(session.user);
  const [isLoading, setIsLoading] = useState(session.needsFetch);
  const [accessToken, setAccessToken] = useState<string | null>(session.token);
  const [role, setRole] = useState<UserRole>(session.role);
  const [isOfflineSession, setIsOfflineSession] = useState(false);

  // Use ref to track if we've already fetched profile for this token
  const fetchedForToken = useRef<string | null>(null);

  // Fetch fresh profile from backend when we have a token
  // But DON'T clear the session on network errors — only on 401
  useEffect(() => {
    if (!session.needsFetch || !session.token) return;
    if (fetchedForToken.current === session.token) return;
    fetchedForToken.current = session.token;

    let cancelled = false;

    fetch('/api/v1/users/me', {
      headers: {
        Authorization: `Bearer ${session.token}`,
        Accept: 'application/json',
      },
    })
      .then((response) => {
        if (cancelled) return null;

        if (response.status === 401) {
          // Token is genuinely invalid/expired — clear session
          removeToken();
          setAccessToken(null);
          setUser(null);
          setRole('CONSUMER');
          setIsOfflineSession(false);
          return null;
        }

        if (response.status === 500 || response.status === 502 || response.status === 503 || response.status === 504) {
          // Server error or unavailable — keep the JWT-based user
          // We can still function with the JWT claims
          setIsOfflineSession(true);
          return null;
        }

        if (response.ok) return response.json() as Promise<UserResponse>;

        // Other errors — keep JWT-based user, mark as offline
        setIsOfflineSession(true);
        return null;
      })
      .then((profile) => {
        if (cancelled) return;
        if (profile) {
          setUser(profile);
          if (profile.role) setRole(profile.role);
          setIsOfflineSession(false);
        }
      })
      .catch(() => {
        if (cancelled) return;
        // Network error — keep the JWT-based user, will retry later
        // This is the key resilience improvement: don't log out on network errors
        setIsOfflineSession(true);
      })
      .finally(() => {
        if (!cancelled) {
          setIsLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [session.needsFetch, session.token]);

  const signIn = useCallback(async () => {
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

    // Browser navigates directly to backend's OAuth2 authorize endpoint
    const authUrl = `${AUTH_BASE}/authorize?${params.toString()}`;
    window.location.href = authUrl;
  }, []);

  const signOut = useCallback(() => {
    removeToken();
    setAccessToken(null);
    setUser(null);
    setRole('CONSUMER');
    setIsOfflineSession(false);
    fetchedForToken.current = null;
    // Redirect to backend's logout endpoint
    const logoutUrl = `${AUTH_BASE}/logout?client_id=${CLIENT_ID}&post_logout_redirect_uri=${encodeURIComponent(typeof window !== 'undefined' ? window.location.origin : '')}`;
    window.location.href = logoutUrl;
  }, []);

  const isAuthenticated = useMemo(() => !!user && !!accessToken, [user, accessToken]);

  const value = useMemo(
    () => ({
      user,
      isLoading,
      isAuthenticated,
      accessToken,
      role,
      signIn,
      signOut,
      isOfflineSession,
    }),
    [user, isLoading, isAuthenticated, accessToken, role, signIn, signOut, isOfflineSession],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// ── Hook ──────────────────────────────────────────────────────────

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
