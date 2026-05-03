'use client';

import { useLanguage } from '@/stores/languageStore';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Wifi, WifiOff, AlertTriangle, CheckCircle2, XCircle } from 'lucide-react';

const services = [
  { id: '1', nameEn: 'Water Supply', nameAr: 'مياه', status: 'operational', statusEn: 'Operational', statusAr: 'يعمل' },
  { id: '2', nameEn: 'Electricity', nameAr: 'كهرباء', status: 'degraded', statusEn: 'Partial Outage', statusAr: 'انقطاع جزئي' },
  { id: '3', nameEn: 'Internet', nameAr: 'إنترنت', status: 'operational', statusEn: 'Operational', statusAr: 'يعمل' },
  { id: '4', nameEn: 'Road Access', nameAr: 'طرقات', status: 'outage', statusEn: 'Blocked', statusAr: 'مغلق' },
];

const statusConfig = {
  operational: { icon: CheckCircle2, color: 'text-green-500', bg: 'bg-green-50', badge: 'bg-green-500' },
  degraded: { icon: AlertTriangle, color: 'text-yellow-500', bg: 'bg-yellow-50', badge: 'bg-yellow-500' },
  outage: { icon: XCircle, color: 'text-red-500', bg: 'bg-red-50', badge: 'bg-red-500' },
};

export default function ServiceStatus() {
  const { language } = useLanguage();
  const isRTL = language === 'ar';

  const operationalCount = services.filter((s) => s.status === 'operational').length;
  const allOk = operationalCount === services.length;

  return (
    <Card className={`${allOk ? 'border-green-200' : 'border-yellow-200'}`}>
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-bold text-sm flex items-center gap-2">
            {allOk ? (
              <Wifi className="w-4 h-4 text-green-500" />
            ) : (
              <WifiOff className="w-4 h-4 text-yellow-500" />
            )}
            {isRTL ? 'حالة الخدمات' : 'Service Status'}
          </h3>
          <Badge className={`${allOk ? 'bg-green-500' : 'bg-yellow-500'} text-white text-xs`}>
            {operationalCount}/{services.length} {isRTL ? 'تعمل' : 'OK'}
          </Badge>
        </div>
        <div className="space-y-2">
          {services.map((service) => {
            const config = statusConfig[service.status as keyof typeof statusConfig];
            const Icon = config.icon;
            return (
              <div key={service.id} className={`flex items-center justify-between p-2 rounded-lg ${config.bg}`}>
                <span className="text-xs font-medium flex items-center gap-1.5">
                  <Icon className={`w-3.5 h-3.5 ${config.color}`} />
                  {isRTL ? service.nameAr : service.nameEn}
                </span>
                <span className="text-xs text-muted-foreground">
                  {isRTL ? service.statusAr : service.statusEn}
                </span>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
