'use client';

import { useLanguage } from '@/stores/languageStore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Phone, Stethoscope, ShieldCheck, Zap, Droplets, Building2 } from 'lucide-react';

interface EmergencyContact {
  id: string;
  nameEn: string;
  nameAr: string;
  phone: string;
  category: 'medical' | 'security' | 'utilities';
}

const contacts: EmergencyContact[] = [
  { id: '1', nameEn: 'Central Hospital', nameAr: 'المستشفى المركزي', phone: '011-2222333', category: 'medical' },
  { id: '2', nameEn: 'Ambulance Service', nameAr: 'خدمة الإسعاف', phone: '110', category: 'medical' },
  { id: '3', nameEn: 'Red Crescent', nameAr: 'الهلال الأحمر', phone: '111', category: 'medical' },
  { id: '4', nameEn: 'Police Station', nameAr: 'مركز الشرطة', phone: '112', category: 'security' },
  { id: '5', nameEn: 'Civil Defense', nameAr: 'الدفاع المدني', phone: '113', category: 'security' },
  { id: '6', nameEn: 'Electricity Emergency', nameAr: 'طوارئ الكهرباء', phone: '011-4444555', category: 'utilities' },
  { id: '7', nameEn: 'Water Emergency', nameAr: 'طوارئ المياه', phone: '011-6666777', category: 'utilities' },
];

const categoryConfig = {
  medical: { icon: Stethoscope, color: 'text-red-500', bg: 'bg-red-50', labelEn: 'Medical', labelAr: 'طبي' },
  security: { icon: ShieldCheck, color: 'text-blue-600', bg: 'bg-blue-50', labelEn: 'Security', labelAr: 'أمني' },
  utilities: { icon: Zap, color: 'text-yellow-600', bg: 'bg-yellow-50', labelEn: 'Utilities', labelAr: 'خدمات' },
};

export default function EmergencyContacts() {
  const { language } = useLanguage();
  const isRTL = language === 'ar';

  const categories = ['medical', 'security', 'utilities'] as const;

  return (
    <section className="py-4">
      <h2 className="text-xl font-bold mb-4">
        {isRTL ? 'أرقام الطوارئ' : 'Emergency Contacts'}
      </h2>
      <div className="space-y-4">
        {categories.map((cat) => {
          const config = categoryConfig[cat];
          const CatIcon = config.icon;
          const filtered = contacts.filter((c) => c.category === cat);
          return (
            <Card key={cat}>
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-base">
                  <CatIcon className={`w-5 h-5 ${config.color}`} />
                  {isRTL ? config.labelAr : config.labelEn}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {filtered.map((contact) => (
                  <div
                    key={contact.id}
                    className={`flex items-center justify-between p-3 rounded-lg ${config.bg} cursor-pointer hover:opacity-80 transition-opacity`}
                    onClick={() => window.open(`tel:${contact.phone}`, '_self')}
                  >
                    <div className="flex items-center gap-3">
                      {cat === 'utilities' ? (
                        contact.nameEn.includes('Water') ? (
                          <Droplets className="w-4 h-4 text-blue-500" />
                        ) : (
                          <Zap className="w-4 h-4 text-yellow-500" />
                        )
                      ) : cat === 'medical' ? (
                        <Stethoscope className="w-4 h-4 text-red-500" />
                      ) : (
                        <Building2 className="w-4 h-4 text-blue-500" />
                      )}
                      <span className="font-medium text-sm">
                        {isRTL ? contact.nameAr : contact.nameEn}
                      </span>
                    </div>
                    <span className="flex items-center gap-1 text-sm font-bold text-red-600">
                      <Phone className="w-3 h-3" />
                      {contact.phone}
                    </span>
                  </div>
                ))}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </section>
  );
}
