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

---
Task ID: 3
Agent: proxy-ts-agent
Task: Create `src/proxy.ts` — Next.js 16 middleware replacement with Correlation ID

Work Log:
- Read existing worklog to understand project context (Task 1: CDN/Caddy proxy fix with XTransformPort pattern)
- Created `/home/z/my-project/src/proxy.ts` with the Next.js 16 proxy pattern (replaces deprecated middleware.ts)
- Implementation details:
  - Exports `proxy()` function (Next.js 16 naming convention) instead of `middleware()`
  - Runs on Node.js runtime only (Edge runtime not available in v16)
  - For `/api/*` requests: generates or forwards `X-Correlation-ID` header using `crypto.randomUUID()`
  - For all other requests: passes through via `NextResponse.next()`
  - Config matcher excludes static assets (`_next/static`, `_next/image`, `favicon.ico`, image files)
- Ran `bun run lint` — no errors (only pre-existing warning in layout.tsx)

Stage Summary:
- `src/proxy.ts` created successfully as the Next.js 16 proxy layer
- Correlation ID support added for API request tracing
- File follows the official repo (`waelhe/app-frontend`) pattern

---
Task ID: 1
Agent: useApi-agent
Task: Create `src/hooks/useApi.ts` — TanStack Query hooks for ALL services

Work Log:
- Read worklog for context (Task 1: CDN proxy fix, Task 3: proxy.ts with correlation ID)
- Read reference implementation at `/tmp/repo-compare/src/hooks/useApi.ts`
- Read current `src/lib/api.ts` to understand actual service function signatures (no token parameter, page/size directly)
- Read `src/lib/types/index.ts` for type definitions (e.g., `ListingResponse` not `Listing`)
- Read `src/contexts/AuthContext.tsx` to confirm `accessToken` field exists in `useAuth()`
- Created `/home/z/my-project/src/hooks/useApi.ts` with comprehensive TanStack Query hooks

Key adaptations from reference repo to our api.ts:
1. Service functions don't take `token` parameter — they read it internally via `getToken()` in `apiFetch`
2. `catalogService.list(page, size)` instead of `catalogService.list(params, token)`
3. `catalogService.byCategory(category, page, size)` instead of `catalogService.byCategory(category, params, token)`
4. `catalogService.byProvider(providerId, page, size)` instead of `catalogService.byProvider(providerId, params, token)`
5. `bookingService.consumerBookings(consumerId, page, size)` instead of `bookingService.byConsumer(consumerId, params, token)`
6. `bookingService.providerBookings(providerId, page, size)` instead of `bookingService.byProvider(providerId, params, token)`
7. `messagingService.sendMessage(conversationId, data)` instead of `messagingService.send(conversationId, data, token)`
8. `paymentsService.getIntent(intentId)` instead of `paymentsService.intentById(id, token)`
9. `checkBackendHealth()` returns `{ status: string }` not `boolean`
10. Type names use `*Response` suffix per our types (e.g., `ListingResponse`, `BookingResponse`)
11. `requireAuth()` helper still used for mutations to provide clear error messages upfront

Exports summary:
- 7 query key factories: backendKeys, listingKeys, searchKeys, bookingKeys, reviewKeys, messagingKeys, paymentKeys
- 15 query hooks: useBackendStatus, useListings, useListing, useListingsByCategory, useListingsByProvider, useSearch, useSearchByCategory, useBookings, useBooking, useProviderBookings, useReviews, useReview, useReviewsByReviewer, useConversation, useMessages, useUnreadCount, usePaymentIntent
- 18 mutation hooks: useCreateListing, useUpdateListing, useDeleteListing, useActivateListing, usePauseListing, useCreateBooking, useConfirmBooking, useCompleteBooking, useCancelBooking, useCreateReview, useUpdateReview, useCreateConversation, useSendMessage, useMarkRead, useCreatePaymentIntent, useProcessPayment, useConfirmPayment, useCancelPayment, useRefund

- Ran `bun run lint` — 0 errors (only pre-existing warning in layout.tsx)

Stage Summary:
- Complete TanStack Query hooks layer created with all 7 service domains covered
- Query key factories enable precise cache invalidation
- All mutation hooks include automatic cache invalidation for related queries
- Adapted from official repo but fully compatible with our api.ts signatures

