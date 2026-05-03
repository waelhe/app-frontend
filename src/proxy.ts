import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * Next.js 16 Proxy (replaces deprecated middleware.ts)
 *
 * Runs on Node.js runtime only (Edge runtime NOT available in v16).
 *
 * Responsibilities:
 * 1. Add correlation ID header to API requests
 * 2. Pass through all other requests
 */

export function proxy(request: NextRequest) {
  // Only process API requests
  if (request.nextUrl.pathname.startsWith("/api/")) {
    const response = NextResponse.next();
    const correlationId =
      request.headers.get("X-Correlation-ID") || crypto.randomUUID();
    response.headers.set("X-Correlation-ID", correlationId);
    return response;
  }

  // All other requests — pass through
  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon\\.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
