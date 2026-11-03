import React from 'react';
import { useLanguage } from '../context/LanguageContext';
import { Sparkles, Award, MapPin } from 'lucide-react';

export const AboutSection: React.FC = () => {
  const { t } = useLanguage();

  return (
    <section id="a-propos" className="py-20 lg:py-28 bg-[#14100D] border-t border-[#C69A55]/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          {/* Editorial Column */}
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.25em] text-[#C69A55] font-medium">
              <Sparkles className="w-3.5 h-3.5" />
              <span>SENTA.DZ HAUTE PARFUMERIE</span>
            </div>

            <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-[#F8F1E8] leading-tight text-balance">
              {t('aboutTitle')}
            </h2>

            <p className="font-serif text-lg text-[#C69A55] italic">
              {t('aboutSubtitle')}
            </p>

            <div className="space-y-4 text-sm sm:text-base text-[#E8D9C6]/85 font-light leading-relaxed">
              <p>{t('aboutText1')}</p>
              <p>{t('aboutText2')}</p>
            </div>

            {/* 3 Pillars */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-6 border-t border-[#C69A55]/15">
              <div className="p-3 bg-[#1A1511] border border-[#C69A55]/20 rounded-sm">
                <Award className="w-5 h-5 text-[#C69A55] mb-2" />
                <h4 className="font-serif text-sm font-bold text-[#F8F1E8] mb-1">
                  {t('aboutPillar1')}
                </h4>
                <p className="text-xs text-[#E8D9C6]/70 leading-normal">
                  {t('aboutPillar1Desc')}
                </p>
              </div>

              <div className="p-3 bg-[#1A1511] border border-[#C69A55]/20 rounded-sm">
                <Sparkles className="w-5 h-5 text-[#C69A55] mb-2" />
                <h4 className="font-serif text-sm font-bold text-[#F8F1E8] mb-1">
                  {t('aboutPillar2')}
                </h4>
                <p className="text-xs text-[#E8D9C6]/70 leading-normal">
                  {t('aboutPillar2Desc')}
                </p>
              </div>

              <div className="p-3 bg-[#1A1511] border border-[#C69A55]/20 rounded-sm">
                <MapPin className="w-5 h-5 text-[#C69A55] mb-2" />
                <h4 className="font-serif text-sm font-bold text-[#F8F1E8] mb-1">
                  {t('aboutPillar3')}
                </h4>
                <p className="text-xs text-[#E8D9C6]/70 leading-normal">
                  {t('aboutPillar3Desc')}
                </p>
              </div>
            </div>
          </div>

          {/* Luxury Imagery Column */}
          <div className="lg:col-span-5 relative">
            <div className="relative mx-auto max-w-md lg:max-w-none">
              <div className="aspect-[4/5] rounded-sm overflow-hidden border border-[#C69A55]/30 shadow-2xl bg-[#110E0B]">
                <img
                  src="/src/assets/images/perfume_santal_mystique_1793742305628.jpg"
                  alt="SENTA.DZ Art Olfactif"
                  className="w-full h-full object-cover object-center transition-transform duration-700 hover:scale-105"
                  referrerPolicy="no-referrer"
                />
              </div>

              {/* Inset Badge */}
              <div className="absolute -bottom-6 -left-6 bg-[#17130F] border border-[#C69A55] p-5 rounded-sm shadow-xl hidden sm:block max-w-[200px]">
                <p className="text-xs uppercase tracking-widest text-[#C69A55] font-bold mb-1">
                  Algérie
                </p>
                <p className="text-xs text-[#E8D9C6] leading-tight">
                  L'élégance commence par une fragrance.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
