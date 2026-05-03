---
Task ID: 1
Agent: Main
Task: Fix production deployment issue - "الخادم غير متاح حالياً" (Server unavailable) error

Work Log:
- Investigated the root cause: CDN → Caddy direct proxy to Railway backend was returning 502
- Verified that Caddy at `/app/Caddyfile` has handlers for `/api/v1/*` and `/api/auth/health` that proxy directly to Railway, which fails through CDN
- Discovered that adding `XTransformPort=3000` query param routes requests through Next.js instead, which works correctly
- Updated `api.ts` to add `XTransformPort=3000` to all API requests
- Updated API proxy routes to strip `XTransformPort` before forwarding to backend
- Changed health check from `/api/auth/health` to `/api/actuator/health/readiness` for more reliable UP status
- Updated auth proxy route to map `/api/auth/health` to `/actuator/health/readiness` instead of `/actuator/health`
- Improved error handling in InteractiveMarketSection - changed from full-page error to subtle banners
- Updated BackendStatusBanner with better Arabic messaging
- Verified all API endpoints work through CDN with XTransformPort parameter
- Production build succeeds with no errors

Stage Summary:
- Root cause: Caddy's direct proxy to Railway backend fails when accessed through CDN (returns 502)
- Fix: Route all API calls through Next.js by adding `XTransformPort=3000` query parameter
- Health check now uses readiness endpoint which correctly returns UP
- Error states are now subtle banners instead of full-page replacements
- All CDN API tests pass: listings, categories, search, health check all return 200
