/**
 * Actuator Proxy Route — forwards /api/actuator/* to the Spring Boot /actuator/* endpoints.
 */

import { type NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = process.env.BACKEND_URL ?? 'http://localhost:8080';

const TIMEOUT_MS = 15_000;

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> },
) {
  const { path } = await params;
  const pathStr = path.join('/');
  const searchParams = request.nextUrl.searchParams.toString();
  const targetUrl = `${BACKEND_URL}/actuator/${pathStr}${searchParams ? `?${searchParams}` : ''}`;

  try {
    const headers: Record<string, string> = {
      Accept: 'application/json',
    };
    const authHeader = request.headers.get('authorization');
    if (authHeader) headers['Authorization'] = authHeader;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS);

    const backendResponse = await fetch(targetUrl, {
      method: 'GET',
      headers,
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

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

    return new NextResponse(responseBody, {
      status: backendResponse.status,
      statusText: backendResponse.statusText,
      headers: responseHeaders,
    });
  } catch (error) {
    console.error(`[Actuator Proxy] Error forwarding GET ${targetUrl}:`, error);

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
