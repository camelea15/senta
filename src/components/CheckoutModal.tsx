import React, { useState, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useCart } from '../context/CartContext';
import { WilayaDeliveryFee, Order } from '../types';
import { X, ShieldCheck, Truck, Building2, AlertCircle, CheckCircle2 } from 'lucide-react';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOrderSuccess: (order: Order) => void;
  initialDiscount?: number;
  initialPromoCode?: string;
}

export const CheckoutModal: React.FC<CheckoutModalProps> = ({
  isOpen,
  onClose,
  onOrderSuccess,
  initialDiscount = 0,
  initialPromoCode = '',
}) => {
  const { language, t } = useLanguage();
  const { cart, cartSubtotal, clearCart } = useCart();

  const [wilayas, setWilayas] = useState<WilayaDeliveryFee[]>([]);
  const [loadingWilayas, setLoadingWilayas] = useState(true);

  // Form State
  const [fullName, setFullName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [selectedWilayaCode, setSelectedWilayaCode] = useState('');
  const [commune, setCommune] = useState('');
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [deliveryMethod, setDeliveryMethod] = useState<'home' | 'desk'>('home');
  const [orderNotes, setOrderNotes] = useState('');

  // Submitting State
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Fetch Wilayas on mount
  useEffect(() => {
    fetch('/api/wilayas')
      .then((res) => res.json())
      .then((data) => {
        setWilayas(data);
        if (data.length > 0 && !selectedWilayaCode) {
          // Default to Alger (16) if available, or first wilaya
          const defaultW = data.find((w: WilayaDeliveryFee) => w.code === '16') || data[0];
          setSelectedWilayaCode(defaultW.code);
        }
      })
      .catch((err) => console.error('Failed fetching wilayas', err))
      .finally(() => setLoadingWilayas(false));
  }, []);

  if (!isOpen) return null;

  const isFrench = language === 'fr';
  const selectedWilaya = wilayas.find((w) => w.code === selectedWilayaCode);

  // Delivery fee logic
  let deliveryFee = 0;
  if (selectedWilaya) {
    deliveryFee = deliveryMethod === 'desk' ? selectedWilaya.deskFee : selectedWilaya.homeFee;
  }

  // Free shipping check if subtotal is above 22,000 DZD
  const isFreeShipping = cartSubtotal >= 22000;
  if (isFreeShipping) {
    deliveryFee = 0;
  }

  const finalTotal = Math.max(0, cartSubtotal - initialDiscount + deliveryFee);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    // Client-side validations
    if (!fullName.trim() || fullName.trim().length < 2) {
      setErrorMessage(
        isFrench ? 'Veuillez saisir votre nom et prénom.' : 'يرجى إدخال اسمك ولقبك الكامل.'
      );
      return;
    }

    const cleanPhone = phoneNumber.replace(/[\s\-\.]/g, '');
    const algerianRegex = /^(0|\+213|00213)(5|6|7)[0-9]{8}$/;
    if (!algerianRegex.test(cleanPhone)) {
      setErrorMessage(
        isFrench
          ? 'Numéro de téléphone algérien non valide (doit commencer par 05, 06 ou 07).'
          : 'رقم الهاتف غير صحيح (يجب أن يبدأ بـ 05، 06 أو 07 متبوعاً بـ 8 أرقام).'
      );
      return;
    }

    if (!selectedWilayaCode) {
      setErrorMessage(
        isFrench ? 'Veuillez sélectionner votre wilaya.' : 'يرجى اختيار الولاية الخاصة بك.'
      );
      return;
    }

    if (!commune.trim()) {
      setErrorMessage(
        isFrench ? 'Veuillez renseigner votre commune.' : 'يرجى كتابة اسم البلدية أو المدينة.'
      );
      return;
    }

    if (!deliveryAddress.trim() || deliveryAddress.trim().length < 4) {
      setErrorMessage(
        isFrench
          ? 'Veuillez fournir une adresse de livraison précise.'
          : 'يرجى كتابة عنوان مفصل وواضح للتسليم.'
      );
      return;
    }

    if (cart.length === 0) {
      setErrorMessage(
        isFrench ? 'Votre panier est vide.' : 'سلة المشتريات فارغة.'
      );
      return;
    }

    setSubmitting(true);

    try {
      const orderPayload = {
        customerName: fullName.trim(),
        phoneNumber: cleanPhone,
        wilayaCode: selectedWilayaCode,
        commune: commune.trim(),
        deliveryAddress: deliveryAddress.trim(),
        deliveryMethod,
        items: cart.map((item) => ({
          productId: item.product.id,
          quantity: item.quantity,
        })),
        promoCode: initialPromoCode,
        notes: orderNotes.trim() || undefined,
      };

      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderPayload),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Erreur lors de la validation');
      }

      // Success! Empty cart & notify parent
      clearCart();
      onClose();
      onOrderSuccess(data);
    } catch (err: any) {
      setErrorMessage(err.message || 'Une erreur est survenue lors de la validation.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 animate-fadeIn">
      <div
        className="relative w-full max-w-2xl bg-[#17130F] border border-[#C69A55]/30 rounded-sm shadow-2xl overflow-hidden my-6"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 border-b border-[#C69A55]/20 flex items-center justify-between bg-[#14100D]">
          <div>
            <h2 className="font-serif text-2xl font-bold text-[#F8F1E8]">
              {t('checkoutTitle')}
            </h2>
            <p className="text-xs text-[#E8D9C6]/70 mt-0.5">
              {t('checkoutSubtitle')}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-[#E8D9C6]/70 hover:text-[#C69A55] transition-colors rounded-full"
            aria-label={t('close')}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6 max-h-[80vh] overflow-y-auto">
          {errorMessage && (
            <div className="p-3 bg-rose-950/40 border border-rose-500/40 text-rose-300 text-xs rounded flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Customer Info */}
          <div className="space-y-4">
            <h3 className="text-xs uppercase tracking-widest text-[#C69A55] font-semibold">
              1. {isFrench ? 'Coordonnées du Destinataire' : 'معلومات المستلم'}
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-[#E8D9C6] mb-1.5">
                  {t('fullName')} *
                </label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder={t('fullNamePlaceholder')}
                  className="w-full px-3.5 py-2.5 bg-[#1B1612] border border-[#C69A55]/30 rounded text-sm text-[#F8F1E8] placeholder:text-[#E8D9C6]/40 focus:outline-none focus:border-[#C69A55]"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[#E8D9C6] mb-1.5">
                  {t('phone')} *
                </label>
                <input
                  type="tel"
                  required
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  placeholder={t('phonePlaceholder')}
                  className="w-full px-3.5 py-2.5 bg-[#1B1612] border border-[#C69A55]/30 rounded text-sm text-[#F8F1E8] placeholder:text-[#E8D9C6]/40 focus:outline-none focus:border-[#C69A55] font-mono"
                />
              </div>
            </div>
          </div>

          {/* Delivery Location */}
          <div className="space-y-4 pt-4 border-t border-[#C69A55]/15">
            <h3 className="text-xs uppercase tracking-widest text-[#C69A55] font-semibold">
              2. {isFrench ? 'Adresse de Livraison (Algérie)' : 'عنوان التوصيل في الجزائر'}
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* 58 Wilayas Selector */}
              <div>
                <label className="block text-xs font-medium text-[#E8D9C6] mb-1.5">
                  {t('wilaya')} *
                </label>
                <select
                  required
                  value={selectedWilayaCode}
                  onChange={(e) => setSelectedWilayaCode(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-[#1B1612] border border-[#C69A55]/30 rounded text-sm text-[#F8F1E8] focus:outline-none focus:border-[#C69A55]"
                >
                  {loadingWilayas ? (
                    <option>Chargement des wilayas...</option>
                  ) : (
                    wilayas.map((w) => (
                      <option key={w.code} value={w.code}>
                        {w.code} - {isFrench ? w.nameFr : w.nameAr}
                      </option>
                    ))
                  )}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-[#E8D9C6] mb-1.5">
                  {t('commune')} *
                </label>
                <input
                  type="text"
                  required
                  value={commune}
                  onChange={(e) => setCommune(e.target.value)}
                  placeholder={t('communePlaceholder')}
                  className="w-full px-3.5 py-2.5 bg-[#1B1612] border border-[#C69A55]/30 rounded text-sm text-[#F8F1E8] placeholder:text-[#E8D9C6]/40 focus:outline-none focus:border-[#C69A55]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-[#E8D9C6] mb-1.5">
                {t('address')} *
              </label>
              <textarea
                required
                rows={2}
                value={deliveryAddress}
                onChange={(e) => setDeliveryAddress(e.target.value)}
                placeholder={t('addressPlaceholder')}
                className="w-full px-3.5 py-2.5 bg-[#1B1612] border border-[#C69A55]/30 rounded text-sm text-[#F8F1E8] placeholder:text-[#E8D9C6]/40 focus:outline-none focus:border-[#C69A55]"
              />
            </div>
          </div>

          {/* Delivery Method Selector */}
          <div className="space-y-3 pt-4 border-t border-[#C69A55]/15">
            <h3 className="text-xs uppercase tracking-widest text-[#C69A55] font-semibold">
              3. {t('deliveryMethod')}
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Home Delivery */}
              <label
                className={`p-3.5 rounded border cursor-pointer transition-all flex items-start gap-3 ${
                  deliveryMethod === 'home'
                    ? 'border-[#C69A55] bg-[#C69A55]/10'
                    : 'border-[#C69A55]/20 bg-[#14100D] hover:border-[#C69A55]/40'
                }`}
              >
                <input
                  type="radio"
                  name="deliveryMethod"
                  checked={deliveryMethod === 'home'}
                  onChange={() => setDeliveryMethod('home')}
                  className="mt-0.5 accent-[#C69A55]"
                />
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-bold text-[#F8F1E8] flex items-center gap-1.5">
                      <Truck className="w-4 h-4 text-[#C69A55]" />
                      {t('homeDelivery')}
                    </span>
                    <span className="text-xs font-mono font-bold text-[#C69A55] tabular-nums">
                      {isFreeShipping ? t('freeDelivery') : `${selectedWilaya?.homeFee || 600} DZD`}
                    </span>
                  </div>
                  <p className="text-[11px] text-[#E8D9C6]/60 mt-0.5">
                    {isFrench ? 'Directement à votre porte' : 'توصيل لباب منزلك أو عنوان عملك'}
                  </p>
                </div>
              </label>

              {/* Desk Pickup */}
              <label
                className={`p-3.5 rounded border cursor-pointer transition-all flex items-start gap-3 ${
                  deliveryMethod === 'desk'
                    ? 'border-[#C69A55] bg-[#C69A55]/10'
                    : 'border-[#C69A55]/20 bg-[#14100D] hover:border-[#C69A55]/40'
                }`}
              >
                <input
                  type="radio"
                  name="deliveryMethod"
                  checked={deliveryMethod === 'desk'}
                  onChange={() => setDeliveryMethod('desk')}
                  className="mt-0.5 accent-[#C69A55]"
                />
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-bold text-[#F8F1E8] flex items-center gap-1.5">
                      <Building2 className="w-4 h-4 text-[#C69A55]" />
                      {t('deskDelivery')}
                    </span>
                    <span className="text-xs font-mono font-bold text-[#C69A55] tabular-nums">
                      {isFreeShipping ? t('freeDelivery') : `${selectedWilaya?.deskFee || 400} DZD`}
                    </span>
                  </div>
                  <p className="text-[11px] text-[#E8D9C6]/60 mt-0.5">
                    {isFrench ? 'Point relais / Bureau de messagerie' : 'استلام من مكتب التوصيل في ولايتك'}
                  </p>
                </div>
              </label>
            </div>
          </div>

          {/* Payment Method Notice */}
          <div className="p-4 bg-[#14100D] border border-[#C69A55]/30 rounded text-xs space-y-1">
            <div className="flex items-center gap-2 text-[#C69A55] font-semibold">
              <ShieldCheck className="w-4 h-4" />
              <span>{isFrench ? 'Paiement à la Livraison (100% Sérénité)' : 'الدفع عند الاستلام (يداً بيد)'}</span>
            </div>
            <p className="text-[#E8D9C6]/75 leading-relaxed">
              {t('codNotice')}
            </p>
          </div>

          {/* Optional Notes */}
          <div>
            <label className="block text-xs font-medium text-[#E8D9C6] mb-1.5">
              {t('orderNotes')}
            </label>
            <input
              type="text"
              value={orderNotes}
              onChange={(e) => setOrderNotes(e.target.value)}
              placeholder={t('orderNotesPlaceholder')}
              className="w-full px-3.5 py-2 bg-[#1B1612] border border-[#C69A55]/30 rounded text-xs text-[#F8F1E8] placeholder:text-[#E8D9C6]/40 focus:outline-none focus:border-[#C69A55]"
            />
          </div>

          {/* Dynamic Order Summary */}
          <div className="pt-4 border-t border-[#C69A55]/20 space-y-2 bg-[#120E0B] p-4 rounded text-xs">
            <h4 className="font-semibold text-xs uppercase tracking-wider text-[#C69A55] mb-2">
              {t('orderSummary')}
            </h4>

            {cart.map((item) => (
              <div key={item.product.id} className="flex justify-between text-[#E8D9C6]/80">
                <span className="truncate max-w-[220px]">
                  {isFrench ? item.product.name : item.product.nameAr} × {item.quantity}
                </span>
                <span className="font-mono tabular-nums">
                  {(item.product.price * item.quantity).toLocaleString()} DZD
                </span>
              </div>
            ))}

            <div className="flex justify-between text-[#E8D9C6]/80 pt-2 border-t border-[#C69A55]/10">
              <span>{t('subtotal')}</span>
              <span className="font-mono tabular-nums">{cartSubtotal.toLocaleString()} DZD</span>
            </div>

            {initialDiscount > 0 && (
              <div className="flex justify-between text-emerald-400">
                <span>{t('discount')} ({initialPromoCode})</span>
                <span className="font-mono tabular-nums">-{initialDiscount.toLocaleString()} DZD</span>
              </div>
            )}

            <div className="flex justify-between text-[#E8D9C6]/80">
              <span>{t('deliveryFee')}</span>
              <span className="font-mono font-medium text-[#C69A55] tabular-nums">
                {deliveryFee === 0 ? t('freeDelivery') : `${deliveryFee.toLocaleString()} DZD`}
              </span>
            </div>

            <div className="flex justify-between text-base font-bold text-[#F8F1E8] pt-2 border-t border-[#C69A55]/20">
              <span>{t('totalToPay')}</span>
              <span className="font-mono text-xl text-[#C69A55] tabular-nums">
                {finalTotal.toLocaleString()} {isFrench ? 'DZD' : 'دج'}
              </span>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={submitting}
            className="w-full py-4 px-6 bg-[#C69A55] hover:bg-[#d8af6f] disabled:bg-neutral-800 disabled:text-neutral-500 text-[#17130F] font-bold text-sm tracking-wider uppercase rounded-sm shadow-xl shadow-[#C69A55]/25 transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            {submitting ? (
              <span>{t('submittingOrder')}</span>
            ) : (
              <>
                <CheckCircle2 className="w-5 h-5" />
                <span>{t('confirmOrderButton')}</span>
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};
