import React, { useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useCart } from '../context/CartContext';
import { X, Trash2, ShoppingBag, ArrowRight, ArrowLeft, Tag, Sparkles } from 'lucide-react';
import { resolveProductImage } from '../assets/images';

interface CartDrawerProps {
  onProceedToCheckout: (discountAmount: number, promoCode?: string) => void;
  freeShippingThreshold?: number;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({
  onProceedToCheckout,
  freeShippingThreshold = 22000,
}) => {
  const { language, dir, t } = useLanguage();
  const {
    cart,
    isCartOpen,
    setIsCartOpen,
    removeFromCart,
    updateQuantity,
    cartSubtotal,
  } = useCart();

  const [promoInput, setPromoInput] = useState('');
  const [appliedPromo, setAppliedPromo] = useState<{ code: string; discount: number } | null>(null);
  const [promoError, setPromoError] = useState('');
  const [validatingPromo, setValidatingPromo] = useState(false);

  if (!isCartOpen) return null;

  const isFrench = language === 'fr';
  const progressPercent = Math.min(100, Math.round((cartSubtotal / freeShippingThreshold) * 100));
  const amountToFree = Math.max(0, freeShippingThreshold - cartSubtotal);

  const handleApplyPromo = async () => {
    if (!promoInput.trim()) return;
    setValidatingPromo(true);
    setPromoError('');

    try {
      const res = await fetch('/api/promos/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: promoInput.trim(), cartTotal: cartSubtotal }),
      });
      const data = await res.json();
      if (!res.ok) {
        setPromoError(data.error || 'Code promo invalide');
        setAppliedPromo(null);
      } else {
        setAppliedPromo({ code: promoInput.trim().toUpperCase(), discount: data.discount });
        setPromoError('');
      }
    } catch {
      setPromoError('Erreur de validation');
    } finally {
      setValidatingPromo(false);
    }
  };

  const finalTotal = Math.max(0, cartSubtotal - (appliedPromo?.discount || 0));

