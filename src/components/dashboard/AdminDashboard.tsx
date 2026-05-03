'use client';

import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Shield,
  Users,
  Package,
  CalendarCheck,
  DollarSign,
  TrendingUp,
  TrendingDown,
  Search,
  ChevronLeft,
  ChevronRight,
  Settings,
  FileText,
  UserCog,
  PackageSearch,
  Activity,
  Star,
  UserPlus,
  Eye,
  EyeOff,
  Archive,
  CheckCircle2,
  AlertCircle,
  Clock,
} from 'lucide-react';
import { useLanguage } from '@/stores/languageStore';
import { adminService } from '@/lib/api';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';

// ── Category Gradients & Labels ──────────────────────────────────────

const categoryGradients: Record<string, string> = {
  real_estate: 'from-blue-500 to-blue-600',
  electronics: 'from-purple-500 to-purple-600',
  cars: 'from-red-500 to-red-600',
  services: 'from-emerald-500 to-emerald-600',
  jobs: 'from-amber-500 to-amber-600',
  furniture: 'from-orange-500 to-orange-600',
  medical: 'from-teal-500 to-teal-600',
  dining: 'from-rose-500 to-rose-600',
  education: 'from-sky-500 to-sky-600',
  beauty: 'from-pink-500 to-pink-600',
};

const categoryLabelsAr: Record<string, string> = {
  real_estate: 'عقارات',
  electronics: 'إلكترونيات',
  cars: 'سيارات',
  services: 'خدمات',
  jobs: 'وظائف',
  furniture: 'أثاث',
  medical: 'طبية',
  dining: 'مطاعم',
  education: 'تعليم',
  beauty: 'جمال',
};

const categoryLabelsEn: Record<string, string> = {
  real_estate: 'Real Estate',
  electronics: 'Electronics',
  cars: 'Cars',
  services: 'Services',
  jobs: 'Jobs',
  furniture: 'Furniture',
  medical: 'Medical',
  dining: 'Dining',
  education: 'Education',
  beauty: 'Beauty',
};

const listingStatusColors: Record<string, string> = {
  ACTIVE: 'bg-emerald-100 text-emerald-700',
  PAUSED: 'bg-amber-100 text-amber-700',
  ARCHIVED: 'bg-gray-100 text-gray-600',
  DRAFT: 'bg-blue-100 text-blue-700',
};

const bookingStatusColors: Record<string, string> = {
  PENDING: 'bg-amber-100 text-amber-700',
  CONFIRMED: 'bg-blue-100 text-blue-700',
  COMPLETED: 'bg-emerald-100 text-emerald-700',
  CANCELLED: 'bg-red-100 text-red-700',
};

const paymentStatusColors: Record<string, string> = {
  PENDING: 'bg-amber-100 text-amber-700',
  COMPLETED: 'bg-emerald-100 text-emerald-700',
  FAILED: 'bg-red-100 text-red-700',
  REFUNDED: 'bg-purple-100 text-purple-700',
};

// ── Helpers ────────────────────────────────────────────────────────

function timeAgo(iso: string, isRTL: boolean): string {
  const now = Date.now();
  const then = new Date(iso).getTime();
  const diff = now - then;
  const mins = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);
  if (mins < 1) return isRTL ? 'الآن' : 'just now';
  if (mins < 60) return isRTL ? `منذ ${mins} دقيقة` : `${mins}m ago`;
  if (hours < 24) return isRTL ? `منذ ${hours} ساعة` : `${hours}h ago`;
  if (days < 30) return isRTL ? `منذ ${days} يوم` : `${days}d ago`;
  return new Date(iso).toLocaleDateString(isRTL ? 'ar-SA' : 'en-US', { month: 'short', day: 'numeric' });
}

// ── Recent Activity Mock ──────────────────────────────────────────

interface ActivityItem {
  id: string;
  type: 'new_user' | 'new_listing' | 'booking_completed' | 'review_posted';
  descriptionAr: string;
  descriptionEn: string;
  time: string;
}

