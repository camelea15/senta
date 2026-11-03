import React from 'react';
import { Product } from '../types';
import { useLanguage } from '../context/LanguageContext';
import { useCart } from '../context/CartContext';
import { ShoppingBag, Eye, Check } from 'lucide-react';

interface ProductCardProps {
  product: Product;
  onSelect: (product: Product) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, onSelect }) => {
  const { language, t } = useLanguage();
  const { addToCart, cart } = useCart();

  const isFrench = language === 'fr';
  const name = isFrench ? product.name : product.nameAr;
  const description = isFrench ? product.descriptionFr : product.descriptionAr;

  const categoryLabel = {
    women: t('filterWomen'),
    men: t('filterMen'),
    unisex: t('filterUnisex'),
  }[product.category];

  const inCartItem = cart.find((item) => item.product.id === product.id);

  return (
    <div className="group relative bg-[#1B1612] border border-[#C69A55]/20 hover:border-[#C69A55]/60 rounded-sm overflow-hidden flex flex-col transition-all duration-300 hover:shadow-2xl hover:shadow-[#C69A55]/10 hover:-translate-y-1">
      {/* Product Image Stage */}
      <div
        onClick={() => onSelect(product)}
        className="relative aspect-[4/3] w-full overflow-hidden bg-[#120E0B] cursor-pointer"
      >
        <img
          src={product.image}
          alt={name}
          loading="lazy"
          className="w-full h-full object-cover object-center transition-transform duration-700 group-hover:scale-105"
          referrerPolicy="no-referrer"
        />

        {/* Volume & Category Overlay */}
        <div className="absolute top-3 left-3 right-3 flex items-center justify-between text-xs pointer-events-none">
          <span className="bg-[#17130F]/80 backdrop-blur-md text-[#E8D9C6] px-2.5 py-1 rounded-sm border border-[#C69A55]/25 uppercase tracking-wider font-medium text-[11px]">
            {categoryLabel}
          </span>
          <span className="bg-[#17130F]/80 backdrop-blur-md text-[#C69A55] px-2 py-1 rounded-sm border border-[#C69A55]/25 font-mono text-[11px] tabular-nums">
            {product.volume}
          </span>
        </div>

        {/* Quick View Button on Hover */}
        <div className="absolute inset-0 bg-[#17130F]/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center p-4">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onSelect(product);
            }}
            className="px-4 py-2 bg-[#F8F1E8] text-[#17130F] text-xs font-semibold uppercase tracking-wider rounded-sm shadow-lg flex items-center gap-2 hover:bg-[#C69A55] transition-colors"
          >
            <Eye className="w-3.5 h-3.5" />
            <span>{t('viewDetails')}</span>
          </button>
        </div>
      </div>

      {/* Product Content */}
      <div className="p-5 flex-1 flex flex-col justify-between bg-gradient-to-b from-[#1B1612] to-[#15110E]">
        <div>
          {/* Unboxed Metadata (Zero-Pill discipline) */}
          <div className="text-[11px] uppercase tracking-[0.2em] text-[#C69A55] font-medium mb-1.5 flex items-center gap-1.5">
            <span>SENTA PRIVÉE</span>
            <span aria-hidden="true">·</span>
            <span>{product.volume}</span>
          </div>

          {/* Title */}
          <h3
            onClick={() => onSelect(product)}
            className="font-serif text-xl font-bold text-[#F8F1E8] hover:text-[#C69A55] transition-colors cursor-pointer line-clamp-1 mb-2"
          >
            {name}
          </h3>

          {/* Description */}
          <p className="text-xs text-[#E8D9C6]/75 line-clamp-2 leading-relaxed mb-4">
            {description}
          </p>
        </div>

        {/* Price & Action Row */}
        <div className="pt-4 border-t border-[#C69A55]/15 flex items-center justify-between gap-3">
          {/* Price */}
          <div className="flex flex-col">
            <span className="text-[10px] uppercase tracking-wider text-[#E8D9C6]/60">
              {isFrench ? 'Prix Algérie' : 'السعر في الجزائر'}
            </span>
            <span className="text-lg font-bold text-[#C69A55] font-mono tabular-nums">
              {product.price.toLocaleString()} <span className="text-xs font-sans text-[#E8D9C6]/80">{isFrench ? 'DZD' : 'دج'}</span>
            </span>
          </div>

          {/* Add To Cart */}
          <button
            onClick={() => addToCart(product, 1)}
            disabled={!product.inStock}
            className={`px-3.5 py-2.5 rounded-sm text-xs font-semibold uppercase tracking-wider transition-all duration-200 flex items-center gap-2 cursor-pointer ${
              !product.inStock
                ? 'bg-neutral-800 text-neutral-500 cursor-not-allowed'
                : inCartItem
                ? 'bg-[#C69A55]/20 text-[#C69A55] border border-[#C69A55] hover:bg-[#C69A55] hover:text-[#17130F]'
                : 'bg-[#C69A55] text-[#17130F] hover:bg-[#d8af6f] shadow-md shadow-[#C69A55]/20'
            }`}
            title={t('addToCart')}
          >
            {inCartItem ? (
              <>
                <Check className="w-3.5 h-3.5" />
                <span className="hidden sm:inline font-mono tabular-nums">({inCartItem.quantity})</span>
              </>
            ) : (
              <>
                <ShoppingBag className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">{t('addToCart')}</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
