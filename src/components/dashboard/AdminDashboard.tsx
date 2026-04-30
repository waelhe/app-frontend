'use client';

import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import {
  Shield,
  Users,
  Package,
  CalendarCheck,
  CreditCard,
  DollarSign,
  Inbox,
} from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { adminService } from '@/lib/api';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
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

const listingStatusColors: Record<string, string> = {
  ACTIVE: 'bg-emerald-100 text-emerald-700',
  PAUSED: 'bg-amber-100 text-amber-700',
  ARCHIVED: 'bg-gray-100 text-gray-600',
  DRAFT: 'bg-blue-100 text-blue-700',
};

export function AdminDashboard() {
  const { t, isRTL } = useLanguage();

  // ── Queries ──────────────────────────────────────────────────
  const {
    data: usersData,
    isLoading: usersLoading,
  } = useQuery({
    queryKey: ['admin-users'],
    queryFn: () => adminService.listUsers(),
  });

  const {
    data: listingsData,
    isLoading: listingsLoading,
  } = useQuery({
    queryKey: ['admin-listings'],
    queryFn: () => adminService.listListings(),
  });

  const {
    data: bookingsData,
    isLoading: bookingsLoading,
  } = useQuery({
    queryKey: ['admin-bookings'],
    queryFn: () => adminService.listBookings(),
  });

  const {
    data: paymentsData,
    isLoading: paymentsLoading,
  } = useQuery({
    queryKey: ['admin-payments'],
    queryFn: () => adminService.listPayments(),
  });

  const users = usersData?.content ?? [];
  const listings = listingsData?.content ?? [];
  const bookings = bookingsData?.content ?? [];
  const payments = paymentsData?.content ?? [];

  // ── Revenue Calculation ──────────────────────────────────────
  const revenue = useMemo(() => {
    return payments
      .filter((p) => p.status === 'COMPLETED')
      .reduce((sum, p) => sum + p.amountCents, 0);
  }, [payments]);

  // ── Stats ────────────────────────────────────────────────────
  const stats = [
    {
      label: isRTL ? 'المستخدمين' : 'Users',
      value: usersData?.totalElements ?? users.length,
      icon: <Users className="h-5 w-5 text-blue-500" />,
      color: 'bg-blue-50',
    },
    {
      label: isRTL ? 'الإعلانات' : 'Listings',
      value: listingsData?.totalElements ?? listings.length,
      icon: <Package className="h-5 w-5 text-emerald-500" />,
      color: 'bg-emerald-50',
    },
    {
      label: isRTL ? 'الحجوزات' : 'Bookings',
      value: bookingsData?.totalElements ?? bookings.length,
      icon: <CalendarCheck className="h-5 w-5 text-purple-500" />,
      color: 'bg-purple-50',
    },
    {
      label: isRTL ? 'المدفوعات' : 'Payments',
      value: paymentsData?.totalElements ?? payments.length,
      icon: <CreditCard className="h-5 w-5 text-amber-500" />,
      color: 'bg-amber-50',
    },
    {
      label: isRTL ? 'الإيرادات' : 'Revenue',
      value: `${(revenue / 100).toLocaleString()}`,
      icon: <DollarSign className="h-5 w-5 text-emerald-600" />,
      color: 'bg-emerald-50',
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-4 p-4"
    >
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-red-500 to-red-600 shadow-md">
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
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        {stats.map((stat) => (
          <Card key={stat.label}>
            <CardContent className="flex items-center gap-3 p-4">
              <div className={`rounded-lg p-2 ${stat.color}`}>
                {stat.icon}
              </div>
              <div>
                <p className="text-xl font-bold text-gray-900">{stat.value}</p>
                <p className="text-xs text-gray-500">{stat.label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Tabs */}
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
          {usersLoading ? (
            <div className="space-y-2">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-10 w-full" />
              ))}
            </div>
          ) : users.length === 0 ? (
            <EmptyState icon={<Users className="h-10 w-10" />} label={isRTL ? 'لا يوجد مستخدمين' : 'No users'} />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{isRTL ? 'الاسم' : 'Name'}</TableHead>
                  <TableHead>{isRTL ? 'البريد' : 'Email'}</TableHead>
                  <TableHead>{isRTL ? 'الدور' : 'Role'}</TableHead>
                  <TableHead>{isRTL ? 'التاريخ' : 'Date'}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium">
                      {user.displayName}
                    </TableCell>
                    <TableCell className="text-sm text-gray-500">
                      {user.email}
                    </TableCell>
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
                    <TableCell className="text-xs text-gray-500">
                      {new Date(user.createdAt).toLocaleDateString(
                        isRTL ? 'ar-SA' : 'en-US',
                        { month: 'short', day: 'numeric', year: 'numeric' }
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </TabsContent>

        {/* ── Listings Tab ──────────────────────────────────── */}
        <TabsContent value="listings">
          {listingsLoading ? (
            <div className="space-y-2">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-10 w-full" />
              ))}
            </div>
          ) : listings.length === 0 ? (
            <EmptyState icon={<Package className="h-10 w-10" />} label={isRTL ? 'لا توجد إعلانات' : 'No listings'} />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{isRTL ? 'العنوان' : 'Title'}</TableHead>
                  <TableHead>{isRTL ? 'الفئة' : 'Category'}</TableHead>
                  <TableHead>{isRTL ? 'السعر' : 'Price'}</TableHead>
                  <TableHead>{isRTL ? 'الحالة' : 'Status'}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {listings.map((listing) => (
                  <TableRow key={listing.id}>
                    <TableCell className="max-w-[150px] truncate font-medium">
                      {listing.title}
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary" className="text-[10px]">
                        {listing.category}
                      </Badge>
                    </TableCell>
                    <TableCell dir="ltr" className="text-sm">
                      {listing.price.toLocaleString()}
                    </TableCell>
                    <TableCell>
                      <Badge
                        className={`text-[10px] ${listingStatusColors[listing.status] ?? 'bg-gray-100 text-gray-600'}`}
                      >
                        {listing.status}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </TabsContent>

        {/* ── Bookings Tab ──────────────────────────────────── */}
        <TabsContent value="bookings">
          {bookingsLoading ? (
            <div className="space-y-2">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-10 w-full" />
              ))}
            </div>
          ) : bookings.length === 0 ? (
            <EmptyState icon={<CalendarCheck className="h-10 w-10" />} label={isRTL ? 'لا توجد حجوزات' : 'No bookings'} />
          ) : (
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
                      <Badge
                        className={`text-[10px] ${bookingStatusColors[booking.status] ?? 'bg-gray-100 text-gray-600'}`}
                      >
                        {booking.status}
                      </Badge>
                    </TableCell>
                    <TableCell dir="ltr" className="text-sm">
                      {(booking.priceCents / 100).toLocaleString()}{' '}
                      {booking.currency}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </TabsContent>

        {/* ── Payments Tab ──────────────────────────────────── */}
        <TabsContent value="payments">
          {paymentsLoading ? (
            <div className="space-y-2">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-10 w-full" />
              ))}
            </div>
          ) : payments.length === 0 ? (
            <EmptyState icon={<CreditCard className="h-10 w-10" />} label={isRTL ? 'لا توجد مدفوعات' : 'No payments'} />
          ) : (
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
                      {(payment.amountCents / 100).toLocaleString()}{' '}
                      {payment.currency}
                    </TableCell>
                    <TableCell>
                      <Badge
                        className={`text-[10px] ${paymentStatusColors[payment.status] ?? 'bg-gray-100 text-gray-600'}`}
                      >
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
          )}
        </TabsContent>
      </Tabs>
    </motion.div>
  );
}

// ── Empty State Helper ──────────────────────────────────────────

function EmptyState({
  icon,
  label,
}: {
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <div className="flex flex-col items-center gap-3 py-12 text-center">
      <div className="text-gray-300">{icon}</div>
      <p className="text-sm text-gray-500">{label}</p>
    </div>
  );
}
