/**
 * Lightweight API Proxy Service
 * Forwards requests from /api/v1/* to the Java backend on Railway
 * and /api/auth/health to the backend's health endpoint.
 * Runs on port 3030 to avoid interfering with Next.js on port 3000.
 */

const BACKEND_URL = process.env.BACKEND_URL ?? 'https://app-java-v3-production.up.railway.app';
const PORT = 3030;

const HOP_BY_HOP = new Set([
  'host', 'connection', 'keep-alive', 'transfer-encoding',
  'te', 'trailer', 'upgrade', 'content-length', 'content-encoding',
]);

function filterHeaders(headers: Record<string, string>): Record<string, string> {
  const filtered: Record<string, string> = {};
  for (const [key, value] of Object.entries(headers)) {
    if (!HOP_BY_HOP.has(key.toLowerCase())) {
      filtered[key] = value;
    }
  }
  if (!filtered['accept']) filtered['accept'] = 'application/json';
  return filtered;
}

const server = Bun.serve({
  port: PORT,
  async fetch(req) {
    const url = new URL(req.url);

    // Health check endpoint
    if (url.pathname === '/api/auth/health') {
      try {
        const healthRes = await fetch(`${BACKEND_URL}/actuator/health/readiness`, {
          headers: { Accept: 'application/json' },
          signal: AbortSignal.timeout(15000),
        });
        const data = await healthRes.json();
        return Response.json(data, { status: healthRes.status });
      } catch (error) {
        const msg = error instanceof Error ? error.message : 'Unknown error';
        return Response.json({ status: 'DOWN', detail: msg }, { status: 503 });
      }
    }

    // API v1 proxy
    if (url.pathname.startsWith('/api/v1/')) {
      const pathSegments = url.pathname.replace('/api/v1/', '');
      const backendUrl = new URL(`/api/v1/${pathSegments}`, BACKEND_URL);

      // Pass through query parameters
      for (const [key, value] of url.searchParams.entries()) {
        backendUrl.searchParams.set(key, value);
      }

      const forwardHeaders = filterHeaders(
        Object.fromEntries(req.headers.entries())
      );

      // Remove Origin header to avoid CORS issues with the backend
      delete forwardHeaders['origin'];
      delete forwardHeaders['Origin'];
      delete forwardHeaders['referer'];
      delete forwardHeaders['Referer'];

      let body: ArrayBuffer | null = null;
      if (req.method !== 'GET' && req.method !== 'HEAD') {
        body = await req.arrayBuffer();
        if (body.byteLength === 0) body = null;
      }

      try {
        const backendRes = await fetch(backendUrl.toString(), {
          method: req.method,
          headers: forwardHeaders,
          body: body,
          signal: AbortSignal.timeout(15000),
        });

        const responseHeaders = filterHeaders(
          Object.fromEntries(backendRes.headers.entries())
        );

        const responseBody = await backendRes.arrayBuffer();

        return new Response(responseBody, {
          status: backendRes.status,
          statusText: backendRes.statusText,
          headers: responseHeaders,
        });
      } catch (error) {
        const msg = error instanceof Error ? error.message : 'Unknown error';
        console.error('[API Proxy] Error:', msg);
        return Response.json(
          {
            type: 'https://httpstatus.es/502',
            title: 'Backend Unreachable',
            status: 502,
            detail: `Could not reach the backend. ${msg}`,
          },
          { status: 502 },
        );
      }
    }

    // Auth token endpoint proxy
    if (url.pathname.startsWith('/api/auth/')) {
      const pathSegments = url.pathname.replace('/api/auth/', '');
      const backendUrl = new URL(`/${pathSegments}`, BACKEND_URL);

      for (const [key, value] of url.searchParams.entries()) {
        backendUrl.searchParams.set(key, value);
      }

      const forwardHeaders = filterHeaders(
        Object.fromEntries(req.headers.entries())
      );
      delete forwardHeaders['origin'];
      delete forwardHeaders['Origin'];
      delete forwardHeaders['referer'];
      delete forwardHeaders['Referer'];

      let body: ArrayBuffer | null = null;
      if (req.method !== 'GET' && req.method !== 'HEAD') {
        body = await req.arrayBuffer();
        if (body.byteLength === 0) body = null;
      }

      try {
        const backendRes = await fetch(backendUrl.toString(), {
          method: req.method,
          headers: forwardHeaders,
          body: body,
          signal: AbortSignal.timeout(15000),
          redirect: 'manual',
        });

        const responseHeaders = filterHeaders(
          Object.fromEntries(backendRes.headers.entries())
        );

        const responseBody = await backendRes.arrayBuffer();

        return new Response(responseBody, {
          status: backendRes.status,
          statusText: backendRes.statusText,
          headers: responseHeaders,
        });
      } catch (error) {
        const msg = error instanceof Error ? error.message : 'Unknown error';
        return Response.json(
          { status: 'DOWN', detail: msg },
          { status: 502 },
        );
      }
    }

    return Response.json({ error: 'Not Found' }, { status: 404 });
  },
});

console.log(`🚀 API Proxy running on http://0.0.0.0:${PORT}`);
console.log(`   Backend: ${BACKEND_URL}`);
