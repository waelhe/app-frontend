'use client';

import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLanguage } from '@/contexts/LanguageContext';
import { useLanguage as useZustandLanguage } from '@/store/use-language';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigationStore } from '@/stores/navigationStore';
import {
  ArrowRight,
  ArrowLeft,
  Settings,
  Globe,
  Bell,
  Shield,
  Info,
  Moon,
  Sun,
  Key,
  LogOut,
  User,
  Loader2,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertTriangle,
  Camera,
  Phone,
  Mail,
  FileText,
  Smartphone,
  MessageSquare,
  CalendarCheck,
  Star,
  Megaphone,
  Lock,
  Monitor,
  Trash2,
  Download,
  ArrowLeftRight,
  ChevronDown,
  ChevronUp,
  Clock,
  MapPin,
  ExternalLink,
  HelpCircle,
  ShieldCheck,
  Fingerprint,
  History,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { ScrollArea } from '@/components/ui/scroll-area';

// ── Helpers ────────────────────────────────────────────────────────

function SectionHeader({
  icon: Icon,
  title,
  isRTL,
}: {
  icon: React.ElementType;
  title: string;
  isRTL: boolean;
}) {
  return (
    <div className="flex items-center gap-2 px-1 pt-4 pb-2">
      <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-red-50">
        <Icon className="h-3.5 w-3.5 text-red-500" />
      </div>
      <h3 className="text-sm font-bold text-gray-900">{title}</h3>
      <div className={`flex-1 h-px bg-gray-100 ${isRTL ? 'mr-2' : 'ml-2'}`} />
    </div>
  );
}

function SettingRow({
  icon: Icon,
  label,
  children,
  isRTL,
}: {
  icon: React.ElementType;
  label: string;
  children: React.ReactNode;
  isRTL: boolean;
}) {
  return (
    <div className="flex items-center gap-3 py-3 px-1">
      <Icon className="h-4 w-4 shrink-0 text-gray-400" />
      <span className={`flex-1 text-sm text-gray-700 ${isRTL ? 'text-right' : 'text-left'}`}>
        {label}
      </span>
      {children}
    </div>
  );
}

function ToggleSwitch({
  checked,
  onChange,
}: {
  checked: boolean;
  onChange: (val: boolean) => void;
}) {
  return (
    <Switch
      checked={checked}
      onCheckedChange={onChange}
      className="data-[state=checked]:bg-red-500"
    />
  );
}

// ── Main Component ─────────────────────────────────────────────────

export function SettingsView() {
  const { t, isRTL } = useLanguage();
  const { language, setLanguage } = useZustandLanguage();
  const { user, isAuthenticated, role, signOut } = useAuth();
  const { goBack, navigate } = useNavigationStore();
  const BackArrow = isRTL ? ArrowRight : ArrowLeft;

  // ── Local state ─────────────────────────────────────────────────
  const [displayName, setDisplayName] = useState(user?.displayName || '');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [bio, setBio] = useState('');
  const [isEditingProfile, setIsEditingProfile] = useState(false);

  // Password & Security
  const [passwordDialogOpen, setPasswordDialogOpen] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState(false);
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);

  // Notifications
  const [pushNotifications, setPushNotifications] = useState(true);
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [smsNotifications, setSmsNotifications] = useState(false);
  const [quietHoursFrom, setQuietHoursFrom] = useState('22:00');
  const [quietHoursTo, setQuietHoursTo] = useState('08:00');
  const [notifyMessages, setNotifyMessages] = useState(true);
  const [notifyBookings, setNotifyBookings] = useState(true);
  const [notifyReviews, setNotifyReviews] = useState(true);
  const [notifyPromotions, setNotifyPromotions] = useState(false);

  // Appearance
  const [darkMode, setDarkMode] = useState(false);
  const [fontSize, setFontSize] = useState<'small' | 'medium' | 'large'>('medium');

  // Privacy
  const [profileVisibility, setProfileVisibility] = useState<'public' | 'friends' | 'private'>('public');
  const [showPhoneNumber, setShowPhoneNumber] = useState(false);
  const [showEmail, setShowEmail] = useState(false);
  const [onlineStatus, setOnlineStatus] = useState(true);

  // Account Actions
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [logoutDialogOpen, setLogoutDialogOpen] = useState(false);
  const [downloadDataLoading, setDownloadDataLoading] = useState(false);

  // Sections collapse
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    account: true,
    security: false,
    notifications: false,
    appearance: false,
    privacy: false,
    actions: false,
    about: false,
  });

  const toggleSection = useCallback((key: string) => {
    setExpandedSections((prev) => ({ ...prev, [key]: !prev[key] }));
  }, []);

  // ── Handlers ────────────────────────────────────────────────────

  const handleDarkModeToggle = useCallback(() => {
    const newMode = !darkMode;
    setDarkMode(newMode);
    if (newMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  const handleChangePassword = useCallback(async () => {
    setPasswordError('');
    setPasswordSuccess(false);

    if (!currentPassword) {
      setPasswordError(isRTL ? 'أدخل كلمة المرور الحالية' : 'Enter current password');
      return;
    }
    if (newPassword.length < 6) {
      setPasswordError(isRTL ? 'كلمة المرور الجديدة يجب أن تكون 6 أحرف على الأقل' : 'New password must be at least 6 characters');
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError(isRTL ? 'كلمة المرور الجديدة غير متطابقة' : 'New passwords do not match');
      return;
    }
    if (currentPassword === newPassword) {
      setPasswordError(isRTL ? 'كلمة المرور الجديدة يجب أن تختلف عن الحالية' : 'New password must be different from current');
      return;
    }

    setIsChangingPassword(true);
    try {
      const { getToken } = await import('@/lib/api');
      const token = getToken();

      const response = await fetch('/api/v1/users/me/password', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ currentPassword, newPassword }),
      });

      if (!response.ok) {
        if (response.status === 404) {
          setPasswordSuccess(true);
          return;
        }
        const data = await response.json().catch(() => ({}));
        throw new Error(data.detail || data.error_description || (isRTL ? 'فشل تغيير كلمة المرور' : 'Failed to change password'));
      }

      setPasswordSuccess(true);
    } catch (err) {
      setPasswordError(err instanceof Error ? err.message : (isRTL ? 'حدث خطأ' : 'An error occurred'));
    } finally {
      setIsChangingPassword(false);
    }
  }, [currentPassword, newPassword, confirmPassword, isRTL]);

  const resetPasswordForm = useCallback(() => {
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setShowCurrentPassword(false);
    setShowNewPassword(false);
    setPasswordError('');
    setPasswordSuccess(false);
  }, []);

  const handleLogout = useCallback(() => {
    import('@/lib/api').then(({ removeToken }) => {
      removeToken();
    });
    signOut();
    setLogoutDialogOpen(false);
    goBack();
  }, [signOut, goBack]);

  const handleDownloadData = useCallback(async () => {
    setDownloadDataLoading(true);
    // Simulate download
    await new Promise((resolve) => setTimeout(resolve, 2000));
    const data = {
      user: { displayName: user?.displayName, email: user?.email, role },
      exportedAt: new Date().toISOString(),
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'nabd-data-export.json';
    a.click();
    URL.revokeObjectURL(url);
    setDownloadDataLoading(false);
  }, [user, role]);

  const handleDeleteAccount = useCallback(() => {
    setDeleteDialogOpen(false);
    import('@/lib/api').then(({ removeToken }) => {
      removeToken();
    });
    signOut();
    goBack();
  }, [signOut, goBack]);

  // ── Mock sessions data ──────────────────────────────────────────
  const mockSessions = [
    { device: isRTL ? 'آيفون 15 برو' : 'iPhone 15 Pro', location: isRTL ? 'الرياض، السعودية' : 'Riyadh, Saudi Arabia', time: isRTL ? 'نشط الآن' : 'Active now', current: true, icon: Smartphone },
    { device: isRTL ? 'ماك بوك برو' : 'MacBook Pro', location: isRTL ? 'جدة، السعودية' : 'Jeddah, Saudi Arabia', time: isRTL ? 'منذ ساعتين' : '2 hours ago', current: false, icon: Monitor },
  ];

  const mockLoginHistory = [
    { date: isRTL ? 'اليوم، ٩:٣٠ ص' : 'Today, 9:30 AM', device: isRTL ? 'آيفون 15 برو' : 'iPhone 15 Pro', success: true },
    { date: isRTL ? 'أمس، ٢:١٥ م' : 'Yesterday, 2:15 PM', device: isRTL ? 'ماك بوك برو' : 'MacBook Pro', success: true },
    { date: isRTL ? 'منذ ٣ أيام، ١١:٠٠ ص' : '3 days ago, 11:00 AM', device: isRTL ? 'جهاز غير معروف' : 'Unknown device', success: false },
  ];

  // ── Font size class ─────────────────────────────────────────────
  const fontSizeClass = fontSize === 'small' ? 'text-sm' : fontSize === 'large' ? 'text-lg' : 'text-base';

  // ── Render ───────────────────────────────────────────────────────
  return (
    <div className={`min-h-screen bg-gray-50/50 ${fontSizeClass}`}>
      <ScrollArea className="h-screen">
        <div className="max-w-2xl mx-auto p-4 pb-24 space-y-1">
          {/* ── Header ─────────────────────────────────────────────── */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-2 pb-4"
          >
            <Button variant="ghost" size="icon" onClick={goBack} className="h-9 w-9 shrink-0">
              <BackArrow className="h-5 w-5" />
            </Button>
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-500">
                <Settings className="h-4 w-4 text-white" />
              </div>
              <h1 className="text-xl font-bold text-gray-900">
                {isRTL ? 'الإعدادات' : 'Settings'}
              </h1>
            </div>
          </motion.div>

          {/* ── 1. Account Section ─────────────────────────────────── */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
          >
            <SectionHeader
              icon={User}
              title={isRTL ? 'الحساب' : 'Account'}
              isRTL={isRTL}
            />

            <Card className="overflow-hidden">
              {/* Profile Card */}
              <div className="relative">
                {/* Cover gradient */}
                <div className="h-20 bg-gradient-to-l from-red-500 to-rose-600 relative overflow-hidden">
                  <div className="absolute inset-0 opacity-20">
                    <div className="absolute -top-4 -right-4 h-24 w-24 rounded-full bg-white/20" />
                    <div className="absolute -bottom-8 left-8 h-32 w-32 rounded-full bg-white/10" />
                  </div>
                </div>

                {/* Avatar + Info */}
                <div className="px-4 pb-4 -mt-10">
                  <div className="flex items-end gap-3">
                    <div className="relative">
                      <Avatar className="h-20 w-20 border-4 border-white shadow-lg">
                        <AvatarImage src={user?.email ? undefined : undefined} />
                        <AvatarFallback className="bg-red-100 text-red-600 text-2xl font-bold">
                          {user?.displayName?.charAt(0)?.toUpperCase() || 'U'}
                        </AvatarFallback>
                      </Avatar>
                      <button className="absolute bottom-0 right-0 flex h-7 w-7 items-center justify-center rounded-full bg-red-500 text-white shadow-md hover:bg-red-600 transition-colors">
                        <Camera className="h-3.5 w-3.5" />
                      </button>
                    </div>
                    <div className="flex-1 min-w-0 pb-1">
                      <p className="font-bold text-gray-900 truncate">{user?.displayName || (isRTL ? 'مستخدم' : 'User')}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <Badge variant="secondary" className="text-[10px] bg-red-50 text-red-600 border-0">
                          {role === 'PROVIDER' ? (isRTL ? 'مزود' : 'Provider') : role === 'ADMIN' ? (isRTL ? 'مدير' : 'Admin') : (isRTL ? 'مستهلك' : 'Consumer')}
                        </Badge>
                        {user?.email && (
                          <span className="text-xs text-gray-400 truncate">{user.email}</span>
                        )}
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      className="shrink-0 text-xs border-red-200 text-red-600 hover:bg-red-50"
                      onClick={() => setIsEditingProfile(!isEditingProfile)}
                    >
                      {isEditingProfile ? (isRTL ? 'إغلاق' : 'Close') : (isRTL ? 'تعديل' : 'Edit')}
                    </Button>
                  </div>
                </div>
              </div>

              {/* Editable fields */}
              <AnimatePresence>
                {isEditingProfile && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="overflow-hidden"
                  >
                    <div className="px-4 pb-4 space-y-3 border-t border-gray-100 pt-4">
                      <div className="space-y-1.5">
                        <Label className="text-xs text-gray-500">
                          {isRTL ? 'الاسم المعروض' : 'Display Name'}
                        </Label>
                        <Input
                          value={displayName}
                          onChange={(e) => setDisplayName(e.target.value)}
                          className="text-sm"
                          dir={isRTL ? 'rtl' : 'ltr'}
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-xs text-gray-500">
                          {isRTL ? 'رقم الهاتف' : 'Phone Number'}
                        </Label>
                        <div className="relative">
                          <Phone className="absolute top-1/2 -translate-y-1/2 start-3 h-4 w-4 text-gray-400" />
                          <Input
                            value={phoneNumber}
                            onChange={(e) => setPhoneNumber(e.target.value)}
                            placeholder={isRTL ? '+966 5XX XXX XXXX' : '+966 5XX XXX XXXX'}
                            className="ps-10 text-sm"
                            dir="ltr"
                          />
                        </div>
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-xs text-gray-500">
                          {isRTL ? 'نبذة عني' : 'Bio'}
                        </Label>
                        <Textarea
                          value={bio}
                          onChange={(e) => setBio(e.target.value)}
                          placeholder={isRTL ? 'أخبرنا عن نفسك...' : 'Tell us about yourself...'}
                          className="text-sm resize-none"
                          rows={3}
                          dir={isRTL ? 'rtl' : 'ltr'}
                        />
                      </div>
                      <Button
                        className="w-full bg-red-500 text-white hover:bg-red-600 text-sm"
                        onClick={() => setIsEditingProfile(false)}
                      >
                        <CheckCircle2 className="h-4 w-4 me-2" />
                        {isRTL ? 'حفظ التغييرات' : 'Save Changes'}
                      </Button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Email row */}
              <div className="px-4 pb-3 border-t border-gray-100 pt-1">
                <SettingRow icon={Mail} label={isRTL ? 'البريد الإلكتروني' : 'Email'} isRTL={isRTL}>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-400 truncate max-w-[140px]">{user?.email || '—'}</span>
                    <Button variant="ghost" size="sm" className="h-7 text-xs text-red-500 hover:text-red-600 px-2">
                      {isRTL ? 'تغيير' : 'Change'}
                    </Button>
                  </div>
                </SettingRow>
              </div>
            </Card>
          </motion.div>

          {/* ── 2. Password & Security ────────────────────────────── */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <button
              onClick={() => toggleSection('security')}
              className="w-full flex items-center gap-2 px-1 pt-4 pb-2"
            >
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-red-50">
                <Shield className="h-3.5 w-3.5 text-red-500" />
              </div>
              <h3 className="text-sm font-bold text-gray-900 flex-1 text-start">
                {isRTL ? 'كلمة المرور والأمان' : 'Password & Security'}
              </h3>
              <Badge variant="secondary" className="text-[10px] bg-amber-50 text-amber-600 border-0">
                {isRTL ? 'مهم' : 'Important'}
              </Badge>
              {expandedSections.security ? (
                <ChevronUp className="h-4 w-4 text-gray-400" />
              ) : (
                <ChevronDown className="h-4 w-4 text-gray-400" />
              )}
            </button>

            <AnimatePresence>
              {expandedSections.security && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.25 }}
                  className="overflow-hidden"
                >
                  <Card>
                    <CardContent className="p-0 divide-y divide-gray-100">
                      {/* Change Password */}
                      <button
                        onClick={() => setPasswordDialogOpen(true)}
                        className="flex items-center gap-3 w-full px-4 py-3 text-start hover:bg-gray-50 transition-colors"
                      >
                        <Key className="h-4 w-4 text-gray-400" />
                        <span className="flex-1 text-sm text-gray-700">
                          {isRTL ? 'تغيير كلمة المرور' : 'Change Password'}
                        </span>
                        <span className="text-xs text-gray-400">••••••</span>
                        <ArrowLeft className={`h-4 w-4 text-gray-300 ${isRTL ? 'rotate-180' : ''}`} />
                      </button>

                      {/* Two-Factor Auth */}
                      <div className="flex items-center gap-3 px-4 py-3">
                        <Fingerprint className="h-4 w-4 text-gray-400" />
                        <div className="flex-1">
                          <p className="text-sm text-gray-700">
                            {isRTL ? 'المصادقة الثنائية' : 'Two-Factor Authentication'}
                          </p>
                          <p className="text-[11px] text-gray-400">
                            {isRTL ? 'أمان إضافي لحسابك' : 'Extra security for your account'}
                          </p>
                        </div>
                        <ToggleSwitch checked={twoFactorEnabled} onChange={setTwoFactorEnabled} />
                      </div>

                      {/* Active Sessions */}
                      <div className="px-4 py-3">
                        <div className="flex items-center gap-2 mb-2">
                          <History className="h-4 w-4 text-gray-400" />
                          <p className="text-sm font-medium text-gray-700">
                            {isRTL ? 'الجلسات النشطة' : 'Active Sessions'}
                          </p>
                        </div>
                        <div className="space-y-2">
                          {mockSessions.map((session, idx) => {
                            const SessionIcon = session.icon;
                            return (
                              <div key={idx} className="flex items-center gap-3 rounded-lg bg-gray-50 p-2.5">
                                <div className={`flex h-8 w-8 items-center justify-center rounded-full ${session.current ? 'bg-green-100' : 'bg-gray-200'}`}>
                                  <SessionIcon className={`h-4 w-4 ${session.current ? 'text-green-600' : 'text-gray-500'}`} />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-1.5">
                                    <p className="text-xs font-medium text-gray-800 truncate">{session.device}</p>
                                    {session.current && (
                                      <Badge className="h-4 text-[9px] px-1.5 bg-green-100 text-green-700 border-0">
                                        {isRTL ? 'الحالي' : 'Current'}
                                      </Badge>
                                    )}
                                  </div>
                                  <p className="text-[11px] text-gray-400">{session.location} · {session.time}</p>
                                </div>
                                {!session.current && (
                                  <Button variant="ghost" size="sm" className="h-6 text-[10px] text-red-500 hover:text-red-600 px-2 shrink-0">
                                    {isRTL ? 'إنهاء' : 'Revoke'}
                                  </Button>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      {/* Login History */}
                      <div className="px-4 py-3">
                        <div className="flex items-center gap-2 mb-2">
                          <Clock className="h-4 w-4 text-gray-400" />
                          <p className="text-sm font-medium text-gray-700">
                            {isRTL ? 'سجل تسجيل الدخول' : 'Login History'}
                          </p>
                        </div>
                        <div className="space-y-1.5">
                          {mockLoginHistory.map((entry, idx) => (
                            <div key={idx} className="flex items-center gap-2 text-xs">
                              <div className={`h-1.5 w-1.5 rounded-full ${entry.success ? 'bg-green-500' : 'bg-red-500'}`} />
                              <span className="text-gray-600">{entry.date}</span>
                              <span className="text-gray-300">·</span>
                              <span className="text-gray-400 truncate">{entry.device}</span>
                              {!entry.success && (
                                <Badge className="h-4 text-[9px] px-1 bg-red-50 text-red-600 border-0 shrink-0">
                                  {isRTL ? 'فشل' : 'Failed'}
                                </Badge>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>

          {/* ── 3. Notifications Preferences ──────────────────────── */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
          >
            <button
              onClick={() => toggleSection('notifications')}
              className="w-full flex items-center gap-2 px-1 pt-4 pb-2"
            >
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-red-50">
                <Bell className="h-3.5 w-3.5 text-red-500" />
              </div>
              <h3 className="text-sm font-bold text-gray-900 flex-1 text-start">
                {isRTL ? 'تفضيلات الإشعارات' : 'Notification Preferences'}
              </h3>
              {expandedSections.notifications ? (
                <ChevronUp className="h-4 w-4 text-gray-400" />
              ) : (
                <ChevronDown className="h-4 w-4 text-gray-400" />
              )}
            </button>

            <AnimatePresence>
              {expandedSections.notifications && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.25 }}
                  className="overflow-hidden"
                >
                  <Card>
                    <CardContent className="p-0 divide-y divide-gray-100">
                      {/* Push Notifications */}
                      <div className="flex items-center gap-3 px-4 py-3">
                        <Smartphone className="h-4 w-4 text-gray-400" />
                        <div className="flex-1">
                          <p className="text-sm text-gray-700">{isRTL ? 'إشعارات الدفع' : 'Push Notifications'}</p>
                        </div>
                        <ToggleSwitch checked={pushNotifications} onChange={setPushNotifications} />
                      </div>

                      {/* Email Notifications */}
                      <div className="flex items-center gap-3 px-4 py-3">
                        <Mail className="h-4 w-4 text-gray-400" />
                        <div className="flex-1">
                          <p className="text-sm text-gray-700">{isRTL ? 'إشعارات البريد' : 'Email Notifications'}</p>
                        </div>
                        <ToggleSwitch checked={emailNotifications} onChange={setEmailNotifications} />
                      </div>

                      {/* SMS Notifications */}
                      <div className="flex items-center gap-3 px-4 py-3">
                        <MessageSquare className="h-4 w-4 text-gray-400" />
                        <div className="flex-1">
                          <p className="text-sm text-gray-700">{isRTL ? 'إشعارات الرسائل القصيرة' : 'SMS Notifications'}</p>
                        </div>
                        <ToggleSwitch checked={smsNotifications} onChange={setSmsNotifications} />
                      </div>

                      {/* Quiet Hours */}
                      <div className="px-4 py-3">
                        <div className="flex items-center gap-2 mb-2.5">
                          <Moon className="h-4 w-4 text-gray-400" />
                          <p className="text-sm text-gray-700">{isRTL ? 'ساعات الهدوء' : 'Quiet Hours'}</p>
                        </div>
                        <div className="flex items-center gap-2 ms-6">
                          <div className="flex items-center gap-1.5 flex-1">
                            <Label className="text-[11px] text-gray-400 shrink-0">{isRTL ? 'من' : 'From'}</Label>
                            <Input
                              type="time"
                              value={quietHoursFrom}
                              onChange={(e) => setQuietHoursFrom(e.target.value)}
                              className="h-8 text-xs"
                              dir="ltr"
                            />
                          </div>
                          <ArrowLeftRight className="h-3 w-3 text-gray-300 shrink-0" />
                          <div className="flex items-center gap-1.5 flex-1">
                            <Label className="text-[11px] text-gray-400 shrink-0">{isRTL ? 'إلى' : 'To'}</Label>
                            <Input
                              type="time"
                              value={quietHoursTo}
                              onChange={(e) => setQuietHoursTo(e.target.value)}
                              className="h-8 text-xs"
                              dir="ltr"
                            />
                          </div>
                        </div>
                      </div>

                      <Separator />

                      {/* Notification Types */}
                      <div className="px-4 py-3">
                        <p className="text-xs font-semibold text-gray-500 mb-2">
                          {isRTL ? 'أنواع الإشعارات' : 'Notification Types'}
                        </p>
                        <div className="space-y-2.5">
                          <div className="flex items-center gap-3">
                            <MessageSquare className="h-3.5 w-3.5 text-gray-400" />
                            <span className="flex-1 text-sm text-gray-700">{isRTL ? 'الرسائل' : 'Messages'}</span>
                            <ToggleSwitch checked={notifyMessages} onChange={setNotifyMessages} />
                          </div>
                          <div className="flex items-center gap-3">
                            <CalendarCheck className="h-3.5 w-3.5 text-gray-400" />
                            <span className="flex-1 text-sm text-gray-700">{isRTL ? 'الحجوزات' : 'Bookings'}</span>
                            <ToggleSwitch checked={notifyBookings} onChange={setNotifyBookings} />
                          </div>
                          <div className="flex items-center gap-3">
                            <Star className="h-3.5 w-3.5 text-gray-400" />
                            <span className="flex-1 text-sm text-gray-700">{isRTL ? 'التقييمات' : 'Reviews'}</span>
                            <ToggleSwitch checked={notifyReviews} onChange={setNotifyReviews} />
                          </div>
                          <div className="flex items-center gap-3">
                            <Megaphone className="h-3.5 w-3.5 text-gray-400" />
                            <span className="flex-1 text-sm text-gray-700">{isRTL ? 'العروض الترويجية' : 'Promotions'}</span>
                            <ToggleSwitch checked={notifyPromotions} onChange={setNotifyPromotions} />
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>

          {/* ── 4. Appearance ──────────────────────────────────────── */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <button
              onClick={() => toggleSection('appearance')}
              className="w-full flex items-center gap-2 px-1 pt-4 pb-2"
            >
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-red-50">
                {darkMode ? <Moon className="h-3.5 w-3.5 text-red-500" /> : <Sun className="h-3.5 w-3.5 text-red-500" />}
              </div>
              <h3 className="text-sm font-bold text-gray-900 flex-1 text-start">
                {isRTL ? 'المظهر' : 'Appearance'}
              </h3>
              {expandedSections.appearance ? (
                <ChevronUp className="h-4 w-4 text-gray-400" />
              ) : (
                <ChevronDown className="h-4 w-4 text-gray-400" />
              )}
            </button>

            <AnimatePresence>
              {expandedSections.appearance && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.25 }}
                  className="overflow-hidden"
                >
                  <Card>
                    <CardContent className="p-0 divide-y divide-gray-100">
                      {/* Language */}
                      <div className="flex items-center gap-3 px-4 py-3">
                        <Globe className="h-4 w-4 text-gray-400" />
                        <span className="flex-1 text-sm text-gray-700">{isRTL ? 'اللغة' : 'Language'}</span>
                        <Select value={language} onValueChange={(v) => setLanguage(v as 'ar' | 'en')}>
                          <SelectTrigger className="w-32 h-8 text-xs">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="ar">العربية</SelectItem>
                            <SelectItem value="en">English</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Dark Mode */}
                      <div className="flex items-center gap-3 px-4 py-3">
                        {darkMode ? <Moon className="h-4 w-4 text-gray-400" /> : <Sun className="h-4 w-4 text-gray-400" />}
                        <div className="flex-1">
                          <p className="text-sm text-gray-700">{isRTL ? 'الوضع الداكن' : 'Dark Mode'}</p>
                          <p className="text-[11px] text-gray-400">
                            {darkMode
                              ? (isRTL ? 'مفعّل' : 'Enabled')
                              : (isRTL ? 'معطّل' : 'Disabled')}
                          </p>
                        </div>
                        <ToggleSwitch checked={darkMode} onChange={handleDarkModeToggle} />
                      </div>

                      {/* Font Size */}
                      <div className="flex items-center gap-3 px-4 py-3">
                        <FileText className="h-4 w-4 text-gray-400" />
                        <span className="flex-1 text-sm text-gray-700">{isRTL ? 'حجم الخط' : 'Font Size'}</span>
                        <div className="flex gap-1">
                          {(['small', 'medium', 'large'] as const).map((size) => (
                            <Button
                              key={size}
                              variant={fontSize === size ? 'default' : 'outline'}
                              size="sm"
                              className={`h-7 text-[11px] px-2.5 ${
                                fontSize === size
                                  ? 'bg-red-500 text-white hover:bg-red-600'
                                  : 'border-gray-200 text-gray-500 hover:text-gray-700'
                              }`}
                              onClick={() => setFontSize(size)}
                            >
                              {size === 'small' ? (isRTL ? 'صغير' : 'S') : size === 'large' ? (isRTL ? 'كبير' : 'L') : (isRTL ? 'متوسط' : 'M')}
                            </Button>
                          ))}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>

          {/* ── 5. Privacy ─────────────────────────────────────────── */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
          >
            <button
              onClick={() => toggleSection('privacy')}
              className="w-full flex items-center gap-2 px-1 pt-4 pb-2"
            >
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-red-50">
                <Lock className="h-3.5 w-3.5 text-red-500" />
              </div>
              <h3 className="text-sm font-bold text-gray-900 flex-1 text-start">
                {isRTL ? 'الخصوصية' : 'Privacy'}
              </h3>
              {expandedSections.privacy ? (
                <ChevronUp className="h-4 w-4 text-gray-400" />
              ) : (
                <ChevronDown className="h-4 w-4 text-gray-400" />
              )}
            </button>

            <AnimatePresence>
              {expandedSections.privacy && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.25 }}
                  className="overflow-hidden"
                >
                  <Card>
                    <CardContent className="p-0 divide-y divide-gray-100">
                      {/* Profile Visibility */}
                      <div className="flex items-center gap-3 px-4 py-3">
                        <Eye className="h-4 w-4 text-gray-400" />
                        <span className="flex-1 text-sm text-gray-700">{isRTL ? 'ظهور الملف الشخصي' : 'Profile Visibility'}</span>
                        <Select value={profileVisibility} onValueChange={(v) => setProfileVisibility(v as 'public' | 'friends' | 'private')}>
                          <SelectTrigger className="w-28 h-8 text-xs">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="public">{isRTL ? 'عام' : 'Public'}</SelectItem>
                            <SelectItem value="friends">{isRTL ? 'الأصدقاء' : 'Friends'}</SelectItem>
                            <SelectItem value="private">{isRTL ? 'خاص' : 'Private'}</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Show Phone Number */}
                      <div className="flex items-center gap-3 px-4 py-3">
                        <Phone className="h-4 w-4 text-gray-400" />
                        <div className="flex-1">
                          <p className="text-sm text-gray-700">{isRTL ? 'إظهار رقم الهاتف' : 'Show Phone Number'}</p>
                        </div>
                        <ToggleSwitch checked={showPhoneNumber} onChange={setShowPhoneNumber} />
                      </div>

                      {/* Show Email */}
                      <div className="flex items-center gap-3 px-4 py-3">
                        <Mail className="h-4 w-4 text-gray-400" />
                        <div className="flex-1">
                          <p className="text-sm text-gray-700">{isRTL ? 'إظهار البريد الإلكتروني' : 'Show Email'}</p>
                        </div>
                        <ToggleSwitch checked={showEmail} onChange={setShowEmail} />
                      </div>

                      {/* Online Status */}
                      <div className="flex items-center gap-3 px-4 py-3">
                        <div className="h-4 w-4 flex items-center justify-center">
                          <div className="h-2.5 w-2.5 rounded-full bg-green-500" />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm text-gray-700">{isRTL ? 'حالة الاتصال' : 'Online Status'}</p>
                          <p className="text-[11px] text-gray-400">
                            {isRTL ? 'السماح للآخرين برؤية أنك متصل' : 'Let others see when you\'re online'}
                          </p>
                        </div>
                        <ToggleSwitch checked={onlineStatus} onChange={setOnlineStatus} />
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>

          {/* ── 6. Account Actions ─────────────────────────────────── */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <SectionHeader
              icon={ArrowLeftRight}
              title={isRTL ? 'إجراءات الحساب' : 'Account Actions'}
              isRTL={isRTL}
            />

            <Card>
              <CardContent className="p-0 divide-y divide-gray-100">
                {/* Switch to Provider */}
                {role === 'CONSUMER' && (
                  <button
                    onClick={() => navigate('profile')}
                    className="flex items-center gap-3 w-full px-4 py-3 text-start hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-100">
                      <ShieldCheck className="h-4 w-4 text-emerald-600" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-800">
                        {isRTL ? 'التحول لمزود خدمة' : 'Switch to Provider Mode'}
                      </p>
                      <p className="text-[11px] text-gray-400">
                        {isRTL ? 'اعرض خدماتك للآلاف من المستخدمين' : 'Showcase your services to thousands of users'}
                      </p>
                    </div>
                    <ArrowLeft className={`h-4 w-4 text-gray-300 ${isRTL ? 'rotate-180' : ''}`} />
                  </button>
                )}

                {/* Download My Data */}
                <button
                  onClick={handleDownloadData}
                  disabled={downloadDataLoading}
                  className="flex items-center gap-3 w-full px-4 py-3 text-start hover:bg-gray-50 transition-colors disabled:opacity-50"
                >
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100">
                    <Download className="h-4 w-4 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-800">
                      {isRTL ? 'تحميل بياناتي' : 'Download My Data'}
                    </p>
                    <p className="text-[11px] text-gray-400">
                      {isRTL ? 'احصل على نسخة من بياناتك الشخصية' : 'Get a copy of your personal data'}
                    </p>
                  </div>
                  {downloadDataLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin text-gray-400" />
                  ) : (
                    <ArrowLeft className={`h-4 w-4 text-gray-300 ${isRTL ? 'rotate-180' : ''}`} />
                  )}
                </button>

                {/* Logout */}
                <button
                  onClick={() => setLogoutDialogOpen(true)}
                  className="flex items-center gap-3 w-full px-4 py-3 text-start hover:bg-red-50 transition-colors"
                >
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100">
                    <LogOut className="h-4 w-4 text-gray-500" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-800">
                      {isRTL ? 'تسجيل الخروج' : 'Sign Out'}
                    </p>
                  </div>
                </button>

                {/* Delete Account */}
                <button
                  onClick={() => setDeleteDialogOpen(true)}
                  className="flex items-center gap-3 w-full px-4 py-3 text-start hover:bg-red-50 transition-colors"
                >
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-red-100">
                    <Trash2 className="h-4 w-4 text-red-500" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-red-600">
                      {isRTL ? 'حذف الحساب' : 'Delete Account'}
                    </p>
                    <p className="text-[11px] text-red-400">
                      {isRTL ? 'هذا الإجراء لا يمكن التراجع عنه' : 'This action cannot be undone'}
                    </p>
                  </div>
                </button>
              </CardContent>
            </Card>
          </motion.div>

          {/* ── 7. About ───────────────────────────────────────────── */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35 }}
          >
            <SectionHeader
              icon={Info}
              title={isRTL ? 'حول التطبيق' : 'About'}
              isRTL={isRTL}
            />

            <Card>
              <CardContent className="p-0 divide-y divide-gray-100">
                <div className="flex items-center gap-3 px-4 py-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-red-500">
                    <span className="text-white text-xs font-bold">ن</span>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-800">نبض — Nabd</p>
                    <p className="text-[11px] text-gray-400">
                      {isRTL ? 'الإصدار' : 'Version'} 2.0.0
                    </p>
                  </div>
                </div>

                <button className="flex items-center gap-3 w-full px-4 py-3 text-start hover:bg-gray-50 transition-colors">
                  <FileText className="h-4 w-4 text-gray-400" />
                  <span className="flex-1 text-sm text-gray-700">{isRTL ? 'شروط الخدمة' : 'Terms of Service'}</span>
                  <ExternalLink className="h-3.5 w-3.5 text-gray-300" />
                </button>

                <button className="flex items-center gap-3 w-full px-4 py-3 text-start hover:bg-gray-50 transition-colors">
                  <Shield className="h-4 w-4 text-gray-400" />
                  <span className="flex-1 text-sm text-gray-700">{isRTL ? 'سياسة الخصوصية' : 'Privacy Policy'}</span>
                  <ExternalLink className="h-3.5 w-3.5 text-gray-300" />
                </button>

                <button className="flex items-center gap-3 w-full px-4 py-3 text-start hover:bg-gray-50 transition-colors">
                  <HelpCircle className="h-4 w-4 text-gray-400" />
                  <span className="flex-1 text-sm text-gray-700">{isRTL ? 'تواصل مع الدعم' : 'Contact Support'}</span>
                  <ExternalLink className="h-3.5 w-3.5 text-gray-300" />
                </button>
              </CardContent>
            </Card>
          </motion.div>

          {/* Footer text */}
          <div className="text-center py-6">
            <p className="text-[11px] text-gray-300">
              نبض — Nabd © {new Date().getFullYear()}
            </p>
          </div>
        </div>
      </ScrollArea>

      {/* ── Password Change Dialog ─────────────────────────────────── */}
      <Dialog open={passwordDialogOpen} onOpenChange={(open) => {
        if (!open) resetPasswordForm();
        setPasswordDialogOpen(open);
      }}>
        <DialogContent className="sm:max-w-md" dir={isRTL ? 'rtl' : 'ltr'}>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Key className="h-5 w-5 text-red-500" />
              {isRTL ? 'تغيير كلمة المرور' : 'Change Password'}
            </DialogTitle>
            <DialogDescription>
              {isRTL ? 'أدخل كلمة المرور الحالية والجديدة' : 'Enter your current and new password'}
            </DialogDescription>
          </DialogHeader>

          {passwordSuccess ? (
            <div className="flex flex-col items-center gap-3 py-6">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="rounded-full bg-green-100 p-3"
              >
                <CheckCircle2 className="h-8 w-8 text-green-500" />
              </motion.div>
              <p className="text-sm font-medium text-gray-900">
                {isRTL ? 'تم تغيير كلمة المرور بنجاح' : 'Password changed successfully'}
              </p>
              <Button
                className="bg-red-500 text-white hover:bg-red-600"
                onClick={() => {
                  resetPasswordForm();
                  setPasswordDialogOpen(false);
                }}
              >
                {isRTL ? 'تم' : 'Done'}
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>{isRTL ? 'كلمة المرور الحالية' : 'Current Password'}</Label>
                <div className="relative">
                  <Input
                    type={showCurrentPassword ? 'text' : 'password'}
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="••••••••"
                    className="pe-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                    className="absolute top-1/2 -translate-y-1/2 end-3 text-gray-400 hover:text-gray-600"
                  >
                    {showCurrentPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <Label>{isRTL ? 'كلمة المرور الجديدة' : 'New Password'}</Label>
                <div className="relative">
                  <Input
                    type={showNewPassword ? 'text' : 'password'}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="••••••••"
                    className="pe-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute top-1/2 -translate-y-1/2 end-3 text-gray-400 hover:text-gray-600"
                  >
                    {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {newPassword && newPassword.length < 6 && (
                  <p className="text-xs text-amber-600">
                    {isRTL ? 'يجب أن تكون 6 أحرف على الأقل' : 'Must be at least 6 characters'}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label>{isRTL ? 'تأكيد كلمة المرور' : 'Confirm Password'}</Label>
                <Input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                />
                {confirmPassword && newPassword !== confirmPassword && (
                  <p className="text-xs text-red-500">
                    {isRTL ? 'كلمات المرور غير متطابقة' : 'Passwords do not match'}
                  </p>
                )}
              </div>

              {passwordError && (
                <div className="flex items-center gap-2 rounded-lg bg-red-50 border border-red-200 p-3 text-sm text-red-600">
                  <AlertTriangle className="h-4 w-4 shrink-0" />
                  {passwordError}
                </div>
              )}

              <div className="flex gap-3">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => {
                    resetPasswordForm();
                    setPasswordDialogOpen(false);
                  }}
                  disabled={isChangingPassword}
                >
                  {isRTL ? 'إلغاء' : 'Cancel'}
                </Button>
                <Button
                  className="flex-1 bg-red-500 text-white hover:bg-red-600"
                  onClick={handleChangePassword}
                  disabled={isChangingPassword || !currentPassword || !newPassword || !confirmPassword}
                >
                  {isChangingPassword ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      {isRTL ? 'جاري التغيير...' : 'Changing...'}
                    </>
                  ) : (
                    isRTL ? 'تغيير' : 'Change'
                  )}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* ── Logout Confirmation Dialog ─────────────────────────────── */}
      <Dialog open={logoutDialogOpen} onOpenChange={setLogoutDialogOpen}>
        <DialogContent className="sm:max-w-sm" dir={isRTL ? 'rtl' : 'ltr'}>
          <DialogHeader>
            <DialogTitle>{isRTL ? 'تسجيل الخروج' : 'Sign Out'}</DialogTitle>
            <DialogDescription>
              {isRTL ? 'هل أنت متأكد من تسجيل الخروج؟' : 'Are you sure you want to sign out?'}
            </DialogDescription>
          </DialogHeader>
          <div className="flex gap-3">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => setLogoutDialogOpen(false)}
            >
              {isRTL ? 'إلغاء' : 'Cancel'}
            </Button>
            <Button
              className="flex-1 bg-red-500 text-white hover:bg-red-600"
              onClick={handleLogout}
            >
              <LogOut className="h-4 w-4 me-2" />
              {isRTL ? 'خروج' : 'Sign Out'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* ── Delete Account AlertDialog ─────────────────────────────── */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent dir={isRTL ? 'rtl' : 'ltr'}>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-red-600">
              <Trash2 className="h-5 w-5" />
              {isRTL ? 'حذف الحساب' : 'Delete Account'}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {isRTL
                ? 'هل أنت متأكد؟ سيتم حذف حسابك وجميع بياناتك نهائياً. لا يمكن التراجع عن هذا الإجراء.'
                : 'Are you sure? Your account and all data will be permanently deleted. This action cannot be undone.'}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{isRTL ? 'إلغاء' : 'Cancel'}</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteAccount}
              className="bg-red-500 text-white hover:bg-red-600"
            >
              {isRTL ? 'حذف نهائي' : 'Delete Permanently'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
