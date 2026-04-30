---
Task ID: 1
Agent: Main
Task: Switch from Turbopack to Webpack and fix remaining integration issues

Work Log:
- Confirmed ProviderDashboard.tsx already has useAuth import (was fixed in previous session)
- Switched Next.js dev server from Turbopack to Webpack by adding `--webpack` flag to dev script
- Added `-H 0.0.0.0` flag to bind to all network interfaces (fixes connection issue in sandbox)
- Fixed critical AuthSync bug: AuthSync component was a no-op, now properly syncs AuthContext user → Zustand store
- Fixed User interface in use-auth.ts: renamed `name` → `displayName` to match backend UserResponse
- Updated all `user.name` references in Header.tsx to `user.displayName` (5 occurrences)
- Removed 10 old Prisma-based API routes that are dead code (frontend now uses /api/v1/... proxy)
- Deleted: listings, bookings, search, messages, community, directory, emergency, seed routes
- Kept: api/v1/[...path] proxy, api/auth/token proxy, api/auth/health, api/route.ts

Stage Summary:
- Next.js 16.1.3 running with **Webpack** (not Turbopack) on port 3000
- Homepage loads successfully (HTTP 200)
- AuthSync now properly bridges AuthContext → Zustand store
- All user.name references updated to user.displayName
- Old Prisma API routes cleaned up, only backend proxy routes remain
- Dev script: `next dev -p 3000 -H 0.0.0.0 --webpack`
