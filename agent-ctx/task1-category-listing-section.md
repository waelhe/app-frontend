# Task 1: Create CategoryListingSection Generic Component

## Summary
Created a reusable `CategoryListingSection` component that replaces the repetitive pattern of 30+ local section components with hardcoded mock data, and updated 5 key components to use it.

## Files Created
- `/home/z/my-project/src/components/sections/CategoryListingSection.tsx` — Generic reusable component

## Files Modified
- `/home/z/my-project/src/components/local/RealEstate.tsx` — Simplified to use CategoryListingSection (category: 'real-estate')
- `/home/z/my-project/src/components/local/Doctors.tsx` — Simplified to use CategoryListingSection (category: 'medical')
- `/home/z/my-project/src/components/local/Pharmacies.tsx` — Simplified to use CategoryListingSection (category: 'pharmacies')
- `/home/z/my-project/src/components/local/Restaurants.tsx` — Simplified to use CategoryListingSection (category: 'restaurants')
- `/home/z/my-project/src/components/local/CarServices.tsx` — Simplified to use CategoryListingSection (category: 'car-services')

## Component Features
- **Props**: `category`, `titleAr`, `titleEn`, `icon?` (LucideIcon), `gradientFrom?`, `gradientTo?`, `pageSize?`
- **Data fetching**: Uses `useQuery` from `@tanstack/react-query` calling `catalogService.byCategory(category)`
- **Section header**: Gradient icon badge, bilingual title with listing count, "View All" button
- **Responsive grid**: 2 cols (mobile), 3 cols (tablet), 4 cols (desktop)
- **Card content**: Gradient placeholder image, title, provider name, price (SYP), category badge
- **Navigation**: Clicking a card navigates to `listing-detail` view with `{ id: listing.id }`
- **Loading state**: 4 skeleton placeholder cards matching the card layout
- **Error state**: AlertCircle icon with bilingual message and retry button
- **Empty state**: PackageOpen icon with bilingual "no listings" message
- **Animations**: framer-motion stagger entrance animations on cards, hover lift effect
- **RTL-aware**: Uses `isRTL` from `useLanguage()` for arrows, text direction, and bilingual content
- **shadcn components**: Card, CardContent, Badge, Button, Skeleton

## Lint Result
✅ 0 errors, 1 pre-existing warning (font in layout.tsx)

## Dev Server
✅ Running successfully on port 3000 with no compilation errors
