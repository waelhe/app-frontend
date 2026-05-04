---
Task ID: 1
Agent: Main
Task: Code cleanup refactoring - eliminate dual state management, extract shared modules, add Correlation ID

Work Log:
- Mapped complete dependency graph of all 4 state directories (contexts/, providers/, store/, stores/)
- Identified 71+ import lines from contexts/, 33 from store/, 27 from stores/, 1 from providers/
- Created src/lib/pkce.ts - shared PKCE helpers (eliminated 3x duplication)
- Created src/lib/server-auth.ts - shared server-side OAuth2 flow (eliminated 2x duplication in login/register routes)
- Created src/stores/authStore.ts - merged AuthContext + useAuth into pure Zustand store with full OAuth2 PKCE flow
- Created src/stores/languageStore.ts - merged LanguageContext + useLanguage with full translations and document dir sync
- Created src/stores/cartStore.ts - merged CartContext + useCart with toast notifications
- Created src/stores/regionStore.ts - merged RegionContext + useRegion with Arabic/English names
- Copied remaining stores (favorites, recently-viewed, local-users) to stores/ directory
- Moved QueryProvider from providers/ to stores/
- Updated ALL component imports across ~70 files to use new store paths
- Created AuthInitializer component for JWT-based session init + profile fetch
- Simplified layout.tsx from 5 provider wrappers to QueryProvider + AuthInitializer
- Added X-Correlation-ID to all API requests in api.ts
- Fixed Header signOut to use full OAuth2 logout (token revocation + redirect)
- Deleted old directories: contexts/, providers/, store/
- Deleted dead code: uiStore.ts, proxy.ts
- Rewrote api/auth/login/route.ts using shared server-auth module
- Rewrote api/auth/register/route.ts using shared server-auth module
- Verified: lint passes with 0 errors, dev server returns HTTP 200

Stage Summary:
- Eliminated 4 state directories → 1 (src/stores/)
- Eliminated bridge/sync layer (providers/)
- Eliminated 3x PKCE duplication → 1 shared module
- Eliminated 2x OAuth2 server flow duplication → 1 shared module
- Added Correlation ID to all API requests
- Fixed signOut to properly revoke tokens
- App compiles and renders successfully

---
Task ID: 2
Agent: Main
Task: Railway deployment preparation + BFF auth completion + Correlation ID middleware

Work Log:
- Explored complete codebase: all API routes, auth stores, proxy routes, env config
- Made XTransformPort conditional via NEXT_PUBLIC_USE_XTRANSFORM env var (default: true for Z.ai sandbox, set to false on Railway)
- Updated api.ts URL building logic to skip XTransformPort when not needed
- Created /api/auth/logout/route.ts: server-side token revocation + httpOnly cookie clearing
- Created src/proxy.ts (Next.js 16 convention, replacing deprecated middleware.ts):
  - Adds X-Correlation-ID to every request
  - For API routes, injects Authorization header from httpOnly cookies (BFF pattern)
  - Exposes correlation ID in response headers for client debugging
- Updated authStore.signOut() to use BFF /api/auth/logout endpoint instead of direct backend call
- Updated auth callback page with cleaner BFF flow and URL history cleanup
- Made server-auth.ts redirect URI configurable via AUTH_SERVER_REDIRECT_URI env var
- Added Correlation ID forwarding to all 3 proxy routes (v1, auth, actuator)
- Created Dockerfile with multi-stage build (deps → build → production runner)
- Created railway.toml with Docker builder + health check configuration
- Created .env.production template with all required Railway env vars
- Updated .env with NEXT_PUBLIC_USE_XTRANSFORM variable
- Fixed middleware.ts → proxy.ts naming (Next.js 16 deprecation warning resolved)
- All tests passing: main page 200, API health OK, logout route OK, correlation ID present, backend health UP
- Pushed to GitHub: commit 323dd78

