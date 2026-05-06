/**
 * Mobile App Detection & Configuration
 * Detects if the app is running inside a Capacitor native shell
 * and provides platform-specific configuration.
 */

declare global {
  interface Window {
    Capacitor?: {
      isNativePlatform?: () => boolean;
      getPlatform?: () => string;
      isPluginAvailable?: (name: string) => boolean;
      Plugins?: Record<string, unknown>;
    };
    IS_MOBILE_APP?: boolean;
  }
}

/** Check if running inside Capacitor native app */
export function isMobileApp(): boolean {
  if (typeof window === 'undefined') return false;
  return !!(window.Capacitor?.isNativePlatform?.() || window.IS_MOBILE_APP);
}

/** Get the current platform */
export function getPlatform(): 'android' | 'ios' | 'web' {
  if (typeof window === 'undefined') return 'web';
  if (window.Capacitor?.getPlatform) {
    const platform = window.Capacitor.getPlatform();
    if (platform === 'android') return 'android';
    if (platform === 'ios') return 'ios';
  }
  return 'web';
}

/** Check if a Capacitor plugin is available */
export function isPluginAvailable(name: string): boolean {
  if (typeof window === 'undefined') return false;
  return !!window.Capacitor?.isPluginAvailable?.(name);
}

/** Get the backend URL based on platform */
export function getMobileBackendUrl(): string {
  if (isMobileApp()) {
    // In mobile app, call backend directly
    return process.env.NEXT_PUBLIC_BACKEND_URL || 'https://nabd-production.up.railway.app';
  }
  // On web, use relative paths (proxied through Next.js)
  return '';
}
