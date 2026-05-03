/**
 * Lightweight API Proxy Service
 * Forwards requests from /api/v1/* to the Java backend on Railway
 * and /api/auth/* to the backend's auth endpoints.
 * Runs on port 3030.
 */

import http from 'node:http';
import https from 'node:https';
import { URL } from 'node:url';

const BACKEND_URL = 'https://app-java-v3-production.up.railway.app';
const PORT = 3030;

const HOP_BY_HOP = new Set([
  'host', 'connection', 'keep-alive', 'transfer-encoding',
  'te', 'trailer', 'upgrade', 'content-length', 'content-encoding',
]);

function filterHeaders(headers) {
  const filtered = {};
  for (const [key, value] of Object.entries(headers)) {
    if (!HOP_BY_HOP.has(key.toLowerCase()) && value) {
      filtered[key] = Array.isArray(value) ? value.join(', ') : value;
    }
  }
  delete filtered['origin'];
  delete filtered['referer'];
  delete filtered['cookie'];
  if (!filtered['accept']) filtered['accept'] = 'application/json';
  return filtered;
}

function proxyRequest(req, res, backendPath) {
  const backendUrl = new URL(backendPath, BACKEND_URL);

  if (req.url) {
    const reqUrl = new URL(req.url, 'http://localhost');
    for (const [key, value] of reqUrl.searchParams.entries()) {
      backendUrl.searchParams.set(key, value);
    }
  }

  const forwardHeaders = filterHeaders(req.headers);
  forwardHeaders['host'] = 'app-java-v3-production.up.railway.app';

  const bodyChunks = [];
  req.on('data', (chunk) => bodyChunks.push(chunk));
  req.on('end', () => {
    const body = bodyChunks.length > 0 ? Buffer.concat(bodyChunks) : undefined;

    const options = {
      hostname: backendUrl.hostname,
      port: 443,
      path: backendUrl.pathname + backendUrl.search,
      method: req.method,
      headers: forwardHeaders,
      timeout: 15000,
    };

    const proxyReq = https.request(options, (proxyRes) => {
      const responseHeaders = {};
      for (const [key, value] of Object.entries(proxyRes.headers)) {
        if (!HOP_BY_HOP.has(key.toLowerCase()) && value) {
          responseHeaders[key] = Array.isArray(value) ? value.join(', ') : value;
        }
      }
      responseHeaders['access-control-allow-origin'] = '*';
      responseHeaders['access-control-allow-methods'] = 'GET, POST, PUT, DELETE, OPTIONS, PATCH';
      responseHeaders['access-control-allow-headers'] = 'Authorization, Content-Type, Accept';

      res.writeHead(proxyRes.statusCode || 502, responseHeaders);
      proxyRes.pipe(res, { end: true });
    });

    proxyReq.on('error', (err) => {
      console.error('[Proxy] Error:', err.message);
      if (!res.headersSent) {
        res.writeHead(502, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
          type: 'https://httpstatus.es/502',
          title: 'Backend Unreachable',
          status: 502,
          detail: `Could not reach the backend. ${err.message}`,
        }));
      }
    });

    proxyReq.on('timeout', () => {
      console.error('[Proxy] Timeout');
      proxyReq.destroy();
    });

    if (body) {
      proxyReq.write(body);
    }
    proxyReq.end();
  });
}

const server = http.createServer((req, res) => {
  // CORS preflight
  if (req.method === 'OPTIONS') {
    res.writeHead(204, {
      'access-control-allow-origin': '*',
      'access-control-allow-methods': 'GET, POST, PUT, DELETE, OPTIONS, PATCH',
      'access-control-allow-headers': 'Authorization, Content-Type, Accept',
      'access-control-max-age': '86400',
    });
    res.end();
    return;
  }

  const url = req.url || '/';
  const urlPath = new URL(url, 'http://localhost').pathname;

  if (urlPath === '/api/auth/health') {
    proxyRequest(req, res, '/actuator/health/readiness');
    return;
  }

  if (urlPath.startsWith('/api/auth/')) {
    const path = urlPath.replace('/api/auth/', '');
    proxyRequest(req, res, `/${path}`);
    return;
  }

  if (urlPath.startsWith('/api/v1/')) {
    const path = urlPath.replace('/api/v1/', '');
    proxyRequest(req, res, `/api/v1/${path}`);
    return;
  }

  res.writeHead(404, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ error: 'Not Found' }));
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`API Proxy running on http://0.0.0.0:${PORT}`);
  console.log(`Backend: ${BACKEND_URL}`);
});
