/**
 * Next.js Proxy — BFF Layer
 *
 * Next.js 16 replaces "middleware.ts" with "proxy.ts".
 * See: https://nextjs.org/docs/messages/middleware-to-proxy
 *
 * Responsibilities:
 * 1. Attaches X-Correlation-ID to every incoming request for end-to-end tracing
 * 2. Forwards the Correlation ID to API routes (via request header)
 * 3. For API routes, injects Authorization header from httpOnly cookies (BFF pattern)
 *
 * The Correlation ID flows:
 *   Browser → Proxy (adds X-Correlation-ID) → API Route → Backend
 *   This enables correlating frontend errors with backend logs.
 */

import { NextRequest, NextResponse } from 'next/server';

export function proxy(request: NextRequest) {
  // Generate or forward Correlation ID
  const correlationId =
    request.headers.get('X-Correlation-ID') ||
    request.headers.get('x-correlation-id') ||
    crypto.randomUUID();

  // Clone request headers and add correlation ID
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set('X-Correlation-ID', correlationId);

  // For API routes, also forward the access token from httpOnly cookies
  // to the Authorization header so proxy routes can use it (BFF pattern)
  if (request.nextUrl.pathname.startsWith('/api/')) {
    const cookieToken = request.cookies.get('marketplace_access_token')?.value;
    if (cookieToken && !requestHeaders.get('Authorization')) {
      requestHeaders.set('Authorization', `Bearer ${cookieToken}`);
    }
  }

  const response = NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });

  // Expose correlation ID to the client for debugging
  response.headers.set('X-Correlation-ID', correlationId);

  return response;
}

// Backwards-compatible export name (deprecated but still supported)
export const middleware = proxy;

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder files
     */
    '/((?!_next/static|_next/image|favicon\\.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
