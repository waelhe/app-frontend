/**
 * Auth Logout Route (BFF Pattern)
 *
 * Revokes the access token at the Spring Authorization Server,
 * then clears all httpOnly auth cookies.
 *
 * Called by the client-side authStore.signOut() instead of
 * directly hitting the backend (avoids CORS + exposes token in JS).
 */

import { type NextRequest, NextResponse } from 'next/server';

const BACKEND_URL =
  process.env.BACKEND_URL ||
  process.env.NEXT_PUBLIC_BACKEND_URL ||
  'http://localhost:8080';

export async function POST(request: NextRequest): Promise<NextResponse> {
  // Read token from httpOnly cookie (preferred) or Authorization header
  const accessToken = request.cookies.get('marketplace_access_token')?.value;
  const refreshToken = request.cookies.get('marketplace_refresh_token')?.value;

  // Also try to read token from request body (client-side localStorage token)
  let clientToken: string | undefined;
  try {
    const body = await request.json().catch(() => ({}));
    clientToken = body.token;
  } catch {
    // No body or invalid JSON — ignore
  }

  const tokenToRevoke = accessToken || clientToken;

  // 1. Attempt to revoke the access token at the authorization server
  if (tokenToRevoke) {
    try {
      await fetch(`${BACKEND_URL}/oauth2/revoke`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          token: tokenToRevoke,
          token_type_hint: 'access_token',
        }),
      });
      console.info('[Auth Logout] Access token revoked successfully');
    } catch (err) {
      console.warn('[Auth Logout] Token revocation failed (non-critical):', err);
    }
  }

  // 2. Attempt to revoke the refresh token
  if (refreshToken) {
    try {
      await fetch(`${BACKEND_URL}/oauth2/revoke`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          token: refreshToken,
          token_type_hint: 'refresh_token',
        }),
      });
    } catch {
      // Non-critical
    }
  }

  // 3. Clear all httpOnly auth cookies
  const response = NextResponse.json({ success: true });

  response.cookies.set('marketplace_access_token', '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 0,
    path: '/',
  });

  response.cookies.set('marketplace_refresh_token', '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 0,
    path: '/',
  });

  response.cookies.set('marketplace_id_token', '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 0,
    path: '/',
  });

  return response;
}
