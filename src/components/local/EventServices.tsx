'use client';

import { useLanguage } from '@/stores/languageStore';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { PartyPopper, MapPin, Phone, Star } from 'lucide-react';

const eventServices = [
  {
    id: '1',
    nameEn: 'Dream Events',
    nameAr: 'أحداث الحلم',
    typeEn: 'Wedding Planning',
    typeAr: 'تنظيم أعراس',
    rating: 4.9,
    locationEn: 'Main Street',
    locationAr: 'الشارع الرئيسي',
    phone: '011-2342343',
  },
  {
    id: '2',
    nameEn: 'Party Hall Rental',
    nameAr: 'تأجير قاعات الحفلات',
    typeEn: 'Venue Rental',
    typeAr: 'تأجير قاعات',
    rating: 4.6,
    locationEn: 'Qudsaya Center',
    locationAr: 'مركز قدسيا',
    phone: '011-3453454',
  },
  {
    id: '3',
    nameEn: 'Sweet Table Catering',
    nameAr: 'تموين طاولة الحلويات',
    typeEn: 'Catering',
    typeAr: 'تموين',
    rating: 4.7,
    locationEn: 'Dahia District',
    locationAr: 'حي الضاحية',
    phone: '011-4564565',
  },
  {
    id: '4',
    nameEn: 'Flower & Decor',
    nameAr: 'زهور وديكور',
    typeEn: 'Decoration',
    typeAr: 'ديكور',
    rating: 4.5,
    locationEn: 'Riverside Road',
    locationAr: 'طريق النهر',
    phone: '011-5675676',
  },
];

export default function EventServices() {
  const { language } = useLanguage();
  const isRTL = language === 'ar';

  return (
    <section className="py-4">
      <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
        <PartyPopper className="w-5 h-5 text-red-500" />
        {isRTL ? 'خدمات الفعاليات' : 'Event Services'}
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {eventServices.map((service) => (
          <Card key={service.id} className="hover:shadow-md transition-shadow cursor-pointer">
            <CardContent className="p-4">
              <div className="w-full h-20 bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg flex items-center justify-center mb-3">
                <PartyPopper className="w-8 h-8 text-purple-300" />
              </div>
              <div className="flex items-start justify-between mb-1">
                <h3 className="font-semibold text-sm">{isRTL ? service.nameAr : service.nameEn}</h3>
                <div className="flex items-center gap-1 shrink-0">
                  <Star className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" />
                  <span className="text-xs font-medium">{service.rating}</span>
                </div>
              </div>
              <Badge variant="outline" className="text-xs mb-2">
                {isRTL ? service.typeAr : service.typeEn}
              </Badge>
              <div className="space-y-1 text-xs text-muted-foreground">
                <div className="flex items-center gap-1.5">
                  <MapPin className="w-3 h-3" />
                  {isRTL ? service.locationAr : service.locationEn}
                </div>
                <div
                  className="flex items-center gap-1.5 text-red-500 cursor-pointer"
                  onClick={() => window.open(`tel:${service.phone}`, '_self')}
                >
                  <Phone className="w-3 h-3" />
                  {service.phone}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
}
