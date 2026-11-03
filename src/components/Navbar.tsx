import React, { useState, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useCart } from '../context/CartContext';
import { Logo } from './Logo';
import { ShoppingBag, Search, Globe, Menu, X, Shield, PackageCheck } from 'lucide-react';

interface NavbarProps {
  onOpenSearch: () => void;
  onOpenTrackOrder: () => void;
  onOpenAdmin: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenSearch, onOpenTrackOrder, onOpenAdmin }) => {
  const { language, setLanguage, t } = useLanguage();
  const { cartCount, setIsCartOpen } = useCart();
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const toggleLanguage = () => {
    setLanguage(language === 'fr' ? 'ar' : 'fr');
  };

  const navLinks = [
    { label: t('navHome'), href: '#' },
    { label: t('navPerfumes'), href: '#parfums' },
    { label: t('navAbout'), href: '#a-propos' },
    { label: t('navContact'), href: '#contact' },
  ];

  return (
    <header
      className={`sticky top-0 z-40 transition-all duration-300 ${
        isScrolled
          ? 'bg-[#17130F]/95 backdrop-blur-md shadow-lg shadow-black/40 border-b border-[#C69A55]/20 py-3.5'
          : 'bg-[#17130F] border-b border-[#C69A55]/10 py-5'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-8">
          {/* Zone 1: Brand Wordmark & Logo */}
          <a href="#" className="whitespace-nowrap shrink-0 group focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#C69A55]">
            <Logo size="responsive" />
          </a>

          {/* Zone 2: Navigation Links (Desktop) */}
          <nav className="hidden lg:flex items-center gap-8 text-sm font-medium tracking-wide">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="text-[#E8D9C6]/85 hover:text-[#C69A55] transition-colors whitespace-nowrap relative py-1 after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-0 after:h-[1px] after:bg-[#C69A55] hover:after:w-full after:transition-all"
              >
                {link.label}
              </a>
            ))}
          </nav>

          {/* Zone 3: Actions & Utilities */}
          <div className="flex items-center gap-3 sm:gap-4 shrink-0">
            {/* Search Trigger */}
            <button
              onClick={onOpenSearch}
              className="p-2 text-[#E8D9C6]/80 hover:text-[#C69A55] transition-colors rounded-md focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#C69A55]"
              title={t('searchPlaceholder')}
              aria-label="Rechercher"
            >
              <Search className="w-5 h-5" />
            </button>

            {/* Track Order Trigger */}
            <button
              onClick={onOpenTrackOrder}
              className="hidden sm:flex items-center gap-1.5 p-2 text-xs font-medium text-[#E8D9C6]/80 hover:text-[#C69A55] transition-colors rounded-md"
              title={t('navTrackOrder')}
            >
              <PackageCheck className="w-4 h-4 text-[#C69A55]" />
              <span className="hidden xl:inline">{t('navTrackOrder')}</span>
            </button>

            {/* Language Switcher */}
            <button
              onClick={toggleLanguage}
              className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium tracking-wider text-[#E8D9C6] border border-[#C69A55]/30 hover:border-[#C69A55] rounded hover:bg-[#C69A55]/10 transition-colors uppercase whitespace-nowrap"
              title="Changer de langue / تغيير اللغة"
            >
              <Globe className="w-3.5 h-3.5 text-[#C69A55]" />
              <span>{language === 'fr' ? 'العربية' : 'FR'}</span>
            </button>

            {/* Cart Trigger */}
            <button
              onClick={() => setIsCartOpen(true)}
              className="relative p-2.5 bg-[#C69A55]/15 hover:bg-[#C69A55] text-[#F8F1E8] hover:text-[#17130F] rounded-lg transition-all duration-200 border border-[#C69A55]/40 hover:border-[#C69A55] group"
              aria-label="Panier d'achats"
            >
              <ShoppingBag className="w-5 h-5 transition-transform group-hover:scale-105" />
              {cartCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-[#C69A55] text-[#17130F] font-bold text-[11px] w-5 h-5 rounded-full flex items-center justify-center shadow-md animate-pulse">
                  {cartCount}
                </span>
              )}
            </button>


            {/* Mobile Hamburger Menu Toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 text-[#E8D9C6] hover:text-[#C69A55] transition-colors focus-visible:outline-none"
              aria-label="Menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="lg:hidden pt-4 pb-6 mt-3 border-t border-[#C69A55]/20 animate-fadeIn">
            <nav className="flex flex-col gap-3">
              {navLinks.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="px-3 py-2 text-base font-medium text-[#E8D9C6] hover:text-[#C69A55] hover:bg-[#C69A55]/10 rounded-md transition-colors"
                >
                  {link.label}
                </a>
              ))}
              <div className="pt-3 border-t border-[#C69A55]/10 flex flex-col gap-2">
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onOpenTrackOrder();
                  }}
                  className="flex items-center gap-2 px-3 py-2 text-sm text-[#E8D9C6] hover:text-[#C69A55]"
                >
                  <PackageCheck className="w-4 h-4 text-[#C69A55]" />
                  <span>{t('navTrackOrder')}</span>
                </button>
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onOpenAdmin();
                  }}
                  className="flex items-center gap-2 px-3 py-2 text-sm text-[#E8D9C6]/60 hover:text-[#C69A55]"
                >
                  <Shield className="w-4 h-4 text-[#C69A55]" />
                  <span>{t('navAdmin')}</span>
                </button>
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};
