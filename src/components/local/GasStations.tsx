'use client';

import { useLanguage } from '@/stores/languageStore';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Fuel, Clock, MapPin, Phone } from 'lucide-react';

const gasStations = [
  {
    id: '1',
    nameEn: 'Al-Fayhaa Station',
    nameAr: 'محطة الفيحاء',
    locationEn: 'Highway Entry',
    locationAr: 'مدخل السريع',
    phone: '011-9999999',
    hoursEn: '24 Hours',
    hoursAr: '24 ساعة',
    fuelTypes: ['Diesel', 'Gasoline', 'Gas'],
    fuelTypesAr: ['ديزل', 'بنزين', 'غاز'],
    hasShop: true,
  },
  {
    id: '2',
    nameEn: 'National Oil Station',
    nameAr: 'محطة النفط الوطنية',
    locationEn: 'Main Street',
    locationAr: 'الشارع الرئيسي',
    phone: '011-1010101',
    hoursEn: '6 AM - 12 AM',
    hoursAr: '6 ص - 12 م',
    fuelTypes: ['Diesel', 'Gasoline'],
    fuelTypesAr: ['ديزل', 'بنزين'],
    hasShop: false,
  },
  {
    id: '3',
    nameEn: 'City Fuel Center',
    nameAr: 'مركز وقود المدينة',
    locationEn: 'Qudsaya Dahia',
    locationAr: 'ضاحية قدسيا',
    phone: '011-2020202',
    hoursEn: '24 Hours',
    hoursAr: '24 ساعة',
    fuelTypes: ['Gasoline', 'Gas'],
    fuelTypesAr: ['بنزين', 'غاز'],
    hasShop: true,
  },
];

export default function GasStations() {
  const { language } = useLanguage();
  const isRTL = language === 'ar';

  return (
    <section className="py-4">
      <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
        <Fuel className="w-5 h-5 text-red-500" />
        {isRTL ? 'محطات الوقود' : 'Gas Stations'}
      </h2>
      <div className="space-y-3">
        {gasStations.map((station) => (
          <Card key={station.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-full bg-green-50 flex items-center justify-center shrink-0">
                  <Fuel className="w-5 h-5 text-green-600" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-sm">{isRTL ? station.nameAr : station.nameEn}</h3>
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <MapPin className="w-3 h-3" />
                    {isRTL ? station.locationAr : station.locationEn}
                  </div>
                </div>
                {station.hasShop && (
                  <Badge variant="secondary" className="text-xs">
                    {isRTL ? 'سوق' : 'Shop'}
                  </Badge>
                )}
              </div>
              <div className="flex flex-wrap gap-1 mb-2 ms-13">
                {(isRTL ? station.fuelTypesAr : station.fuelTypes).map((ft, i) => (
                  <Badge key={i} variant="outline" className="text-xs">
                    {ft}
                  </Badge>
                ))}
              </div>
              <div className="flex items-center gap-4 text-xs text-muted-foreground ms-13">
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {isRTL ? station.hoursAr : station.hoursEn}
                </span>
                <span
                  className="flex items-center gap-1 text-red-500 cursor-pointer"
                  onClick={() => window.open(`tel:${station.phone}`, '_self')}
                >
                  <Phone className="w-3 h-3" />
                  {station.phone}
                </span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
}