function generateActivities(users: { displayName: string; createdAt: string }[], listings: { title: string; createdAt: string }[], bookingsCount: number): ActivityItem[] {
  const activities: ActivityItem[] = [];
  if (users.length > 0) {
    activities.push({
      id: '1',
      type: 'new_user',
      descriptionAr: `مستخدم جديد: ${users[0].displayName}`,
      descriptionEn: `New user: ${users[0].displayName}`,
      time: users[0].createdAt,
    });
  }
  if (listings.length > 0) {
    activities.push({
      id: '2',
      type: 'new_listing',
      descriptionAr: `إعلان جديد: ${listings[0].title}`,
      descriptionEn: `New listing: ${listings[0].title}`,
      time: listings[0].createdAt,
    });
  }
  if (bookingsCount > 0) {
    activities.push({
      id: '3',
      type: 'booking_completed',
      descriptionAr: `تم إكمال حجز`,
      descriptionEn: `Booking completed`,
      time: new Date(Date.now() - 3600000).toISOString(),
    });
  }
  activities.push({
    id: '4',
    type: 'review_posted',
    descriptionAr: 'تم نشر تقييم جديد ⭐',
    descriptionEn: 'New review posted ⭐',
    time: new Date(Date.now() - 7200000).toISOString(),
  });
  activities.push({
    id: '5',
    type: 'new_user',
    descriptionAr: 'مستخدم جديد: سارة أحمد',
    descriptionEn: 'New user: Sarah Ahmad',
    time: new Date(Date.now() - 86400000).toISOString(),
  });
  activities.push({
    id: '6',
    type: 'new_listing',
    descriptionAr: 'إعلان جديد: شقة للإيجار',
    descriptionEn: 'New listing: Apartment for rent',
    time: new Date(Date.now() - 172800000).toISOString(),
  });
  activities.push({
    id: '7',
    type: 'booking_completed',
    descriptionAr: 'تم إكمال 3 حجوزات',
    descriptionEn: '3 bookings completed',
    time: new Date(Date.now() - 259200000).toISOString(),
  });
  activities.push({
    id: '8',
    type: 'review_posted',
    descriptionAr: 'تقييم جديد بإمتياز ★★★★★',
    descriptionEn: 'New 5-star review ★★★★★',
    time: new Date(Date.now() - 432000000).toISOString(),
  });
  activities.push({
    id: '9',
    type: 'new_user',
    descriptionAr: 'مزود خدمة جديد: محمد الخدماتي',
    descriptionEn: 'New provider: Mohammad Services',
    time: new Date(Date.now() - 518400000).toISOString(),
  });
  activities.push({
    id: '10',
    type: 'new_listing',
    descriptionAr: 'إعلان جديد: سيارة تويوتا',
    descriptionEn: 'New listing: Toyota Car',
    time: new Date(Date.now() - 604800000).toISOString(),
  });
  return activities;
}

// ── Chart Data ────────────────────────────────────────────────────

const monthlyBookingsData = [
  { month: 'Jan', monthAr: 'يناير', value: 12 },
  { month: 'Feb', monthAr: 'فبراير', value: 19 },
  { month: 'Mar', monthAr: 'مارس', value: 15 },
  { month: 'Apr', monthAr: 'أبريل', value: 25 },
  { month: 'May', monthAr: 'مايو', value: 22 },
  { month: 'Jun', monthAr: 'يونيو', value: 30 },
];

const revenueBreakdown = [
  { labelAr: 'عقارات', labelEn: 'Real Estate', percentage: 35, color: 'bg-blue-500' },
  { labelAr: 'خدمات', labelEn: 'Services', percentage: 25, color: 'bg-emerald-500' },
  { labelAr: 'سيارات', labelEn: 'Cars', percentage: 20, color: 'bg-red-500' },
  { labelAr: 'أخرى', labelEn: 'Other', percentage: 20, color: 'bg-amber-500' },
];

// ── Main Component ────────────────────────────────────────────────

