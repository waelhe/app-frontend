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
