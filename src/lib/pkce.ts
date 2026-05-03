/**
 * PKCE (Proof Key for Code Exchange) helpers.
 *
 * Shared between:
 * - Client-side: AuthContext / authStore (browser PKCE flow)
 * - Server-side: API route handlers (login, register)
 *
 * Single source of truth — eliminates the 3x duplication that previously
 * existed in AuthContext.tsx, api/auth/login/route.ts, and
 * api/auth/register/route.ts.
 */

// ── Random String ──────────────────────────────────────────────────

export function generateRandomString(length = 64): string {
  const array = new Uint8Array(length);
  if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
    crypto.getRandomValues(array);
  } else {
    // Fallback for environments without crypto.getRandomValues
    for (let i = 0; i < length; i++) {
      array[i] = Math.floor(Math.random() * 256);
    }
  }
  return Array.from(array, (b) => b.toString(16).padStart(2, '0')).join('');
}

// ── SHA-256 ────────────────────────────────────────────────────────

export async function sha256(plain: string): Promise<ArrayBuffer> {
  const encoder = new TextEncoder();
  const data = encoder.encode(plain);
  return crypto.subtle.digest('SHA-256', data);
}

// ── Base64URL Encoding ─────────────────────────────────────────────

export function base64UrlEncode(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (const b of bytes) {
    binary += String.fromCharCode(b);
  }
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

// ── PKCE Generation ────────────────────────────────────────────────

export async function generatePKCE(): Promise<{ verifier: string; challenge: string }> {
  const verifier = generateRandomString(64);
  const hash = await sha256(verifier);
  const challenge = base64UrlEncode(hash);
  return { verifier, challenge };
}
