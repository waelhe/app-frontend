# Task 1 — API Client Updater

## Task
Update `/home/z/my-project/src/lib/api.ts` to match the actual backend endpoints from `waelhe/app-java-v3`.

## Work Done
- Read worklog.md and current api.ts to understand existing structure
- Wrote complete updated api.ts with all endpoint corrections
- Ran lint check — 0 errors, 0 warnings

## Key Changes Summary
1. BACKEND_URL: `http://localhost:8080` → `''` (relative paths)
2. All `/api/v1/catalog/listings` → `/api/v1/listings`
3. Listing actions (activate/pause/archive): PATCH → POST
4. Booking actions (confirm/complete/cancel): PATCH → POST
5. Messaging markRead: PATCH → POST
6. Identity: `/api/v1/identity/me` → `/api/v1/users/me`
7. Removed non-existent endpoints (categories, byBooking, conversations list, etc.)
8. Added missing endpoints (processIntent, cancelIntent, refund, archiveListing, getPayment, etc.)
9. Fixed reviews: byListing → byProvider, byBooking → byReviewer
10. Fixed messaging: unreadCount now conversation-scoped
11. Fixed booking: list → consumerBookings/providerBookings
12. Admin: listBookings now has status filter, added archiveListing and getPayment
