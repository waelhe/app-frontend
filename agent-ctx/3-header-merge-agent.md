# Task 3: Header Merge Agent

## Task
Merge Yelp-style Header from nabd-dahia reference project into local project, adapting Context imports to Zustand stores.

## What was done
1. Read reference Header.tsx (`/home/z/temp-ref/src/components/layout/Header.tsx`) - 742 lines with Yelp-style two-row header
2. Read local Header.tsx (`/home/z/my-project/src/components/layout/Header.tsx`) - 587 lines with Zustand stores
3. Read all 4 Zustand stores: authStore, languageStore, navigationStore, regionStore
4. Read AppView types to understand available navigation targets
5. Wrote complete new Header.tsx merging both designs

## Key adaptations made
- `useLanguage()` from Context → `useLanguage` from `@/stores/languageStore` (uses `tAr` for inline bilingual)
- `useAuth()` from Context → `useAuth` from `@/stores/authStore` (has `user`, `isAuthenticated`, `signOut`)
- All `Link href="/..."` → `navigate()` from `useNavigationStore` for SPA navigation
- Hardcoded `LOCATIONS` → `REGIONS` from `@/stores/regionStore`
- Category dropdown items use `navigate('search', { category: item.id })` instead of `Link href`

## Features from reference (kept)
- Two-row Yelp-style header: Logo+search row + category icon bar row
- Category bar with 4 categories (emergency, market, directory, info)
- Smart scroll: category row hides when scrolling down, mini text nav appears
- Search bar collapses to search icon on desktop when scrolling down
- Yelp-style rounded-full search bar with MapPin location dropdown
- Category mega-menu dropdown: red top line, groups, 2-column grid, icons
- Mobile: category icons shrink on scroll (height→0)
- "اكتب تقييم" and "للأعمال" links
- Location dropdown with REGIONS from store

## Features from local (kept)
- Backend status indicator (green/red dot)
- Notification bell with Popover
- Language toggle (AR/EN button)
- LoginDialog dispatch via `window.dispatchEvent(new CustomEvent('open-login', ...))`
- shadcn/ui components: DropdownMenu, Avatar, Popover, Button
- Navigation via navigationStore: `navigate('search')`, `navigate('profile')`, etc.

## Verification
- Lint: 0 errors, 1 pre-existing warning
- Dev server: compiles successfully, HTTP 200
