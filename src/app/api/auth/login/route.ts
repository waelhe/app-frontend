/**
 * Server-side login proxy route.
 *
 * Handles the complete OAuth2 Authorization Code flow with PKCE,
 * all done server-side so the user never leaves the frontend.
 *
 * Flow:
 * 1. Accepts username/password from the frontend
 * 2. Fetches CSRF token from backend's /login page
 * 3. POSTs credentials to backend's /login (form-based auth)
 * 4. After successful login, generates PKCE
 * 5. Calls backend's /oauth2/authorize with session cookie
 * 6. Extracts authorization code from redirect Location header
 * 7. Exchanges code for JWT token at /oauth2/token
 * 8. Returns access token + user info to the frontend
 */

import { type NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = process.env.BACKEND_URL ?? 'http://localhost:8080';

// The registered redirect URI from the backend's OAuth2 client configuration
// (R__seed_oauth2_client.sql: redirect_uris = 'http://127.0.0.1:8080/login/oauth2/code/marketplace-web-client')
const REGISTERED_REDIRECT_URI = 'http://127.0.0.1:8080/login/oauth2/code/marketplace-web-client';
const CLIENT_ID = 'marketplace-web-client';

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

// ── Main Handler ──────────────────────────────────────────────────

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const body = await request.json();
    const { username, password } = body;

    if (!username || !password) {
      return NextResponse.json(
        { error: 'invalid_request', error_description: 'Username and password are required' },
        { status: 400 },
      );
    }

    console.log(`[Auth Login] Attempting login for user: ${username}`);

    // Step 1: Fetch the backend's login page to get CSRF token and session cookie
    const loginPageResponse = await fetch(`${BACKEND_URL}/login`, {
      method: 'GET',
      headers: {
        Accept: 'text/html',
      },
    });

    if (!loginPageResponse.ok) {
      console.error(`[Auth Login] Failed to fetch login page: ${loginPageResponse.status}`);
      return NextResponse.json(
        { error: 'server_error', error_description: 'Could not reach the authentication server' },
        { status: 502 },
      );
    }

    // Extract CSRF token from the HTML
    const loginPageHtml = await loginPageResponse.text();
    const csrfMatch = loginPageHtml.match(/name="_csrf"\s+type="hidden"\s+value="([^"]+)"/);
    if (!csrfMatch) {
      console.error('[Auth Login] Could not find CSRF token in login page');
      return NextResponse.json(
        { error: 'server_error', error_description: 'Could not extract CSRF token' },
        { status: 502 },
      );
    }
    const csrfToken = csrfMatch[1];

    // Extract session cookie from the Set-Cookie header
    const setCookieHeader = loginPageResponse.headers.get('set-cookie');
    const sessionCookieMatch = setCookieHeader?.match(/SESSION=([^;]+)/);
    const sessionId = sessionCookieMatch ? sessionCookieMatch[1] : null;

    if (!sessionId) {
      console.error('[Auth Login] Could not find session cookie');
      return NextResponse.json(
        { error: 'server_error', error_description: 'Could not establish session' },
        { status: 502 },
      );
    }

    console.log(`[Auth Login] Got CSRF token and session: ${sessionId.substring(0, 8)}...`);

    // Step 2: POST login credentials to the backend
    const loginResponse = await fetch(`${BACKEND_URL}/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        Cookie: `SESSION=${sessionId}`,
        Referer: `${BACKEND_URL}/login`,
      },
      body: new URLSearchParams({
        username,
        password,
        _csrf: csrfToken,
      }).toString(),
      redirect: 'manual', // Don't follow redirects
    });

    // Check if login was successful
    // Successful login → 302 redirect to a non-error page
    // Failed login → 302 redirect to /login?error
    if (loginResponse.status !== 302) {
      console.error(`[Auth Login] Unexpected login response status: ${loginResponse.status}`);
      return NextResponse.json(
        { error: 'server_error', error_description: 'Unexpected response from authentication server' },
        { status: 502 },
      );
    }

    const loginRedirectLocation = loginResponse.headers.get('location') ?? '';
    if (loginRedirectLocation.includes('error')) {
      console.warn(`[Auth Login] Login failed for user: ${username}`);
      return NextResponse.json(
        { error: 'invalid_credentials', error_description: 'اسم المستخدم أو كلمة المرور غير صحيحة' },
        { status: 401 },
      );
    }

    // Extract the new session cookie (backend may issue a new one after login)
    const loginSetCookie = loginResponse.headers.get('set-cookie');
    const newSessionMatch = loginSetCookie?.match(/SESSION=([^;]+)/);
    const authenticatedSessionId = newSessionMatch ?? sessionId;
    console.log(`[Auth Login] Login successful for user: ${username}`);

    // Step 3: Generate PKCE
    const { verifier, challenge } = await generatePKCE();

    // Step 4: Call /oauth2/authorize with the authenticated session
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
      redirect: 'manual', // Don't follow redirects — we want the Location header
    });

    // The response should be a 302 redirect to the redirect_uri with the code
    if (authorizeResponse.status !== 302) {
      console.error(`[Auth Login] Unexpected authorize response: ${authorizeResponse.status}`);
      const responseBody = await authorizeResponse.text();
      console.error(`[Auth Login] Response body: ${responseBody.substring(0, 500)}`);
      return NextResponse.json(
        { error: 'server_error', error_description: 'OAuth2 authorization failed' },
        { status: 502 },
      );
    }

    const authorizeRedirectLocation = authorizeResponse.headers.get('location') ?? '';
    console.log(`[Auth Login] Authorize redirect: ${authorizeRedirectLocation.substring(0, 100)}...`);

    // Check if it redirected to the consent page
    if (authorizeRedirectLocation.includes('/oauth2/consent') || authorizeRedirectLocation.includes('consent')) {
      console.log('[Auth Login] Consent page required - attempting auto-consent');

      // Follow the redirect to the consent page and auto-accept
      // The consent page URL contains the state parameter we need
      try {
        const consentResponse = await fetch(`${BACKEND_URL}${new URL(authorizeRedirectLocation).pathname}${new URL(authorizeRedirectLocation).search}`, {
          method: 'GET',
          headers: {
            Cookie: `SESSION=${authenticatedSessionId}`,
            Accept: 'text/html',
          },
          redirect: 'manual',
        });

        if (consentResponse.status === 302) {
          // Consent was auto-granted or redirected back with code
          const consentLocation = consentResponse.headers.get('location') ?? '';
          const consentUrl = new URL(consentLocation, BACKEND_URL);
          const code = consentUrl.searchParams.get('code');

          if (code) {
            // We got the code! Exchange it for a token
            return await exchangeCodeForToken(code, verifier);
          }

          // Need to follow further redirects
          console.log(`[Auth Login] Consent redirect: ${consentLocation}`);
        }

        // Try to POST consent approval
        const consentHtml = consentResponse.status === 200 ? await consentResponse.text() : '';
        const consentCsrfMatch = consentHtml.match(/name="_csrf"\s+type="hidden"\s+value="([^"]+)"/);
        const consentCsrf = consentCsrfMatch ? consentCsrfMatch[1] : csrfToken;

        // Extract state from the consent page
        const stateMatch = consentHtml.match(/name="state"\s+value="([^"]+)"/);
        const state = stateMatch ? stateMatch[1] : '';

        // Submit consent
        const submitConsentResponse = await fetch(`${BACKEND_URL}/oauth2/consent`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            Cookie: `SESSION=${authenticatedSessionId}`,
            Referer: consentResponse.url || `${BACKEND_URL}/oauth2/consent`,
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
          return await exchangeCodeForToken(code, verifier);
        }

        console.error(`[Auth Login] Could not auto-consent. Location: ${submitLocation}`);
        return NextResponse.json(
          {
            error: 'consent_required',
            error_description: 'Authorization consent could not be auto-approved.',
            needsBrowserAuth: true,
          },
          { status: 200 },
        );
      } catch (consentError) {
        console.error('[Auth Login] Consent handling error:', consentError);
        return NextResponse.json(
          {
            error: 'consent_required',
            error_description: 'Authorization consent could not be auto-approved.',
            needsBrowserAuth: true,
          },
          { status: 200 },
        );
      }
    }

    // Extract the authorization code from the redirect URL
    const redirectUrl = new URL(authorizeRedirectLocation, BACKEND_URL);
    const code = redirectUrl.searchParams.get('code');

    if (!code) {
      console.error(`[Auth Login] No code in redirect: ${authorizeRedirectLocation}`);
      return NextResponse.json(
        { error: 'server_error', error_description: 'No authorization code received' },
        { status: 502 },
      );
    }

    console.log(`[Auth Login] Got authorization code: ${code.substring(0, 8)}...`);
    return await exchangeCodeForToken(code, verifier);
  } catch (error) {
    console.error('[Auth Login] Unexpected error:', error);
    return NextResponse.json(
      {
        error: 'server_error',
        error_description: error instanceof Error ? error.message : 'An unexpected error occurred',
      },
      { status: 500 },
    );
  }
}

// ── Token Exchange ────────────────────────────────────────────────

async function exchangeCodeForToken(
  code: string,
  codeVerifier: string,
): Promise<NextResponse> {
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
    console.error(`[Auth Login] Token exchange failed: ${tokenResponse.status} ${errorBody}`);
    return NextResponse.json(
      { error: 'server_error', error_description: `Token exchange failed: ${errorBody}` },
      { status: 502 },
    );
  }

  const tokenData = await tokenResponse.json();
  const accessToken = tokenData.access_token;

  if (!accessToken) {
    console.error('[Auth Login] No access_token in token response');
    return NextResponse.json(
      { error: 'server_error', error_description: 'No access token received' },
      { status: 502 },
    );
  }

  console.log('[Auth Login] Token obtained successfully');

  // Fetch user profile using the token
  let userProfile = null;
  try {
    const profileResponse = await fetch(`${BACKEND_URL}/api/v1/users/me`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        Accept: 'application/json',
      },
    });
    if (profileResponse.ok) {
      userProfile = await profileResponse.json();
    }
  } catch {
    // Profile fetch failed - we still have the token
  }

  return NextResponse.json({
    accessToken,
    expiresIn: tokenData.expires_in,
    refreshToken: tokenData.refresh_token,
    tokenType: tokenData.token_type,
    user: userProfile,
  });
}
