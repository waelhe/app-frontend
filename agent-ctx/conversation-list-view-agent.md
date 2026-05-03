# Task: Create ConversationListView Component

## Summary
Created `/home/z/my-project/src/components/system/ConversationListView.tsx` — an Inbox view for the Nabd marketplace app that shows all conversations for the current user.

## Key Decisions

### Data Fetching Strategy
Since there's no "list conversations" API endpoint, the component derives conversations from bookings:
1. Fetches user's bookings (consumer or provider based on role) via `bookingService`
2. For each booking, calls `messagingService.createConversation({ bookingId })` which either creates a new conversation or returns the existing one
3. For each conversation, fetches the last message (page 0, size 1) and unread count in parallel
4. Results are sorted by most recent activity (conversation `updatedAt` or booking `updatedAt`)
5. Bookings are processed in batches of 5 to avoid overwhelming the API

### Architecture
- Used `useQuery` from React Query for the entire data pipeline (instead of `useEffect` + `useState`) to avoid the `react-hooks/set-state-in-effect` lint rule
- Extracted `fetchConversationSummaries()` as a standalone async function for clean separation
- Separate query for bookings count to support contextual empty state messaging
- Custom `ConversationSummary` interface combines ConversationResponse + BookingSummary + last message + unread count

### Component States
1. **Auth required** — shown when user is not authenticated, with sign-in prompt
2. **Loading** — skeleton placeholders matching the app's pattern
3. **Error** — centered error with retry button
4. **Empty** — contextual message depending on whether user has bookings or not, with navigation to bookings list
5. **Conversation list** — animated cards with all the requested info

### UI Design
- Red accent stripe on the left of each card (red for unread, gray for read)
- Booking reference, listing reference with status badge, last message preview, relative time, unread count badge
- RTL-aware with `BackArrow`, `ForwardChevron`, and all Arabic translations
- framer-motion for list animations (staggered entrance, exit animations)
- Follows the same header pattern as other system views (BackArrow + icon + title + count badge)

### Lint Status
Passes cleanly with zero errors (only pre-existing font warning remains).
