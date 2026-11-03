import React, { useState } from 'react';
import { Product } from '../types';
import { useLanguage } from '../context/LanguageContext';
import { useCart } from '../context/CartContext';
import { X, ShoppingBag, ShieldCheck, Truck, Sparkles, Check } from 'lucide-react';
import { resolveProductImage } from '../assets/images';

interface ProductModalProps {
  product: Product | null;
  allProducts: Product[];
  onClose: () => void;
  onSelectProduct: (p: Product) => void;
}

export const ProductModal: React.FC<ProductModalProps> = ({
  product,
  allProducts,
  onClose,
  onSelectProduct,
}) => {
  const { language, t } = useLanguage();
  const { addToCart, setIsCartOpen } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [justAdded, setJustAdded] = useState(false);

  if (!product) return null;

  const isFrench = language === 'fr';
  const name = isFrench ? product.name : product.nameAr;
  const description = isFrench ? product.descriptionFr : product.descriptionAr;
  const topNotes = isFrench ? product.topNotesFr : product.topNotesAr;
  const heartNotes = isFrench ? product.heartNotesFr : product.heartNotesAr;
  const baseNotes = isFrench ? product.baseNotesFr : product.baseNotesAr;

  const categoryLabel = {
    women: t('filterWomen'),
    men: t('filterMen'),
    unisex: t('filterUnisex'),
  }[product.category];

  const handleAdd = () => {
    addToCart(product, quantity);
    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 2000);
  };

  const handleBuyNow = () => {
    addToCart(product, quantity);
    onClose();
    setIsCartOpen(true);
  };

  // 3 Related products in same or similar category
  const related = allProducts
    .filter((p) => p.id !== product.id && (p.category === product.category || p.category === 'unisex'))
    .slice(0, 3);

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 animate-fadeIn">
      <div
        className="relative w-full max-w-4xl bg-[#17130F] border border-[#C69A55]/30 rounded-sm shadow-2xl overflow-hidden my-8"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 p-2 bg-[#17130F]/80 hover:bg-[#C69A55] text-[#E8D9C6] hover:text-[#17130F] rounded-full border border-[#C69A55]/30 transition-colors"
          aria-label={t('close')}
        >
          <X className="w-5 h-5" />
        </button>

        <div className="grid grid-cols-1 md:grid-cols-2">
          {/* Gallery / Product Image */}
          <div className="relative bg-[#120E0B] p-6 sm:p-8 flex items-center justify-center min-h-[340px] md:min-h-[480px]">
            <img
              src={resolveProductImage(product.image, product.id)}
              alt={name}
              className="max-h-[380px] w-auto object-contain rounded shadow-2xl transition-transform duration-500 hover:scale-105"
              referrerPolicy="no-referrer"
            />
            <div className="absolute bottom-4 left-4 bg-[#17130F]/90 px-3 py-1 rounded text-xs text-[#C69A55] border border-[#C69A55]/30 uppercase tracking-widest font-mono">
              {product.volume} • Eau de Parfum
            </div>
          </div>

          {/* Details & Purchase Column */}
          <div className="p-6 sm:p-8 flex flex-col justify-between bg-gradient-to-b from-[#1A1511] to-[#17130F]">
            <div>
              {/* Category & Badge */}
              <div className="flex items-center gap-3 text-xs uppercase tracking-widest text-[#C69A55] mb-2 font-medium">
                <span>{categoryLabel}</span>
                <span aria-hidden="true">·</span>
                <span>{product.volume}</span>
                <span aria-hidden="true">·</span>
                <span className="text-emerald-400 font-sans normal-case">{t('inStock')}</span>
              </div>

              {/* Title */}
              <h2 className="font-serif text-3xl sm:text-4xl font-bold text-[#F8F1E8] mb-3">
                {name}
              </h2>

              {/* Price */}
              <div className="mb-5 flex items-baseline gap-2">
                <span className="text-2xl sm:text-3xl font-bold text-[#C69A55] font-mono tabular-nums">
                  {product.price.toLocaleString()}
                </span>
                <span className="text-sm font-sans text-[#E8D9C6]/80">{isFrench ? 'DZD' : 'دج'}</span>
              </div>

              {/* Description */}
              <p className="text-sm text-[#E8D9C6]/85 leading-relaxed mb-6">
                {description}
              </p>

              {/* Olfactory Pyramid */}
              <div className="border border-[#C69A55]/20 bg-[#14100D] p-4 rounded-sm mb-6">
                <h4 className="text-xs uppercase tracking-wider text-[#C69A55] font-semibold mb-3 flex items-center gap-2">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>{t('olfactoryPyramid')}</span>
                </h4>
                <div className="space-y-2 text-xs">
                  {topNotes && (
                    <div className="flex flex-col sm:flex-row sm:items-baseline gap-1 sm:gap-2">
                      <span className="text-[#E8D9C6]/60 font-medium shrink-0">{t('topNotes')} :</span>
                      <span className="text-[#F8F1E8]">{topNotes}</span>
                    </div>
                  )}
                  {heartNotes && (
                    <div className="flex flex-col sm:flex-row sm:items-baseline gap-1 sm:gap-2">
                      <span className="text-[#E8D9C6]/60 font-medium shrink-0">{t('heartNotes')} :</span>
                      <span className="text-[#F8F1E8]">{heartNotes}</span>
                    </div>
                  )}
                  {baseNotes && (
                    <div className="flex flex-col sm:flex-row sm:items-baseline gap-1 sm:gap-2">
                      <span className="text-[#E8D9C6]/60 font-medium shrink-0">{t('baseNotes')} :</span>
                      <span className="text-[#F8F1E8]">{baseNotes}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Quantity Stepper & Actions */}
              <div className="space-y-3 mb-6">
                <div className="flex items-center gap-4">
                  <span className="text-xs uppercase tracking-wider text-[#E8D9C6]/70">
                    {t('quantity')} :
                  </span>
                  <div className="flex items-center border border-[#C69A55]/40 rounded bg-[#110E0B]">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="px-3 py-1.5 text-base text-[#E8D9C6] hover:text-[#C69A55] transition-colors"
                    >
                      -
                    </button>
                    <span className="px-3 py-1.5 text-sm font-mono text-[#F8F1E8] min-w-[2.5rem] text-center tabular-nums">
                      {quantity}
                    </span>
                    <button
                      onClick={() => setQuantity(quantity + 1)}
                      className="px-3 py-1.5 text-base text-[#E8D9C6] hover:text-[#C69A55] transition-colors"
                    >
                      +
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                  <button
                    onClick={handleAdd}
                    className={`py-3.5 px-4 font-semibold text-xs tracking-wider uppercase rounded-sm border border-[#C69A55] transition-all flex items-center justify-center gap-2 cursor-pointer ${
                      justAdded
                        ? 'bg-[#C69A55] text-[#17130F]'
                        : 'bg-transparent text-[#C69A55] hover:bg-[#C69A55]/15'
                    }`}
                  >
                    {justAdded ? (
                      <>
                        <Check className="w-4 h-4" />
                        <span>{isFrench ? 'Ajouté !' : 'تمت الإضافة !'}</span>
                      </>
                    ) : (
                      <>
                        <ShoppingBag className="w-4 h-4" />
                        <span>{t('addToCart')}</span>
                      </>
                    )}
                  </button>

                  <button
                    onClick={handleBuyNow}
                    className="py-3.5 px-4 font-semibold text-xs tracking-wider uppercase rounded-sm bg-[#C69A55] hover:bg-[#d8af6f] text-[#17130F] shadow-lg shadow-[#C69A55]/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <span>{t('proceedToCheckout')}</span>
                  </button>
                </div>
              </div>

              {/* Guarantees */}
              <div className="pt-4 border-t border-[#C69A55]/15 grid grid-cols-2 gap-2 text-[11px] text-[#E8D9C6]/70">
                <div className="flex items-center gap-1.5">
                  <Truck className="w-3.5 h-3.5 text-[#C69A55]" />
                  <span>58 Wilayas en 24h-72h</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-[#C69A55]" />
                  <span>Paiement à la livraison</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Related Products Section */}
        {related.length > 0 && (
          <div className="p-6 bg-[#130F0C] border-t border-[#C69A55]/20">
            <h3 className="text-xs uppercase tracking-[0.2em] text-[#C69A55] font-semibold mb-4">
              {t('relatedProducts')}
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {related.map((r) => {
                const rName = isFrench ? r.name : r.nameAr;
                return (
                  <div
                    key={r.id}
                    onClick={() => onSelectProduct(r)}
                    className="flex items-center gap-3 p-2.5 rounded bg-[#1A1511] border border-[#C69A55]/15 hover:border-[#C69A55]/50 transition-colors cursor-pointer group"
                  >
                    <img
                      src={resolveProductImage(r.image, r.id)}
                      alt={rName}
                      className="w-14 h-14 object-cover rounded bg-[#110E0B]"
                      referrerPolicy="no-referrer"
                    />
                    <div className="overflow-hidden">
                      <p className="font-serif text-sm font-bold text-[#F8F1E8] group-hover:text-[#C69A55] transition-colors truncate">
                        {rName}
                      </p>
                      <p className="text-xs font-mono text-[#C69A55] tabular-nums">
                        {r.price.toLocaleString()} {isFrench ? 'DZD' : 'دج'}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
