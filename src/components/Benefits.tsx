import React from 'react';
import { useLanguage } from '../context/LanguageContext';
import { Truck, ShieldCheck, Sparkles, Headphones } from 'lucide-react';

export const Benefits: React.FC = () => {
  const { t } = useLanguage();

  const benefits = [
    {
      icon: Truck,
      title: t('benefit1Title'),
      desc: t('benefit1Desc'),
    },
    {
      icon: ShieldCheck,
      title: t('benefit2Title'),
      desc: t('benefit2Desc'),
    },
    {
      icon: Sparkles,
      title: t('benefit3Title'),
      desc: t('benefit3Desc'),
    },
    {
      icon: Headphones,
      title: t('benefit4Title'),
      desc: t('benefit4Desc'),
    },
  ];

  return (
    <section className="border-y border-[#C69A55]/20 bg-[#14100D] py-14">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {benefits.map((b, idx) => {
            const Icon = b.icon;
            return (
              <div
                key={idx}
                className="flex flex-col items-center sm:items-start text-center sm:text-left group"
              >
                <div className="w-12 h-12 rounded-lg bg-[#C69A55]/10 border border-[#C69A55]/30 flex items-center justify-center text-[#C69A55] mb-4 transition-colors group-hover:bg-[#C69A55] group-hover:text-[#17130F]">
                  <Icon className="w-6 h-6" />
                </div>
                <h3 className="text-base font-semibold text-[#F8F1E8] mb-1.5 font-serif tracking-wide">
                  {b.title}
                </h3>
                <p className="text-xs sm:text-sm text-[#E8D9C6]/75 leading-relaxed">
                  {b.desc}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
