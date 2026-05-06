# Task 4+5: Mobile API Configuration & PWA Manifest

## Summary
Made the API client dual-mode (web proxy vs mobile direct), created PWA manifest, service worker, and CapacitorInitializer component, and updated layout with PWA meta tags.

## Files Modified
1. **src/lib/api.ts** — Dynamic BACKEND_URL and conditional XTransformPort based on isMobileApp()
2. **src/app/layout.tsx** — Added PWA meta tags, CapacitorInitializer, and service worker registration
3. **src/components/system/index.ts** — Added exports for CapacitorInitializer and other system components

## Files Created
1. **public/manifest.json** — PWA manifest (Arabic, RTL, 8 icon sizes, theme #D32F2F)
2. **public/sw.js** — Service worker (network-first, cache fallback, API bypass)
3. **src/components/system/CapacitorInitializer.tsx** — Native feature initializer (status bar, keyboard, splash screen)
4. **public/icons/** — Directory placeholder for future icon generation

## Key Design Decisions
- BACKEND_URL is evaluated at module load time using `typeof window !== 'undefined' && isMobileApp()` to handle SSR
- USE_XTRANSFORM now also checks `!isMobileApp()` to avoid appending XTransformPort when in Capacitor shell
- Service worker uses network-first strategy with cache fallback — API calls always go to network
- CapacitorInitializer returns null (no UI) and only runs effects when isMobileApp() is true
- PWA manifest supports both web install and Play Store preferred app listing
