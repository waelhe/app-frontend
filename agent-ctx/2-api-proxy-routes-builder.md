# Task 2 — API Proxy Routes Builder

## Summary
Created 3 Next.js API proxy routes that forward frontend requests to the Java backend at `http://localhost:8080`, completely avoiding CORS issues.

## Files Created

1. **`src/app/api/v1/[...path]/route.ts`** — Catch-all proxy
   - Handles GET, POST, PUT, PATCH, DELETE
   - Forwards to `{BACKEND_URL}/api/v1/{path}`
   - Passes through Authorization header, query params, body
   - Correct Content-Type handling (form-urlencoded preserved, JSON auto-set, omitted for bodyless)
   - Hop-by-hop headers filtered on both directions
   - 502 with ProblemDetail JSON on backend unreachable

2. **`src/app/api/auth/token/route.ts`** — OAuth2 token exchange
   - POST with application/x-www-form-urlencoded
   - Forwards to `{BACKEND_URL}/oauth2/token`
   - Preserves form-urlencoded Content-Type
   - 502 with OAuth2 error format on failure

3. **`src/app/api/auth/health/route.ts`** — Backend health check
   - GET to `{BACKEND_URL}/actuator/health`
   - 5-second timeout via AbortSignal
   - Returns 503 with `{ status: 'DOWN' }` on failure

## Key Decisions
- `BACKEND_URL` env var with `http://localhost:8080` fallback
- No Content-Type override for form-urlencoded (important for OAuth2 spec compliance)
- Content-Encoding stripped from responses (decompressed by Node fetch)
- RFC 7807 ProblemDetail format for catch-all proxy errors
- OAuth2 error format for token endpoint errors

## Lint
0 errors, 0 warnings
