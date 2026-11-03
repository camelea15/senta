import React from 'react';
import { useLanguage } from '../context/LanguageContext';
import { Truck, ShieldCheck, Headphones } from 'lucide-react';

export const AnnouncementBar: React.FC = () => {
  const { t } = useLanguage();

  return (
    <div className="bg-[#110E0B] border-b border-[#C69A55]/20 text-[#E8D9C6] text-xs py-2 px-4 transition-colors">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        {/* Desktop 3 trust points */}
        <div className="hidden md:flex items-center justify-between w-full">
          <div className="flex items-center gap-2">
            <Truck className="w-3.5 h-3.5 text-[#C69A55]" />
            <span>{t('announcement1')}</span>
          </div>

          <div className="flex items-center gap-2">
            <ShieldCheck className="w-3.5 h-3.5 text-[#C69A55]" />
            <span>{t('announcement2')}</span>
          </div>

          <div className="flex items-center gap-2">
            <Headphones className="w-3.5 h-3.5 text-[#C69A55]" />
            <span>{t('announcement3')}</span>
          </div>
        </div>

        {/* Mobile single scrolling or concise banner */}
        <div className="flex md:hidden items-center justify-center w-full gap-2 text-center truncate">
          <Truck className="w-3.5 h-3.5 text-[#C69A55] shrink-0" />
          <span className="truncate">{t('announcement1')} • {t('announcement2')}</span>
        </div>
      </div>
    </div>
  );
};
