'use client';

import { motion } from 'framer-motion';
import {
  UtensilsCrossed,
  Coffee,
  Hotel,
  Stethoscope,
  Pill,
  Building2,
  Scissors,
  WashingMachine,
  Car,
  Fuel,
  GraduationCap,
  Dumbbell,
  Briefcase,
  Building,
  Landmark,
  ShieldAlert,
  Flame,
  HeartPulse,
  Phone,
} from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useNavigationStore } from '@/stores/navigationStore';

interface DirectoryItem {
  id: string;
  icon: React.ElementType;
  labelAr: string;
  labelEn: string;
  count?: number;
}

interface DirectoryGroup {
  id: string;
  labelAr: string;
  labelEn: string;
  headerGradient: string;
  items: DirectoryItem[];
}

const directoryGroups: DirectoryGroup[] = [
  {
    id: 'food-hospitality',
    labelAr: 'طعام وضيافة',
    labelEn: 'Food & Hospitality',
    headerGradient: 'from-orange-500 to-amber-500',
    items: [
      { id: 'restaurants', icon: UtensilsCrossed, labelAr: 'مطاعم', labelEn: 'Restaurants', count: 48 },
      { id: 'cafes', icon: Coffee, labelAr: 'مقاهي', labelEn: 'Cafes', count: 23 },
      { id: 'hotels', icon: Hotel, labelAr: 'فنادق', labelEn: 'Hotels', count: 12 },
    ],
  },
  {
    id: 'health-medical',
    labelAr: 'صحة وطبية',
    labelEn: 'Health & Medical',
    headerGradient: 'from-red-500 to-rose-500',
    items: [
      { id: 'doctors', icon: Stethoscope, labelAr: 'أطباء', labelEn: 'Doctors', count: 35 },
      { id: 'pharmacies', icon: Pill, labelAr: 'صيدليات', labelEn: 'Pharmacies', count: 18 },
      { id: 'medical-centers', icon: Building, labelAr: 'مراكز طبية', labelEn: 'Medical Centers', count: 8 },
    ],
  },
  {
    id: 'beauty-care',
    labelAr: 'جمال وعناية',
    labelEn: 'Beauty & Care',
    headerGradient: 'from-pink-500 to-fuchsia-500',
    items: [
      { id: 'beauty-salons', icon: Scissors, labelAr: 'صالونات تجميل', labelEn: 'Beauty Salons', count: 30 },
      { id: 'laundry', icon: WashingMachine, labelAr: 'مغاسل', labelEn: 'Laundry', count: 10 },
    ],
  },
  {
    id: 'cars-transport',
    labelAr: 'سيارات ونقل',
    labelEn: 'Cars & Transport',
    headerGradient: 'from-sky-500 to-cyan-500',
    items: [
      { id: 'car-services', icon: Car, labelAr: 'خدمات سيارات', labelEn: 'Car Services', count: 22 },
      { id: 'gas-stations', icon: Fuel, labelAr: 'محطات وقود', labelEn: 'Gas Stations', count: 7 },
    ],
  },
  {
    id: 'education-sports',
    labelAr: 'تعليم ورياضة',
    labelEn: 'Education & Sports',
    headerGradient: 'from-violet-500 to-purple-500',
    items: [
      { id: 'schools', icon: GraduationCap, labelAr: 'مدارس ومعاهد', labelEn: 'Schools & Institutes', count: 15 },
      { id: 'sports', icon: Dumbbell, labelAr: 'مراكز رياضية', labelEn: 'Sports Centers', count: 9 },
    ],
  },
  {
    id: 'business-offices',
    labelAr: 'أعمال ومكاتب',
    labelEn: 'Business & Offices',
    headerGradient: 'from-emerald-500 to-teal-500',
    items: [
      { id: 'professionals', icon: Briefcase, labelAr: 'مهنيون', labelEn: 'Professionals', count: 28 },
      { id: 'offices', icon: Building2, labelAr: 'مكاتب', labelEn: 'Offices', count: 14 },
      { id: 'financial', icon: Landmark, labelAr: 'مالية وبنوك', labelEn: 'Financial & Banks', count: 6 },
    ],
  },
  {
    id: 'public-services',
    labelAr: 'خدمات عامة',
    labelEn: 'Public Services',
    headerGradient: 'from-slate-600 to-gray-600',
    items: [
      { id: 'government', icon: ShieldAlert, labelAr: 'دوائر حكومية', labelEn: 'Government', count: 5 },
      { id: 'emergency', icon: Flame, labelAr: 'طوارئ', labelEn: 'Emergency', count: 3 },
      { id: 'health-emergency', icon: HeartPulse, labelAr: 'صحة طوارئ', labelEn: 'Health Emergency', count: 4 },
    ],
  },
];

const containerVariants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.08 },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

export function InteractiveDirectorySection() {
  const { language } = useLanguage();
  const navigate = useNavigationStore((s) => s.navigate);

  const handleItemClick = (itemId: string) => {
    navigate('directory', { category: itemId });
  };

  const handleEmergencyCall = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigate('emergency');
  };

  return (
    <section className="py-8 sm:py-10 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-8 sm:mb-10"
        >
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
            {language === 'ar' ? 'دليل الخدمات' : 'Service Directory'}
          </h2>
          <p className="text-gray-500 text-sm sm:text-base max-w-xl mx-auto">
            {language === 'ar'
              ? 'جميع الخدمات والمزودين في مكان واحد منظّم حسب الفئات'
              : 'All services and providers in one place, organized by category'}
          </p>
        </motion.div>

        {/* Directory Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5"
        >
          {directoryGroups.map((group) => (
            <motion.div
              key={group.id}
              variants={cardVariants}
              whileHover={{ y: -4 }}
              className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
            >
              {/* Colored Header */}
              <div
                className={`bg-gradient-to-l ${group.headerGradient} px-4 py-3 flex items-center justify-between`}
              >
                <h3 className="font-bold text-sm text-white">
                  {language === 'ar' ? group.labelAr : group.labelEn}
                </h3>
                <Phone className="w-4 h-4 text-white/70" />
              </div>

              {/* Items Grid */}
              <div className="p-3 grid grid-cols-2 gap-2">
                {group.items.map((item) => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.id}
                      onClick={(e) =>
                        item.id === 'emergency' || item.id === 'health-emergency'
                          ? handleEmergencyCall(e)
                          : handleItemClick(item.id)
                      }
                      className="flex flex-col items-center gap-1.5 p-3 rounded-xl hover:bg-gray-50 transition-colors text-center group/item"
                    >
                      <div className="w-10 h-10 rounded-xl bg-gray-100 group-hover/item:bg-gray-200 flex items-center justify-center transition-colors">
                        <Icon className="w-5 h-5 text-gray-600" />
                      </div>
                      <span className="text-xs font-medium text-gray-700 group-hover/item:text-gray-900 whitespace-nowrap">
                        {language === 'ar' ? item.labelAr : item.labelEn}
                      </span>
                      {item.count != null && (
                        <span className="text-[10px] text-gray-400">
                          {item.count} {language === 'ar' ? 'مزود' : 'providers'}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
