'use client';

import { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Building2, Home, Building, MapPin, Filter } from 'lucide-react';

const propertyTypes = [
  { id: 'apartment', labelEn: 'Apartments', labelAr: 'شقق', icon: Building },
  { id: 'villa', labelEn: 'Villas', labelAr: 'فلل', icon: Home },
  { id: 'office', labelEn: 'Offices', labelAr: 'مكاتب', icon: Building2 },
  { id: 'land', labelEn: 'Land', labelAr: 'أراضي', icon: MapPin },
];

const properties = [
  {
    id: '1',
    titleEn: '2-Bedroom Apartment',
    titleAr: 'شقة غرفتين',
    price: '15,000,000',
    locationEn: 'Qudsaya Center',
    locationAr: 'مركز قدسيا',
    type: 'apartment',
    area: '120',
  },
  {
    id: '2',
    titleEn: 'Modern Villa with Garden',
    titleAr: 'فيلا حديثة مع حديقة',
    price: '65,000,000',
    locationEn: 'Qudsaya Dahia',
    locationAr: 'ضاحية قدسيا',
    type: 'villa',
    area: '350',
  },
  {
    id: '3',
    titleEn: 'Office Space for Rent',
    titleAr: 'مكتب للإيجار',
    price: '500,000/mo',
    locationEn: 'Main Street',
    locationAr: 'الشارع الرئيسي',
    type: 'office',
    area: '80',
  },
  {
    id: '4',
    titleEn: 'Residential Land Plot',
    titleAr: 'قطعة أرض سكنية',
    price: '30,000,000',
    locationEn: 'Qudsaya Dahia',
    locationAr: 'ضاحية قدسيا',
    type: 'land',
    area: '500',
  },
];

export default function RealEstate() {
  const { language } = useLanguage();
  const isRTL = language === 'ar';
  const [selectedType, setSelectedType] = useState<string | null>(null);

  const filtered = selectedType
    ? properties.filter((p) => p.type === selectedType)
    : properties;

  return (
    <section className="py-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold flex items-center gap-2">
          <Building2 className="w-5 h-5 text-red-500" />
          {isRTL ? 'العقارات' : 'Real Estate'}
        </h2>
        <Button variant="outline" size="sm" className="text-xs">
          <Filter className="w-3 h-3 me-1" />
          {isRTL ? 'تصفية' : 'Filter'}
        </Button>
      </div>

      <div className="flex gap-2 mb-4 overflow-x-auto pb-1" style={{ scrollbarWidth: 'none' }}>
        <Button
          size="sm"
          variant={selectedType === null ? 'default' : 'outline'}
          className={selectedType === null ? 'bg-red-500 hover:bg-red-600' : ''}
          onClick={() => setSelectedType(null)}
        >
          {isRTL ? 'الكل' : 'All'}
        </Button>
        {propertyTypes.map((pt) => {
          const Icon = pt.icon;
          return (
            <Button
              key={pt.id}
              size="sm"
              variant={selectedType === pt.id ? 'default' : 'outline'}
              className={selectedType === pt.id ? 'bg-red-500 hover:bg-red-600' : ''}
              onClick={() => setSelectedType(pt.id)}
            >
              <Icon className="w-3 h-3 me-1" />
              {isRTL ? pt.labelAr : pt.labelEn}
            </Button>
          );
        })}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {filtered.map((property) => (
          <Card key={property.id} className="hover:shadow-md transition-shadow cursor-pointer">
            <CardContent className="p-4">
              <div className="w-full h-28 bg-muted rounded-lg flex items-center justify-center mb-3">
                <Building2 className="w-8 h-8 text-muted-foreground/30" />
              </div>
              <h3 className="font-semibold text-sm mb-1">
                {isRTL ? property.titleAr : property.titleEn}
              </h3>
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-2">
                <MapPin className="w-3 h-3" />
                {isRTL ? property.locationAr : property.locationEn}
              </div>
              <div className="flex items-center justify-between">
                <span className="text-red-600 font-bold text-sm">{property.price} SYP</span>
                <Badge variant="secondary" className="text-xs">
                  {property.area} m²
                </Badge>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
}
