/**
 * Server-side OAuth2 Authorization Code flow with PKCE.
 *
 * Shared between /api/auth/login and /api/auth/register routes.
 * Eliminates the 2x duplication of the full CSRF → Login → Authorize →
 * Consent → Token Exchange flow.
 *
 * Usage:
 *   import { acquireTokenViaPKCE } from '@/lib/server-auth';
 *   const result = await acquireTokenViaPKCE(username, password);
 *   if ('error' in result) { ... }
 *   const token = result.token;
 */

import { generatePKCE } from './pkce';

const BACKEND_URL = process.env.BACKEND_URL ?? 'http://localhost:8080';
const CLIENT_ID = 'marketplace-web-client';
const REGISTERED_REDIRECT_URI =
  'http://127.0.0.1:8080/login/oauth2/code/marketplace-web-client';

// ── Types ──────────────────────────────────────────────────────────

export type AuthResult =
  | { token: string; user?: unknown }
  | { error: string; status: number; description?: string };

export interface TokenExchangeResult {
  accessToken: string;
  expiresIn?: number;
  refreshToken?: string;
  tokenType?: string;
  user?: unknown;
}

// ── CSRF + Session Helper ──────────────────────────────────────────

async function fetchCsrfAndSession(): Promise<
  { csrfToken: string; sessionId: string } | { error: string; status: number }
> {
  const loginPageResponse = await fetch(`${BACKEND_URL}/login`, {
    method: 'GET',
    headers: { Accept: 'text/html' },
  });

  if (!loginPageResponse.ok) {
    return { error: 'Could not reach the authentication server', status: 502 };
  }

  const loginPageHtml = await loginPageResponse.text();
  const csrfMatch = loginPageHtml.match(
    /name="_csrf"\s+type="hidden"\s+value="([^"]+)"/,
  );
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

  return { csrfToken, sessionId };
}

// ── Form-Based Login ───────────────────────────────────────────────

async function formLogin(
  username: string,
  password: string,
  csrfToken: string,
  sessionId: string,
): Promise<
  { authenticatedSessionId: string } | { error: string; status: number }
> {
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
    redirect: 'manual',
  });

  if (loginResponse.status !== 302) {
    return {
      error: 'Unexpected response from authentication server',
      status: 502,
    };
  }

  const loginRedirectLocation = loginResponse.headers.get('location') ?? '';
  if (loginRedirectLocation.includes('error')) {
    return { error: 'Invalid credentials', status: 401 };
  }

  const loginSetCookie = loginResponse.headers.get('set-cookie');
  const newSessionMatch = loginSetCookie?.match(/SESSION=([^;]+)/);
  const authenticatedSessionId = newSessionMatch?.[1] ?? sessionId;

  return { authenticatedSessionId };
}

// ── OAuth2 Authorize + Consent ─────────────────────────────────────

async function authorizeWithConsent(
  authenticatedSessionId: string,
  csrfToken: string,
  verifier: string,
  challenge: string,
  logPrefix: string,
): Promise<{ code: string } | { error: string; status: number }> {
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
    console.error(
      `[${logPrefix}] Unexpected authorize response: ${authorizeResponse.status}`,
    );
    return { error: 'OAuth2 authorization failed', status: 502 };
  }

  let authorizeRedirectLocation =
    authorizeResponse.headers.get('location') ?? '';

  // Handle consent page if needed
  if (
    authorizeRedirectLocation.includes('/oauth2/consent') ||
    authorizeRedirectLocation.includes('consent')
  ) {
    console.log(`[${logPrefix}] Consent page required — attempting auto-consent`);

    try {
      const consentUrl = new URL(authorizeRedirectLocation, BACKEND_URL);
      const consentResponse = await fetch(
        `${consentUrl.pathname}${consentUrl.search}`,
        {
          method: 'GET',
          headers: {
            Cookie: `SESSION=${authenticatedSessionId}`,
            Accept: 'text/html',
          },
          redirect: 'manual',
        },
      );

      if (consentResponse.status === 302) {
        const consentLocation =
          consentResponse.headers.get('location') ?? '';
        const consentUrl = new URL(consentLocation, BACKEND_URL);
        const code = consentUrl.searchParams.get('code');
        if (code) return { code };
      }

      // Try to POST consent approval
      const consentHtml =
        consentResponse.status === 200 ? await consentResponse.text() : '';
      const consentCsrfMatch = consentHtml.match(
        /name="_csrf"\s+type="hidden"\s+value="([^"]+)"/,
      );
      const consentCsrf = consentCsrfMatch?.[1] ?? csrfToken;
      const stateMatch = consentHtml.match(
        /name="state"\s+value="([^"]+)"/,
      );
      const state = stateMatch?.[1] ?? '';

      const submitConsentResponse = await fetch(
        `${BACKEND_URL}/oauth2/consent`,
        {
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
        },
      );

      const submitLocation =
        submitConsentResponse.headers.get('location') ?? '';
      const submitUrl = new URL(submitLocation, BACKEND_URL);
      const code = submitUrl.searchParams.get('code');
      if (code) return { code };

      console.error(
        `[${logPrefix}] Could not auto-consent. Location: ${submitLocation}`,
      );
      return {
        error: 'Authorization consent could not be auto-approved',
        status: 502,
      };
    } catch (consentError) {
      console.error(`[${logPrefix}] Consent handling error:`, consentError);
      return {
        error: 'Authorization consent could not be auto-approved',
        status: 502,
      };
    }
  }

  // Extract authorization code from the redirect URL
  const redirectUrl = new URL(authorizeRedirectLocation, BACKEND_URL);
  const code = redirectUrl.searchParams.get('code');
  if (!code) {
    console.error(
      `[${logPrefix}] No code in redirect: ${authorizeRedirectLocation}`,
    );
    return { error: 'No authorization code received', status: 502 };
  }

  return { code };
}

