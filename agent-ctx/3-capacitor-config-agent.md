# Task 3: Capacitor Configuration Files

## Summary
Created all Capacitor configuration files for converting the نبض (Nabd) Arabic marketplace Next.js project to a mobile app.

## Files Created
1. **capacitor.config.ts** - Main Capacitor config with appId `com.nabd.app`, appName `نبض`, webDir `out`, server settings (androidScheme, cleartext), plugin configs (SplashScreen, StatusBar, LocalNotifications, Camera, Keyboard, App), and Android-specific settings
2. **scripts/mobile-build.sh** - Build script that temporarily modifies next.config.ts for static export, runs `next build`, creates capacitor.js detection file, runs `cap copy android`, and restores original config via trap EXIT
3. **scripts/mobile-dev.sh** - Dev script for live reload on mobile: detects local IP, starts Next.js dev server, opens Android with `cap run android --livereload`
4. **src/lib/mobile-detect.ts** - Mobile detection utilities: `isMobileApp()`, `getPlatform()`, `isPluginAvailable()`, `getMobileBackendUrl()` with Window.Capacitor type declarations
5. **src/lib/capacitor-plugins.ts** - Wrapper module for 11 Capacitor plugins with dynamic imports and web fallbacks (Haptics, Camera, Geolocation, Share, Network, App, StatusBar, SplashScreen, Preferences, Keyboard, LocalNotifications)
6. **src/hooks/useMobileApp.ts** - React hook providing isMobile, platform, isOnline, networkType state plus hapticFeedback/hapticNotification callbacks

## Files Updated
- **package.json** - Added 8 mobile scripts: mobile:init, mobile:add:android, mobile:build, mobile:dev, mobile:open:android, mobile:sync, mobile:run:android, mobile:copy

## Lint
- 0 errors after fixing set-state-in-effect lint issue in useMobileApp.ts (moved to lazy state initializer)
