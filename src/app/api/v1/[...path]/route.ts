/**
 * Catch-all API proxy route.
 * Forwards requests from /api/v1/{path} to the Java backend at {BACKEND_URL}/api/v1/{path}.
 * Includes retry logic for when the backend is temporarily unavailable.
 * Avoids CORS issues by proxying through the Next.js server.
 */

import { type NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = process.env.BACKEND_URL ?? 'http://localhost:8080';

/**
 * Headers that should NOT be forwarded to the backend.
 * These are hop-by-hop headers or headers that Next.js/Node sets automatically.
 */
const HOP_BY_HOP_HEADERS = new Set([
  'host',
  'connection',
  'keep-alive',
  'transfer-encoding',
  'te',
  'trailer',
  'upgrade',
  'content-length', // Let fetch set this automatically
]);

/**
 * Builds the forward headers from the incoming request.
 * Passes through Authorization and other relevant headers.
 * Handles Content-Type correctly for different body types.
 */
function buildForwardHeaders(
  incomingHeaders: Headers,
  body: ArrayBuffer | null,
  contentType: string | null,
): Headers {
  const forward = new Headers();

  for (const [key, value] of incomingHeaders.entries()) {
    const lower = key.toLowerCase();
    if (HOP_BY_HOP_HEADERS.has(lower)) continue;
    forward.set(key, value);
  }

  if (body && body.byteLength > 0) {
    if (contentType) {
      forward.set('Content-Type', contentType);
    } else {
      forward.set('Content-Type', 'application/json');
    }
  } else {
    forward.delete('Content-Type');
  }

  if (!forward.has('Accept')) {
    forward.set('Accept', 'application/json');
  }

  return forward;
}

/**
 * Core proxy handler — forwards a request to the backend and returns the response.
 * Includes retry logic with exponential backoff for transient failures.
 */
async function proxyRequest(request: NextRequest): Promise<NextResponse> {
  // Extract the catch-all path segments
  const pathSegments = request.nextUrl.pathname
    .replace('/api/v1/', '');

  // Build the backend URL
  const backendUrl = new URL(`/api/v1/${pathSegments}`, BACKEND_URL);

  // Pass through all query parameters
  for (const [key, value] of request.nextUrl.searchParams.entries()) {
    backendUrl.searchParams.set(key, value);
  }

  // Read the request body (null for GET/HEAD/DELETE)
  let body: ArrayBuffer | null = null;
  const contentType = request.headers.get('Content-Type');

  if (request.method !== 'GET' && request.method !== 'HEAD') {
    try {
      body = await request.arrayBuffer();
      if (body.byteLength === 0) body = null;
    } catch {
      body = null;
    }
  }

  // Build forward headers
  const forwardHeaders = buildForwardHeaders(
    request.headers,
    body,
    contentType,
  );

  // Retry logic for GET requests (idempotent)
  const maxRetries = request.method === 'GET' ? 2 : 0;
  let lastError: Error | null = null;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 10000); // 10s timeout

      const backendResponse = await fetch(backendUrl.toString(), {
        method: request.method,
        headers: forwardHeaders,
        body: body,
        signal: controller.signal,
      });

      clearTimeout(timeout);

      // Build the response, preserving the status code
      const responseHeaders = new Headers();

      // Forward response headers, excluding hop-by-hop
      for (const [key, value] of backendResponse.headers.entries()) {
        const lower = key.toLowerCase();
        if (HOP_BY_HOP_HEADERS.has(lower)) continue;
        if (lower === 'content-encoding') continue;
        responseHeaders.set(key, value);
      }

      const responseBody = await backendResponse.arrayBuffer();

      return new NextResponse(responseBody, {
        status: backendResponse.status,
        statusText: backendResponse.statusText,
        headers: responseHeaders,
      });
    } catch (error) {
      lastError = error instanceof Error ? error : new Error('Unknown error');

      // Don't retry on abort (timeout) - just fail fast
      if (lastError.name === 'AbortError') {
        break;
      }

      // Wait before retry with exponential backoff
      if (attempt < maxRetries) {
        await new Promise(resolve => setTimeout(resolve, 1000 * (attempt + 1)));
      }
    }
  }

  console.error('[API Proxy] Error forwarding request after retries:', lastError);

  const message = lastError?.message ?? 'Unknown error';

  return NextResponse.json(
    {
      type: 'https://httpstatus.es/502',
      title: 'Backend Unreachable',
      status: 502,
      detail: `Could not reach the backend at ${BACKEND_URL}. ${message}`,
    },
    { status: 502 },
  );
}

// ── HTTP Method Handlers ──────────────────────────────────────────

export async function GET(request: NextRequest): Promise<NextResponse> {
  return proxyRequest(request);
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  return proxyRequest(request);
}

export async function PUT(request: NextRequest): Promise<NextResponse> {
  return proxyRequest(request);
}

export async function PATCH(request: NextRequest): Promise<NextResponse> {
  return proxyRequest(request);
}

export async function DELETE(request: NextRequest): Promise<NextResponse> {
  return proxyRequest(request);
}
