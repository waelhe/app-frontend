'use client';

import { useEffect, useState, useCallback } from 'react';
import { isMobileApp, getPlatform } from '@/lib/mobile-detect';
import { haptics, network, app, statusBar, splashScreen } from '@/lib/capacitor-plugins';

interface MobileAppState {
  isMobile: boolean;
  platform: 'android' | 'ios' | 'web';
  isOnline: boolean;
  networkType: string;
}

function getInitialState(): MobileAppState {
  const mobile = isMobileApp();
  const platform = getPlatform();
  return {
    isMobile: mobile,
    platform,
    isOnline: typeof navigator !== 'undefined' ? navigator.onLine : true,
    networkType: 'unknown',
  };
}

export function useMobileApp() {
  const [state, setState] = useState<MobileAppState>(getInitialState);

  useEffect(() => {
    const mobile = isMobileApp();
    const platform = getPlatform();

    // Listen for network changes
    const unsubscribe = network.addListener((status) => {
      setState(prev => ({
        ...prev,
        isOnline: status.connected,
        networkType: status.type,
      }));
    });

    // Listen for app resume
    const unsubResume = app.addResumeListener(() => {
      // Refresh data when app comes back to foreground
      console.log('[MobileApp] App resumed');
    });

    // Handle Android back button
    const unsubBack = app.addBackButtonListener(() => {
      // Let the default browser back behavior work
      // but prevent accidental exits
      if (window.history.length > 1) {
        window.history.back();
      }
    });

    // Set status bar for Android
    if (platform === 'android') {
      statusBar.setBackgroundColor('#ffffff');
      statusBar.setStyle('light');
    }

    // Hide splash screen
    if (mobile) {
      setTimeout(() => splashScreen.hide(), 1000);
    }

    return () => {
      unsubscribe();
      unsubResume();
      unsubBack();
    };
  }, []);

  const hapticFeedback = useCallback((style: 'light' | 'medium' | 'heavy' = 'medium') => {
    haptics.impact(style);
  }, []);

  const hapticNotification = useCallback((type: 'success' | 'warning' | 'error' = 'success') => {
    haptics.notification(type);
  }, []);

  return {
    ...state,
    hapticFeedback,
    hapticNotification,
  };
}