export function AdminDashboard() {
  const { t, isRTL } = useLanguage();

  // ── Pagination State ──────────────────────────────────────────
  const [userPage, setUserPage] = useState(0);
  const [listingPage, setListingPage] = useState(0);
  const [userSearch, setUserSearch] = useState('');
  const [listingSearch, setListingSearch] = useState('');

  // ── Queries ───────────────────────────────────────────────────
  const { data: usersData, isLoading: usersLoading } = useQuery({
    queryKey: ['admin-users', userPage],
    queryFn: () => adminService.listUsers(userPage, 10),
  });

  const { data: listingsData, isLoading: listingsLoading } = useQuery({
    queryKey: ['admin-listings', listingPage],
    queryFn: () => adminService.listListings(listingPage, 10),
  });

  const { data: bookingsData, isLoading: bookingsLoading } = useQuery({
    queryKey: ['admin-bookings'],
    queryFn: () => adminService.listBookings(),
  });

  const { data: paymentsData, isLoading: paymentsLoading } = useQuery({
    queryKey: ['admin-payments'],
    queryFn: () => adminService.listPayments(),
  });

  const users = usersData?.content ?? [];
  const listings = listingsData?.content ?? [];
  const bookings = bookingsData?.content ?? [];
  const payments = paymentsData?.content ?? [];

  // ── Revenue Calculation ───────────────────────────────────────
  const revenue = useMemo(() => {
    return payments
      .filter((p) => p.status === 'COMPLETED')
      .reduce((sum, p) => sum + p.amountCents, 0);
  }, [payments]);

  // ── Filtered Users ────────────────────────────────────────────
  const filteredUsers = useMemo(() => {
    if (!userSearch.trim()) return users;
    const q = userSearch.toLowerCase();
    return users.filter(
      (u) =>
        u.displayName?.toLowerCase().includes(q) ||
        u.email?.toLowerCase().includes(q) ||
        u.role?.toLowerCase().includes(q)
    );
  }, [users, userSearch]);

  // ── Filtered Listings ─────────────────────────────────────────
  const filteredListings = useMemo(() => {
    if (!listingSearch.trim()) return listings;
    const q = listingSearch.toLowerCase();
    return listings.filter(
      (l) =>
        l.title?.toLowerCase().includes(q) ||
        l.category?.toLowerCase().includes(q)
    );
  }, [listings, listingSearch]);

  // ── Activities ────────────────────────────────────────────────
  const activities = useMemo(() => generateActivities(users, listings, bookings.length), [users, listings, bookings.length]);

  // ── Stats ─────────────────────────────────────────────────────
  const stats = [
    {
      label: isRTL ? 'المستخدمين' : 'Total Users',
      value: usersData?.totalElements ?? users.length,
      icon: <Users className="h-5 w-5 text-white" />,
      color: 'from-blue-500 to-blue-600',
      trend: '+12%',
      trendUp: true,
    },
    {
      label: isRTL ? 'الإعلانات' : 'Total Listings',
      value: listingsData?.totalElements ?? listings.length,
      icon: <Package className="h-5 w-5 text-white" />,
      color: 'from-emerald-500 to-emerald-600',
      trend: '+8%',
      trendUp: true,
    },
    {
      label: isRTL ? 'الحجوزات' : 'Total Bookings',
      value: bookingsData?.totalElements ?? bookings.length,
      icon: <CalendarCheck className="h-5 w-5 text-white" />,
      color: 'from-purple-500 to-purple-600',
      trend: '+15%',
      trendUp: true,
    },
    {
      label: isRTL ? 'الإيرادات' : 'Revenue',
      value: `${(revenue / 100).toLocaleString()} ${isRTL ? 'ر.س' : 'SAR'}`,
      icon: <DollarSign className="h-5 w-5 text-white" />,
      color: 'from-amber-500 to-amber-600',
      trend: '+5%',
      trendUp: true,
    },
  ];

  // ── Quick Actions ─────────────────────────────────────────────
  const quickActions = [
    { icon: <UserCog className="h-5 w-5" />, label: isRTL ? 'إدارة المستخدمين' : 'Manage Users', tab: 'users' },
    { icon: <PackageSearch className="h-5 w-5" />, label: isRTL ? 'إدارة الإعلانات' : 'Manage Listings', tab: 'listings' },
    { icon: <FileText className="h-5 w-5" />, label: isRTL ? 'التقارير' : 'View Reports', tab: 'bookings' },
    { icon: <Settings className="h-5 w-5" />, label: isRTL ? 'إعدادات النظام' : 'System Settings', tab: 'payments' },
  ];

  const maxBooking = Math.max(...monthlyBookingsData.map((d) => d.value), 1);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-4 p-4"
    >
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-red-500 to-red-600 shadow-md shadow-red-500/25">
          <Shield className="h-5 w-5 text-white" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-gray-900">
            {isRTL ? 'لوحة الإدارة' : 'Admin Dashboard'}
          </h1>
          <p className="text-xs text-gray-500">
            {isRTL ? 'إدارة المنصة والمستخدمين' : 'Manage platform and users'}
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {stats.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
          >
            <Card className="overflow-hidden">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className={`rounded-lg p-2 bg-gradient-to-br ${stat.color} shadow-sm`}>
                    {stat.icon}
                  </div>
                  <div className={`flex items-center gap-0.5 text-xs font-medium ${stat.trendUp ? 'text-emerald-600' : 'text-red-600'}`}>
                    {stat.trendUp ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                    {stat.trend}
                  </div>
                </div>
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                <p className="text-xs text-gray-500 mt-0.5">{stat.label}</p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Bookings Chart */}
        <Card>
          <CardContent className="p-4">
            <h3 className="text-sm font-semibold text-gray-900 mb-4">
              {isRTL ? 'الحجوزات عبر الوقت' : 'Bookings Over Time'}
            </h3>
            <div className="flex items-end gap-2 h-32">
              {monthlyBookingsData.map((d, i) => (
                <div key={i} className="flex-1 flex flex-col items-center gap-1">
                  <span className="text-[10px] font-medium text-gray-600">{d.value}</span>
                  <motion.div
                    initial={{ height: 0 }}
                    animate={{ height: `${(d.value / maxBooking) * 100}%` }}
                    transition={{ delay: i * 0.08, duration: 0.5, ease: 'easeOut' }}
                    className="w-full rounded-t-md bg-gradient-to-t from-red-500 to-red-400 min-h-[4px]"
                  />
                  <span className="text-[9px] text-gray-400">
                    {isRTL ? d.monthAr.slice(0, 3) : d.month.slice(0, 3)}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Revenue Breakdown */}
        <Card>
          <CardContent className="p-4">
            <h3 className="text-sm font-semibold text-gray-900 mb-4">
              {isRTL ? 'توزيع الإيرادات' : 'Revenue Breakdown'}
            </h3>
            {/* CSS Pie Chart */}
            <div className="flex items-center gap-4">
              <div className="relative w-24 h-24 shrink-0">
                <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
                  {revenueBreakdown.reduce<{ elements: React.ReactNode[]; offset: number }>(
                    (acc, segment, i) => {
                      const dashArray = `${segment.percentage} ${100 - segment.percentage}`;
                      const colorMap: Record<string, string> = {
                        'bg-blue-500': '#3b82f6',
                        'bg-emerald-500': '#10b981',
                        'bg-red-500': '#ef4444',
                        'bg-amber-500': '#f59e0b',
                      };
                      const element = (
                        <circle
                          key={i}
                          cx="18"
                          cy="18"
                          r="15.915"
                          fill="none"
                          stroke={colorMap[segment.color] || '#6b7280'}
                          strokeWidth="4"
                          strokeDasharray={dashArray}
                          strokeDashoffset={-acc.offset}
                          className="transition-all duration-700"
                        />
                      );
                      acc.elements.push(element);
                      acc.offset += segment.percentage;
                      return acc;
                    },
                    { elements: [], offset: 0 }
                  ).elements}
                </svg>
              </div>
              <div className="flex-1 space-y-2">
                {revenueBreakdown.map((segment, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <div className={`w-3 h-3 rounded-sm ${segment.color} shrink-0`} />
                    <span className="text-xs text-gray-600 flex-1">
                      {isRTL ? segment.labelAr : segment.labelEn}
                    </span>
                    <span className="text-xs font-medium text-gray-900">{segment.percentage}%</span>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity & Quick Actions */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Recent Activity */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-3">
              <Activity className="h-4 w-4 text-red-500" />
              <h3 className="text-sm font-semibold text-gray-900">
                {isRTL ? 'النشاط الأخير' : 'Recent Activity'}
              </h3>
            </div>
            <div className="max-h-64 overflow-y-auto space-y-2 pr-1 custom-scrollbar">
              {activities.map((item) => {
                const iconMap = {
                  new_user: <UserPlus className="h-4 w-4 text-blue-500" />,
                  new_listing: <Package className="h-4 w-4 text-emerald-500" />,
                  booking_completed: <CheckCircle2 className="h-4 w-4 text-purple-500" />,
                  review_posted: <Star className="h-4 w-4 text-amber-500" />,
                };
                const bgMap = {
                  new_user: 'bg-blue-50',
                  new_listing: 'bg-emerald-50',
                  booking_completed: 'bg-purple-50',
                  review_posted: 'bg-amber-50',
                };
                return (
                  <div key={item.id} className={`flex items-center gap-3 rounded-lg p-2.5 ${bgMap[item.type]}`}>
                    <div className="shrink-0">{iconMap[item.type]}</div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-gray-800 truncate">
                        {isRTL ? item.descriptionAr : item.descriptionEn}
                      </p>
                      <p className="text-[10px] text-gray-500 flex items-center gap-1">
                        <Clock className="h-2.5 w-2.5" />
                        {timeAgo(item.time, isRTL)}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-3">
              <Settings className="h-4 w-4 text-red-500" />
              <h3 className="text-sm font-semibold text-gray-900">
                {isRTL ? 'إجراءات سريعة' : 'Quick Actions'}
              </h3>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {quickActions.map((action) => (
                <button
                  key={action.tab}
                  className="flex flex-col items-center gap-2 rounded-xl border border-gray-200 bg-white p-4 text-center transition-all hover:bg-red-50 hover:border-red-200 hover:shadow-sm active:scale-[0.97]"
                >
                  <div className="text-gray-600">{action.icon}</div>
                  <span className="text-xs font-medium text-gray-700">{action.label}</span>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <Separator />

      {/* Management Tabs */}
      <Tabs defaultValue="users" dir={isRTL ? 'rtl' : 'ltr'}>
        <TabsList className="w-full">
          <TabsTrigger value="users" className="flex-1">
            {isRTL ? 'المستخدمين' : 'Users'}
          </TabsTrigger>
          <TabsTrigger value="listings" className="flex-1">
            {isRTL ? 'الإعلانات' : 'Listings'}
          </TabsTrigger>
          <TabsTrigger value="bookings" className="flex-1">
            {isRTL ? 'الحجوزات' : 'Bookings'}
          </TabsTrigger>
          <TabsTrigger value="payments" className="flex-1">
            {isRTL ? 'المدفوعات' : 'Payments'}
          </TabsTrigger>
        </TabsList>

        {/* ── Users Tab ─────────────────────────────────────── */}
        <TabsContent value="users">
          <Card>
            <CardContent className="p-4 space-y-4">
              {/* Search */}
              <div className="relative">
                <Search className={`absolute top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400 ${isRTL ? 'right-3' : 'left-3'}`} />
                <Input
                  value={userSearch}
                  onChange={(e) => setUserSearch(e.target.value)}
                  placeholder={isRTL ? 'بحث عن مستخدم...' : 'Search users...'}
                  className={isRTL ? 'pr-10' : 'pl-10'}
                />
              </div>

              {usersLoading ? (
                <div className="space-y-2">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Skeleton key={i} className="h-12 w-full" />
                  ))}
                </div>
              ) : filteredUsers.length === 0 ? (
                <EmptyState icon={<Users className="h-10 w-10" />} label={isRTL ? 'لا يوجد مستخدمين' : 'No users'} />
              ) : (
                <>
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>{isRTL ? 'المستخدم' : 'User'}</TableHead>
                          <TableHead>{isRTL ? 'البريد' : 'Email'}</TableHead>
                          <TableHead>{isRTL ? 'الدور' : 'Role'}</TableHead>
                          <TableHead>{isRTL ? 'الحالة' : 'Status'}</TableHead>
                          <TableHead>{isRTL ? 'إجراءات' : 'Actions'}</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredUsers.map((user) => (
                          <TableRow key={user.id}>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <Avatar className="h-8 w-8">
                                  <AvatarFallback className="bg-gradient-to-br from-red-400 to-red-500 text-white text-xs">
                                    {user.displayName?.charAt(0)?.toUpperCase() || 'U'}
                                  </AvatarFallback>
                                </Avatar>
                                <span className="font-medium text-sm">{user.displayName}</span>
                              </div>
                            </TableCell>
                            <TableCell className="text-xs text-gray-500">{user.email}</TableCell>
                            <TableCell>
                              <Badge
                                variant="secondary"
                                className={
                                  user.role === 'ADMIN'
                                    ? 'bg-red-100 text-red-700'
                                    : user.role === 'PROVIDER'
                                      ? 'bg-blue-100 text-blue-700'
                                      : 'bg-gray-100 text-gray-700'
                                }
                              >
                                {user.role}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-1">
                                <div className="h-2 w-2 rounded-full bg-emerald-500" />
                                <span className="text-xs text-emerald-600">
                                  {isRTL ? 'نشط' : 'Active'}
                                </span>
                              </div>
                            </TableCell>
                            <TableCell>
                              <Button variant="ghost" size="sm" className="h-7 text-xs text-gray-500 hover:text-red-500">
                                {isRTL ? 'عرض' : 'View'}
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                  {/* Pagination */}
                  <div className="flex items-center justify-between pt-2">
                    <p className="text-xs text-gray-500">
                      {isRTL
                        ? `صفحة ${userPage + 1} من ${Math.max(usersData?.totalPages ?? 1, 1)}`
                        : `Page ${userPage + 1} of ${Math.max(usersData?.totalPages ?? 1, 1)}`}
                    </p>
                    <div className="flex gap-1">
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-8 w-8 p-0"
                        disabled={userPage === 0}
                        onClick={() => setUserPage(Math.max(0, userPage - 1))}
                      >
                        {isRTL ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-8 w-8 p-0"
                        disabled={usersData?.last ?? true}
                        onClick={() => setUserPage(userPage + 1)}
                      >
                        {isRTL ? <ChevronLeft className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                      </Button>
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── Listings Tab ──────────────────────────────────── */}
        <TabsContent value="listings">
          <Card>
            <CardContent className="p-4 space-y-4">
              {/* Search */}
              <div className="relative">
                <Search className={`absolute top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400 ${isRTL ? 'right-3' : 'left-3'}`} />
                <Input
                  value={listingSearch}
                  onChange={(e) => setListingSearch(e.target.value)}
                  placeholder={isRTL ? 'بحث عن إعلان...' : 'Search listings...'}
                  className={isRTL ? 'pr-10' : 'pl-10'}
                />
              </div>

              {listingsLoading ? (
                <div className="space-y-2">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Skeleton key={i} className="h-12 w-full" />
                  ))}
                </div>
              ) : filteredListings.length === 0 ? (
                <EmptyState icon={<Package className="h-10 w-10" />} label={isRTL ? 'لا توجد إعلانات' : 'No listings'} />
              ) : (
                <>
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>{isRTL ? 'الإعلان' : 'Listing'}</TableHead>
                          <TableHead>{isRTL ? 'الفئة' : 'Category'}</TableHead>
                          <TableHead>{isRTL ? 'السعر' : 'Price'}</TableHead>
                          <TableHead>{isRTL ? 'الحالة' : 'Status'}</TableHead>
                          <TableHead>{isRTL ? 'إجراءات' : 'Actions'}</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredListings.map((listing) => (
                          <TableRow key={listing.id}>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <div className={`h-8 w-8 rounded-md bg-gradient-to-br ${categoryGradients[listing.category] ?? 'from-gray-400 to-gray-500'} flex items-center justify-center text-white text-[10px] font-bold shrink-0`}>
                                  {(categoryLabelsEn[listing.category] ?? listing.category)?.charAt(0)?.toUpperCase()}
                                </div>
                                <span className="font-medium text-sm max-w-[120px] truncate">{listing.title}</span>
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge variant="secondary" className="text-[10px]">
                                {isRTL ? (categoryLabelsAr[listing.category] ?? listing.category) : (categoryLabelsEn[listing.category] ?? listing.category)}
                              </Badge>
                            </TableCell>
                            <TableCell dir="ltr" className="text-sm">
                              {listing.price.toLocaleString()} SAR
                            </TableCell>
                            <TableCell>
                              <Badge className={`text-[10px] ${listingStatusColors[listing.status] ?? 'bg-gray-100 text-gray-600'}`}>
                                {listing.status}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-1">
                                {listing.status !== 'ACTIVE' && (
                                  <Button variant="ghost" size="sm" className="h-7 px-2 text-[10px] text-emerald-600 hover:bg-emerald-50">
                                    <Eye className="h-3 w-3" />
                                    {isRTL ? 'تفعيل' : 'Activate'}
                                  </Button>
                                )}
                                {listing.status === 'ACTIVE' && (
                                  <Button variant="ghost" size="sm" className="h-7 px-2 text-[10px] text-amber-600 hover:bg-amber-50">
                                    <EyeOff className="h-3 w-3" />
                                    {isRTL ? 'إيقاف' : 'Pause'}
                                  </Button>
                                )}
                                {listing.status !== 'ARCHIVED' && (
                                  <Button variant="ghost" size="sm" className="h-7 px-2 text-[10px] text-gray-500 hover:bg-gray-50">
                                    <Archive className="h-3 w-3" />
                                  </Button>
                                )}
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                  {/* Pagination */}
                  <div className="flex items-center justify-between pt-2">
                    <p className="text-xs text-gray-500">
                      {isRTL
                        ? `صفحة ${listingPage + 1} من ${Math.max(listingsData?.totalPages ?? 1, 1)}`
                        : `Page ${listingPage + 1} of ${Math.max(listingsData?.totalPages ?? 1, 1)}`}
                    </p>
                    <div className="flex gap-1">
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-8 w-8 p-0"
                        disabled={listingPage === 0}
                        onClick={() => setListingPage(Math.max(0, listingPage - 1))}
                      >
                        {isRTL ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-8 w-8 p-0"
                        disabled={listingsData?.last ?? true}
                        onClick={() => setListingPage(listingPage + 1)}
                      >
                        {isRTL ? <ChevronLeft className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                      </Button>
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── Bookings Tab ──────────────────────────────────── */}
        <TabsContent value="bookings">
          <Card>
            <CardContent className="p-4">
              {bookingsLoading ? (
                <div className="space-y-2">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <Skeleton key={i} className="h-10 w-full" />
                  ))}
                </div>
              ) : bookings.length === 0 ? (
                <EmptyState icon={<CalendarCheck className="h-10 w-10" />} label={isRTL ? 'لا توجد حجوزات' : 'No bookings'} />
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>ID</TableHead>
                        <TableHead>{isRTL ? 'المستهلك' : 'Consumer'}</TableHead>
                        <TableHead>{isRTL ? 'المزود' : 'Provider'}</TableHead>
                        <TableHead>{isRTL ? 'الحالة' : 'Status'}</TableHead>
                        <TableHead>{isRTL ? 'السعر' : 'Price'}</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {bookings.map((booking) => (
                        <TableRow key={booking.id}>
                          <TableCell className="font-mono text-xs">
                            {booking.id.slice(0, 8)}
                          </TableCell>
                          <TableCell className="text-sm">
                            {booking.consumerId.slice(0, 8)}
                          </TableCell>
                          <TableCell className="text-sm">
                            {booking.providerId.slice(0, 8)}
                          </TableCell>
                          <TableCell>
                            <Badge className={`text-[10px] ${bookingStatusColors[booking.status] ?? 'bg-gray-100 text-gray-600'}`}>
                              {booking.status}
                            </Badge>
                          </TableCell>
                          <TableCell dir="ltr" className="text-sm">
                            {(booking.priceCents / 100).toLocaleString()} {booking.currency}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── Payments Tab ──────────────────────────────────── */}
        <TabsContent value="payments">
          <Card>
            <CardContent className="p-4">
              {paymentsLoading ? (
                <div className="space-y-2">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <Skeleton key={i} className="h-10 w-full" />
                  ))}
                </div>
              ) : payments.length === 0 ? (
                <EmptyState icon={<DollarSign className="h-10 w-10" />} label={isRTL ? 'لا توجد مدفوعات' : 'No payments'} />
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>ID</TableHead>
                        <TableHead>{isRTL ? 'الحجز' : 'Booking'}</TableHead>
                        <TableHead>{isRTL ? 'المبلغ' : 'Amount'}</TableHead>
                        <TableHead>{isRTL ? 'الحالة' : 'Status'}</TableHead>
                        <TableHead>{isRTL ? 'التاريخ' : 'Date'}</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {payments.map((payment) => (
                        <TableRow key={payment.id}>
                          <TableCell className="font-mono text-xs">
                            {payment.id.slice(0, 8)}
                          </TableCell>
                          <TableCell className="font-mono text-xs">
                            {payment.bookingId.slice(0, 8)}
                          </TableCell>
                          <TableCell dir="ltr" className="text-sm font-medium">
                            {(payment.amountCents / 100).toLocaleString()} {payment.currency}
                          </TableCell>
                          <TableCell>
                            <Badge className={`text-[10px] ${paymentStatusColors[payment.status] ?? 'bg-gray-100 text-gray-600'}`}>
                              {payment.status}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-xs text-gray-500">
                            {new Date(payment.createdAt).toLocaleDateString(
                              isRTL ? 'ar-SA' : 'en-US',
                              { month: 'short', day: 'numeric' }
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </motion.div>
  );
}

// ── Empty State Helper ──────────────────────────────────────────

function EmptyState({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <div className="flex flex-col items-center gap-3 py-12 text-center">
      <div className="text-gray-300">{icon}</div>
      <p className="text-sm text-gray-500">{label}</p>
    </div>
  );
}