Stage Summary:
- BFF pattern now complete: server-side token revocation, httpOnly cookie management, cookie→header injection
- Correlation ID flows: Browser → Proxy → API Route → Backend (end-to-end tracing)
- Railway-ready: Dockerfile, railway.toml, .env.production template
- XTransformPort is now environment-conditional (sandbox vs Railway)
- All 13 files changed, 273 insertions, 24 deletions
- Lint: 0 errors, 1 warning (pre-existing font warning)
- Dev server: HTTP 200, all routes functional

---
Task ID: 4
Agent: daily-info-quick-services-agent
Task: Port DailyInfoBar and QuickServices from nabd-dahia

Work Log:
- Read reference DailyInfoBar.tsx and QuickServices.tsx from /home/z/temp-ref/
- Read local Zustand stores (languageStore.ts, regionStore.ts) to understand interfaces
- Adapted DailyInfoBar.tsx imports: useLanguage from @/stores/languageStore, useRegion from @/stores/regionStore
- Mapped region IDs: local store uses string IDs ('qudsaya', 'dahia', 'dimas', 'all') → mapped to prayer/weather data records
- Changed Region type from Context union → Record<string, PrayerData/WeatherData> with fallback to qudsayaCenterPrayers
- Used selectedRegion.id (string) instead of region (union type) for data lookups
- Added aria-label attributes to toggle and scroll buttons for accessibility
- Adapted QuickServices.tsx import: useLanguage from @/stores/languageStore
- Fixed ServicesStatus dynamic import to use local filename (ServiceStatus instead of ServicesStatus)
- Kept all PARTS/categories configuration, componentMap, and dynamic imports from reference
- Lint passes with 0 errors, 1 pre-existing warning

Stage Summary:
- DailyInfoBar.tsx created with prayer times + weather + region selector (purple-to-sky gradient, glassmorphism)
- QuickServices.tsx created with Airbnb-style category bar (scrollable, Sheet for all categories, inline content loading)
- Both use Zustand stores instead of React Context
- Region data mapped correctly using store's string ID pattern

---
Task ID: 3
Agent: header-merge-agent
Task: Merge Yelp-style Header from nabd-dahia into local project

Work Log:
- Read reference Header.tsx (nabd-dahia) and local Header.tsx (app-frontend)
- Read all 4 Zustand stores: authStore, languageStore, navigationStore, regionStore
- Read AppView types to understand available navigation targets
- Merged Yelp-style two-row header with category bar into local project
- Adapted all Context imports to Zustand stores (useAuth, useLanguage, useNavigationStore, useRegion/REGIONS)
- Kept local features: backend status indicator (green/red dot), notification bell with Popover, language toggle (AR/EN), LoginDialog dispatch via window.dispatchEvent
- Added smart scroll behavior from reference: category row hides when scrolling down, mini category text nav appears instead; search bar collapses to just a search icon on desktop
- Added category mega-menu dropdown from reference: red top line, groups with 2-column grid, items with icons, hover to open
- Replaced all Link href="/..." with navigate() calls for SPA navigation
- Used REGIONS from regionStore instead of hardcoded LOCATIONS
- Category dropdown items use navigate('search', { category: item.id }) instead of Link href
- Mobile: category icons shrink when scrolling down (icon height reduces to 0)
- Separate desktop/mobile category rows as in reference
- "اكتب تقييم" (Write Review) and "للأعمال" (For Businesses) links added using navigate()
- Used tAr() for bilingual translations throughout
- Lint: 0 errors, 1 warning (pre-existing font warning)
- Dev server: compiles and runs successfully

Stage Summary:
- Header.tsx rewritten with Yelp-style design (two-row layout)
- Category bar with 4 main categories (emergency, market, directory, info)
- Smart scroll: hides category row when scrolling down, shows mini text nav instead
- Search bar collapses to icon on desktop when scrolling down
- Mega-menu dropdown for category sub-items with red top line
- All Context imports replaced with Zustand stores
- All Link navigation replaced with navigationStore.navigate()
- REGIONS from regionStore used instead of hardcoded LOCATIONS
- Local features preserved: backend status, notification bell, language toggle, LoginDialog dispatch

