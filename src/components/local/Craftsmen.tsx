'use client';

import { useLanguage } from '@/contexts/LanguageContext';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Wrench, Zap, Droplets, Paintbrush, Hammer, Phone, Star } from 'lucide-react';

const trades = [
  { id: 'plumbing', labelEn: 'Plumbing', labelAr: 'سباكة', icon: Droplets, color: 'text-blue-500' },
  { id: 'electrical', labelEn: 'Electrical', labelAr: 'كهرباء', icon: Zap, color: 'text-yellow-500' },
  { id: 'painting', labelEn: 'Painting', labelAr: 'دهان', icon: Paintbrush, color: 'text-green-500' },
  { id: 'carpentry', labelEn: 'Carpentry', labelAr: 'نجارة', icon: Hammer, color: 'text-amber-600' },
];

const craftsmen = [
  {
    id: '1',
    nameEn: 'Abu Hassan Plumbing',
    nameAr: 'سباكة أبو حسن',
    trade: 'plumbing',
    rating: 4.6,
    phone: '099-1111111',
    experience: 15,
  },
  {
    id: '2',
    nameEn: 'Al-Raee Electric',
    nameAr: 'كهرباء الراعي',
    trade: 'electrical',
    rating: 4.8,
    phone: '099-2222222',
    experience: 20,
  },
  {
    id: '3',
    nameEn: 'Perfect Paint',
    nameAr: 'الدهان المثالي',
    trade: 'painting',
    rating: 4.4,
    phone: '099-3333333',
    experience: 10,
  },
  {
    id: '4',
    nameEn: 'Heritage Carpentry',
    nameAr: 'نجارة التراث',
    trade: 'carpentry',
    rating: 4.7,
    phone: '099-4444444',
    experience: 25,
  },
];

export default function Craftsmen() {
  const { language } = useLanguage();
  const isRTL = language === 'ar';

  return (
    <section className="py-4">
      <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
        <Wrench className="w-5 h-5 text-red-500" />
        {isRTL ? 'الحرفيين' : 'Craftsmen'}
      </h2>

      <div className="grid grid-cols-4 gap-2 mb-4">
        {trades.map((trade) => {
          const Icon = trade.icon;
          return (
            <div key={trade.id} className="flex flex-col items-center gap-1 p-2 rounded-lg bg-muted/50 cursor-pointer hover:bg-muted transition-colors">
              <Icon className={`w-6 h-6 ${trade.color}`} />
              <span className="text-xs text-center">{isRTL ? trade.labelAr : trade.labelEn}</span>
            </div>
          );
        })}
      </div>

      <div className="space-y-3">
        {craftsmen.map((craftsman) => {
          const trade = trades.find((t) => t.id === craftsman.trade);
          const TradeIcon = trade?.icon ?? Wrench;
          return (
            <Card key={craftsman.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center shrink-0">
                    <TradeIcon className={`w-5 h-5 ${trade?.color ?? 'text-muted-foreground'}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-sm">{isRTL ? craftsman.nameAr : craftsman.nameEn}</h3>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                        {craftsman.rating}
                      </span>
                      <span>
                        {craftsman.experience} {isRTL ? 'سنة خبرة' : 'yrs exp'}
                      </span>
                    </div>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    className="shrink-0"
                    onClick={() => window.open(`tel:${craftsman.phone}`, '_self')}
                  >
                    <Phone className="w-3 h-3" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </section>
  );
}
