/**
 * Auth Session Endpoint (BFF Pattern)
 *
 * Reads httpOnly auth cookies set by the server-side OAuth2 callback
 * and returns the access token to the client-side AuthContext.
 *
 * This bridges the gap between server-side httpOnly cookies (secure,
 * not accessible to JavaScript) and the client-side localStorage token
 * that AuthContext uses for API calls.
 *
 * Security considerations:
 * - Only returns tokens when the request includes valid httpOnly cookies
 * - Called only during the OAuth2 callback flow (server_auth=true)
 * - The access_token from the cookie is exposed only to same-origin requests
 */

import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest): Promise<NextResponse> {
  const accessToken = request.cookies.get("marketplace_access_token")?.value;
  const idToken = request.cookies.get("marketplace_id_token")?.value;
  const refreshToken = request.cookies.get("marketplace_refresh_token")?.value;

  if (!accessToken) {
    return NextResponse.json(
      { authenticated: false },
      { status: 401 },
    );
  }

  return NextResponse.json({
    authenticated: true,
    access_token: accessToken,
    ...(idToken ? { id_token: idToken } : {}),
    ...(refreshToken ? { refresh_token: refreshToken } : {}),
  });
}
