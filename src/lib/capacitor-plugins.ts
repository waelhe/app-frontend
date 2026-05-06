/**
 * Capacitor Plugin Wrappers
 * Provides a unified interface for native device features
 * with graceful fallbacks for web platform.
 */

import { isMobileApp, getPlatform } from './mobile-detect';

// Dynamic imports to avoid bundling issues on web
let Haptics: typeof import('@capacitor/haptics') | null = null;
let Camera: typeof import('@capacitor/camera') | null = null;
let Geolocation: typeof import('@capacitor/geolocation') | null = null;
let Share: typeof import('@capacitor/share') | null = null;
let Network: typeof import('@capacitor/network') | null = null;
let App: typeof import('@capacitor/app') | null = null;
let StatusBar: typeof import('@capacitor/status-bar') | null = null;
let SplashScreen: typeof import('@capacitor/splash-screen') | null = null;
let Preferences: typeof import('@capacitor/preferences') | null = null;
let Keyboard: typeof import('@capacitor/keyboard') | null = null;
let LocalNotifications: typeof import('@capacitor/local-notifications') | null = null;

async function loadPlugins() {
  if (!isMobileApp()) return;
  try {
    Haptics = await import('@capacitor/haptics');
    Camera = await import('@capacitor/camera');
    Geolocation = await import('@capacitor/geolocation');
    Share = await import('@capacitor/share');
    Network = await import('@capacitor/network');
    App = await import('@capacitor/app');
    StatusBar = await import('@capacitor/status-bar');
    SplashScreen = await import('@capacitor/splash-screen');
    Preferences = await import('@capacitor/preferences');
    Keyboard = await import('@capacitor/keyboard');
    LocalNotifications = await import('@capacitor/local-notifications');
  } catch (error) {
    console.warn('[Capacitor] Some plugins failed to load:', error);
  }
}

// Load plugins on first import
loadPlugins();

// ── Haptics ────────────────────────────────────────────────────────

export const haptics = {
  async impact(style: 'light' | 'medium' | 'heavy' = 'medium') {
    if (!Haptics) return;
    const styleMap = {
      light: Haptics.ImpactStyle.Light,
      medium: Haptics.ImpactStyle.Medium,
      heavy: Haptics.ImpactStyle.Heavy,
    };
    await Haptics.Haptics.impact({ style: styleMap[style] });
  },
  async notification(type: 'success' | 'warning' | 'error' = 'success') {
    if (!Haptics) return;
    const typeMap = {
      success: Haptics.NotificationType.Success,
      warning: Haptics.NotificationType.Warning,
      error: Haptics.NotificationType.Error,
    };
    await Haptics.Haptics.notification({ type: typeMap[type] });
  },
  async vibrate(duration = 50) {
    if (!Haptics) return;
    await Haptics.Haptics.vibrate({ duration });
  },
};

// ── Camera ─────────────────────────────────────────────────────────

export const camera = {
  async getPhoto(options?: {
    quality?: number;
    allowEditing?: boolean;
    source?: 'camera' | 'photos' | 'prompt';
  }) {
    if (!Camera) return null;
    const sourceMap = {
      camera: Camera.CameraSource.Camera,
      photos: Camera.CameraSource.Photos,
      prompt: Camera.CameraSource.Prompt,
    };
    const photo = await Camera.Camera.getPhoto({
      quality: options?.quality ?? 90,
      allowEditing: options?.allowEditing ?? false,
      source: sourceMap[options?.source ?? 'prompt'],
      resultType: Camera.CameraResultType.DataUrl,
    });
    return photo.dataUrl;
  },
};

// ── Geolocation ────────────────────────────────────────────────────

export const geolocation = {
  async getCurrentPosition() {
    if (!Geolocation) return null;
    const position = await Geolocation.Geolocation.getCurrentPosition();
    return {
      latitude: position.coords.latitude,
      longitude: position.coords.longitude,
      accuracy: position.coords.accuracy,
    };
  },
  async watchPosition(callback: (position: {
    latitude: number;
    longitude: number;
    accuracy: number;
  }) => void) {
    if (!Geolocation) return null;
    return Geolocation.Geolocation.watchPosition({}, (position, err) => {
      if (err) {
        console.error('[Geolocation] Error:', err);
        return;
      }
      if (position) {
        callback({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
        });
      }
    });
  },
};

// ── Share ──────────────────────────────────────────────────────────

export const share = {
  async share(options: { title?: string; text?: string; url?: string }) {
    if (!Share) {
      // Web fallback
      if (navigator.share) {
        await navigator.share(options);
        return;
      }
      // Copy to clipboard
      const text = options.text || options.url || '';
      if (text) {
        await navigator.clipboard.writeText(text);
      }
      return;
    }
    await Share.Share.share(options);
  },
};

// ── Network ────────────────────────────────────────────────────────