---
Task ID: 5
Agent: component-merge-agent
Task: Merge BottomNav, RegionSelector, and FeaturedOffers from nabd-dahia reference into local project

Work Log:
- Read reference BottomNav.tsx (nabd-dahia): 5-item Airbnb-style nav with emergency tel:112, emerald/teal active states, floating pill indicator
- Read local BottomNav.tsx (app-frontend): 5-item nav with FAB Plus button, Zustand stores, Framer Motion, badge support, login dialog dispatch
- Read reference RegionSelector.tsx: 4 variants (default, light, compact, mini) with dropdown, checkmark, emoji icons
- Read local RegionSelector.tsx: Simple button-based selector using Zustand stores with REGIONS constant
- Read reference FeaturedOffers.tsx: Region-aware offers with mini cards, Unsplash images, discount/badge, full pricing, relative time
- Read local FeaturedOffers.tsx: Simple card-based offers with no region awareness
- Read all relevant Zustand stores: authStore, languageStore, navigationStore, regionStore

- Rewrote BottomNav.tsx with merged 6-item layout:
  1. الرئيسية (Home) — emerald/teal active states
  2. استكشف (Explore/Search) — emerald/teal active states
  3. [FAB] — Red gradient Plus button with pulse animation (from local), auth check + login dialog dispatch
  4. السوق (Market) — emerald/teal active states
  5. المفضلة (Favorites) — emerald/teal active states
  6. طوارئ (Emergency) — RED gradient glow effect with tel:112 link (from reference)
  - Kept: Airbnb-style bg-white/95 backdrop-blur-xl, floating pill indicator (emerald-to-teal), scroll-hiding, Framer Motion animations, badge support
  - Adapted: all navigation uses navigate() from navigationStore, auth check uses useAuth, language uses useLanguage

- Rewrote RegionSelector.tsx with 4 dropdown variants:
  - mini: small inline dropdown with emoji icons, checkmark, MapPin
  - compact: glass-style (bg-white/10 backdrop-blur-sm) for header bars
  - light: clean white dropdown for section use
  - default: delegates to mini
  - Adapted: uses selectedRegion.id (object) instead of region (string), setRegion(REGIONS.find(...)) instead of setRegion(string)
  - Regions: قدسيا (🏙️), الضاحية (🌳), الديماس (🏔️) matching local REGIONS constant
  - Close on outside click, chevron rotation on open

- Rewrote FeaturedOffers.tsx with region-aware compact design:
  - Gradient background: from-rose-500/10 via-orange-500/10 to-pink-500/10
  - Mini cards (w-36) with Unsplash images, discount badges (rose-to-orange gradient)
  - Yellow "محدود/حصري" badges on qualifying offers
  - Full pricing: old price strikethrough + new price in rose-600
  - Relative time with Clock icon in amber-600
  - Region mapping: 'qudsaya' → qudsayaCenterOffers, 'dahia' → qudsayaDahiaOffers, 'dimas' → dimasOffers, 'all' → qudsayaCenterOffers (default)
  - Added unique dimasOffers array for الديماس region
  - Framer Motion entrance animation on cards
  - Horizontal scroll with ChevronLeft/ChevronRight buttons

- Lint: 0 errors, 1 warning (pre-existing font warning)
- Dev server: compiles and runs successfully

Stage Summary:
- BottomNav.tsx: 6-item merged nav (4 emerald + FAB + emergency red glow)
- RegionSelector.tsx: 4 dropdown variants adapted for Zustand selectedRegion object
- FeaturedOffers.tsx: region-aware compact offers with 3 region datasets
- All 3 components use Zustand stores (useAuth, useLanguage, useRegion, useNavigationStore)
- All Context imports eliminated

