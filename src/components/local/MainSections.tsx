'use client';

import { useLanguage } from '@/stores/languageStore';
import { useNavigationStore } from '@/stores/navigationStore';
import { Card, CardContent } from '@/components/ui/card';
import {
  Siren,
  Stethoscope,
  ShoppingBag,
  Utensils,
  Coffee,
  Scissors,
  Car,
  Fuel,
  Wrench,
  Store,
  GraduationCap,
  Dumbbell,
  BedDouble,
  Bus,
  Briefcase,
  Building2,
  Banknote,
  Landmark,
  Hospital,
  WashingMachine,
  PartyPopper,
  Package,
  MapPin,
  Newspaper,
  Tag,
  Home,
} from 'lucide-react';

const sections = [
  { id: 'emergency', labelEn: 'Emergency', labelAr: 'الطوارئ', icon: Siren, color: 'text-red-500', bg: 'bg-red-50' },
  { id: 'doctors', labelEn: 'Doctors', labelAr: 'أطباء', icon: Stethoscope, color: 'text-blue-500', bg: 'bg-blue-50' },
  { id: 'markets', labelEn: 'Markets', labelAr: 'أسواق', icon: ShoppingBag, color: 'text-green-500', bg: 'bg-green-50' },
  { id: 'restaurants', labelEn: 'Restaurants', labelAr: 'مطاعم', icon: Utensils, color: 'text-orange-500', bg: 'bg-orange-50' },
  { id: 'cafes', labelEn: 'Cafes', labelAr: 'مقاهي', icon: Coffee, color: 'text-amber-600', bg: 'bg-amber-50' },
  { id: 'beauty', labelEn: 'Beauty', labelAr: 'جمال', icon: Scissors, color: 'text-pink-500', bg: 'bg-pink-50' },
  { id: 'cars', labelEn: 'Car Services', labelAr: 'سيارات', icon: Car, color: 'text-slate-500', bg: 'bg-slate-50' },
  { id: 'gas', labelEn: 'Gas Stations', labelAr: 'محطات وقود', icon: Fuel, color: 'text-emerald-500', bg: 'bg-emerald-50' },
  { id: 'craftsmen', labelEn: 'Craftsmen', labelAr: 'حرفيين', icon: Wrench, color: 'text-yellow-600', bg: 'bg-yellow-50' },
  { id: 'shops', labelEn: 'Shops', labelAr: 'متاجر', icon: Store, color: 'text-purple-500', bg: 'bg-purple-50' },
  { id: 'education', labelEn: 'Education', labelAr: 'تعليم', icon: GraduationCap, color: 'text-indigo-500', bg: 'bg-indigo-50' },
  { id: 'sports', labelEn: 'Sports', labelAr: 'رياضة', icon: Dumbbell, color: 'text-teal-500', bg: 'bg-teal-50' },
  { id: 'hotels', labelEn: 'Hotels', labelAr: 'فنادق', icon: BedDouble, color: 'text-cyan-500', bg: 'bg-cyan-50' },
  { id: 'transport', labelEn: 'Transport', labelAr: 'نقل', icon: Bus, color: 'text-blue-600', bg: 'bg-blue-50' },
  { id: 'professionals', labelEn: 'Professionals', labelAr: 'محترفون', icon: Briefcase, color: 'text-gray-500', bg: 'bg-gray-50' },
  { id: 'offices', labelEn: 'Offices', labelAr: 'مكاتب', icon: Building2, color: 'text-stone-500', bg: 'bg-stone-50' },
  { id: 'finance', labelEn: 'Finance', labelAr: 'مالية', icon: Banknote, color: 'text-emerald-600', bg: 'bg-emerald-50' },
  { id: 'government', labelEn: 'Government', labelAr: 'حكومي', icon: Landmark, color: 'text-slate-600', bg: 'bg-slate-50' },
  { id: 'medical', labelEn: 'Medical Centers', labelAr: 'مراكز طبية', icon: Hospital, color: 'text-red-600', bg: 'bg-red-50' },
  { id: 'laundry', labelEn: 'Laundry', labelAr: 'مغاسل', icon: WashingMachine, color: 'text-sky-500', bg: 'bg-sky-50' },
  { id: 'events', labelEn: 'Event Services', labelAr: 'فعاليات', icon: PartyPopper, color: 'text-fuchsia-500', bg: 'bg-fuchsia-50' },
  { id: 'used', labelEn: 'Used Items', labelAr: 'مستعمل', icon: Package, color: 'text-amber-500', bg: 'bg-amber-50' },
  { id: 'places', labelEn: 'Places', labelAr: 'أماكن', icon: MapPin, color: 'text-teal-600', bg: 'bg-teal-50' },
  { id: 'news', labelEn: 'News', labelAr: 'أخبار', icon: Newspaper, color: 'text-gray-600', bg: 'bg-gray-50' },
  { id: 'offers', labelEn: 'Offers', labelAr: 'عروض', icon: Tag, color: 'text-red-500', bg: 'bg-red-50' },
  { id: 'realestate', labelEn: 'Real Estate', labelAr: 'عقارات', icon: Home, color: 'text-green-600', bg: 'bg-green-50' },
];

export default function MainSections() {
  const { language } = useLanguage();
  const { navigate } = useNavigationStore();
  const isRTL = language === 'ar';

  return (
    <section className="py-4">
      <h2 className="text-xl font-bold mb-4">
        {isRTL ? 'الأقسام الرئيسية' : 'Main Sections'}
      </h2>
      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2">
        {sections.map((section) => {
          const Icon = section.icon;
          return (
            <Card
              key={section.id}
              className="cursor-pointer hover:shadow-md transition-all duration-200 active:scale-95"
              onClick={() => navigate('directory', { section: section.id })}
            >
              <CardContent className="p-3 flex flex-col items-center text-center gap-1.5">
                <div className={`w-10 h-10 rounded-xl ${section.bg} flex items-center justify-center`}>
                  <Icon className={`w-5 h-5 ${section.color}`} />
                </div>
                <span className="text-xs font-medium leading-tight">
                  {isRTL ? section.labelAr : section.labelEn}
                </span>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </section>
  );
}
