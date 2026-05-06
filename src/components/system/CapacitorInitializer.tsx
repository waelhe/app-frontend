'use client';

import { useEffect } from 'react';
import { isMobileApp, getPlatform } from '@/lib/mobile-detect';
import { statusBar, splashScreen, keyboard } from '@/lib/capacitor-plugins';

/**
 * Initializes Capacitor-specific features when running as a native app.
 * This component should be rendered early in the app tree.
 */
export function CapacitorInitializer() {
  useEffect(() => {
    if (!isMobileApp()) return;

    const platform = getPlatform();

    const init = async () => {
      try {
        // Configure status bar
        if (platform === 'android') {
          await statusBar.setBackgroundColor('#ffffff');
          await statusBar.setStyle('light');
        }

        // Configure keyboard
        await keyboard.setResizeMode('body');
        if (platform === 'android') {
          await keyboard.setAccessoryBarVisible(true);
        }

        // Hide splash screen after a short delay
        setTimeout(async () => {
          try {
            await splashScreen.hide();
          } catch {
            // Splash screen may already be hidden
          }
        }, 1500);

        console.log(`[Capacitor] Initialized for ${platform}`);
      } catch (error) {
        console.error('[Capacitor] Initialization error:', error);
      }
    };

    init();
  }, []);

  return null;
}
