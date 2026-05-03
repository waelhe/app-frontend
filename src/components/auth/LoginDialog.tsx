'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Loader2, Mail, Lock, User, WifiOff, AlertTriangle, CheckCircle2, Eye, EyeOff } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { setToken, getBackendStatus, type ApiError } from '@/lib/api';
import { useAuth as useAuthStore } from '@/store/use-auth';
import { useLocalUsers } from '@/store/use-local-users';
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
type UserRole = 'CONSUMER' | 'PROVIDER' | 'ADMIN';

/**
 * Infer user role from username since JWT doesn't include role claims.
 */
function inferRoleFromUsername(username: string): UserRole {
  if (username === 'admin') return 'ADMIN';
  if (username.startsWith('provider-')) return 'PROVIDER';
  return 'CONSUMER';
}

export function LoginDialog({ open, onOpenChange }: LoginDialogProps) {
  const { isRTL } = useLanguage();
  const { signIn } = useAuth();
  const { login: zustandLogin } = useAuthStore();
  const { registerUser, authenticateUser, findByEmail } = useLocalUsers();

  const [mode, setMode] = useState<AuthMode>('login');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState<UserRole>('CONSUMER');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [registrationSuccess, setRegistrationSuccess] = useState(false);

  const backendStatus = getBackendStatus();
  const isBackendDown = backendStatus === 'offline';

  const resetForm = () => {
    setUsername('');
    setEmail('');
    setPassword('');
    setDisplayName('');
    setPhone('');
    setRole('CONSUMER');
    setError('');
    setIsLoading(false);
    setShowPassword(false);
    setRegistrationSuccess(false);
  };

  const handleLogin = async () => {
    setIsLoading(true);
    setError('');

    try {
      // First, check local users
      const localUser = authenticateUser(username || email, password);
      if (localUser) {
        // Login with local user
        zustandLogin({
          id: localUser.id,
          displayName: localUser.displayName,
          email: localUser.email,
          role: localUser.role,
          phone: localUser.phone,
        });
        onOpenChange(false);
        return;
      }

      // Try backend login
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: username || email,
          password,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        if (data.error === 'invalid_credentials') {
          throw new Error(isRTL ? 'اسم المستخدم أو كلمة المرور غير صحيحة' : 'Invalid username or password');
        }
        if (data.error === 'consent_required' || data.needsBrowserAuth) {
          signIn();
          return;
        }
        if (res.status === 502 || res.status === 504) {
          throw new Error(isRTL ? 'الخادم غير متاح حالياً، يرجى المحاولة لاحقاً' : 'Server is currently unavailable, please try again later');
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
        try {
          const parts = data.accessToken.split('.');
          if (parts.length === 3) {
            const payload = JSON.parse(atob(parts[1].replace(/-/g, '+').replace(/_/g, '/')));
            const jwtSub = payload.sub || username;
            const inferredRole = payload.roles?.includes('ADMIN')
              ? 'ADMIN' as UserRole
              : payload.roles?.includes('PROVIDER')
                ? 'PROVIDER' as UserRole
                : inferRoleFromUsername(jwtSub);
            zustandLogin({
              id: jwtSub,
              displayName: payload.name || payload.preferred_username || jwtSub,
              email: payload.email || '',
              role: inferredRole,
            });
          }
        } catch {
          zustandLogin({
            id: username,
            displayName: username,
            email: '',
            role: inferRoleFromUsername(username),
          });
        }
      }

      onOpenChange(false);
    } catch (err) {
      if (err instanceof ApiError && (err.category === 'network' || err.category === 'server' || err.category === 'timeout')) {
        setError(isRTL ? 'الخادم غير متاح حالياً، يرجى المحاولة لاحقاً' : 'Server is currently unavailable, please try again later');
      } else {
        setError(err instanceof Error ? err.message : (isRTL ? 'حدث خطأ أثناء تسجيل الدخول' : 'An error occurred during sign in'));
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async () => {
    setIsLoading(true);
    setError('');

    try {
      // Check if user already exists locally
      if (findByEmail(email)) {
        throw new Error(isRTL ? 'البريد الإلكتروني مسجل بالفعل' : 'Email is already registered');
      }

      // Try backend registration first
      let backendRegistered = false;
      try {
        const res = await fetch('/api/auth/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ displayName, email, password, role }),
        });

        if (res.ok) {
          backendRegistered = true;
          const data = await res.json();
          if (data.user) {
            // Auto-login with the new backend account
            setUsername(email);
            await handleLogin();
            return;
          }
        }
      } catch {
        // Backend registration failed, continue with local registration
      }

      // Fallback: Register locally
      const localUser = registerUser({
        email,
        displayName,
        password,
        role,
        phone,
      });

      // Auto-login with the new local account
      zustandLogin({
        id: localUser.id,
        displayName: localUser.displayName,
        email: localUser.email,
        role: localUser.role,
        phone: localUser.phone,
      });

      setRegistrationSuccess(true);

      // Close dialog after a short delay
      setTimeout(() => {
        onOpenChange(false);
      }, 1500);
    } catch (err) {
      if (err instanceof ApiError && (err.category === 'network' || err.category === 'server' || err.category === 'timeout')) {
        setError(isRTL ? 'الخادم غير متاح حالياً، يرجى المحاولة لاحقاً' : 'Server is currently unavailable, please try again later');
      } else {
        setError(err instanceof Error ? err.message : (isRTL ? 'حدث خطأ أثناء إنشاء الحساب' : 'An error occurred during registration'));
      }
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
      if (!email.includes('@')) {
        setError(isRTL ? 'البريد الإلكتروني غير صحيح' : 'Invalid email address');
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

        {/* Backend down warning */}
        {isBackendDown && mode === 'login' && (
          <div className="flex items-center gap-2 rounded-lg bg-amber-50 border border-amber-200 p-3 text-sm text-amber-800">
            <WifiOff className="h-4 w-4 shrink-0" />
            <span>
              {isRTL
                ? 'الخادم غير متاح، يمكنك تسجيل الدخول بحساب محلي'
                : 'Server unavailable, you can sign in with a local account'}
            </span>
          </div>
        )}

        {/* Registration success */}
        {registrationSuccess && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center gap-2 py-4"
          >
            <div className="rounded-full bg-green-100 p-3">
              <CheckCircle2 className="h-8 w-8 text-green-500" />
            </div>
            <p className="text-sm font-medium text-green-700">
              {isRTL ? 'تم إنشاء الحساب بنجاح!' : 'Account created successfully!'}
            </p>
          </motion.div>
        )}

        {!registrationSuccess && (
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
                    {isRTL ? 'اسم المستخدم أو البريد' : 'Username or Email'}
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
                      placeholder={isRTL ? 'admin أو email@example.com' : 'admin or email@example.com'}
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
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className={`${isRTL ? 'pr-10' : 'pl-10'} pe-10`}
                      autoComplete="current-password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className={`absolute top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 ${isRTL ? 'left-3' : 'right-3'}`}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`flex items-center gap-2 rounded-lg p-3 text-sm ${
                      error.includes('غير متاح')
                        ? 'bg-amber-50 border border-amber-200 text-amber-700'
                        : 'bg-red-50 border border-red-200 text-red-600'
                    }`}
                  >
                    {error.includes('غير متاح') ? (
                      <AlertTriangle className="h-4 w-4 shrink-0" />
                    ) : null}
                    {error}
                  </motion.div>
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
                  className="w-full flex items-center justify-center gap-3 rounded-md border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:opacity-50"
                  disabled={isBackendDown}
                >
                  <svg className="h-5 w-5" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
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
                    {isRTL ? 'الاسم الكامل' : 'Full Name'} <span className="text-red-500">*</span>
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
                    {isRTL ? 'البريد الإلكتروني' : 'Email'} <span className="text-red-500">*</span>
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
                  <Label htmlFor="register-phone">
                    {isRTL ? 'رقم الهاتف' : 'Phone Number'}
                  </Label>
                  <Input
                    id="register-phone"
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder={isRTL ? '05XXXXXXXX' : '05XXXXXXXX'}
                    dir="ltr"
                    className="text-left"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="register-password">
                    {isRTL ? 'كلمة المرور' : 'Password'} <span className="text-red-500">*</span>
                  </Label>
                  <div className="relative">
                    <Lock
                      className={`absolute top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400 ${
                        isRTL ? 'right-3' : 'left-3'
                      }`}
                    />
                    <Input
                      id="register-password"
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className={`${isRTL ? 'pr-10' : 'pl-10'} pe-10`}
                      autoComplete="new-password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className={`absolute top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 ${isRTL ? 'left-3' : 'right-3'}`}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  {password && password.length < 6 && (
                    <p className="text-xs text-amber-600">
                      {isRTL ? 'يجب أن تكون 6 أحرف على الأقل' : 'Must be at least 6 characters'}
                    </p>
                  )}
                </div>

                {/* Role Selection */}
                <div className="space-y-2">
                  <Label>
                    {isRTL ? 'نوع الحساب' : 'Account Type'} <span className="text-red-500">*</span>
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
                      {isRTL ? '👤 مستهلك' : '👤 Consumer'}
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
                      {isRTL ? '🏪 مزود خدمة' : '🏪 Provider'}
                    </button>
                  </div>
                </div>

                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`flex items-center gap-2 rounded-lg p-3 text-sm ${
                      error.includes('غير متاح')
                        ? 'bg-amber-50 border border-amber-200 text-amber-700'
                        : 'bg-red-50 border border-red-200 text-red-600'
                    }`}
                  >
                    {error.includes('غير متاح') ? (
                      <AlertTriangle className="h-4 w-4 shrink-0" />
                    ) : null}
                    {error}
                  </motion.div>
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

                {/* Info about local registration */}
                <div className="rounded-lg bg-blue-50 border border-blue-200 p-3 text-xs text-blue-700">
                  {isRTL
                    ? '💡 سيتم إنشاء حسابك محلياً ومزامنته مع الخادم عند توفره'
                    : '💡 Your account will be created locally and synced with the server when available'}
                </div>

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
                  className="w-full flex items-center justify-center gap-3 rounded-md border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:opacity-50"
                  disabled={isBackendDown}
                >
                  <svg className="h-5 w-5" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                  </svg>
                  {isRTL ? 'تسجيل الدخول عبر Google' : 'Sign in with Google'}
                </button>

                {/* Demo Accounts Info */}
                <div className="rounded-lg bg-gray-50 border border-gray-200 p-3 space-y-2">
                  <p className="text-xs font-semibold text-gray-600">
                    {isRTL ? 'حسابات للتجربة:' : 'Demo Accounts:'}
                  </p>
                  <div className="space-y-1.5">
                    <button
                      type="button"
                      onClick={() => { setUsername('admin'); setPassword('Admin@2024'); setMode('login'); setError(''); }}
                      className="flex items-center justify-between w-full text-xs bg-white rounded-md border border-gray-100 px-2.5 py-1.5 hover:bg-gray-100 transition-colors"
                    >
                      <span className="text-gray-700 font-mono">admin / Admin@2024</span>
                      <span className="rounded bg-red-100 px-1.5 py-0.5 text-[10px] font-medium text-red-700">ADMIN</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => { setUsername('provider-ahmad'); setPassword('Ahmad@2024'); setMode('login'); setError(''); }}
                      className="flex items-center justify-between w-full text-xs bg-white rounded-md border border-gray-100 px-2.5 py-1.5 hover:bg-gray-100 transition-colors"
                    >
                      <span className="text-gray-700 font-mono">provider-ahmad / Ahmad@2024</span>
                      <span className="rounded bg-emerald-100 px-1.5 py-0.5 text-[10px] font-medium text-emerald-700">PROVIDER</span>
                    </button>
                  </div>
                </div>
              </form>
            </TabsContent>
          </Tabs>
        )}
      </DialogContent>
    </Dialog>
  );
}
