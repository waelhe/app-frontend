/**
 * API V1 Proxy Route — forwards all /api/v1/* requests to the Spring Boot backend.
 * Reads BACKEND_URL from environment to determine the target.
 *
 * Resilience improvements:
 * - Faster timeout for first request (backend may be sleeping on Railway free tier)
 * - Better error messages in Arabic for the frontend
 * - Proper handling of backend restart scenarios
 */

import { type NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = process.env.BACKEND_URL ?? 'http://localhost:8080';

// Longer timeout for cloud backend (Railway may need time to wake up)
const TIMEOUT_MS = 30_000;

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> },
) {
  return proxyRequest(request, params);
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> },
) {
  return proxyRequest(request, params);
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> },
) {
  return proxyRequest(request, params);
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> },
) {
  return proxyRequest(request, params);
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> },
) {
  return proxyRequest(request, params);
}

async function proxyRequest(
  request: NextRequest,
  paramsPromise: Promise<{ path: string[] }>,
) {
  const { path } = await paramsPromise;
  const pathStr = path.join('/');
  // Strip XTransformPort from search params before forwarding to backend
  const sp = new URLSearchParams(request.nextUrl.searchParams);
  sp.delete('XTransformPort');
  const searchParams = sp.toString();
  const targetUrl = `${BACKEND_URL}/api/v1/${pathStr}${searchParams ? `?${searchParams}` : ''}`;

  try {
    // Build headers — forward auth, content-type, and correlation ID
    const headers: Record<string, string> = {};
    const authHeader = request.headers.get('authorization');
    if (authHeader) headers['Authorization'] = authHeader;
    const contentType = request.headers.get('content-type');
    if (contentType) headers['Content-Type'] = contentType;
    const accept = request.headers.get('accept');
    if (accept) headers['Accept'] = accept;
    const correlationId = request.headers.get('x-correlation-id');
    if (correlationId) headers['X-Correlation-ID'] = correlationId;

    // Build body for non-GET requests
    let body: string | undefined;
    if (request.method !== 'GET' && request.method !== 'HEAD') {
      body = await request.text();
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS);

    const backendResponse = await fetch(targetUrl, {
      method: request.method,
      headers,
      body,
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    // Read response
    const responseBody = await backendResponse.arrayBuffer();

    // Build response headers
    const responseHeaders = new Headers();
    for (const [key, value] of backendResponse.headers.entries()) {
      const lower = key.toLowerCase();
      if (
        lower === 'transfer-encoding' ||
        lower === 'content-encoding' ||
        lower === 'connection'
      ) {
        continue;
      }
      responseHeaders.set(key, value);
    }

    // Add a custom header so the frontend knows the backend responded
    responseHeaders.set('X-Backend-Status', 'reachable');

    // Add Cache-Control for GET responses to enable CDN/browser caching
    if (request.method === 'GET' && backendResponse.ok) {
      const existingCacheControl = responseHeaders.get('cache-control');
      if (!existingCacheControl || existingCacheControl === 'no-cache' || existingCacheControl === 'no-store') {
        responseHeaders.set('Cache-Control', 'public, s-maxage=60, stale-while-revalidate=300');
      }
    }

    return new NextResponse(responseBody, {
      status: backendResponse.status,
      statusText: backendResponse.statusText,
      headers: responseHeaders,
    });
  } catch (error) {
    console.error(`[API V1 Proxy] Error forwarding ${request.method} ${targetUrl}:`, error);

    const isTimeout = error instanceof Error && error.name === 'AbortError';

    return NextResponse.json(
      {
        status: isTimeout ? 504 : 502,
        title: isTimeout ? 'Gateway Timeout' : 'Bad Gateway',
        detail: isTimeout
          ? 'الخادم يستغرق وقتاً طويلاً للرد، قد يكون قيد إعادة التشغيل'
          : 'لا يمكن الاتصال بالخادم حالياً',
      },
      { status: isTimeout ? 504 : 502 },
    );
  }
}
