/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { LanguageProvider, useLanguage } from './context/LanguageContext';
import { CartProvider, useCart } from './context/CartContext';
import { Product, Order } from './types';
import { INITIAL_PRODUCTS } from './data/initialData';
import { AnnouncementBar } from './components/AnnouncementBar';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { Benefits } from './components/Benefits';
import { ProductCard } from './components/ProductCard';
import { ProductModal } from './components/ProductModal';
import { CartDrawer } from './components/CartDrawer';
import { CheckoutModal } from './components/CheckoutModal';
import { OrderConfirmationModal } from './components/OrderConfirmationModal';
import { OrderLookupModal } from './components/OrderLookupModal';
import { SearchModal } from './components/SearchModal';
import { AboutSection } from './components/AboutSection';
import { ContactSection } from './components/ContactSection';
import { Footer } from './components/Footer';
import { AdminModal } from './components/AdminModal';
import { CartToast } from './components/CartToast';
import { Sparkles, SlidersHorizontal, RefreshCw } from 'lucide-react';

function Storefront() {
  const { language, t } = useLanguage();
  const { setIsCartOpen } = useCart();

  // Products State
  const [products, setProducts] = useState<Product[]>(INITIAL_PRODUCTS);
  const [loading, setLoading] = useState(false);

  // Filter & Sort State
  const [categoryFilter, setCategoryFilter] = useState<'all' | 'men' | 'women' | 'unisex'>('all');
  const [sortBy, setSortBy] = useState<'newest' | 'price-asc' | 'price-desc'>('newest');

  // Modals
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [checkoutDiscount, setCheckoutDiscount] = useState(0);
  const [checkoutPromoCode, setCheckoutPromoCode] = useState<string | undefined>(undefined);
  const [confirmedOrder, setConfirmedOrder] = useState<Order | null>(null);
  const [isTrackOrderOpen, setIsTrackOrderOpen] = useState(false);
  const [trackInitialRef, setTrackInitialRef] = useState('');
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  // Fetch products from backend
  const fetchProducts = async () => {
    try {
      const res = await fetch('/api/products');
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          setProducts(data);
        }
      }
    } catch (e) {
      console.warn('Backend loading, using initial catalogue', e);
    }
  };

  useEffect(() => {
    fetchProducts();
    if (window.location.hash === '#admin' || window.location.hash === '#gestion') {
      setIsAdminOpen(true);
    }
    const handleHashChange = () => {
      if (window.location.hash === '#admin' || window.location.hash === '#gestion') {
        setIsAdminOpen(true);
      }
    };
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  // Filter & Sort Logic
  const filteredProducts = products
    .filter((p) => {
      if (categoryFilter === 'all') return true;
      return p.category === categoryFilter;
    })
    .sort((a, b) => {
      if (sortBy === 'price-asc') return a.price - b.price;
      if (sortBy === 'price-desc') return b.price - a.price;
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

  // Handlers
  const handleProceedToCheckout = (discount: number, promo?: string) => {
    setCheckoutDiscount(discount);
    setCheckoutPromoCode(promo);
    setIsCheckoutOpen(true);
  };

  const handleOrderSuccess = (order: Order) => {
    setConfirmedOrder(order);
  };

  const handleOpenTrackWithRef = (ref: string) => {
    setTrackInitialRef(ref);
    setIsTrackOrderOpen(true);
  };

  return (
    <div className="min-h-screen bg-[#17130F] text-[#F8F1E8] flex flex-col font-sans selection:bg-[#C69A55] selection:text-[#17130F]">
      {/* 1. Announcement Bar */}
      <AnnouncementBar />

      {/* 2. Top Navigation Bar */}
      <Navbar
        onOpenSearch={() => setIsSearchOpen(true)}
        onOpenTrackOrder={() => {
          setTrackInitialRef('');
          setIsTrackOrderOpen(true);
        }}
        onOpenAdmin={() => setIsAdminOpen(true)}
      />

      {/* 3. Hero Section */}
      <Hero />

      {/* 4. 4 Brand Pillars / Benefits */}
      <Benefits />

      {/* 5. Product Collection Section */}
      <section id="parfums" className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.25em] text-[#C69A55] font-medium mb-3">
            <Sparkles className="w-3.5 h-3.5" />
            <span>SENTA.DZ COLLECTION</span>
          </div>

          <h2 className="font-serif text-3xl sm:text-5xl font-bold text-[#F8F1E8] mb-4 tracking-tight">
            {t('collectionTitle')}
          </h2>

          <p className="text-sm sm:text-base text-[#E8D9C6]/80 font-light">
            {t('collectionSubtitle')}
          </p>
        </div>

        {/* Filters and Sorting Bar */}
        <div className="mb-10 p-2 sm:p-3 bg-[#1A1511] border border-[#C69A55]/20 rounded flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Category Tabs (Functional buttons as per frontend-design guidelines §1.A) */}
          <div className="flex items-center gap-1.5 p-1 bg-[#120E0B] rounded border border-[#C69A55]/20 w-full md:w-auto overflow-x-auto">
            <button
              onClick={() => setCategoryFilter('all')}
              className={`px-3.5 py-1.5 text-xs font-medium rounded transition-colors whitespace-nowrap cursor-pointer ${
                categoryFilter === 'all'
                  ? 'bg-[#C69A55] text-[#17130F] font-bold shadow-sm'
                  : 'text-[#E8D9C6]/75 hover:text-[#C69A55]'
              }`}
            >
              {t('filterAll')}
            </button>
            <button
              onClick={() => setCategoryFilter('women')}
              className={`px-3.5 py-1.5 text-xs font-medium rounded transition-colors whitespace-nowrap cursor-pointer ${
                categoryFilter === 'women'
                  ? 'bg-[#C69A55] text-[#17130F] font-bold shadow-sm'
                  : 'text-[#E8D9C6]/75 hover:text-[#C69A55]'
              }`}
            >
              {t('filterWomen')}
            </button>
            <button
              onClick={() => setCategoryFilter('men')}
              className={`px-3.5 py-1.5 text-xs font-medium rounded transition-colors whitespace-nowrap cursor-pointer ${
                categoryFilter === 'men'
                  ? 'bg-[#C69A55] text-[#17130F] font-bold shadow-sm'
                  : 'text-[#E8D9C6]/75 hover:text-[#C69A55]'
              }`}
            >
              {t('filterMen')}
            </button>
            <button
              onClick={() => setCategoryFilter('unisex')}
              className={`px-3.5 py-1.5 text-xs font-medium rounded transition-colors whitespace-nowrap cursor-pointer ${
                categoryFilter === 'unisex'
                  ? 'bg-[#C69A55] text-[#17130F] font-bold shadow-sm'
                  : 'text-[#E8D9C6]/75 hover:text-[#C69A55]'
              }`}
            >
              {t('filterUnisex')}
            </button>
          </div>

          {/* Results Count & Sorting */}
          <div className="flex items-center justify-between md:justify-end gap-4 w-full md:w-auto text-xs text-[#E8D9C6]">
            <span className="font-mono text-[#C69A55] tabular-nums">
              {filteredProducts.length} {t('resultsCount')}
            </span>

            <div className="flex items-center gap-2">
              <SlidersHorizontal className="w-3.5 h-3.5 text-[#C69A55]" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="bg-[#120E0B] border border-[#C69A55]/30 text-xs text-[#F8F1E8] rounded px-3 py-1.5 focus:outline-none focus:border-[#C69A55] cursor-pointer"
              >
                <option value="newest">{t('sortNewest')}</option>
                <option value="price-asc">{t('sortPriceAsc')}</option>
                <option value="price-desc">{t('sortPriceDesc')}</option>
              </select>
            </div>
          </div>
        </div>

        {/* Product Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {filteredProducts.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onSelect={(p) => setSelectedProduct(p)}
            />
          ))}
        </div>
      </section>

      {/* 6. Brand Story & Craftsmanship */}
      <AboutSection />

      {/* 7. Contact & Assistance */}
      <ContactSection />

      {/* 8. Footer */}
      <Footer
        onOpenTrackOrder={() => {
          setTrackInitialRef('');
          setIsTrackOrderOpen(true);
        }}
        onOpenAdmin={() => setIsAdminOpen(true)}
      />

      {/* Interactive Modals */}
      {/* Product Details Modal (PDP) */}
      <ProductModal
        product={selectedProduct}
        allProducts={products}
        onClose={() => setSelectedProduct(null)}
        onSelectProduct={(p) => setSelectedProduct(p)}
      />

      {/* Slide-over Shopping Cart Drawer */}
      <CartDrawer
        onProceedToCheckout={handleProceedToCheckout}
        freeShippingThreshold={22000}
      />

      {/* Algerian Checkout Form (58 Wilayas & Cash on Delivery) */}
      <CheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        onOrderSuccess={handleOrderSuccess}
        initialDiscount={checkoutDiscount}
        initialPromoCode={checkoutPromoCode}
      />

      {/* Order Confirmation Screen */}
      <OrderConfirmationModal
        order={confirmedOrder}
        onClose={() => setConfirmedOrder(null)}
        onTrackOrder={handleOpenTrackWithRef}
      />

      {/* Order Tracking Modal */}
      <OrderLookupModal
        isOpen={isTrackOrderOpen}
        onClose={() => setIsTrackOrderOpen(false)}
        initialReference={trackInitialRef}
      />

      {/* Search Modal */}
      <SearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        products={products}
        onSelectProduct={(p) => setSelectedProduct(p)}
      />

      {/* Protected Admin Dashboard */}
      <AdminModal
        isOpen={isAdminOpen}
        onClose={() => setIsAdminOpen(false)}
        onProductsUpdated={fetchProducts}
      />

      {/* Quick Add-to-Cart Toast */}
      <CartToast />
    </div>
  );
}

export default function App() {
  return (
    <LanguageProvider>
      <CartProvider>
        <Storefront />
      </CartProvider>
    </LanguageProvider>
  );
}
