'use client';

import { useEffect, useRef } from 'react';
import { useAuthStore } from '@/stores/authStore';
import { getToken, removeToken } from '@/lib/api';

export function AuthInitializer({ children }: { children: React.ReactNode }) {
  const initialized = useRef(false);

  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;

    const store = useAuthStore.getState();
    store.initializeFromToken();

    // If we have a token, fetch fresh profile in the background
    // Don't block the UI while fetching — the token decode already gives us basic info
    const token = getToken();
    if (token) {
      // Don't set loading=true to avoid blocking the UI
      fetch('/api/v1/users/me', {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/json',
        },
      })
        .then((response) => {
          if (response.status === 401) {
            removeToken();
            store.logout();
            return null;
          }
          if (response.status >= 500) {
            store.setOfflineSession(true);
            store.setLoading(false);
            return null;
          }
          if (response.ok) return response.json();
          store.setOfflineSession(true);
          store.setLoading(false);
          return null;
        })
        .then((profile) => {
          if (profile) {
            store.login({
              id: profile.id,
              displayName: profile.displayName,
              email: profile.email,
              role: profile.role ?? 'CONSUMER',
            }, token);
            store.setOfflineSession(false);
          }
        })
        .catch(() => {
          store.setOfflineSession(true);
          store.setLoading(false);
        });
    }
  }, []);

  return <>{children}</>;
}
