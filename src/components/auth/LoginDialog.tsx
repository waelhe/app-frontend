'use client';

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Loader2,
  Mail,
  Lock,
  User,
  Phone,
  WifiOff,
  AlertTriangle,
  CheckCircle2,
  Eye,
  EyeOff,
  Heart,
  ArrowRight,
  ArrowLeft,
  ShieldCheck,
  Store,
} from 'lucide-react';
import { useLanguage } from '@/stores/languageStore';
import { useAuth } from '@/stores/authStore';
import { setToken, getBackendStatus, type ApiError } from '@/lib/api';
import { useLocalUsers } from '@/stores/localUsersStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface LoginDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

type AuthMode = 'login' | 'register';
type UserRole = 'CONSUMER' | 'PROVIDER' | 'ADMIN';

function inferRoleFromUsername(username: string): UserRole {
  if (username === 'admin') return 'ADMIN';
  if (username.startsWith('provider-')) return 'PROVIDER';
  return 'CONSUMER';
}

function getPasswordStrength(password: string): { level: number; label: string; labelEn: string; color: string } {
  if (!password) return { level: 0, label: '', labelEn: '', color: '' };
  let score = 0;
  if (password.length >= 6) score++;
  if (password.length >= 8) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;

  if (score <= 1) return { level: 1, label: 'ضعيفة', labelEn: 'Weak', color: 'bg-red-500' };
  if (score <= 3) return { level: 2, label: 'متوسطة', labelEn: 'Medium', color: 'bg-amber-500' };
  return { level: 3, label: 'قوية', labelEn: 'Strong', color: 'bg-emerald-500' };
}

