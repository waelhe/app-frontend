# Task ID: 2 — MapListSplitView Component

## Agent: maplist-splitview-agent

## Task: Create MapListSplitView component implementing Villow Pattern 1: Split Map + List View

## Work Log:
- Read worklog.md to understand previous work context (Tasks 1-7, performance optimization)
- Read existing stores: languageStore.ts, navigationStore.ts
- Read existing hooks: useApi.ts (useListings)
- Read existing components: ListingCard.tsx, skeleton.tsx, badge.tsx
- Read types: ListingSummary, PagedResponse
- Created /src/components/sections/MapListSplitView.tsx with:
  1. **Split Layout**: Desktop grid `lg:grid-cols-[1fr_1.2fr]` with map left / list right (swapped in RTL)
  2. **SVG Map Visualization**: 
     - Grid road pattern with main roads (King Fahd, Makkah Road)
     - Ring road ellipse (Riyadh Ring Road)
     - District labels (شمال الرياض, الدرعية, العليا, جنوب الرياض)
     - Colored dots per listing category (teal=real-estate, amber=restaurants, red=medical, etc.)
     - Price bubbles showing "ر.س XXX" on first 6 dots and on hover
     - Hover interaction: dot enlarges, glow filter, pulsing ring animation
     - "الموقع التقريبي" label at bottom
     - Color legend (عقارات, مطاعم, طبي)
  3. **Filter Chips**: 
     - Price: "أقل من 500K", "500K-1M", "1M-3M", "3M+"
     - Type: "شقة", "فيلا", "أرض", "مكتب"
     - Rooms: "1", "2", "3", "4+"
     - Toggle on/off with teal-600 active state, "مسح الكل" clear button
     - Active filter count badge
  4. **Mobile Bottom Sheet**:
     - Framer Motion `motion.div` with drag="y" and dragElastic={0.2}
     - Draggable from 70% to full, closes on drag > 150px
     - Pill-shaped drag handle
     - Floating "عرض الخريطة" button when sheet is closed
     - AnimatePresence for enter/exit animations
  5. **RTL Support**: Map section uses `order-2` in RTL, `order-1` in LTR
  6. **Data Integration**: useListings hook fetches real listings, filtered by active filter chips
  7. **Bidirectional Hover**: Hovering a listing card highlights the corresponding map dot (ring-2 ring-teal-400), hovering a map dot highlights the listing
  8. **Loading States**: Skeleton cards while data loads, error and empty states with MapPin icon
- Fixed SVG price bubble rendering: replaced broken IIFE with clean `dotIndex < 6 || isHovered` boolean
- Lint: 0 errors (only pre-existing errors from ListingDetailSheet.tsx)

## Stage Summary:
- MapListSplitView.tsx created with split map + list view (Villow Pattern 1)
- SVG-based Riyadh districts map with 16 dot positions, price bubbles, interactive hover
- Filter chips for price/type/rooms with toggle and clear all
- Mobile bottom sheet with Framer Motion drag, floating "عرض الخريطة" button
- RTL support with order swapping
- Bidirectional hover: listing card ↔ map dot
- Uses useListings from @/hooks/useApi, ListingCard from @/components/ui/ListingCard
- All imports as specified: useLanguage, useNavigationStore, useListings, ListingCard, Skeleton, Button, Badge
