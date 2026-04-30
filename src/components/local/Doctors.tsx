'use client';

import { useLanguage } from '@/contexts/LanguageContext';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Stethoscope, Star, MapPin, Phone } from 'lucide-react';

const doctors = [
  {
    id: '1',
    nameEn: 'Dr. Ahmad Khalil',
    nameAr: 'د. أحمد خليل',
    specialtyEn: 'General Medicine',
    specialtyAr: 'طب عام',
    rating: 4.8,
    locationEn: 'Qudsaya Center',
    locationAr: 'مركز قدسيا',
    phone: '011-1234567',
    available: true,
  },
  {
    id: '2',
    nameEn: 'Dr. Sara Haddad',
    nameAr: 'د. سارة حداد',
    specialtyEn: 'Pediatrics',
    specialtyAr: 'طب أطفال',
    rating: 4.9,
    locationEn: 'Dahia District',
    locationAr: 'حي الضاحية',
    phone: '011-2345678',
    available: true,
  },
  {
    id: '3',
    nameEn: 'Dr. Omar Mansour',
    nameAr: 'د. عمر منصور',
    specialtyEn: 'Cardiology',
    specialtyAr: 'أمراض القلب',
    rating: 4.7,
    locationEn: 'Main Street',
    locationAr: 'الشارع الرئيسي',
    phone: '011-3456789',
    available: false,
  },
  {
    id: '4',
    nameEn: 'Dr. Layla Abbas',
    nameAr: 'د. ليلى عباس',
    specialtyEn: 'Dermatology',
    specialtyAr: 'أمراض جلدية',
    rating: 4.6,
    locationEn: 'Qudsaya Center',
    locationAr: 'مركز قدسيا',
    phone: '011-4567890',
    available: true,
  },
];

export default function Doctors() {
  const { language } = useLanguage();
  const isRTL = language === 'ar';

  return (
    <section className="py-4">
      <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
        <Stethoscope className="w-5 h-5 text-red-500" />
        {isRTL ? 'الأطباء' : 'Doctors'}
      </h2>
      <div className="space-y-3">
        {doctors.map((doctor) => (
          <Card key={doctor.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center shrink-0">
                  <Stethoscope className="w-6 h-6 text-red-500" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between mb-1">
                    <h3 className="font-semibold text-sm">
                      {isRTL ? doctor.nameAr : doctor.nameEn}
                    </h3>
                    <Badge
                      variant={doctor.available ? 'default' : 'secondary'}
                      className={`text-xs shrink-0 ms-2 ${doctor.available ? 'bg-green-500 hover:bg-green-600' : ''}`}
                    >
                      {doctor.available
                        ? isRTL ? 'متاح' : 'Available'
                        : isRTL ? 'غير متاح' : 'Unavailable'}
                    </Badge>
                  </div>
                  <p className="text-xs text-red-500 font-medium mb-1">
                    {isRTL ? doctor.specialtyAr : doctor.specialtyEn}
                  </p>
                  <div className="flex items-center gap-3 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                      {doctor.rating}
                    </span>
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3 h-3" />
                      {isRTL ? doctor.locationAr : doctor.locationEn}
                    </span>
                  </div>
                </div>
              </div>
              <Button
                size="sm"
                variant="outline"
                className="w-full mt-3 text-xs"
                onClick={() => window.open(`tel:${doctor.phone}`, '_self')}
              >
                <Phone className="w-3 h-3 me-1" />
                {isRTL ? 'حجز موعد' : 'Book Appointment'}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
}