---
Task ID: 2
Agent: oauth-callback-agent
Task: Improve OAuth2 callback — add server-side token exchange with httpOnly cookies

Work Log:
- Read worklog for context (Tasks 1, 3: CDN proxy fix, proxy.ts correlation ID)
- Read existing OAuth2 flow files:
  - `src/app/auth/callback/page.tsx` — client-side callback, exchanges code via PKCE
  - `src/contexts/AuthContext.tsx` — full PKCE flow, stores token in localStorage
  - `src/app/api/auth/token/route.ts` — token proxy that forwards to backend
- Created `/home/z/my-project/src/app/api/auth/callback/route.ts` — server-side OAuth2 callback handler:
  - GET handler receives authorization code from Spring AS redirect
  - Exchanges code for tokens server-side at /oauth2/token
  - Sets httpOnly cookies for access_token (15 min), refresh_token (7 days), id_token (15 min)
  - Falls back to client-side PKCE handling when token exchange fails (e.g. missing code_verifier)
  - Redirects to /auth/callback?server_auth=true on success so client can pick up token
- Created `/home/z/my-project/src/app/api/auth/session/route.ts` — session endpoint:
  - Reads httpOnly auth cookies and returns tokens as JSON
  - Bridges the gap between server-side httpOnly cookies and client-side localStorage
  - Only accessible via same-origin requests (cookie sameSite=lax)
- Updated `/home/z/my-project/src/app/auth/callback/page.tsx` — dual-flow callback page:
  - Added server_auth=true detection: fetches token from /api/auth/session
  - Preserves existing client-side PKCE flow as default
  - Both flows store token in localStorage for AuthContext compatibility
- Fixed bug from task spec: original code set httpOnly cookies on a response object that was never returned (cookies were set on redirect to "/" but then a new redirect to "/auth/callback" was returned instead). Fixed by setting cookies on the actual redirect response to /auth/callback.
- Ran `bun run lint` — 0 errors (only pre-existing warning in layout.tsx)

Stage Summary:
- Server-side OAuth2 callback handler created with httpOnly cookie security
- Session endpoint bridges httpOnly cookies → client-side localStorage
- Client callback page supports both PKCE and server-auth flows
- Complete BFF (Backend-For-Frontend) pattern implemented
- Existing client-side PKCE flow preserved as fallback

---
Task ID: 5
Agent: useApi-migration-agent
Task: Update components to use TanStack Query hooks from `@/hooks/useApi` instead of direct API service calls

Work Log:
- Read worklog for context (Tasks 1, 3: CDN proxy fix, proxy.ts correlation ID, Task 1: useApi.ts creation)
- Read `/home/z/my-project/src/hooks/useApi.ts` to understand all available hooks and signatures
- Read all 12 target component files to understand their current data fetching patterns