export const network = {
  async getStatus() {
    if (!Network) {
      return { connected: navigator.onLine, type: 'unknown' };
    }
    const status = await Network.Network.getStatus();
    return { connected: status.connected, type: status.connectionType };
  },
  addListener(callback: (status: { connected: boolean; type: string }) => void) {
    if (!Network) {
      // Web fallback
      const online = () => callback({ connected: true, type: 'unknown' });
      const offline = () => callback({ connected: false, type: 'none' });
      window.addEventListener('online', online);
      window.addEventListener('offline', offline);
      return () => {
        window.removeEventListener('online', online);
        window.removeEventListener('offline', offline);
      };
    }
    Network.Network.addListener('networkStatusChange', (status) => {
      callback({ connected: status.connected, type: status.connectionType });
    });
    return () => { /* Capacitor listener cleanup */ };
  },
};

// ── App Lifecycle ──────────────────────────────────────────────────

export const app = {
  addResumeListener(callback: () => void) {
    if (!App) return () => {};
    App.App.addListener('appStateChange', (state) => {
      if (state.isActive) callback();
    });
    return () => { /* cleanup */ };
  },
  addBackButtonListener(callback: () => void) {
    if (!App || getPlatform() !== 'android') return () => {};
    App.App.addListener('backButton', callback);
    return () => { /* cleanup */ };
  },
  exitApp() {
    if (App && getPlatform() === 'android') {
      App.App.exitApp();
    }
  },
};

// ── Status Bar ─────────────────────────────────────────────────────

export const statusBar = {
  async setStyle(style: 'light' | 'dark') {
    if (!StatusBar) return;
    const styleEnum = style === 'dark'
      ? StatusBar.Style.Dark
      : StatusBar.Style.Light;
    await StatusBar.StatusBar.setStyle({ style: styleEnum });
  },
  async setBackgroundColor(color: string) {
    if (!StatusBar) return;
    await StatusBar.StatusBar.setBackgroundColor({ color });
  },
  async show() {
    if (!StatusBar) return;
    await StatusBar.StatusBar.show();
  },
  async hide() {
    if (!StatusBar) return;
    await StatusBar.StatusBar.hide();
  },
};

// ── Splash Screen ──────────────────────────────────────────────────

export const splashScreen = {
  async hide() {
    if (!SplashScreen) return;
    await SplashScreen.SplashScreen.hide();
  },
  async show(options?: { autoHide?: boolean; duration?: number }) {
    if (!SplashScreen) return;
    await SplashScreen.SplashScreen.show({
      autoHide: options?.autoHide ?? true,
      duration: options?.duration ?? 2000,
    });
  },
};

// ── Preferences (Key-Value Storage) ────────────────────────────────

export const preferences = {
  async get(key: string): Promise<string | null> {
    if (!Preferences) return localStorage.getItem(key);
    const result = await Preferences.Preferences.get({ key });
    return result.value;
  },
  async set(key: string, value: string): Promise<void> {
    if (!Preferences) { localStorage.setItem(key, value); return; }
    await Preferences.Preferences.set({ key, value });
  },
  async remove(key: string): Promise<void> {
    if (!Preferences) { localStorage.removeItem(key); return; }
    await Preferences.Preferences.remove({ key });
  },
  async clear(): Promise<void> {
    if (!Preferences) { localStorage.clear(); return; }
    await Preferences.Preferences.clear();
  },
};

// ── Keyboard ───────────────────────────────────────────────────────

export const keyboard = {
  async setResizeMode(mode: 'none' | 'ionic' | 'native' | 'body') {
    if (!Keyboard) return;
    const modeMap = {
      none: Keyboard.KeyboardResize.None,
      ionic: Keyboard.KeyboardResize.Ionic,
      native: Keyboard.KeyboardResize.Native,
      body: Keyboard.KeyboardResize.Body,
    };
    await Keyboard.Keyboard.setResizeMode({ mode: modeMap[mode] });
  },
  async setAccessoryBarVisible(visible: boolean) {
    if (!Keyboard) return;
    await Keyboard.Keyboard.setAccessoryBarVisible({ visible });
  },
  async hide() {
    if (!Keyboard) return;
    await Keyboard.Keyboard.hide();
  },
  async show() {
    if (!Keyboard) return;
    await Keyboard.Keyboard.show();
  },
};

// ── Local Notifications ────────────────────────────────────────────

export const localNotifications = {
  async schedule(options: {
    title: string;
    body: string;
    id?: number;
    schedule?: { at: Date };
  }) {
    if (!LocalNotifications) return;
    await LocalNotifications.LocalNotifications.schedule({
      notifications: [{
        title: options.title,
        body: options.body,
        id: options.id ?? Date.now(),
        schedule: options.schedule ? { at: options.schedule.at } : undefined,
      }],
    });
  },
  async requestPermission(): Promise<boolean> {
    if (!LocalNotifications) return false;
    const result = await LocalNotifications.LocalNotifications.requestPermission();
    return result.granted;
  },
};
