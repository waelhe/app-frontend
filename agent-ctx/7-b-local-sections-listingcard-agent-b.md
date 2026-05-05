# Task 7-b: Update Local Section Components to ListingCard

## Agent: local-sections-listingcard-agent-b

## Summary
Updated 6 local section components (Markets, MedicalCenters, Sports, Places, Events, RetailShops) from old Card/CardContent vertical layouts to Airbnb-style ListingCard horizontal scrolling layout.

## Files Changed
1. `src/components/ui/ListingCard.tsx` — Added 5 new category image mappings (markets, sports, tourism, events, shopping)
2. `src/components/local/Markets.tsx` — Full rewrite to ListingCard
3. `src/components/local/MedicalCenters.tsx` — Full rewrite to ListingCard
4. `src/components/local/Sports.tsx` — Full rewrite to ListingCard
5. `src/components/local/Places.tsx` — Full rewrite to ListingCard
6. `src/components/local/Events.tsx` — Full rewrite to ListingCard
7. `src/components/local/RetailShops.tsx` — Full rewrite to ListingCard

## Key Changes Per File

### Markets.tsx
- Old: Card/CardContent 2-col grid with green icon circles
- New: Horizontal scroll ListingCard, emerald-to-teal gradient header
- Category: 'markets', badgeColor: 'bg-emerald-600/90 text-white'
- Features: Clock (hours), Phone, MapPin (location)

### MedicalCenters.tsx
- Old: Card/CardContent vertical list with emergency border highlight
- New: Horizontal scroll ListingCard, red-to-rose gradient header
- Category: 'medical', badgeColor: 'bg-red-600/90 text-white' (ER) / 'bg-red-500/90 text-white'
- Emergency centers get secondaryBadge='24/7' and rating=4.8
- Features: Clock (hours), Phone

### Sports.tsx
- Old: Card/CardContent grid with emerald gradient placeholder
- New: Horizontal scroll ListingCard, orange-to-amber gradient header
- Category: 'sports', badgeColor: 'bg-orange-600/90 text-white'
- Features: Clock (hours), Phone, MapPin (location)

### Places.tsx
- Old: Card/CardContent vertical list with teal gradient placeholder
- New: Horizontal scroll ListingCard, teal-to-cyan gradient header
- Category: 'tourism', badgeColor: 'bg-teal-600/90 text-white'
- Preserves actual ratings (4.4-4.7), subtitle uses description instead of location
- Features: Clock (hours), MapPin (location)

### Events.tsx
- Old: Card/CardContent grid with date badge (red box with day/month)
- New: Horizontal scroll ListingCard, violet-to-purple gradient header
- Category: 'events', badgeColor: 'bg-violet-600/90 text-white'
- secondaryBadge shows formatted date, subtitle combines date + location
- Features: Clock (time), MapPin (location)

### RetailShops.tsx
- Old: Card/CardContent grid with muted placeholder
- New: Horizontal scroll ListingCard, pink-to-rose gradient header
- Category: 'shopping', badgeColor: 'bg-pink-600/90 text-white'
- Features: Clock (hours), Phone, MapPin (location)

## Lint: 0 errors
## Dev server: compiles successfully
