/**
 * OAuth2 Callback Route Handler (BFF Pattern)
 *
 * Handles the redirect from Spring Authorization Server after user authentication.
 * Exchanges the authorization code for tokens server-side.
 * Sets httpOnly cookies for security + passes tokens to client via redirect.
 *
 * Flow:
 * 1. Spring AS redirects here with ?code=...&state=...
 * 2. Server exchanges code for tokens at /oauth2/token
 * 3. Sets httpOnly cookies for access_token, refresh_token, id_token
 * 4. Redirects to /auth/callback?server_auth=true so client AuthContext can
 *    also store the token in localStorage for its JWT-based session logic
 * 5. If token exchange fails (e.g. missing PKCE verifier), falls back to
 *    client-side handling at /auth/callback
 */

import { NextRequest, NextResponse } from "next/server";

const BACKEND_URL =
  process.env.BACKEND_URL ||
  process.env.NEXT_PUBLIC_BACKEND_URL ||
  "http://localhost:8080";
const CLIENT_ID =
  process.env.NEXT_PUBLIC_AUTH_CLIENT_ID || "marketplace-web-client";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  const state = searchParams.get("state");
  const error = searchParams.get("error");

  // ── Handle authorization errors from the AS ──────────────────────
  if (error) {
    const errorDescription =
      searchParams.get("error_description") || error;
    console.error(
      "[OAuth Callback] Authorization error:",
      error,
      errorDescription,
    );
    return NextResponse.redirect(
      new URL(
        `/?auth_error=${encodeURIComponent(errorDescription)}`,
        request.url,
      ),
    );
  }

  // ── Missing authorization code ───────────────────────────────────
  if (!code) {
    console.error("[OAuth Callback] No authorization code in callback");
    return NextResponse.redirect(
      new URL("/?auth_error=missing_code", request.url),
    );
  }

  try {
    // ── Exchange authorization code for tokens ─────────────────────
    // The redirect_uri must match what was sent in the authorize request.
    // Currently the client registers /auth/callback as the redirect URI,
    // so we use that here. If the AS is configured to accept /api/auth/callback
    // as well, the signIn flow should be updated to redirect here instead.
    const redirectUri = `${new URL(request.url).origin}/auth/callback`;

    const tokenResponse = await fetch(`${BACKEND_URL}/oauth2/token`, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Accept: "application/json",
      },
      body: new URLSearchParams({
        grant_type: "authorization_code",
        code,
        client_id: CLIENT_ID,
        redirect_uri: redirectUri,
        // Note: code_verifier is stored in client's sessionStorage.
        // The client-side AuthContext handles PKCE; this route is a BFF
        // fallback that sets httpOnly cookies for additional security.
        // If the AS requires PKCE, the token exchange here will fail
        // and we fall back to client-side handling.
      }),
    });

    if (!tokenResponse.ok) {
      const errorBody = await tokenResponse.text();
      console.error(
        "[OAuth Callback] Token exchange failed:",
        tokenResponse.status,
        errorBody,
      );
      // Fall back to client-side handling which has the PKCE verifier
      return NextResponse.redirect(
        new URL(
          `/auth/callback?code=${code}&state=${state || ""}`,
          request.url,
        ),
      );
    }

    const tokens = await tokenResponse.json();
    const { access_token, id_token, refresh_token } = tokens;

    if (!access_token) {
      console.error(
        "[OAuth Callback] No access_token in token response",
        tokens,
      );
      return NextResponse.redirect(
        new URL(
          `/auth/callback?code=${code}&state=${state || ""}`,
          request.url,
        ),
      );
    }

    console.info(
      "[OAuth Callback] Token exchange successful, setting httpOnly cookies",
    );

    // ── Build redirect response with httpOnly cookies ──────────────
    // Redirect to the client-side callback page so AuthContext can
    // also store the token in localStorage for its JWT-based session.
    // The server_auth param tells the client the server already exchanged
    // the code, so it doesn't need to call the token endpoint again.
    const callbackUrl = new URL("/auth/callback", request.url);
    callbackUrl.searchParams.set("code", code);
    callbackUrl.searchParams.set("state", state || "");
    callbackUrl.searchParams.set("server_auth", "true");

    const response = NextResponse.redirect(callbackUrl);

    // Set httpOnly cookies for security — these are sent automatically
    // with requests to the same origin, enabling server-side routes
    // to access the token without client-side JS exposure.
    const isProduction = process.env.NODE_ENV === "production";

    response.cookies.set("marketplace_access_token", access_token, {
      httpOnly: true,
      secure: isProduction,
      sameSite: "lax",
      maxAge: 900, // 15 minutes (matches backend access token TTL)
      path: "/",
    });

    if (refresh_token) {
      response.cookies.set("marketplace_refresh_token", refresh_token, {
        httpOnly: true,
        secure: isProduction,
        sameSite: "lax",
        maxAge: 604800, // 7 days
        path: "/",
      });
    }

    if (id_token) {
      response.cookies.set("marketplace_id_token", id_token, {
        httpOnly: true,
        secure: isProduction,
        sameSite: "lax",
        maxAge: 900, // 15 minutes
        path: "/",
      });
    }

    return response;
  } catch (err) {
    console.error("[OAuth Callback] Unexpected error:", err);
    // Fall back to client-side handling
    return NextResponse.redirect(
      new URL(
        `/auth/callback?code=${code}&state=${state || ""}&fallback=true`,
        request.url,
      ),
    );
  }
}
