'use client';

import { motion } from 'framer-motion';
import { Shield, Headphones, Globe, Cpu } from 'lucide-react';
import { useLanguage } from '@/stores/languageStore';

interface Feature {
  id: string;
  icon: React.ElementType;
  titleAr: string;
  titleEn: string;
  descAr: string;
  descEn: string;
  color: string;
  bgColor: string;
}

const features: Feature[] = [
  {
    id: 'protection',
    icon: Shield,
    titleAr: 'حماية مالية',
    titleEn: 'Financial Protection',
    descAr: 'أموالك في أمان تام مع نظام دفع مشفر وضمان استرجاع كامل',
    descEn: 'Your money is safe with encrypted payments and full refund guarantee',
    color: 'text-emerald-600',
    bgColor: 'from-emerald-500 to-emerald-600',
  },
  {
    id: 'support',
    icon: Headphones,
    titleAr: 'دعم محلي',
    titleEn: 'Local Support',
    descAr: 'فريق دعم متخصص من المنطقة يفهم احتياجاتك ويساعدك على مدار الساعة',
    descEn: 'Dedicated local support team that understands your needs 24/7',
    color: 'text-blue-600',
    bgColor: 'from-blue-500 to-blue-600',
  },
  {
    id: 'coverage',
    icon: Globe,
    titleAr: 'تغطية شاملة',
    titleEn: 'Wide Coverage',
    descAr: 'مئات المزودين والخدمات في مختلف المجالات متاحون في منطقتك',
    descEn: 'Hundreds of providers and services across various fields in your area',
    color: 'text-purple-600',
    bgColor: 'from-purple-500 to-purple-600',
  },
  {
    id: 'ai',
    icon: Cpu,
    titleAr: 'ذكاء اصطناعي',
    titleEn: 'AI Powered',
    descAr: 'توصيات ذكية مخصصة لاحتياجاتك تجعلك تعثر على الأفضل بسرعة',
    descEn: 'Smart personalized recommendations help you find the best quickly',
    color: 'text-amber-600',
    bgColor: 'from-amber-500 to-amber-600',
  },
];

interface Stat {
  valueAr: string;
  valueEn: string;
  labelAr: string;
  labelEn: string;
}

const stats: Stat[] = [
  {
    valueAr: '+١٠,٠٠٠',
    valueEn: '10,000+',
    labelAr: 'مستخدم نشط',
    labelEn: 'Active Users',
  },
  {
    valueAr: '+٥٠٠',
    valueEn: '500+',
    labelAr: 'مزود خدمة',
    labelEn: 'Service Providers',
  },
  {
    valueAr: '٤.٩/٥',
    valueEn: '4.9/5',
    labelAr: 'تقييم المستخدمين',
    labelEn: 'User Rating',
  },
];

const containerVariants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.12 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

export function WhyChooseUs() {
  const { language } = useLanguage();

  return (
    <section className="py-12 sm:py-16 bg-gradient-to-b from-gray-50 to-white">
      <div className="max-w-7xl mx-auto px-4">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-10 sm:mb-12"
        >
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3">
            {language === 'ar' ? 'لماذا نبض؟' : 'Why Nabd?'}
          </h2>
          <p className="text-gray-500 text-sm sm:text-base max-w-xl mx-auto">
            {language === 'ar'
              ? 'منصة موثوقة تجمع بين احتياجاتك وأفضل المزودين المحليين'
              : 'A trusted platform connecting your needs with the best local providers'}
          </p>
        </motion.div>

        {/* Features Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 sm:gap-6 mb-12 sm:mb-16"
        >
          {features.map((feature) => {
            const Icon = feature.icon;
            return (
              <motion.div
                key={feature.id}
                variants={itemVariants}
                whileHover={{ y: -6 }}
                className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow text-center"
              >
                <div
                  className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${feature.bgColor} flex items-center justify-center mx-auto mb-4 shadow-sm`}
                >
                  <Icon className="w-7 h-7 text-white" />
                </div>
                <h3 className="font-bold text-base text-gray-900 mb-2">
                  {language === 'ar' ? feature.titleAr : feature.titleEn}
                </h3>
                <p className="text-sm text-gray-500 leading-relaxed">
                  {language === 'ar' ? feature.descAr : feature.descEn}
                </p>
              </motion.div>
            );
          })}
        </motion.div>

        {/* Stats Bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="bg-gradient-to-r from-red-500 to-red-600 rounded-2xl p-6 sm:p-8 shadow-lg"
        >
          <div className="grid grid-cols-3 gap-4 sm:gap-8 text-center">
            {stats.map((stat, idx) => (
              <div key={idx}>
                <div className="text-2xl sm:text-3xl font-bold text-white mb-1">
                  {language === 'ar' ? stat.valueAr : stat.valueEn}
                </div>
                <div className="text-sm text-white/80">
                  {language === 'ar' ? stat.labelAr : stat.labelEn}
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