// ── Token Exchange ─────────────────────────────────────────────────

export async function exchangeCodeForToken(
  code: string,
  codeVerifier: string,
): Promise<TokenExchangeResult | { error: string; status: number }> {
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
    console.error(
      `[ServerAuth] Token exchange failed: ${tokenResponse.status} ${errorBody}`,
    );
    return {
      error: `Token exchange failed: ${errorBody}`,
      status: 502,
    };
  }

  const tokenData = await tokenResponse.json();
  const accessToken = tokenData.access_token;

  if (!accessToken) {
    console.error('[ServerAuth] No access_token in token response');
    return { error: 'No access token received', status: 502 };
  }

  // Fetch user profile using the token
  let user: unknown = null;
  try {
    const profileResponse = await fetch(`${BACKEND_URL}/api/v1/users/me`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        Accept: 'application/json',
      },
    });
    if (profileResponse.ok) {
      user = await profileResponse.json();
    }
  } catch {
    // Profile fetch failed - we still have the token
  }

  return {
    accessToken,
    expiresIn: tokenData.expires_in,
    refreshToken: tokenData.refresh_token,
    tokenType: tokenData.token_type,
    user,
  };
}

// ── Main Entry Point ───────────────────────────────────────────────

/**
 * Acquires a JWT access token by:
 * 1. Fetching CSRF token + session from backend login page
 * 2. POSTing credentials for form-based login
 * 3. Generating PKCE challenge
 * 4. Calling /oauth2/authorize with the authenticated session
 * 5. Auto-approving consent if required
 * 6. Exchanging the authorization code for a token
 *
 * @param username - Backend username
 * @param password - Backend password
 * @param logPrefix - Prefix for log messages (e.g., 'Auth Login')
 * @returns AuthResult with either token + user or error details
 */
export async function acquireTokenViaPKCE(
  username: string,
  password: string,
  logPrefix = 'ServerAuth',
): Promise<AuthResult> {
  // Step 1: Get CSRF token + session cookie
  const csrfResult = await fetchCsrfAndSession();
  if ('error' in csrfResult) return csrfResult;
  const { csrfToken, sessionId } = csrfResult;

  console.log(
    `[${logPrefix}] Got CSRF + session: ${sessionId.substring(0, 8)}...`,
  );

  // Step 2: Login with credentials
  const loginResult = await formLogin(username, password, csrfToken, sessionId);
  if ('error' in loginResult) return loginResult;
  const { authenticatedSessionId } = loginResult;

  console.log(
    `[${logPrefix}] Login successful, session: ${authenticatedSessionId.substring(0, 8)}...`,
  );

  // Step 3: Generate PKCE
  const { verifier, challenge } = await generatePKCE();

  // Step 4-5: Authorize + handle consent
  const authResult = await authorizeWithConsent(
    authenticatedSessionId,
    csrfToken,
    verifier,
    challenge,
    logPrefix,
  );
  if ('error' in authResult) return authResult;
  const { code } = authResult;

  console.log(
    `[${logPrefix}] Got authorization code: ${code.substring(0, 8)}...`,
  );

  // Step 6: Exchange code for token
  const tokenResult = await exchangeCodeForToken(code, verifier);
  if ('error' in tokenResult) return tokenResult;

  console.log(`[${logPrefix}] Token obtained successfully`);
  return { token: tokenResult.accessToken, user: tokenResult.user };
}
