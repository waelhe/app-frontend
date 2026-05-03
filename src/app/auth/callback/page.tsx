'use client';

import { useEffect, useState, startTransition } from 'react';
import { useRouter } from 'next/navigation';
import { exchangeAuthCode } from '@/contexts/AuthContext';
import { setToken } from '@/lib/api';
import { Loader2, CheckCircle2, XCircle } from 'lucide-react';

type CallbackStatus = 'loading' | 'success' | 'error';

/**
 * OAuth2 Callback Page
 *
 * Handles two flows:
 * 1. Client-side PKCE flow (default): Exchanges the authorization code
 *    using the PKCE verifier stored in sessionStorage.
 * 2. Server-side BFF flow (server_auth=true): The server has already
 *    exchanged the code and set httpOnly cookies. We fetch the token
 *    from the session endpoint and store it in localStorage.
 */
export default function AuthCallbackPage() {
  const router = useRouter();
  const [status, setStatus] = useState<CallbackStatus>('loading');
  const [error, setError] = useState('');

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const code = params.get('code');
    const errorParam = params.get('error');
    const serverAuth = params.get('server_auth');

    if (errorParam) {
      const errorDesc = params.get('error_description') ?? errorParam;
      startTransition(() => {
        setStatus('error');
        setError(errorDesc);
      });
      return;
    }

    if (!code) {
      startTransition(() => {
        setStatus('error');
        setError('No authorization code received from the server.');
      });
      return;
    }

    // ── Server-side BFF flow ─────────────────────────────────────
    // The server at /api/auth/callback already exchanged the code
    // and set httpOnly cookies. Fetch the token from the session API.
    if (serverAuth === 'true') {
      fetch('/api/auth/session')
        .then((res) => {
          if (!res.ok) {
            throw new Error('Failed to retrieve session from server cookies.');
          }
          return res.json();
        })
        .then((data) => {
          if (!data.access_token) {
            throw new Error('No access token in server session.');
          }
          setToken(data.access_token);
          startTransition(() => {
            setStatus('success');
          });
          // Clean up URL params
          window.history.replaceState({}, '', '/');
          setTimeout(() => {
            router.replace('/');
          }, 1500);
        })
        .catch((err) => {
          console.error('[Auth Callback] Server auth session fetch failed:', err);
          startTransition(() => {
            setStatus('error');
            setError(err instanceof Error ? err.message : 'Failed to retrieve authentication session.');
          });
        });
      return;
    }

    // ── Client-side PKCE flow (default) ─────────────────────────
    exchangeAuthCode(code)
      .then((token) => {
        setToken(token);
        startTransition(() => {
          setStatus('success');
        });
        setTimeout(() => {
          router.replace('/');
        }, 1500);
      })
      .catch((err) => {
        startTransition(() => {
          setStatus('error');
          setError(err instanceof Error ? err.message : 'Token exchange failed');
        });
      });
  }, [router]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <div className="flex flex-col items-center gap-4 rounded-2xl bg-white p-8 shadow-lg">
        {status === 'loading' && (
          <>
            <Loader2 className="h-12 w-12 animate-spin text-red-500" />
            <h1 className="text-xl font-bold text-gray-900">
              جاري تسجيل الدخول...
            </h1>
            <p className="text-sm text-gray-500">
              Signing you in, please wait...
            </p>
          </>
        )}

        {status === 'success' && (
          <>
            <CheckCircle2 className="h-12 w-12 text-emerald-500" />
            <h1 className="text-xl font-bold text-gray-900">
              تم تسجيل الدخول بنجاح!
            </h1>
            <p className="text-sm text-gray-500">
              Successfully signed in! Redirecting...
            </p>
          </>
        )}

        {status === 'error' && (
          <>
            <XCircle className="h-12 w-12 text-red-500" />
            <h1 className="text-xl font-bold text-gray-900">
              فشل تسجيل الدخول
            </h1>
            <p className="text-sm text-red-600">{error}</p>
            <button
              onClick={() => router.replace('/')}
              className="mt-2 rounded-lg bg-red-500 px-6 py-2 text-sm font-medium text-white hover:bg-red-600 transition-colors"
            >
              العودة للرئيسية
            </button>
          </>
        )}
      </div>
    </div>
  );
}
