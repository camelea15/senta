import React from 'react';
import { useLanguage } from '../context/LanguageContext';
import { Sparkles, ArrowDown } from 'lucide-react';
import { heroImage } from '../assets/images';

export const Hero: React.FC = () => {
  const { t, language } = useLanguage();

  const scrollToProducts = () => {
    const el = document.getElementById('parfums');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section className="relative min-h-[85vh] lg:min-h-[90vh] flex items-center justify-center overflow-hidden bg-[#17130F]">
      {/* Background Image with Depth & Scrim */}
      <div className="absolute inset-0 z-0">
        <img
          src={heroImage}
          alt="SENTA.DZ Haute Parfumerie Algérie"
          className="w-full h-full object-cover object-center scale-105 transform motion-safe:animate-subtleZoom"
          referrerPolicy="no-referrer"
        />
        {/* Measured Contrast Scrims */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#17130F] via-[#17130F]/65 to-[#17130F]/45" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-transparent via-[#17130F]/50 to-[#17130F]" />
      </div>

      {/* Decorative Golden Ambient Glow */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-[#C69A55]/15 blur-[120px] rounded-full pointer-events-none" />

      {/* Hero Content */}
      <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center flex flex-col items-center">
        {/* Subdued Editorial Kicker */}
        <div className="inline-flex items-center gap-2 mb-6 text-xs sm:text-sm uppercase tracking-[0.3em] text-[#C69A55] font-medium border border-[#C69A55]/30 px-4 py-1.5 rounded-full bg-[#17130F]/60 backdrop-blur-sm">
          <Sparkles className="w-3.5 h-3.5 text-[#C69A55]" />
          <span>{t('heroBadge')}</span>
          <span className="text-[#C69A55]/50">·</span>
          <span>{language === 'ar' ? 'الجزائر' : 'Algérie'}</span>
        </div>

        {/* Hero Title */}
        <h1 className="font-serif text-4xl sm:text-6xl lg:text-7xl font-bold tracking-tight text-[#F8F1E8] leading-[1.15] max-w-4xl mb-6 text-balance">
          {t('heroTitle')}
        </h1>

        {/* Subtitle */}
        <p className="text-lg sm:text-xl text-[#E8D9C6]/90 max-w-2xl font-light leading-relaxed mb-10 text-balance">
          {t('heroSubtitle')}
        </p>

        {/* Primary CTA */}
        <div className="flex flex-col sm:flex-row items-center gap-4">
          <button
            onClick={scrollToProducts}
            className="w-full sm:w-auto px-8 py-4 bg-[#C69A55] hover:bg-[#d8af6f] text-[#17130F] font-semibold text-sm sm:text-base tracking-wider uppercase rounded-sm shadow-xl shadow-[#C69A55]/20 hover:shadow-[#C69A55]/35 hover:-translate-y-0.5 transition-all duration-300 flex items-center justify-center gap-3 cursor-pointer group"
          >
            <span>{t('heroCta')}</span>
            <ArrowDown className="w-4 h-4 transition-transform group-hover:translate-y-1" />
          </button>
        </div>

        {/* Discreet Scroll Indicator */}
        <div className="mt-16 flex items-center justify-center">
          <div className="w-[1px] h-12 bg-gradient-to-b from-[#C69A55] to-transparent animate-pulse" />
        </div>
      </div>
    </section>
  );
};
