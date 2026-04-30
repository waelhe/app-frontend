/**
 * Backend Health Check Proxy Route.
 * Checks if the Java backend is reachable at {BACKEND_URL}/actuator/health
 * and returns the health status to the frontend.
 */

import { type NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = process.env.BACKEND_URL ?? 'http://localhost:8080';

export async function GET(_request: NextRequest): Promise<NextResponse> {
  const healthUrl = `${BACKEND_URL}/actuator/health`;

  try {
    const backendResponse = await fetch(healthUrl, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
      },
      // Use a short timeout so the health check doesn't hang
      signal: AbortSignal.timeout(5000),
    });

    const data = await backendResponse.json();

    return NextResponse.json(data, {
      status: backendResponse.status,
    });
  } catch (error) {
    console.error('[Auth Health Proxy] Backend health check failed:', error);

    const message =
      error instanceof Error ? error.message : 'Unknown error';

    // Check if it was a timeout
    const isTimeout =
      error instanceof DOMException && error.name === 'TimeoutError';

    return NextResponse.json(
      {
        status: 'DOWN',
        detail: isTimeout
          ? `Backend at ${BACKEND_URL} did not respond within 5 seconds.`
          : `Could not reach backend at ${BACKEND_URL}. ${message}`,
      },
      { status: 503 },
    );
  }
}
