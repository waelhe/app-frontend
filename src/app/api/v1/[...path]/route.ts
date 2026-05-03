/**
 * API V1 Proxy Route — forwards all /api/v1/* requests to the Spring Boot backend.
 * Reads BACKEND_URL from environment to determine the target.
 */

import { type NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = process.env.BACKEND_URL ?? 'http://localhost:8080';

const TIMEOUT_MS = 30_000; // 30 seconds for cloud backend

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
  const searchParams = request.nextUrl.searchParams.toString();
  const targetUrl = `${BACKEND_URL}/api/v1/${pathStr}${searchParams ? `?${searchParams}` : ''}`;

  try {
    // Build headers — forward auth and content-type
    const headers: Record<string, string> = {};
    const authHeader = request.headers.get('authorization');
    if (authHeader) headers['Authorization'] = authHeader;
    const contentType = request.headers.get('content-type');
    if (contentType) headers['Content-Type'] = contentType;
    const accept = request.headers.get('accept');
    if (accept) headers['Accept'] = accept;

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
          ? 'The backend server took too long to respond.'
          : `Could not reach the backend server at ${BACKEND_URL}.`,
      },
      { status: isTimeout ? 504 : 502 },
    );
  }
}
