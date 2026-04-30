'use client';

import { useEffect, useState, startTransition } from 'react';
import { useRouter } from 'next/navigation';
import { exchangeAuthCode } from '@/contexts/AuthContext';
import { setToken } from '@/lib/api';
import { Loader2, CheckCircle2, XCircle } from 'lucide-react';

type CallbackStatus = 'loading' | 'success' | 'error';

export default function AuthCallbackPage() {
  const router = useRouter();
  const [status, setStatus] = useState<CallbackStatus>('loading');
  const [error, setError] = useState('');

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const code = params.get('code');
    const errorParam = params.get('error');

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
