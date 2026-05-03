'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Loader2, Mail, Lock, User } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { setToken, identityService } from '@/lib/api';
import { useAuth as useAuthStore } from '@/store/use-auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface LoginDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

type AuthMode = 'login' | 'register';
type UserRole = 'CONSUMER' | 'PROVIDER';

export function LoginDialog({ open, onOpenChange }: LoginDialogProps) {
  const { isRTL } = useLanguage();
  const { signIn } = useAuth();
  const { login: zustandLogin } = useAuthStore();

  const [mode, setMode] = useState<AuthMode>('login');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [role, setRole] = useState<UserRole>('CONSUMER');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const resetForm = () => {
    setUsername('');
    setEmail('');
    setPassword('');
    setDisplayName('');
    setRole('CONSUMER');
    setError('');
    setIsLoading(false);
  };

  const handleLogin = async () => {
    setIsLoading(true);
    setError('');

    try {
      // Use our server-side login proxy that handles the full OAuth2 flow
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: username || email, // Support both username and email
          password,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        // Handle specific errors
        if (data.error === 'invalid_credentials') {
          throw new Error(isRTL ? 'اسم المستخدم أو كلمة المرور غير صحيحة' : 'Invalid username or password');
        }
        if (data.error === 'consent_required' || data.needsBrowserAuth) {
          // Fall back to browser-based OAuth2 flow
          signIn();
          return;
        }
        throw new Error(data.error_description || (isRTL ? 'حدث خطأ أثناء تسجيل الدخول' : 'An error occurred during sign in'));
      }

      // Store the access token
      setToken(data.accessToken);

      // Update auth state
      if (data.user) {
        zustandLogin({
          id: data.user.id,
          displayName: data.user.displayName,
          email: data.user.email,
          role: data.user.role ?? 'CONSUMER',
        });
      } else {
        // Decode JWT to get basic user info
        try {
          const parts = data.accessToken.split('.');
          if (parts.length === 3) {
            const payload = JSON.parse(atob(parts[1].replace(/-/g, '+').replace(/_/g, '/')));
            zustandLogin({
              id: payload.sub || '',
              displayName: payload.name || payload.preferred_username || username,
              email: payload.email || '',
              role: payload.roles?.includes('ADMIN') ? 'ADMIN' : payload.roles?.includes('PROVIDER') ? 'PROVIDER' : 'CONSUMER',
            });
          }
        } catch {
          zustandLogin({
            id: username,
            displayName: username,
            email: '',
            role: 'CONSUMER',
          });
        }
      }

      onOpenChange(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : (isRTL ? 'حدث خطأ أثناء تسجيل الدخول' : 'An error occurred during sign in'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async () => {
    setIsLoading(true);
    setError('');

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ displayName, email, password, role }),
      });

      const data = await res.json();

      if (!res.ok) {
        if (data.error === 'registration_unavailable' || data.needsBrowserAuth) {
          setError(isRTL ? 'التسجيل غير متاح حالياً. يرجى استخدام تسجيل الدخول عبر المتصفح.' : 'Registration is currently unavailable. Please use browser-based sign in.');
          return;
        }
        throw new Error(data.error_description || (isRTL ? 'حدث خطأ أثناء إنشاء الحساب' : 'An error occurred during registration'));
      }

      // Auto-login after successful registration
      setUsername(email);
      await handleLogin();
    } catch (err) {
      setError(err instanceof Error ? err.message : (isRTL ? 'حدث خطأ أثناء إنشاء الحساب' : 'An error occurred during registration'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (mode === 'login') {
      if (!username.trim() && !email.trim()) {
        setError(isRTL ? 'اسم المستخدم أو البريد الإلكتروني مطلوب' : 'Username or email is required');
        return;
      }
      if (!password.trim()) {
        setError(isRTL ? 'كلمة المرور مطلوبة' : 'Password is required');
        return;
      }
      await handleLogin();
    } else {
      if (!displayName.trim()) {
        setError(isRTL ? 'الاسم مطلوب' : 'Name is required');
        return;
      }
      if (!email.trim()) {
        setError(isRTL ? 'البريد الإلكتروني مطلوب' : 'Email is required');
        return;
      }
      if (!password.trim()) {
        setError(isRTL ? 'كلمة المرور مطلوبة' : 'Password is required');
        return;
      }
      if (password.length < 6) {
        setError(isRTL ? 'كلمة المرور يجب أن تكون 6 أحرف على الأقل' : 'Password must be at least 6 characters');
        return;
      }
      await handleRegister();
    }
  };

  const handleModeChange = (value: string) => {
    setMode(value as AuthMode);
    setError('');
  };

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) resetForm(); onOpenChange(o); }}>
      <DialogContent className="sm:max-w-md" dir={isRTL ? 'rtl' : 'ltr'}>
        <DialogHeader>
          <DialogTitle className="text-center text-xl">
            {isRTL ? 'نبض' : 'Nabd'}
          </DialogTitle>
          <DialogDescription className="text-center">
            {mode === 'login'
              ? isRTL ? 'سجّل دخولك لحسابك' : 'Sign in to your account'
              : isRTL ? 'أنشئ حساباً جديداً' : 'Create a new account'}
          </DialogDescription>
        </DialogHeader>

        <Tabs value={mode} onValueChange={handleModeChange}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="login">
              {isRTL ? 'تسجيل الدخول' : 'Login'}
            </TabsTrigger>
            <TabsTrigger value="register">
              {isRTL ? 'إنشاء حساب' : 'Register'}
            </TabsTrigger>
          </TabsList>

          {/* Login Form */}
          <TabsContent value="login">
            <form onSubmit={handleSubmit} className="space-y-4 pt-2">
              <div className="space-y-2">
                <Label htmlFor="login-username">
                  {isRTL ? 'اسم المستخدم' : 'Username'}
                </Label>
                <div className="relative">
                  <User
                    className={`absolute top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400 ${
                      isRTL ? 'right-3' : 'left-3'
                    }`}
                  />
                  <Input
                    id="login-username"
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder={isRTL ? 'admin' : 'admin'}
                    className={isRTL ? 'pr-10' : 'pl-10'}
                    autoComplete="username"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="login-password">
                  {isRTL ? 'كلمة المرور' : 'Password'}
                </Label>
                <div className="relative">
                  <Lock
                    className={`absolute top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400 ${
                      isRTL ? 'right-3' : 'left-3'
                    }`}
                  />
                  <Input
                    id="login-password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className={isRTL ? 'pr-10' : 'pl-10'}
                    autoComplete="current-password"
                  />
                </div>
              </div>

              {error && (
                <motion.p
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-sm text-red-500"
                >
                  {error}
                </motion.p>
              )}

              <Button
                type="submit"
                className="w-full bg-red-500 text-white hover:bg-red-600"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    {isRTL ? 'جاري تسجيل الدخول...' : 'Signing in...'}
                  </>
                ) : isRTL ? (
                  'تسجيل الدخول'
                ) : (
                  'Sign In'
                )}
              </Button>

              <div className="relative my-3">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-gray-200" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-white px-2 text-gray-400">
                    {isRTL ? 'أو' : 'or'}
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => signIn()}
                className="w-full flex items-center justify-center gap-3 rounded-md border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
              >
                <svg className="h-5 w-5" viewBox="0 0 24 24" aria-hidden="true">
                  <path
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
                    fill="#4285F4"
                  />
                  <path
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    fill="#34A853"
                  />
                  <path
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    fill="#FBBC05"
                  />
                  <path
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    fill="#EA4335"
                  />
                </svg>
                {isRTL ? 'تسجيل الدخول عبر Google' : 'Sign in with Google'}
              </button>
            </form>
          </TabsContent>

          {/* Register Form */}
          <TabsContent value="register">
            <form onSubmit={handleSubmit} className="space-y-4 pt-2">
              <div className="space-y-2">
                <Label htmlFor="register-name">
                  {isRTL ? 'الاسم الكامل' : 'Full Name'}
                </Label>
                <div className="relative">
                  <User
                    className={`absolute top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400 ${
                      isRTL ? 'right-3' : 'left-3'
                    }`}
                  />
                  <Input
                    id="register-name"
                    type="text"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    placeholder={isRTL ? 'أحمد محمد' : 'John Doe'}
                    className={isRTL ? 'pr-10' : 'pl-10'}
                    autoComplete="name"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="register-email">
                  {isRTL ? 'البريد الإلكتروني' : 'Email'}
                </Label>
                <div className="relative">
                  <Mail
                    className={`absolute top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400 ${
                      isRTL ? 'right-3' : 'left-3'
                    }`}
                  />
                  <Input
                    id="register-email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder={isRTL ? 'example@mail.com' : 'email@example.com'}
                    className={isRTL ? 'pr-10' : 'pl-10'}
                    autoComplete="email"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="register-password">
                  {isRTL ? 'كلمة المرور' : 'Password'}
                </Label>
                <div className="relative">
                  <Lock
                    className={`absolute top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400 ${
                      isRTL ? 'right-3' : 'left-3'
                    }`}
                  />
                  <Input
                    id="register-password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className={isRTL ? 'pr-10' : 'pl-10'}
                    autoComplete="new-password"
                  />
                </div>
              </div>

              {/* Role Selection */}
              <div className="space-y-2">
                <Label>
                  {isRTL ? 'نوع الحساب' : 'Account Type'}
                </Label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setRole('CONSUMER')}
                    className={`rounded-lg border-2 p-3 text-center text-sm font-medium transition-colors ${
                      role === 'CONSUMER'
                        ? 'border-red-500 bg-red-50 text-red-700'
                        : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'
                    }`}
                  >
                    {isRTL ? 'مستهلك' : 'Consumer'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setRole('PROVIDER')}
                    className={`rounded-lg border-2 p-3 text-center text-sm font-medium transition-colors ${
                      role === 'PROVIDER'
                        ? 'border-red-500 bg-red-50 text-red-700'
                        : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'
                    }`}
                  >
                    {isRTL ? 'مزود خدمة' : 'Provider'}
                  </button>
                </div>
              </div>

              {error && (
                <motion.p
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-sm text-red-500"
                >
                  {error}
                </motion.p>
              )}

              <Button
                type="submit"
                className="w-full bg-red-500 text-white hover:bg-red-600"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    {isRTL ? 'جاري إنشاء الحساب...' : 'Creating account...'}
                  </>
                ) : isRTL ? (
                  'إنشاء حساب'
                ) : (
                  'Create Account'
                )}
              </Button>

              <div className="relative my-3">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-gray-200" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-white px-2 text-gray-400">
                    {isRTL ? 'أو' : 'or'}
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => signIn()}
                className="w-full flex items-center justify-center gap-3 rounded-md border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
              >
                <svg className="h-5 w-5" viewBox="0 0 24 24" aria-hidden="true">
                  <path
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
                    fill="#4285F4"
                  />
                  <path
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    fill="#34A853"
                  />
                  <path
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    fill="#FBBC05"
                  />
                  <path
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    fill="#EA4335"
                  />
                </svg>
                {isRTL ? 'تسجيل الدخول عبر Google' : 'Sign in with Google'}
              </button>
            </form>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
