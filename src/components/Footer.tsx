import React from 'react';
import { useLanguage } from '../context/LanguageContext';
import { Logo } from './Logo';
import { Truck, ShieldCheck, Heart } from 'lucide-react';

interface FooterProps {
  onOpenTrackOrder: () => void;
  onOpenAdmin: () => void;
}

export const Footer: React.FC<FooterProps> = ({ onOpenTrackOrder, onOpenAdmin }) => {
  const { language, t } = useLanguage();
  const isFrench = language === 'fr';

  return (
    <footer className="bg-[#100D0A] border-t border-[#C69A55]/25 text-[#E8D9C6]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">
          {/* Brand Col */}
          <div className="lg:col-span-2 space-y-4">
            <Logo size="md" />
            <p className="text-xs sm:text-sm text-[#E8D9C6]/75 leading-relaxed max-w-sm">
              {t('footerDesc')}
            </p>
            <div className="flex items-center gap-4 text-xs text-[#C69A55] pt-2">
              <span className="flex items-center gap-1.5">
                <Truck className="w-3.5 h-3.5" /> 58 Wilayas
              </span>
              <span>·</span>
              <span className="flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5" /> Main à main (COD)
              </span>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-3">
            <h4 className="font-serif text-sm font-bold text-[#F8F1E8] uppercase tracking-wider">
              {t('footerQuickLinks')}
            </h4>
            <ul className="space-y-2 text-xs text-[#E8D9C6]/80">
              <li>
                <a href="#" className="hover:text-[#C69A55] transition-colors">
                  {t('navHome')}
                </a>
              </li>
              <li>
                <a href="#parfums" className="hover:text-[#C69A55] transition-colors">
                  {t('navPerfumes')}
                </a>
              </li>
              <li>
                <a href="#a-propos" className="hover:text-[#C69A55] transition-colors">
                  {t('navAbout')}
                </a>
              </li>
              <li>
                <a href="#contact" className="hover:text-[#C69A55] transition-colors">
                  {t('navContact')}
                </a>
              </li>
            </ul>
          </div>

          {/* Customer Service & Order Tracking */}
          <div className="space-y-3">
            <h4 className="font-serif text-sm font-bold text-[#F8F1E8] uppercase tracking-wider">
              {t('footerCustomerService')}
            </h4>
            <ul className="space-y-2 text-xs text-[#E8D9C6]/80">
              <li>
                <button
                  onClick={onOpenTrackOrder}
                  className="hover:text-[#C69A55] transition-colors text-left"
                >
                  {t('navTrackOrder')}
                </button>
              </li>
              <li>
                <a href="#contact" className="hover:text-[#C69A55] transition-colors">
                  {isFrench ? 'Assistance WhatsApp' : 'مساعدة عبر واتساب'}
                </a>
              </li>
              <li>
                <span className="text-[#E8D9C6]/60">
                  {isFrench ? 'Livraison 24h - 72h' : 'توصيل خلال 24 - 72 ساعة'}
                </span>
              </li>
              <li>
                <span className="text-[#E8D9C6]/60">
                  {isFrench ? 'Paiement à la réception' : 'الدفع عند المعاينة والاستلام'}
                </span>
              </li>
            </ul>
          </div>

          {/* Legal & Admin */}
          <div className="space-y-3">
            <h4 className="font-serif text-sm font-bold text-[#F8F1E8] uppercase tracking-wider">
              SENTA.DZ
            </h4>
            <ul className="space-y-2 text-xs text-[#E8D9C6]/80">
              <li>
                <span className="text-[#E8D9C6]/60">
                  {isFrench ? 'Alger, Algérie' : 'الجزائر العاصمة، الجزائر'}
                </span>
              </li>
              <li>
                <span className="text-[#E8D9C6]/60">
                  {isFrench ? 'Garantie Authenticité 100%' : 'ضمان الجودة والأصالة 100%'}
                </span>
              </li>
              <li>
                <button
                  onClick={() => {
                    window.history.pushState({}, '', '/admin');
                    window.dispatchEvent(new PopStateEvent('popstate'));
                  }}
                  className="text-[#C69A55]/70 hover:text-[#C69A55] transition-colors text-left"
                >
                  {t('navAdmin')}
                </button>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-[#C69A55]/15 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#E8D9C6]/60">
          <p>© {new Date().getFullYear()} SENTA.DZ. {t('footerRights')}</p>
          <div className="flex items-center gap-1 text-[11px]">
            <span>{isFrench ? 'Haute Parfumerie d’Algérie' : 'دار العطور الراقية في الجزائر'}</span>
            <Heart className="w-3 h-3 text-[#C69A55] inline mx-1 fill-current" />
          </div>
        </div>
      </div>
    </footer>
  );
};