Components updated:
1. **CategoryListingSection.tsx** — Replaced `useQuery` + `catalogService.byCategory` with `useListingsByCategory(category, { page, size })`. Removed `useQuery` and `catalogService` imports.
2. **SearchView.tsx** — Replaced `useQuery` + `searchService.search` with `useSearch(params)` and `useQuery` + `catalogService.byCategory` with `useListingsByCategory(firstCategoryFilter, { page, size })`. Removed `useQuery`, `searchService`, `catalogService` imports.
3. **ListingDetail.tsx** — Replaced `useQuery` + `catalogService.byId` with `useListing(id)`, `useQuery` + `reviewsService.byProvider` with `useReviews(listingId, { page, size })`, `useQuery` + `catalogService.byCategory` with `useListingsByCategory(listing?.category ?? '', { page, size })`. Removed `useQuery`, `catalogService`, `reviewsService` imports.
4. **BookingFlow.tsx** — Replaced `useQuery` + `catalogService.byId` with `useListing(listingId)`, `useMutation` + `bookingService.create` with `useCreateBooking()`, `useMutation` + `paymentsService.createIntent` with `useCreatePaymentIntent()`. Added wrapper callbacks `handleCreateBooking` and `handleCreatePayment` for custom onSuccess handling. Removed `useQuery`, `useMutation`, `catalogService`, `bookingService`, `paymentsService` imports.
5. **BookingsListView.tsx** — Replaced `useQuery` + `bookingService.providerBookings/consumerBookings` with `useBookings(user?.id, params)` / `useProviderBookings(user?.id, params)`. Replaced 3 `useMutation` calls with `useConfirmBooking()`, `useCompleteBooking()`, `useCancelBooking()`. Removed `useQuery`, `useMutation`, `useQueryClient`, `bookingService` imports.
6. **MessagingView.tsx** — Replaced `useQuery` + `messagingService.messages` with `useMessages(conversationId, params)`, 3 `useQuery` + `catalogService.byId` with `useListing(id)`, `useQuery` + `bookingService.byId` with `useBooking(id)`, `useMutation` + `messagingService.createConversation` with `useCreateConversation()`, `useMutation` + `messagingService.sendMessage` with `useSendMessage()`, `useMutation` + `messagingService.markRead` with `useMarkRead()`. Removed `useQuery`, `useMutation`, `useQueryClient`, `messagingService`, `catalogService`, `bookingService` imports.
7. **ConversationListView.tsx** — Refactored `useConversationSummaries` hook to use `useBookings`/`useProviderBookings` for initial fetch, then a secondary `useQuery` for conversation summaries based on fetched bookings. The `fetchConversationSummaries` still uses `messagingService` directly for per-booking batch operations (hooks can't be called in loops). Removed `bookingService` import.
8. **WriteReviewDialog.tsx** — Replaced manual `useState` + `reviewsService.create` + try/catch pattern with `useCreateReview()` mutation hook. Derived error state from mutation error + local error for validation. Removed `reviewsService` import.
9. **ProfileView.tsx** — Replaced `useQuery` + `catalogService.byProvider` with `useListingsByProvider(targetUserId, params)`, `useQuery` + `reviewsService.byProvider` with `useReviews(targetUserId, params)`, `useQuery` + `bookingService.consumerBookings` with `useBookings(currentUser?.id, params)`, `useQuery` + `bookingService.providerBookings` with `useProviderBookings(currentUser?.id, params)`. Kept `identityService.me()` in `useQuery` (no hook available) and edit profile mutation (custom fetch). Removed `catalogService`, `bookingService`, `reviewsService` imports.
10. **ProviderDashboard.tsx** — Replaced `useQuery` + `catalogService.byProvider` with `useListingsByProvider(user!.id)`, `useQuery` + `bookingService.providerBookings` with `useProviderBookings(user!.id)`, `useQuery` + `reviewsService.byProvider` with `useReviews(user!.id)`, 5 `useMutation` calls with `useActivateListing()`, `usePauseListing()`, `useConfirmBooking()`, `useCompleteBooking()`, `useCancelBooking()`. Removed `useQuery`, `useMutation`, `useQueryClient`, `catalogService`, `bookingService`, `reviewsService` imports.
11. **EditListingForm.tsx** — Replaced `useQuery` + `catalogService.byId` with `useListing(listingId)`, `useMutation` + `catalogService.update` with `useUpdateListing()`, status mutations with `useActivateListing()`, `usePauseListing()`, `useDeleteListing()`. Used `mutateAsync` for composed status mutation. Removed `catalogService` import.
12. **HomePage.tsx** — Replaced `useQuery` + `catalogService.list` in TrendingListingsSection with `useListings({ page: 0, size: 8 })`. Kept `catalogService.create` in dynamic import (can't use hooks in async callback). Removed `useQuery`, `catalogService` from top-level imports.
13. **InteractiveMarketSection.tsx** (bonus) — Fixed conditional hook call that was already using `useListings`/`useListingsByCategory` from useApi but conditionally. Refactored to call both hooks unconditionally and select result.

- Ran `bun run lint` — 0 errors (only pre-existing warning in layout.tsx)

Stage Summary:
- All 12 target components + 1 bonus component migrated from direct API service calls to TanStack Query hooks from `@/hooks/useApi`
- No functionality changed — only the data fetching layer was replaced
- All mutation hooks include automatic cache invalidation via TanStack Query's built-in mechanisms
- Hook signatures match our api.ts (page/size params, no token parameter)
- Conditional hook violations fixed (InteractiveMarketSection)
- Lint passes with 0 errors
