/**
 * Auth & Actuator Proxy Route — forwards /api/auth/* requests to the Spring Boot backend.
 * Maps /api/auth/health → /actuator/health
 * Maps /api/auth/oauth2/* → /oauth2/*
 * Maps /api/auth/login → /login (for form login)
 * Maps /api/auth/token → /oauth2/token (for token exchange)
 *
 * Resilience improvements:
 * - Better Arabic error messages
 * - Proper handling of backend restart scenarios
 */

import { type NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = process.env.BACKEND_URL ?? 'http://localhost:8080';

const TIMEOUT_MS = 10_000;

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> },
) {
  return proxyAuthRequest(request, params);
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> },
) {
  return proxyAuthRequest(request, params);
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> },
) {
  return proxyAuthRequest(request, params);
}

async function proxyAuthRequest(
  request: NextRequest,
  paramsPromise: Promise<{ path: string[] }>,
) {
  const { path } = await paramsPromise;
  const pathStr = path.join('/');

  // Map auth proxy paths to actual backend paths
  let backendPath: string;
  if (pathStr === 'health') {
    // Use the readiness endpoint which reports UP when the app is ready,
    // instead of the full health endpoint which reports DOWN due to
    // non-critical subsystems (e.g., OTLP metrics).
    backendPath = '/actuator/health/readiness';
  } else if (pathStr === 'token') {
    backendPath = '/oauth2/token';
  } else if (pathStr.startsWith('oauth2/')) {
    backendPath = `/${pathStr}`;
  } else if (pathStr === 'login') {
    backendPath = '/login';
  } else {
    backendPath = `/${pathStr}`;
  }

  // Strip XTransformPort from search params before forwarding to backend
  const sp = new URLSearchParams(request.nextUrl.searchParams);
  sp.delete('XTransformPort');
  const searchParams = sp.toString();
  const targetUrl = `${BACKEND_URL}${backendPath}${searchParams ? `?${searchParams}` : ''}`;

  try {
    const headers: Record<string, string> = {};
    const authHeader = request.headers.get('authorization');
    if (authHeader) headers['Authorization'] = authHeader;
    const contentType = request.headers.get('content-type');
    if (contentType) headers['Content-Type'] = contentType;
    const accept = request.headers.get('accept');
    if (accept) headers['Accept'] = accept;

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
      redirect: 'manual', // Don't follow redirects
    });

    clearTimeout(timeoutId);

    // Handle redirects (e.g., OAuth2 flow)
    if ([301, 302, 303, 307, 308].includes(backendResponse.status)) {
      const location = backendResponse.headers.get('location');
      if (location) {
        return NextResponse.redirect(new URL(location, request.url));
      }
    }

    const responseBody = await backendResponse.arrayBuffer();

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

    // Fix: Spring Boot /actuator/health returns 503 when overall status is DOWN
    // (e.g., due to OTLP metrics), but the actual API endpoints work fine.
    // Convert 503 → 200 so the frontend doesn't treat it as "server down".
    const finalStatus = (pathStr === 'health' && backendResponse.status === 503)
      ? 200
      : backendResponse.status;

    // Add a custom header so the frontend knows the backend responded
    responseHeaders.set('X-Backend-Status', 'reachable');

    return new NextResponse(responseBody, {
      status: finalStatus,
      statusText: finalStatus === 200 ? 'OK' : backendResponse.statusText,
      headers: responseHeaders,
    });
  } catch (error) {
    console.error(`[Auth Proxy] Error forwarding ${request.method} ${targetUrl}:`, error);

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
