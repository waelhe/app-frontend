# Task 7-a: Update Local Section Components to ListingCard

## Agent: local-sections-listingcard-agent

## Summary
Updated all 6 local section components to use the new Airbnb-style `ListingCard` component with horizontal scrolling layout, replacing the old Card/CardContent vertical grid/list patterns.

## Files Modified
1. **Cafes.tsx** — amber-to-orange gradient, category='dining', badgeText=specialty
2. **Beauty.tsx** — pink-to-rose gradient, category='beauty', badgeText=services
3. **Education.tsx** — indigo-to-blue gradient, category='education', badgeText=type
4. **Jobs.tsx** — violet-to-purple gradient, category='jobs', badgeText=type
5. **Professionals.tsx** — red-to-rose gradient, category='services', badgeText=pro type
6. **Craftsmen.tsx** — emerald-to-teal gradient, category='services', badgeText=trade

## Changes Per File
- Removed: Card, CardContent, Badge, Button imports
- Added: ListingCard, getListingImages, formatPrice imports + useState + useNavigationStore
- Section header: gradient icon badge (`w-10 h-10 rounded-xl bg-gradient-to-br`) + title + item count
- Layout: vertical grid/list → horizontal scroll (`flex gap-4 overflow-x-auto`)
- Cards: `ListingCard` with `isScrollCard={true}` for responsive widths
- Favorites: `useState<string[]>` + `toggleFavorite` handler
- Navigation: `useNavigationStore.navigate('listing-detail', { id })`
- Bilingual: `useLanguage` with `isArabic ? nameAr : nameEn`

## Lint
- 0 errors
- Dev server compiles successfully
