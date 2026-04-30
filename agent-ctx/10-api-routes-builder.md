# Task 10 — API Routes Builder

## Summary
Created all 10 backend API route files for the Marketplace project.

## Files Created
1. `src/app/api/listings/route.ts` — GET (list with pagination/filters) + POST (create)
2. `src/app/api/listings/[id]/route.ts` — GET + PUT + DELETE
3. `src/app/api/bookings/route.ts` — GET (list with filters) + POST (create)
4. `src/app/api/bookings/[id]/route.ts` — GET + PUT (status update with state machine)
5. `src/app/api/directory/route.ts` — GET (list with category/group/search) + POST
6. `src/app/api/emergency/route.ts` — GET (list with category filter)
7. `src/app/api/community/route.ts` — GET (list with type/search) + POST
8. `src/app/api/search/route.ts` — GET (unified search across listings + directory)
9. `src/app/api/messages/route.ts` — GET (conversations) + POST (3 actions: create-conversation, send-message, get-messages)
10. `src/app/api/seed/route.ts` — POST (comprehensive seed with 6 users, 18 listings, 16 directory items, 8 emergency contacts, 8 community posts, 4 bookings, 1 conversation)

## Key Decisions
- All routes use `import { db } from '@/lib/db'` for database access
- Pagination uses `page` and `size` query params with safe clamping
- Booking status updates enforce state machine (PENDING→CONFIRMED/CANCELLED, etc.)
- Messages API uses action-based POST pattern for flexibility
- Seed route is idempotent (upsert for users, deleteMany+createMany for others)
- Dynamic route params use `params: Promise<{ id: string }>` for Next.js 16

## Lint Status
0 errors, 0 warnings
