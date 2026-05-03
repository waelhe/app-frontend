/**
 * Server-side register proxy route.
 *
 * Creates a new user in the backend via the admin API.
 * This is done by:
 * 1. Logging in as admin using the full PKCE flow (same as login route)
 *    to obtain a JWT access token
 * 2. Using that JWT token as Bearer auth to call POST /api/v1/admin/users
 * 3. Returning the created user data
 */

import { type NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = process.env.BACKEND_URL ?? 'http://localhost:8080';

const REGISTERED_REDIRECT_URI = 'http://127.0.0.1:8080/login/oauth2/code/marketplace-web-client';
const CLIENT_ID = 'marketplace-web-client';

const ADMIN_USERNAME = process.env.AUTH_ADMIN_USERNAME ?? 'admin';
const ADMIN_PASSWORD = process.env.AUTH_ADMIN_PASSWORD ?? '';

// ── PKCE Helpers ──────────────────────────────────────────────────

function generateRandomString(length = 64): string {
  const array = new Uint8Array(length);
  crypto.getRandomValues(array);
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

// ── Admin JWT Acquisition (full PKCE flow) ────────────────────────

async function getAdminJWT(): Promise<{ token: string } | { error: string; status: number }> {
  // Step 1: Fetch CSRF token + session cookie from the login page
  const loginPageResponse = await fetch(`${BACKEND_URL}/login`, {
    method: 'GET',
    headers: { Accept: 'text/html' },
  });

  if (!loginPageResponse.ok) {
    return { error: 'Could not reach the authentication server', status: 502 };
  }

  const loginPageHtml = await loginPageResponse.text();
  const csrfMatch = loginPageHtml.match(/name="_csrf"\s+type="hidden"\s+value="([^"]+)"/);
  if (!csrfMatch) {
    return { error: 'Could not extract CSRF token', status: 502 };
  }
  const csrfToken = csrfMatch[1];

  const setCookieHeader = loginPageResponse.headers.get('set-cookie');
  const sessionCookieMatch = setCookieHeader?.match(/SESSION=([^;]+)/);
  const sessionId = sessionCookieMatch?.[1];
  if (!sessionId) {
    return { error: 'Could not establish session', status: 502 };
  }

  console.log(`[Auth Register] Got CSRF + session: ${sessionId.substring(0, 8)}...`);

  // Step 2: POST admin credentials to login
  const loginResponse = await fetch(`${BACKEND_URL}/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      Cookie: `SESSION=${sessionId}`,
      Referer: `${BACKEND_URL}/login`,
    },
    body: new URLSearchParams({
      username: ADMIN_USERNAME,
      password: ADMIN_PASSWORD,
      _csrf: csrfToken,
    }).toString(),
    redirect: 'manual',
  });

  if (loginResponse.status !== 302) {
    return { error: 'Unexpected response from authentication server', status: 502 };
  }

  const loginRedirectLocation = loginResponse.headers.get('location') ?? '';
  if (loginRedirectLocation.includes('error')) {
    console.error('[Auth Register] Admin login failed');
    return { error: 'Registration service unavailable', status: 503 };
  }

  const loginSetCookie = loginResponse.headers.get('set-cookie');
  const newSessionMatch = loginSetCookie?.match(/SESSION=([^;]+)/);
  const authenticatedSessionId = newSessionMatch?.[1] ?? sessionId;
  console.log(`[Auth Register] Admin login successful, session: ${authenticatedSessionId.substring(0, 8)}...`);

  // Step 3: Generate PKCE
  const { verifier, challenge } = await generatePKCE();

  // Step 4: Call /oauth2/authorize with authenticated session
  const authorizeUrl = new URL(`${BACKEND_URL}/oauth2/authorize`);
  authorizeUrl.searchParams.set('response_type', 'code');
  authorizeUrl.searchParams.set('client_id', CLIENT_ID);
  authorizeUrl.searchParams.set('redirect_uri', REGISTERED_REDIRECT_URI);
  authorizeUrl.searchParams.set('scope', 'openid profile');
  authorizeUrl.searchParams.set('code_challenge', challenge);
  authorizeUrl.searchParams.set('code_challenge_method', 'S256');

  const authorizeResponse = await fetch(authorizeUrl.toString(), {
    method: 'GET',
    headers: {
      Cookie: `SESSION=${authenticatedSessionId}`,
      Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
    },
    redirect: 'manual',
  });

  if (authorizeResponse.status !== 302) {
    console.error(`[Auth Register] Unexpected authorize response: ${authorizeResponse.status}`);
    return { error: 'OAuth2 authorization failed', status: 502 };
  }

  let authorizeRedirectLocation = authorizeResponse.headers.get('location') ?? '';

  // Handle consent page if needed
  if (authorizeRedirectLocation.includes('/oauth2/consent') || authorizeRedirectLocation.includes('consent')) {
    console.log('[Auth Register] Consent page required — attempting auto-consent');

    try {
      const consentUrl = new URL(authorizeRedirectLocation, BACKEND_URL);
      const consentResponse = await fetch(`${consentUrl.pathname}${consentUrl.search}`, {
        method: 'GET',
        headers: {
          Cookie: `SESSION=${authenticatedSessionId}`,
          Accept: 'text/html',
        },
        redirect: 'manual',
      });

      if (consentResponse.status === 302) {
        const consentLocation = consentResponse.headers.get('location') ?? '';
        const consentUrl = new URL(consentLocation, BACKEND_URL);
        const code = consentUrl.searchParams.get('code');
        if (code) {
          return await exchangeCodeForAdminToken(code, verifier);
        }
      }

      // Try to POST consent approval
      const consentHtml = consentResponse.status === 200 ? await consentResponse.text() : '';
      const consentCsrfMatch = consentHtml.match(/name="_csrf"\s+type="hidden"\s+value="([^"]+)"/);
      const consentCsrf = consentCsrfMatch ? consentCsrfMatch[1] : csrfToken;
      const stateMatch = consentHtml.match(/name="state"\s+value="([^"]+)"/);
      const state = stateMatch?.[1] ?? '';

      const submitConsentResponse = await fetch(`${BACKEND_URL}/oauth2/consent`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          Cookie: `SESSION=${authenticatedSessionId}`,
          Referer: `${BACKEND_URL}/oauth2/consent`,
        },
        body: new URLSearchParams({
          _csrf: consentCsrf,
          state,
          scope: 'openid profile',
          consent: 'approve',
        }).toString(),
        redirect: 'manual',
      });

      const submitLocation = submitConsentResponse.headers.get('location') ?? '';
      const submitUrl = new URL(submitLocation, BACKEND_URL);
      const code = submitUrl.searchParams.get('code');
      if (code) {
        return await exchangeCodeForAdminToken(code, verifier);
      }

      console.error(`[Auth Register] Could not auto-consent. Location: ${submitLocation}`);
      return { error: 'Authorization consent could not be auto-approved', status: 502 };
    } catch (consentError) {
      console.error('[Auth Register] Consent handling error:', consentError);
      return { error: 'Authorization consent could not be auto-approved', status: 502 };
    }
  }

  // Extract authorization code from the redirect URL
  const redirectUrl = new URL(authorizeRedirectLocation, BACKEND_URL);
  const code = redirectUrl.searchParams.get('code');
  if (!code) {
    console.error(`[Auth Register] No code in redirect: ${authorizeRedirectLocation}`);
    return { error: 'No authorization code received', status: 502 };
  }

  console.log(`[Auth Register] Got authorization code: ${code.substring(0, 8)}...`);
  return await exchangeCodeForAdminToken(code, verifier);
}

// ── Token Exchange ────────────────────────────────────────────────

async function exchangeCodeForAdminToken(
  code: string,
  codeVerifier: string,
): Promise<{ token: string } | { error: string; status: number }> {
  const tokenResponse = await fetch(`${BACKEND_URL}/oauth2/token`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      Accept: 'application/json',
    },
    body: new URLSearchParams({
      grant_type: 'authorization_code',
      code,
      redirect_uri: REGISTERED_REDIRECT_URI,
      client_id: CLIENT_ID,
      code_verifier: codeVerifier,
    }).toString(),
  });

  if (!tokenResponse.ok) {
    const errorBody = await tokenResponse.text();
    console.error(`[Auth Register] Token exchange failed: ${tokenResponse.status} ${errorBody}`);
    return { error: `Token exchange failed: ${errorBody}`, status: 502 };
  }

  const tokenData = await tokenResponse.json();
  const accessToken = tokenData.access_token;

  if (!accessToken) {
    console.error('[Auth Register] No access_token in token response');
    return { error: 'No access token received', status: 502 };
  }

  console.log('[Auth Register] Admin JWT obtained successfully');
  return { token: accessToken };
}

// ── Main Handler ──────────────────────────────────────────────────

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const body = await request.json();
    const { displayName, email, password, role = 'CONSUMER' } = body;

    // Validate required fields
    if (!email || !password || !displayName) {
      return NextResponse.json(
        { error: 'invalid_request', error_description: 'Name, email, and password are required' },
        { status: 400 },
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: 'invalid_request', error_description: 'Password must be at least 6 characters' },
        { status: 400 },
      );
    }

    if (!ADMIN_PASSWORD) {
      console.error('[Auth Register] Admin password not configured');
      return NextResponse.json(
        {
          error: 'server_error',
          error_description: 'User registration is not available. Admin credentials not configured.',
        },
        { status: 503 },
      );
    }

    console.log(`[Auth Register] Attempting to register user: ${email}`);

    // Step 1: Get admin JWT via full PKCE flow
    const adminAuthResult = await getAdminJWT();
    if ('status' in adminAuthResult && 'error' in adminAuthResult && !('token' in adminAuthResult)) {
      return NextResponse.json(
        { error: 'server_error', error_description: adminAuthResult.error },
        { status: adminAuthResult.status },
      );
    }
    const adminToken = (adminAuthResult as { token: string }).token;

    // Step 2: Create user via admin API with JWT Bearer auth
    console.log('[Auth Register] Creating user via admin API...');
    const createResponse = await fetch(`${BACKEND_URL}/api/v1/admin/users`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({
        username: email,
        password,
        displayName,
        role,
      }),
    });

    if (!createResponse.ok) {
      const errorBody = await createResponse.text();
      console.error(`[Auth Register] User creation failed: ${createResponse.status} ${errorBody}`);

      if (createResponse.status === 401 || createResponse.status === 403) {
        // The backend's OAuth2 server doesn't include roles in JWT tokens,
        // so the admin API rejects our admin JWT. This is a known limitation.
        // Return a specific error so the frontend can show a helpful message.
        return NextResponse.json(
          {
            error: 'registration_limited',
            error_description: 'Registration is temporarily limited. Please use the provided demo accounts or contact support.',
          },
          { status: 503 },
        );
      }

      if (createResponse.status === 409) {
        return NextResponse.json(
          { error: 'conflict', error_description: 'A user with this email already exists' },
          { status: 409 },
        );
      }

      return NextResponse.json(
        { error: 'server_error', error_description: `Registration failed: ${errorBody}` },
        { status: 502 },
      );
    }

    const userData = await createResponse.json();
    console.log(`[Auth Register] User created successfully: ${email}`);

    return NextResponse.json({
      success: true,
      user: userData,
    });
  } catch (error) {
    console.error('[Auth Register] Unexpected error:', error);
    return NextResponse.json(
      {
        error: 'server_error',
        error_description: error instanceof Error ? error.message : 'An unexpected error occurred',
      },
      { status: 500 },
    );
  }
}
