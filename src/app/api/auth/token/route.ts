/**
 * OAuth2 Token Exchange Proxy Route.
 * Accepts POST with application/x-www-form-urlencoded body
 * and forwards it to the Spring Boot backend at {BACKEND_URL}/oauth2/token.
 *
 * This avoids CORS issues when the frontend needs to exchange
 * an authorization code for an access token.
 */

import { type NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = process.env.BACKEND_URL ?? 'http://localhost:8080';

export async function POST(request: NextRequest): Promise<NextResponse> {
  // Read the form-urlencoded body
  let body: string;
  try {
    body = await request.text();
  } catch (error) {
    console.error('[Auth Token Proxy] Failed to read request body:', error);
    return NextResponse.json(
      {
        error: 'invalid_request',
        error_description: 'Failed to read request body',
      },
      { status: 400 },
    );
  }

  // Build the target URL
  const tokenUrl = `${BACKEND_URL}/oauth2/token`;

  try {
    const backendResponse = await fetch(tokenUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Accept': 'application/json',
      },
      body,
    });

    // Read the response body
    const responseBody = await backendResponse.arrayBuffer();

    // Build response headers, filtering out hop-by-hop headers
    const responseHeaders = new Headers();
    for (const [key, value] of backendResponse.headers.entries()) {
      const lower = key.toLowerCase();
      // Skip headers that shouldn't be forwarded
      if (
        lower === 'transfer-encoding' ||
        lower === 'content-encoding' ||
        lower === 'content-length' ||
        lower === 'connection'
      ) {
        continue;
      }
      responseHeaders.set(key, value);
    }

    // Ensure we return JSON
    if (!responseHeaders.has('Content-Type')) {
      responseHeaders.set('Content-Type', 'application/json');
    }

    return new NextResponse(responseBody, {
      status: backendResponse.status,
      statusText: backendResponse.statusText,
      headers: responseHeaders,
    });
  } catch (error) {
    console.error('[Auth Token Proxy] Error forwarding token request:', error);

    const message = error instanceof Error ? error.message : 'Unknown error';

    return NextResponse.json(
      {
        error: 'server_error',
        error_description: `Could not reach the authentication server at ${BACKEND_URL}. ${message}`,
      },
      { status: 502 },
    );
  }
}