---
Task ID: 6
Agent: homepage-merge-agent
Task: Rewrite HomePage.tsx merging reference 4-part color-coded structure with local system views

Work Log:
- Read reference HomePage.tsx from /home/z/temp-ref/ (4-part structure: Market, Emergency, Directory, Community)
- Read local HomePage.tsx (SPA with system views, CreateListingForm, StatsBar, TrendingListings, etc.)
- Read all Zustand stores (authStore, languageStore, navigationStore, favoritesStore)
- Read local component index.ts for barrel exports
- Rewrote HomePage.tsx with merged structure:
  1. 🌟 Hero (from local - already existed)
  2. ⚡ QuickServices (imported from @/components/local/QuickServices - Airbnb-style, ported in task 4)
  3. 🕌 DailyInfoBar (imported from @/components/local/DailyInfoBar - prayer+weather, ported in task 4)
  4. 🏠 Part 1: السوق والإعلانات (teal gradient bg, border-b-4 border-teal-500)
     - FeaturedOffers (imported from @/components/local - region-aware, ported in task 5)
     - QuickIcons (market filter pills: RealEstate, Used, Classifieds, Craftsmen, Jobs)
     - 5 market sections dynamically ordered by active filter
  5. 📞 Part 2: دليل الطوارئ (collapsible with red gradient icon)
     - UrgentServices + EmergencyContacts
  6. 📱 Part 3: الدليل المحلي (blue gradient bg, border-b-4 border-blue-500)
     - QuickIcons (8 directory group filter pills)
     - 8 organized groups with colored headers (Food, Health, Beauty, Transport, Education, Tourism, Business, Public)
  7. 👥 Part 4: المجتمع والأخبار (purple gradient bg, border-b-4 border-purple-500)
     - QuickIcons (community filter pills)
     - Community, Charity, Events+LocalNews
  8. 🏆 StatsBar (animated counters, from local)
  9. 🔥 TrendingListingsSection (API data, from local)
  10. 📢 PremiumBanner (promote CTA, from local)
  11. 🛡️ TrustSafetySection (from local)
  12. ❓ WhyChooseUsSection (from local)
  13. 💬 TestimonialsCarousel (from local)

- Kept ALL system view switching logic:
  - ListingDetail, SearchView, BookingFlow, MessagingView, ConversationListView
  - ProfileView, BookingsListView, EditListingForm, FavoritesView, SettingsView
  - NotificationCenter, ProviderDashboard, AdminDashboard
  - CreateListingForm (5-step wizard)
  - FloatingActionButton, LoginDialog

- Used Zustand stores (NOT Context):
  - useLanguage from @/stores/languageStore
  - useAuth from @/stores/authStore
  - useNavigationStore from @/stores/navigationStore
  - useFavorites from @/stores/favoritesStore

- Replaced Link href navigation with navigate() calls for SPA consistency
- Added 30+ dynamic imports for all local components
- Tab views (market, directory, community) also use 4-part structure with colored headers
- QuickIcons helper component from reference: horizontal scrollable pills, active=bg-gray-900 text-white
- getOrderedSections and getOrderedGroups helpers for dynamic section reordering
- Lint: 0 errors
- Dev server: HTTP 200, compiles successfully

Stage Summary:
- HomePage.tsx fully rewritten with merged 4-part color-coded structure
- All 13 sections render in correct order when currentView === 'home'
- All system views (listing-detail, search, booking, etc.) work via overlay rendering
- All local section components (StatsBar, TrendingListings, PremiumBanner, etc.) preserved as inline functions
- CreateListingForm (5-step wizard) preserved as inline function
- QuickServices, DailyInfoBar, FeaturedOffers imported from ported local components
- All navigation uses Zustand navigationStore.navigate() instead of Link href
- File is ~900 lines (down from ~2500 of original local HomePage)
