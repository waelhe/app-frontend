# Task 2: Improve OAuth2 callback — add server-side token exchange with httpOnly cookies

## Agent: oauth-callback-agent

## Summary
Added server-side OAuth2 callback handler (BFF pattern) with httpOnly cookies, a session endpoint to bridge cookies to client-side localStorage, and updated the client callback page to support both PKCE and server-auth flows.

## Files Created
1. **`/home/z/my-project/src/app/api/auth/callback/route.ts`** — Server-side OAuth2 callback handler
   - GET handler receives authorization code from Spring Authorization Server
   - Exchanges code for tokens server-side at `/oauth2/token`
   - Sets httpOnly cookies: `marketplace_access_token` (15 min), `marketplace_refresh_token` (7 days), `marketplace_id_token` (15 min)
   - Falls back to client-side PKCE handling when token exchange fails
   - Redirects to `/auth/callback?server_auth=true` on success

2. **`/home/z/my-project/src/app/api/auth/session/route.ts`** — Session endpoint
   - Reads httpOnly auth cookies and returns tokens as JSON
   - Bridges the gap between server-side httpOnly cookies and client-side localStorage
   - Returns 401 if no access_token cookie exists

## Files Modified
3. **`/home/z/my-project/src/app/auth/callback/page.tsx`** — Updated to handle dual flows
   - Added `server_auth=true` detection
   - When server_auth: fetches token from `/api/auth/session` and stores in localStorage
   - Preserves existing client-side PKCE flow as default
   - Both flows store token for AuthContext compatibility

## Bug Fix
- Fixed a bug in the original task spec where httpOnly cookies were set on a response object that was never returned. The original code set cookies on a redirect to "/" but then returned a different redirect to "/auth/callback". Fixed by setting cookies on the actual redirect response that gets returned.

## Architecture
```
Flow 1 (Server-side BFF):
AS → /api/auth/callback?code=... → Server exchanges code → Sets httpOnly cookies → Redirects to /auth/callback?server_auth=true → Client fetches /api/auth/session → Stores token in localStorage → Home

Flow 2 (Client-side PKCE fallback):
AS → /auth/callback?code=... → Client exchanges code with PKCE → Stores token in localStorage → Home
```

## Lint
- 0 errors, 1 pre-existing warning (layout.tsx font)
