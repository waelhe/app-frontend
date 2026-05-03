'use client';

import { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useNavigationStore } from '@/stores/navigationStore';
import { useLanguage as useZustandLanguage } from '@/store/use-language';
import { useAuth } from '@/store/use-auth';
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
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

export function SettingsView() {
  const { t, isRTL } = useLanguage();
  const { goBack } = useNavigationStore();
  const { language, setLanguage } = useZustandLanguage();
  const { user, isAuthenticated } = useAuth();
  const BackArrow = isRTL ? ArrowRight : ArrowLeft;

  const [notifications, setNotifications] = useState(true);
  const [darkMode, setDarkMode] = useState(false);

  const settingsGroups = [
    {
      title: t('عام', 'General'),
      items: [
        {
          icon: Globe,
          label: t('اللغة', 'Language'),
          value: language === 'ar' ? 'العربية' : 'English',
          action: () => setLanguage(language === 'ar' ? 'en' : 'ar'),
        },
        {
          icon: darkMode ? Moon : Sun,
          label: t('الوضع الداكن', 'Dark Mode'),
          value: darkMode ? t('مفعّل', 'On') : t('معطّل', 'Off'),
          action: () => setDarkMode(!darkMode),
          toggle: true,
          toggleValue: darkMode,
        },
      ],
    },
    {
      title: t('الإشعارات', 'Notifications'),
      items: [
        {
          icon: Bell,
          label: t('تلقي الإشعارات', 'Receive Notifications'),
          value: notifications ? t('مفعّل', 'On') : t('معطّل', 'Off'),
          action: () => setNotifications(!notifications),
          toggle: true,
          toggleValue: notifications,
        },
      ],
    },
    {
      title: t('الأمان والخصوصية', 'Security & Privacy'),
      items: [
        {
          icon: Shield,
          label: t('تغيير كلمة المرور', 'Change Password'),
          value: '',
          action: () => {},
        },
      ],
    },
    {
      title: t('حول التطبيق', 'About'),
      items: [
        {
          icon: Info,
          label: t('الإصدار', 'Version'),
          value: '1.0.0',
          action: () => {},
        },
      ],
    },
  ];

  return (
    <div className="p-4 space-y-4">
      {/* Header */}
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" onClick={goBack} className="h-8 w-8 shrink-0">
          <BackArrow className="h-4 w-4" />
        </Button>
        <div className="flex items-center gap-2">
          <Settings className="h-5 w-5 text-gray-600" />
          <h1 className="text-xl font-bold text-gray-900">
            {t('الإعدادات', 'Settings')}
          </h1>
        </div>
      </div>

      {/* User Info Card */}
      {isAuthenticated && user && (
        <Card>
          <CardContent className="flex items-center gap-3 p-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-100 text-lg font-bold text-red-600">
              {user.displayName?.charAt(0)?.toUpperCase() || 'U'}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-gray-900">
                {user.displayName}
              </p>
              <p className="truncate text-xs text-gray-500">
                {user.email || user.id}
              </p>
            </div>
            <span className="rounded-full bg-red-50 px-2 py-0.5 text-[10px] font-medium text-red-600">
              {user.role}
            </span>
          </CardContent>
        </Card>
      )}

      {/* Settings Groups */}
      {settingsGroups.map((group) => (
        <div key={group.title} className="space-y-2">
          <h3 className="px-1 text-xs font-semibold uppercase tracking-wider text-gray-400">
            {group.title}
          </h3>
          <Card>
            <CardContent className="divide-y divide-gray-100 p-0">
              {group.items.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.label}
                    onClick={item.action}
                    className="flex w-full items-center gap-3 px-4 py-3 text-start transition-colors hover:bg-gray-50"
                  >
                    <Icon className="h-4 w-4 shrink-0 text-gray-400" />
                    <span className="flex-1 text-sm text-gray-700">
                      {item.label}
                    </span>
                    {item.toggle ? (
                      <div
                        className={`relative h-6 w-11 rounded-full transition-colors ${
                          item.toggleValue ? 'bg-red-500' : 'bg-gray-200'
                        }`}
                      >
                        <div
                          className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow-sm transition-transform ${
                            item.toggleValue
                              ? isRTL
                                ? 'translate-x-0.5'
                                : 'translate-x-5'
                              : isRTL
                                ? 'translate-x-5'
                                : 'translate-x-0.5'
                          }`}
                        />
                      </div>
                    ) : (
                      item.value && (
                        <span className="text-xs text-gray-400">{item.value}</span>
                      )
                    )}
                  </button>
                );
              })}
            </CardContent>
          </Card>
        </div>
      ))}
    </div>
  );
}
