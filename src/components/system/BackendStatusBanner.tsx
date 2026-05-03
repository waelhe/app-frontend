/**
 * BackendStatusBanner — Shows a subtle banner when the backend is
 * intermittently available or offline. Allows the app to continue
 * working with cached data.
 *
 * Status levels:
 * - 'unknown': Initial state, no banner shown
 * - 'online': Backend is fully healthy, no banner shown
 * - 'degraded': Backend responds but health check reports DOWN
 *   (non-critical subsystems like OTLP may be failing).
 *   Shows a subtle info banner. API endpoints still work.
 * - 'offline': Backend is completely unreachable.
 *   Shows a warning banner with cached data notice.
 */

'use client';

import { useEffect, useState } from 'react';
import { Wifi, WifiOff, RefreshCw, AlertTriangle, Info } from 'lucide-react';
import { getBackendStatus, onBackendStatusChange, type BackendStatus } from '@/lib/api';
import { checkBackendHealth } from '@/lib/api';
import { motion, AnimatePresence } from 'framer-motion';

export function BackendStatusBanner() {
  const [status, setStatus] = useState<BackendStatus>('unknown');
  const [isRetrying, setIsRetrying] = useState(false);

  useEffect(() => {
    // Get initial status
    setStatus(getBackendStatus());

    // Listen for status changes
    const unsubscribe = onBackendStatusChange(setStatus);
    return unsubscribe;
  }, []);

  const handleRetry = async () => {
    setIsRetrying(true);
    try {
      await checkBackendHealth();
    } finally {
      setIsRetrying(false);
    }
  };

  // Don't show banner when backend is online, degraded, or unknown
  // 'degraded' means the API works but some non-critical subsystem is down
  if (status === 'online' || status === 'unknown' || status === 'degraded') {
    return null;
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className={`sticky top-16 z-40 px-4 py-2 text-center text-sm font-medium ${
          status === 'offline'
            ? 'bg-amber-50 text-amber-800 border-b border-amber-200'
            : 'bg-orange-50 text-orange-800 border-b border-orange-200'
        }`}
      >
        <div className="flex items-center justify-center gap-2">
          {status === 'offline' ? (
            <>
              <WifiOff className="h-4 w-4" />
              <span>الخادم غير متاح حالياً — يتم عرض البيانات المحفوظة</span>
            </>
          ) : (
            <>
              <AlertTriangle className="h-4 w-4" />
              <span>الخادم يعمل بشكل متقطع — بعض الميزات قد لا تكون متاحة</span>
            </>
          )}
          <button
            onClick={handleRetry}
            disabled={isRetrying}
            className="inline-flex items-center gap-1 rounded-md bg-white/70 px-2 py-0.5 text-xs font-medium hover:bg-white transition-colors border border-current/20 disabled:opacity-50 ms-2"
          >
            <RefreshCw className={`h-3 w-3 ${isRetrying ? 'animate-spin' : ''}`} />
            {isRetrying ? 'جاري المحاولة...' : 'إعادة المحاولة'}
          </button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
