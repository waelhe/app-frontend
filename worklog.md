---
Task ID: 1
Agent: Main
Task: Code cleanup refactoring - eliminate dual state management, extract shared modules, add Correlation ID

Work Log:
- Mapped complete dependency graph of all 4 state directories (contexts/, providers/, store/, stores/)
- Identified 71+ import lines from contexts/, 33 from store/, 27 from stores/, 1 from providers/
- Created src/lib/pkce.ts - shared PKCE helpers (eliminated 3x duplication)
- Created src/lib/server-auth.ts - shared server-side OAuth2 flow (eliminated 2x duplication in login/register routes)
- Created src/stores/authStore.ts - merged AuthContext + useAuth into pure Zustand store with full OAuth2 PKCE flow
- Created src/stores/languageStore.ts - merged LanguageContext + useLanguage with full translations and document dir sync
- Created src/stores/cartStore.ts - merged CartContext + useCart with toast notifications
- Created src/stores/regionStore.ts - merged RegionContext + useRegion with Arabic/English names
- Copied remaining stores (favorites, recently-viewed, local-users) to stores/ directory
- Moved QueryProvider from providers/ to stores/
- Updated ALL component imports across ~70 files to use new store paths
- Created AuthInitializer component for JWT-based session init + profile fetch
- Simplified layout.tsx from 5 provider wrappers to QueryProvider + AuthInitializer
- Added X-Correlation-ID to all API requests in api.ts
- Fixed Header signOut to use full OAuth2 logout (token revocation + redirect)
- Deleted old directories: contexts/, providers/, store/
- Deleted dead code: uiStore.ts, proxy.ts
- Rewrote api/auth/login/route.ts using shared server-auth module
- Rewrote api/auth/register/route.ts using shared server-auth module
- Verified: lint passes with 0 errors, dev server returns HTTP 200

Stage Summary:
- Eliminated 4 state directories → 1 (src/stores/)
- Eliminated bridge/sync layer (providers/)
- Eliminated 3x PKCE duplication → 1 shared module
- Eliminated 2x OAuth2 server flow duplication → 1 shared module
- Added Correlation ID to all API requests
- Fixed signOut to properly revoke tokens
- App compiles and renders successfully

---
Task ID: 2
Agent: Main
Task: Railway deployment preparation + BFF auth completion + Correlation ID middleware

Work Log:
- Explored complete codebase: all API routes, auth stores, proxy routes, env config
- Made XTransformPort conditional via NEXT_PUBLIC_USE_XTRANSFORM env var (default: true for Z.ai sandbox, set to false on Railway)
- Updated api.ts URL building logic to skip XTransformPort when not needed
- Created /api/auth/logout/route.ts: server-side token revocation + httpOnly cookie clearing
- Created src/proxy.ts (Next.js 16 convention, replacing deprecated middleware.ts):
  - Adds X-Correlation-ID to every request
  - For API routes, injects Authorization header from httpOnly cookies (BFF pattern)
  - Exposes correlation ID in response headers for client debugging
- Updated authStore.signOut() to use BFF /api/auth/logout endpoint instead of direct backend call
- Updated auth callback page with cleaner BFF flow and URL history cleanup
- Made server-auth.ts redirect URI configurable via AUTH_SERVER_REDIRECT_URI env var
- Added Correlation ID forwarding to all 3 proxy routes (v1, auth, actuator)
- Created Dockerfile with multi-stage build (deps → build → production runner)
- Created railway.toml with Docker builder + health check configuration
- Created .env.production template with all required Railway env vars
- Updated .env with NEXT_PUBLIC_USE_XTRANSFORM variable
- Fixed middleware.ts → proxy.ts naming (Next.js 16 deprecation warning resolved)
- All tests passing: main page 200, API health OK, logout route OK, correlation ID present, backend health UP
- Pushed to GitHub: commit 323dd78

Stage Summary:
- BFF pattern now complete: server-side token revocation, httpOnly cookie management, cookie→header injection
- Correlation ID flows: Browser → Proxy → API Route → Backend (end-to-end tracing)
- Railway-ready: Dockerfile, railway.toml, .env.production template
- XTransformPort is now environment-conditional (sandbox vs Railway)
- All 13 files changed, 273 insertions, 24 deletions
- Lint: 0 errors, 1 warning (pre-existing font warning)
- Dev server: HTTP 200, all routes functional