  const handleCheckoutClick = () => {
    setIsCartOpen(false);
    onProceedToCheckout(appliedPromo?.discount || 0, appliedPromo?.code);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/75 backdrop-blur-sm animate-fadeIn">
      <div className="absolute inset-0" onClick={() => setIsCartOpen(false)} />

      <div
        className={`fixed inset-y-0 ${
          dir === 'rtl' ? 'left-0' : 'right-0'
        } max-w-full flex pl-10 animate-slideIn`}
      >
        <div className="w-screen max-w-md bg-[#17130F] border-x border-[#C69A55]/25 shadow-2xl flex flex-col justify-between">
          {/* Header */}
          <div className="p-5 border-b border-[#C69A55]/20 flex items-center justify-between bg-[#14100D]">
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-[#C69A55]" />
              <h2 className="font-serif text-xl font-bold text-[#F8F1E8]">
                {t('cartTitle')} ({cart.reduce((s, i) => s + i.quantity, 0)})
              </h2>
            </div>
            <button
              onClick={() => setIsCartOpen(false)}
              className="p-1.5 text-[#E8D9C6]/70 hover:text-[#C69A55] transition-colors rounded-full"
              aria-label={t('close')}
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Free Shipping Gauge */}
          {cart.length > 0 && freeShippingThreshold > 0 && (
            <div className="px-5 py-3 bg-[#1B1612] border-b border-[#C69A55]/15 text-xs">
              <div className="flex items-center justify-between mb-1.5 font-medium">
                <span className="flex items-center gap-1.5 text-[#C69A55]">
                  <Sparkles className="w-3.5 h-3.5" />
                  {amountToFree === 0
                    ? t('freeShippingQualified')
                    : t('freeShippingAway', { amount: amountToFree.toLocaleString() })}
                </span>
                <span className="font-mono text-[#E8D9C6]">{progressPercent}%</span>
              </div>
              <div className="w-full bg-[#110E0B] h-1.5 rounded-full overflow-hidden">
                <div
                  className="bg-[#C69A55] h-full transition-all duration-500 rounded-full"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>
          )}

          {/* Cart Item List */}
          <div className="flex-1 overflow-y-auto p-5 divide-y divide-[#C69A55]/10">
            {cart.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center py-12">
                <div className="w-16 h-16 rounded-full bg-[#C69A55]/10 flex items-center justify-center text-[#C69A55] mb-4">
                  <ShoppingBag className="w-8 h-8 opacity-70" />
                </div>
                <h3 className="font-serif text-lg font-bold text-[#F8F1E8] mb-1">
                  {t('cartEmpty')}
                </h3>
                <p className="text-xs text-[#E8D9C6]/60 max-w-xs mb-6 leading-relaxed">
                  {t('cartEmptySubtitle')}
                </p>
                <button
                  onClick={() => setIsCartOpen(false)}
                  className="px-6 py-2.5 bg-[#C69A55] text-[#17130F] font-semibold text-xs tracking-wider uppercase rounded-sm hover:bg-[#d8af6f] transition-colors"
                >
                  {t('continueShopping')}
                </button>
              </div>
            ) : (
              cart.map((item) => {
                const pName = isFrench ? item.product.name : item.product.nameAr;
                return (
                  <div key={item.product.id} className="py-4 flex gap-4 items-center">
                    <img
                      src={resolveProductImage(item.product.image, item.product.id)}
                      alt={pName}
                      className="w-18 h-18 object-cover rounded bg-[#110E0B] border border-[#C69A55]/20 shrink-0"
                      referrerPolicy="no-referrer"
                    />
                    <div className="flex-1 min-w-0">
                      <h4 className="font-serif text-base font-bold text-[#F8F1E8] truncate">
                        {pName}
                      </h4>
                      <p className="text-[11px] text-[#C69A55] uppercase tracking-wider font-mono">
                        {item.product.volume} • {item.product.price.toLocaleString()} {isFrench ? 'DZD' : 'دج'}
                      </p>

                      {/* Quantity Stepper */}
                      <div className="mt-2 flex items-center justify-between">
                        <div className="flex items-center border border-[#C69A55]/30 rounded bg-[#110E0B]">
                          <button
                            onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                            className="px-2 py-0.5 text-xs text-[#E8D9C6] hover:text-[#C69A55]"
                            aria-label="Diminuer"
                          >
                            -
                          </button>
                          <span className="px-2 py-0.5 text-xs font-mono text-[#F8F1E8] tabular-nums">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                            className="px-2 py-0.5 text-xs text-[#E8D9C6] hover:text-[#C69A55]"
                            aria-label="Augmenter"
                          >
                            +
                          </button>
                        </div>

                        {/* Remove */}
                        <button
                          onClick={() => removeFromCart(item.product.id)}
                          className="text-[#E8D9C6]/50 hover:text-rose-400 p-1 transition-colors"
                          title="Supprimer"
                          aria-label="Supprimer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Footer & Checkout Trigger */}
          {cart.length > 0 && (
            <div className="p-5 bg-[#14100D] border-t border-[#C69A55]/20 space-y-4">
              {/* Promo Code Input */}
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Tag className="w-3.5 h-3.5 absolute left-3 top-3 text-[#C69A55]/70" />
                  <input
                    type="text"
                    value={promoInput}
                    onChange={(e) => setPromoInput(e.target.value.toUpperCase())}
                    placeholder={t('promoCodePlaceholder')}
                    className="w-full pl-9 pr-3 py-2 bg-[#1B1612] border border-[#C69A55]/30 rounded text-xs text-[#F8F1E8] uppercase placeholder:normal-case placeholder:text-[#E8D9C6]/40 focus:outline-none focus:border-[#C69A55]"
                  />
                </div>
                <button
                  onClick={handleApplyPromo}
                  disabled={validatingPromo}
                  className="px-3 py-2 bg-[#C69A55]/20 text-[#C69A55] border border-[#C69A55]/40 hover:bg-[#C69A55] hover:text-[#17130F] text-xs font-semibold rounded uppercase tracking-wider transition-colors"
                >
                  {t('applyPromo')}
                </button>
              </div>

              {promoError && (
                <p className="text-[11px] text-rose-400">{promoError}</p>
              )}

              {appliedPromo && (
                <div className="flex items-center justify-between text-xs text-emerald-400 bg-emerald-950/30 border border-emerald-500/30 p-2 rounded">
                  <span>{t('promoApplied')} ({appliedPromo.code})</span>
                  <span className="font-mono tabular-nums">-{appliedPromo.discount.toLocaleString()} DZD</span>
                </div>
              )}

              {/* Totals */}
              <div className="space-y-1.5 text-xs text-[#E8D9C6]/80 pt-2 border-t border-[#C69A55]/10">
                <div className="flex justify-between">
                  <span>{t('subtotal')}</span>
                  <span className="font-mono font-medium text-[#F8F1E8] tabular-nums">
                    {cartSubtotal.toLocaleString()} {isFrench ? 'DZD' : 'دج'}
                  </span>
                </div>

                {appliedPromo && (
                  <div className="flex justify-between text-emerald-400">
                    <span>{t('discount')}</span>
                    <span className="font-mono tabular-nums">
                      -{appliedPromo.discount.toLocaleString()} {isFrench ? 'DZD' : 'دج'}
                    </span>
                  </div>
                )}

                <div className="flex justify-between text-base font-bold text-[#F8F1E8] pt-2 border-t border-[#C69A55]/15">
                  <span>{t('estimatedTotal')}</span>
                  <span className="font-mono text-lg text-[#C69A55] tabular-nums">
                    {finalTotal.toLocaleString()} {isFrench ? 'DZD' : 'دج'}
                  </span>
                </div>
              </div>

              {/* Checkout Button */}
              <button
                onClick={handleCheckoutClick}
                className="w-full py-3.5 px-4 bg-[#C69A55] hover:bg-[#d8af6f] text-[#17130F] font-bold text-xs sm:text-sm tracking-wider uppercase rounded-sm shadow-xl shadow-[#C69A55]/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>{t('proceedToCheckout')}</span>
                {dir === 'rtl' ? <ArrowLeft className="w-4 h-4" /> : <ArrowRight className="w-4 h-4" />}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
