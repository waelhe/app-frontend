'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Loader2, Mail, Lock, User } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { setToken, identityService, ApiError } from '@/lib/api';
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
  const { t, isRTL } = useLanguage();
  const { signIn } = useAuth();
  const { login: zustandLogin } = useAuthStore();

  const [mode, setMode] = useState<AuthMode>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [role, setRole] = useState<UserRole>('CONSUMER');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const resetForm = () => {
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
      const res = await fetch('/api/v1/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      if (!res.ok) {
        let detail = isRTL ? 'بيانات الدخول غير صحيحة' : 'Invalid email or password';
        try {
          const problem = await res.json();
          if (problem?.detail) detail = problem.detail;
        } catch { /* non-JSON error */ }
        throw new Error(detail);
      }

      const data = await res.json();
      setToken(data.accessToken);

      const profile = await identityService.me();
      zustandLogin({
        id: profile.id,
        displayName: profile.displayName,
        email: profile.email,
        role: profile.role ?? 'CONSUMER',
      });

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
      const res = await fetch('/api/v1/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ displayName, email, password, role }),
      });

      if (!res.ok) {
        let detail = isRTL ? 'حدث خطأ أثناء إنشاء الحساب' : 'An error occurred during registration';
        try {
          const problem = await res.json();
          if (problem?.detail) detail = problem.detail;
          if (res.status === 409 || (problem?.detail && problem.detail.toLowerCase().includes('email')))
            detail = isRTL ? 'البريد الإلكتروني مستخدم بالفعل' : 'Email is already taken';
        } catch { /* non-JSON error */ }
        throw new Error(detail);
      }

      // Auto-login after successful registration
      const loginRes = await fetch('/api/v1/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      if (!loginRes.ok) {
        // Registration succeeded but auto-login failed — switch to login tab
        setMode('login');
        setError(isRTL ? 'تم إنشاء الحساب. يرجى تسجيل الدخول' : 'Account created. Please sign in.');
        return;
      }

      const data = await loginRes.json();
      setToken(data.accessToken);

      const profile = await identityService.me();
      zustandLogin({
        id: profile.id,
        displayName: profile.displayName,
        email: profile.email,
        role: profile.role ?? 'CONSUMER',
      });

      onOpenChange(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : (isRTL ? 'حدث خطأ أثناء إنشاء الحساب' : 'An error occurred during registration'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Basic validation
    if (!email.trim()) {
      setError(isRTL ? 'البريد الإلكتروني مطلوب' : 'Email is required');
      return;
    }
    if (!password.trim()) {
      setError(isRTL ? 'كلمة المرور مطلوبة' : 'Password is required');
      return;
    }
    if (password.length < 6) {
      setError(
        isRTL
          ? 'كلمة المرور يجب أن تكون 6 أحرف على الأقل'
          : 'Password must be at least 6 characters'
      );
      return;
    }
    if (mode === 'register' && !displayName.trim()) {
      setError(isRTL ? 'الاسم مطلوب' : 'Name is required');
      return;
    }

    if (mode === 'login') {
      await handleLogin();
    } else {
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
              ? isRTL
                ? 'سجّل دخولك لحسابك'
                : 'Sign in to your account'
              : isRTL
                ? 'أنشئ حساباً جديداً'
                : 'Create a new account'}
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
                <Label htmlFor="login-email">
                  {isRTL ? 'البريد الإلكتروني' : 'Email'}
                </Label>
                <div className="relative">
                  <Mail
                    className={`absolute top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400 ${
                      isRTL ? 'right-3' : 'left-3'
                    }`}
                  />
                  <Input
                    id="login-email"
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
                    {t('common.loading')}
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
                className="w-full rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
              >
                {isRTL ? 'تسجيل الدخول عبر SSO' : 'Sign in with SSO'}
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
                    {t('common.loading')}
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
                className="w-full rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
              >
                {isRTL ? 'تسجيل الدخول عبر SSO' : 'Sign in with SSO'}
              </button>
            </form>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
