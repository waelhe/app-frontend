# Task 3: Layout Builder

## Agent: Layout Builder
## Status: ✅ Completed

### What was done
Created all layout components and supporting infrastructure for the Nabd marketplace:

1. **Stores** (Zustand with persist):
   - `useAuth` - Auth state with user, login/logout
   - `useLanguage` - AR/EN language with RTL support and t() helper
   - `useNavigationStore` - Active tab, search, mobile menu state
   - `useCart` - Shopping cart with items
   - `useRegion` - Syrian regions (Qudsaya, Dahia, Al-Dimas, All)

2. **Providers**:
   - QueryProvider (TanStack Query)
   - LanguageProvider (sets document lang/dir)
   - AuthProvider (session check)
   - CartProvider, RegionProvider (store initializers)

3. **Layout Components**:
   - **Header**: Fixed, shadow on scroll, search with location dropdown, auth menu, language toggle, mobile responsive
   - **Footer**: 5-column grid, social icons, language/country selectors, bottom bar
   - **BottomNav**: Mobile nav, hide-on-scroll, provider Add button, emergency call, emerald active state

4. **globals.css**: Tajawal font, oklch theme vars (red-500 primary), animations, scrollbar utils, safe area padding

5. **layout.tsx**: RTL Arabic root, provider chain, layout structure with pt-16 pb-20 md:pb-0

### Lint: ✅ Pass | Dev Server: ✅ Compiled
