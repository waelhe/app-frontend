'use client';

import { useLanguage } from '@/contexts/LanguageContext';
import { Card, CardContent } from '@/components/ui/card';
import { Phone, Ambulance, Flame, Shield, Siren, Heart, AlertTriangle } from 'lucide-react';

const urgentServices = [
  { id: '1', nameEn: 'Ambulance', nameAr: 'الإسعاف', phone: '110', icon: Ambulance, color: 'bg-red-500' },
  { id: '2', nameEn: 'Fire Department', nameAr: 'الدفاع المدني', phone: '113', icon: Flame, color: 'bg-orange-500' },
  { id: '3', nameEn: 'Police', nameAr: 'الشرطة', phone: '112', icon: Shield, color: 'bg-blue-600' },
  { id: '4', nameEn: 'Civil Defense', nameAr: 'الدفاع المدني', phone: '113', icon: Siren, color: 'bg-yellow-500' },
  { id: '5', nameEn: 'Emergency Hospital', nameAr: 'طوارئ المستشفى', phone: '114', icon: Heart, color: 'bg-pink-500' },
  { id: '6', nameEn: 'Red Crescent', nameAr: 'الهلال الأحمر', phone: '111', icon: AlertTriangle, color: 'bg-red-600' },
];

export default function UrgentServices() {
  const { language, t } = useLanguage();
  const isRTL = language === 'ar';

  const handleCall = (phone: string) => {
    window.open(`tel:${phone}`, '_self');
  };

  return (
    <section className="py-4">
      <h2 className="text-xl font-bold mb-4 text-red-600 flex items-center gap-2">
        <AlertTriangle className="w-5 h-5" />
        {isRTL ? 'خدمات الطوارئ' : t('emergency.title')}
      </h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {urgentServices.map((service) => {
          const Icon = service.icon;
          return (
            <Card
              key={service.id}
              className="cursor-pointer hover:shadow-lg transition-all duration-200 border-red-200 hover:border-red-400 active:scale-95"
              onClick={() => handleCall(service.phone)}
            >
              <CardContent className="p-4 flex flex-col items-center text-center gap-2">
                <div className={`w-12 h-12 rounded-full ${service.color} flex items-center justify-center`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <span className="font-semibold text-sm">
                  {isRTL ? service.nameAr : service.nameEn}
                </span>
                <span className="flex items-center gap-1 text-red-600 font-bold text-lg">
                  <Phone className="w-3 h-3" />
                  {service.phone}
                </span>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </section>
  );
}