export function LoginDialog({ open, onOpenChange }: LoginDialogProps) {
  const { isRTL } = useLanguage();
  const { signIn, login: zustandLogin } = useAuth();
  const { registerUser, authenticateUser, findByEmail } = useLocalUsers();

  const [mode, setMode] = useState<AuthMode>('login');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState<UserRole>('CONSUMER');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [registrationSuccess, setRegistrationSuccess] = useState(false);
  const [loginSuccess, setLoginSuccess] = useState(false);

  const backendStatus = getBackendStatus();
  const isBackendDown = backendStatus === 'offline';

  const passwordStrength = useMemo(() => getPasswordStrength(password), [password]);

  const resetForm = () => {
    setUsername('');
    setEmail('');
    setPassword('');
    setConfirmPassword('');
    setDisplayName('');
    setPhone('');
    setRole('CONSUMER');
    setError('');
    setIsLoading(false);
    setShowPassword(false);
    setShowConfirmPassword(false);
    setRememberMe(false);
    setAgreedToTerms(false);
    setRegistrationSuccess(false);
    setLoginSuccess(false);
  };

  const handleLogin = async () => {
    setIsLoading(true);
    setError('');

    try {
      const localUser = authenticateUser(username || email, password);
      if (localUser) {
        zustandLogin({
          id: localUser.id,
          displayName: localUser.displayName,
          email: localUser.email,
          role: localUser.role,
          phone: localUser.phone,
        });
        setLoginSuccess(true);
        setTimeout(() => {
          onOpenChange(false);
        }, 1200);
        return;
      }

      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: username || email, password }),
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

      setToken(data.accessToken);

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

      setLoginSuccess(true);
      setTimeout(() => {
        onOpenChange(false);
      }, 1200);
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
      if (findByEmail(email)) {
        throw new Error(isRTL ? 'البريد الإلكتروني مسجل بالفعل' : 'Email is already registered');
      }

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
            setUsername(email);
            await handleLogin();
            return;
          }
        }
      } catch {
        // Backend registration failed, continue with local registration
      }

      const localUser = registerUser({
        email,
        displayName,
        password,
        role,
        phone,
      });

      zustandLogin({
        id: localUser.id,
        displayName: localUser.displayName,
        email: localUser.email,
        role: localUser.role,
        phone: localUser.phone,
      });

      setRegistrationSuccess(true);
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
      if (password !== confirmPassword) {
        setError(isRTL ? 'كلمتا المرور غير متطابقتين' : 'Passwords do not match');
        return;
      }
      if (!agreedToTerms) {
        setError(isRTL ? 'يجب الموافقة على الشروط والأحكام' : 'You must agree to the terms and conditions');
        return;
      }
      await handleRegister();
    }
  };

  const switchMode = () => {
    const newMode = mode === 'login' ? 'register' : 'login';
    setMode(newMode);
    setError('');
  };

  const slideDirection = isRTL ? 1 : -1;

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) resetForm(); onOpenChange(o); }}>
      <DialogContent className="sm:max-w-md p-0 overflow-hidden" dir={isRTL ? 'rtl' : 'ltr'}>
        {/* Success Animation */}
        <AnimatePresence mode="wait">
          {(loginSuccess || registrationSuccess) ? (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="flex flex-col items-center justify-center py-12 px-6"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 200, damping: 15, delay: 0.1 }}
                className="rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 p-4 mb-4 shadow-lg shadow-emerald-200"
              >
                <CheckCircle2 className="h-10 w-10 text-white" />
              </motion.div>
              <motion.h3
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="text-lg font-bold text-gray-900"
              >
                {loginSuccess
                  ? (isRTL ? 'تم تسجيل الدخول بنجاح!' : 'Successfully signed in!')
                  : (isRTL ? 'تم إنشاء الحساب بنجاح!' : 'Account created successfully!')}
              </motion.h3>
              <motion.p
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="text-sm text-gray-500 mt-1"
              >
                {isRTL ? 'جاري التحويل...' : 'Redirecting...'}
              </motion.p>
            </motion.div>
          ) : (
            <motion.div
              key="form"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              {/* Branding Header */}
              <div className="relative bg-gradient-to-br from-red-500 to-red-600 px-6 pt-6 pb-8 overflow-hidden">
                {/* Decorative elements */}
                <div className="absolute top-0 left-0 w-32 h-32 bg-white/5 rounded-full -translate-x-1/2 -translate-y-1/2" />
                <div className="absolute bottom-0 right-0 w-24 h-24 bg-white/5 rounded-full translate-x-1/3 translate-y-1/3" />
                <div className="absolute top-4 right-8 w-3 h-3 bg-white/20 rounded-full" />
                <div className="absolute bottom-6 left-12 w-2 h-2 bg-white/15 rounded-full" />

                <DialogHeader className="relative z-10">
                  <DialogTitle className="text-center">
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.4 }}
                      className="flex flex-col items-center gap-2"
                    >
                      <div className="flex items-center gap-2">
                        <Heart className="h-6 w-6 text-white/90" fill="currentColor" />
                        <span className="text-3xl font-bold text-white tracking-tight">
                          نبض
                        </span>
                      </div>
                      <span className="text-xs text-white/70 font-medium tracking-wider uppercase">Nabd Marketplace</span>
                    </motion.div>
                  </DialogTitle>
                  <DialogDescription className="text-center">
                    <AnimatePresence mode="wait">
                      <motion.p
                        key={mode}
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -5 }}
                        transition={{ duration: 0.2 }}
                        className="text-white/90 text-base font-medium mt-2"
                      >
                        {mode === 'login'
                          ? (isRTL ? 'مرحباً بعودتك' : 'Welcome Back')
                          : (isRTL ? 'أنشئ حسابك' : 'Create Your Account')}
                      </motion.p>
                    </AnimatePresence>
                  </DialogDescription>
                </DialogHeader>
              </div>

              {/* Backend down warning */}
              {isBackendDown && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="mx-4 mt-3"
                >
                  <div className="flex items-center gap-2 rounded-lg bg-amber-50 border border-amber-200 p-3 text-sm text-amber-800">
                    <WifiOff className="h-4 w-4 shrink-0" />
                    <span>
                      {isRTL
                        ? 'الخادم غير متاح، يمكنك تسجيل الدخول بحساب محلي'
                        : 'Server unavailable, you can sign in with a local account'}
                    </span>
                  </div>
                </motion.div>
              )}

              {/* Tab Content with AnimatePresence */}
              <div className="px-6 pb-6 pt-4">
                <AnimatePresence mode="wait">
                  {mode === 'login' ? (
                    <motion.div
                      key="login"
                      initial={{ opacity: 0, x: slideDirection * 30 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: slideDirection * -30 }}
                      transition={{ duration: 0.25, ease: 'easeInOut' }}
                    >
                      <form onSubmit={handleSubmit} className="space-y-4">
                        {/* Email Input */}
                        <div className="space-y-1.5">
                          <Label htmlFor="login-email" className="text-sm font-medium text-gray-700">
                            {isRTL ? 'البريد الإلكتروني' : 'Email'}
                          </Label>
                          <div className="relative">
                            <Mail
                              className={`absolute top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400 transition-colors ${
                                isRTL ? 'right-3' : 'left-3'
                              }`}
                            />
                            <Input
                              id="login-email"
                              type="text"
                              value={username || email}
                              onChange={(e) => {
                                const val = e.target.value;
                                if (val.includes('@')) {
                                  setEmail(val);
                                  setUsername('');
                                } else {
                                  setUsername(val);
                                  setEmail('');
                                }
                              }}
                              placeholder={isRTL ? 'admin أو email@example.com' : 'admin or email@example.com'}
                              className={`${isRTL ? 'pr-10' : 'pl-10'} transition-all focus:ring-2 focus:ring-red-500/20 focus:border-red-500`}
                              autoComplete="username"
                            />
                          </div>
                        </div>

                        {/* Password Input */}
                        <div className="space-y-1.5">
                          <Label htmlFor="login-password" className="text-sm font-medium text-gray-700">
                            {isRTL ? 'كلمة المرور' : 'Password'}
                          </Label>
                          <div className="relative">
                            <Lock
                              className={`absolute top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400 transition-colors ${
                                isRTL ? 'right-3' : 'left-3'
                              }`}
                            />
                            <Input
                              id="login-password"
                              type={showPassword ? 'text' : 'password'}
                              value={password}
                              onChange={(e) => setPassword(e.target.value)}
                              placeholder="••••••••"
                              className={`${isRTL ? 'pr-10' : 'pl-10'} pe-10 transition-all focus:ring-2 focus:ring-red-500/20 focus:border-red-500`}
                              autoComplete="current-password"
                            />
                            <button
                              type="button"
                              onClick={() => setShowPassword(!showPassword)}
                              className={`absolute top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors ${isRTL ? 'left-3' : 'right-3'}`}
                            >
                              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </button>
                          </div>
                        </div>

                        {/* Remember me & Forgot Password */}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Checkbox
                              id="remember"
                              checked={rememberMe}
                              onCheckedChange={(checked) => setRememberMe(checked === true)}
                              className="data-[state=checked]:bg-red-500 data-[state=checked]:border-red-500"
                            />
                            <Label htmlFor="remember" className="text-xs text-gray-600 cursor-pointer">
                              {isRTL ? 'تذكرني' : 'Remember me'}
                            </Label>
                          </div>
                          <button
                            type="button"
                            className="text-xs text-red-500 hover:text-red-600 font-medium transition-colors"
                          >
                            {isRTL ? 'نسيت كلمة المرور؟' : 'Forgot password?'}
                          </button>
                        </div>

                        {/* Error Message */}
                        {error && (
                          <motion.div
                            initial={{ opacity: 0, y: -5, scale: 0.98 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            className={`flex items-center gap-2 rounded-lg p-3 text-sm ${
                              error.includes('غير متاح')
                                ? 'bg-amber-50 border border-amber-200 text-amber-700'
                                : 'bg-red-50 border border-red-200 text-red-600'
                            }`}
                          >
                            {error.includes('غير متاح') ? (
                              <AlertTriangle className="h-4 w-4 shrink-0" />
                            ) : (
                              <AlertTriangle className="h-4 w-4 shrink-0" />
                            )}
                            {error}
                          </motion.div>
                        )}

                        {/* Login Button */}
                        <Button
                          type="submit"
                          className="w-full bg-gradient-to-r from-red-500 to-red-600 text-white hover:from-red-600 hover:to-red-700 shadow-md shadow-red-500/25 transition-all active:scale-[0.98]"
                          disabled={isLoading}
                        >
                          {isLoading ? (
                            <motion.span className="flex items-center gap-2" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                              <Loader2 className="h-4 w-4 animate-spin" />
                              {isRTL ? 'جاري تسجيل الدخول...' : 'Signing in...'}
                            </motion.span>
                          ) : (
                            <span className="flex items-center gap-2">
                              {isRTL ? 'تسجيل الدخول' : 'Sign In'}
                              {isRTL ? <ArrowLeft className="h-4 w-4" /> : <ArrowRight className="h-4 w-4" />}
                            </span>
                          )}
                        </Button>

                        {/* Divider */}
                        <div className="relative my-2">
                          <div className="absolute inset-0 flex items-center">
                            <span className="w-full border-t border-gray-200" />
                          </div>
                          <div className="relative flex justify-center text-xs uppercase">
                            <span className="bg-white px-3 text-gray-400">
                              {isRTL ? 'أو' : 'or'}
                            </span>
                          </div>
                        </div>

                        {/* Google Login */}
                        <button
                          type="button"
                          onClick={() => signIn()}
                          className="w-full flex items-center justify-center gap-3 rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 transition-all hover:bg-gray-50 hover:shadow-sm active:scale-[0.98] disabled:opacity-50"
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

                        {/* Demo Accounts */}
                        <div className="rounded-lg bg-gray-50 border border-gray-100 p-3 space-y-2">
                          <p className="text-xs font-semibold text-gray-500">
                            {isRTL ? 'حسابات للتجربة:' : 'Demo Accounts:'}
                          </p>
                          <div className="space-y-1.5">
                            <button
                              type="button"
                              onClick={() => { setUsername('admin'); setPassword('Admin@2024'); setError(''); }}
                              className="flex items-center justify-between w-full text-xs bg-white rounded-md border border-gray-100 px-2.5 py-1.5 hover:bg-gray-100 transition-colors"
                            >
                              <span className="text-gray-700 font-mono">admin / Admin@2024</span>
                              <span className="rounded bg-red-100 px-1.5 py-0.5 text-[10px] font-medium text-red-700">ADMIN</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => { setUsername('provider-ahmad'); setPassword('Ahmad@2024'); setError(''); }}
                              className="flex items-center justify-between w-full text-xs bg-white rounded-md border border-gray-100 px-2.5 py-1.5 hover:bg-gray-100 transition-colors"
                            >
                              <span className="text-gray-700 font-mono">provider-ahmad / Ahmad@2024</span>
                              <span className="rounded bg-emerald-100 px-1.5 py-0.5 text-[10px] font-medium text-emerald-700">PROVIDER</span>
                            </button>
                          </div>
                        </div>

                        {/* Switch to Register */}
                        <p className="text-center text-sm text-gray-500">
                          {isRTL ? 'ليس لديك حساب؟' : "Don't have an account?"}{' '}
                          <button
                            type="button"
                            onClick={switchMode}
                            className="text-red-500 hover:text-red-600 font-semibold transition-colors"
                          >
                            {isRTL ? 'إنشاء حساب' : 'Sign Up'}
                          </button>
                        </p>
                      </form>
                    </motion.div>
                  ) : (
                    <motion.div
                      key="register"
                      initial={{ opacity: 0, x: slideDirection * -30 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: slideDirection * 30 }}
                      transition={{ duration: 0.25, ease: 'easeInOut' }}
                    >
                      <form onSubmit={handleSubmit} className="space-y-4">
                        {/* Full Name */}
                        <div className="space-y-1.5">
                          <Label htmlFor="register-name" className="text-sm font-medium text-gray-700">
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
                              className={`${isRTL ? 'pr-10' : 'pl-10'} transition-all focus:ring-2 focus:ring-red-500/20 focus:border-red-500`}
                              autoComplete="name"
                            />
                          </div>
                        </div>

                        {/* Email */}
                        <div className="space-y-1.5">
                          <Label htmlFor="register-email" className="text-sm font-medium text-gray-700">
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
                              className={`${isRTL ? 'pr-10' : 'pl-10'} transition-all focus:ring-2 focus:ring-red-500/20 focus:border-red-500`}
                              autoComplete="email"
                            />
                          </div>
                        </div>

                        {/* Phone */}
                        <div className="space-y-1.5">
                          <Label htmlFor="register-phone" className="text-sm font-medium text-gray-700">
                            {isRTL ? 'رقم الهاتف' : 'Phone Number'}
                          </Label>
                          <div className="relative">
                            <Phone
                              className={`absolute top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400 ${
                                isRTL ? 'right-3' : 'left-3'
                              }`}
                            />
                            <Input
                              id="register-phone"
                              type="tel"
                              value={phone}
                              onChange={(e) => setPhone(e.target.value)}
                              placeholder="05XXXXXXXX"
                              dir="ltr"
                              className={`${isRTL ? 'pr-10 text-right' : 'pl-10 text-left'} transition-all focus:ring-2 focus:ring-red-500/20 focus:border-red-500`}
                              autoComplete="tel"
                            />
                          </div>
                        </div>

                        {/* Password with Strength Indicator */}
                        <div className="space-y-1.5">
                          <Label htmlFor="register-password" className="text-sm font-medium text-gray-700">
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
                              className={`${isRTL ? 'pr-10' : 'pl-10'} pe-10 transition-all focus:ring-2 focus:ring-red-500/20 focus:border-red-500`}
                              autoComplete="new-password"
                            />
                            <button
                              type="button"
                              onClick={() => setShowPassword(!showPassword)}
                              className={`absolute top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors ${isRTL ? 'left-3' : 'right-3'}`}
                            >
                              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </button>
                          </div>
                          {/* Password Strength Bar */}
                          {password && (
                            <motion.div
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: 'auto' }}
                              className="space-y-1.5"
                            >
                              <div className="flex gap-1">
                                {[1, 2, 3].map((level) => (
                                  <div
                                    key={level}
                                    className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${
                                      passwordStrength.level >= level
                                        ? passwordStrength.color
                                        : 'bg-gray-200'
                                    }`}
                                  />
                                ))}
                              </div>
                              <p className={`text-xs font-medium ${
                                passwordStrength.level === 1 ? 'text-red-500' :
                                passwordStrength.level === 2 ? 'text-amber-500' :
                                'text-emerald-500'
                              }`}>
                                {isRTL ? passwordStrength.label : passwordStrength.labelEn}
                              </p>
                            </motion.div>
                          )}
                        </div>

                        {/* Confirm Password */}
                        <div className="space-y-1.5">
                          <Label htmlFor="register-confirm-password" className="text-sm font-medium text-gray-700">
                            {isRTL ? 'تأكيد كلمة المرور' : 'Confirm Password'} <span className="text-red-500">*</span>
                          </Label>
                          <div className="relative">
                            <Lock
                              className={`absolute top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400 ${
                                isRTL ? 'right-3' : 'left-3'
                              }`}
                            />
                            <Input
                              id="register-confirm-password"
                              type={showConfirmPassword ? 'text' : 'password'}
                              value={confirmPassword}
                              onChange={(e) => setConfirmPassword(e.target.value)}
                              placeholder="••••••••"
                              className={`${isRTL ? 'pr-10' : 'pl-10'} pe-10 transition-all focus:ring-2 focus:ring-red-500/20 focus:border-red-500 ${
                                confirmPassword && confirmPassword !== password ? 'border-red-300 focus:border-red-500' : ''
                              }`}
                              autoComplete="new-password"
                            />
                            <button
                              type="button"
                              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                              className={`absolute top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors ${isRTL ? 'left-3' : 'right-3'}`}
                            >
                              {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </button>
                          </div>
                          {confirmPassword && confirmPassword !== password && (
                            <motion.p
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              className="text-xs text-red-500 flex items-center gap-1"
                            >
                              <AlertTriangle className="h-3 w-3" />
                              {isRTL ? 'كلمتا المرور غير متطابقتين' : 'Passwords do not match'}
                            </motion.p>
                          )}
                        </div>

                        {/* Account Type Toggle */}
                        <div className="space-y-1.5">
                          <Label className="text-sm font-medium text-gray-700">
                            {isRTL ? 'نوع الحساب' : 'Account Type'} <span className="text-red-500">*</span>
                          </Label>
                          <div className="grid grid-cols-2 gap-2">
                            <button
                              type="button"
                              onClick={() => setRole('CONSUMER')}
                              className={`relative rounded-xl border-2 p-3 text-center transition-all duration-200 overflow-hidden ${
                                role === 'CONSUMER'
                                  ? 'border-red-500 bg-red-50 shadow-sm shadow-red-500/10'
                                  : 'border-gray-200 bg-white hover:border-gray-300'
                              }`}
                            >
                              <User className={`h-5 w-5 mx-auto mb-1 ${role === 'CONSUMER' ? 'text-red-500' : 'text-gray-400'}`} />
                              <span className={`text-sm font-medium ${role === 'CONSUMER' ? 'text-red-700' : 'text-gray-600'}`}>
                                {isRTL ? 'مستهلك' : 'Consumer'}
                              </span>
                              {role === 'CONSUMER' && (
                                <motion.div
                                  layoutId="accountTypeIndicator"
                                  className="absolute top-1.5 right-1.5"
                                  transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                                >
                                  <CheckCircle2 className="h-4 w-4 text-red-500" />
                                </motion.div>
                              )}
                            </button>
                            <button
                              type="button"
                              onClick={() => setRole('PROVIDER')}
                              className={`relative rounded-xl border-2 p-3 text-center transition-all duration-200 overflow-hidden ${
                                role === 'PROVIDER'
                                  ? 'border-red-500 bg-red-50 shadow-sm shadow-red-500/10'
                                  : 'border-gray-200 bg-white hover:border-gray-300'
                              }`}
                            >
                              <Store className={`h-5 w-5 mx-auto mb-1 ${role === 'PROVIDER' ? 'text-red-500' : 'text-gray-400'}`} />
                              <span className={`text-sm font-medium ${role === 'PROVIDER' ? 'text-red-700' : 'text-gray-600'}`}>
                                {isRTL ? 'مزود خدمة' : 'Provider'}
                              </span>
                              {role === 'PROVIDER' && (
                                <motion.div
                                  layoutId="accountTypeIndicator"
                                  className="absolute top-1.5 right-1.5"
                                  transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                                >
                                  <CheckCircle2 className="h-4 w-4 text-red-500" />
                                </motion.div>
                              )}
                            </button>
                          </div>
                        </div>

                        {/* Terms & Conditions */}
                        <div className="flex items-start gap-2">
                          <Checkbox
                            id="terms"
                            checked={agreedToTerms}
                            onCheckedChange={(checked) => setAgreedToTerms(checked === true)}
                            className="mt-0.5 data-[state=checked]:bg-red-500 data-[state=checked]:border-red-500"
                          />
                          <Label htmlFor="terms" className="text-xs text-gray-600 leading-relaxed cursor-pointer">
                            {isRTL ? (
                              <>أوافق على <span className="text-red-500 font-medium">الشروط والأحكام</span> و<span className="text-red-500 font-medium">سياسة الخصوصية</span></>
                            ) : (
                              <>I agree to the <span className="text-red-500 font-medium">Terms & Conditions</span> and <span className="text-red-500 font-medium">Privacy Policy</span></>
                            )}
                          </Label>
                        </div>

                        {/* Error Message */}
                        {error && (
                          <motion.div
                            initial={{ opacity: 0, y: -5, scale: 0.98 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            className={`flex items-center gap-2 rounded-lg p-3 text-sm ${
                              error.includes('غير متاح')
                                ? 'bg-amber-50 border border-amber-200 text-amber-700'
                                : 'bg-red-50 border border-red-200 text-red-600'
                            }`}
                          >
                            <AlertTriangle className="h-4 w-4 shrink-0" />
                            {error}
                          </motion.div>
                        )}

                        {/* Register Button */}
                        <Button
                          type="submit"
                          className="w-full bg-gradient-to-r from-red-500 to-red-600 text-white hover:from-red-600 hover:to-red-700 shadow-md shadow-red-500/25 transition-all active:scale-[0.98]"
                          disabled={isLoading}
                        >
                          {isLoading ? (
                            <motion.span className="flex items-center gap-2" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                              <Loader2 className="h-4 w-4 animate-spin" />
                              {isRTL ? 'جاري إنشاء الحساب...' : 'Creating account...'}
                            </motion.span>
                          ) : (
                            <span className="flex items-center gap-2">
                              {isRTL ? 'إنشاء حساب' : 'Create Account'}
                              {isRTL ? <ArrowLeft className="h-4 w-4" /> : <ArrowRight className="h-4 w-4" />}
                            </span>
                          )}
                        </Button>

                        {/* Switch to Login */}
                        <p className="text-center text-sm text-gray-500">
                          {isRTL ? 'لديك حساب بالفعل؟' : 'Already have an account?'}{' '}
                          <button
                            type="button"
                            onClick={switchMode}
                            className="text-red-500 hover:text-red-600 font-semibold transition-colors"
                          >
                            {isRTL ? 'تسجيل الدخول' : 'Sign In'}
                          </button>
                        </p>
                      </form>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  );
}
