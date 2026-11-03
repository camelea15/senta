import React from 'react';
import { Order } from '../types';
import { useLanguage } from '../context/LanguageContext';
import { CheckCircle, PhoneCall, Truck, Package, X, ArrowRight, ArrowLeft } from 'lucide-react';

interface OrderConfirmationModalProps {
  order: Order | null;
  onClose: () => void;
  onTrackOrder: (ref: string) => void;
}

export const OrderConfirmationModal: React.FC<OrderConfirmationModalProps> = ({
  order,
  onClose,
  onTrackOrder,
}) => {
  const { language, dir, t } = useLanguage();

  if (!order) return null;
  const isFrench = language === 'fr';

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 animate-fadeIn">
      <div
        className="relative w-full max-w-xl bg-[#17130F] border border-[#C69A55]/40 rounded-sm shadow-2xl overflow-hidden my-6 p-6 sm:p-8"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 text-[#E8D9C6]/60 hover:text-[#C69A55] rounded-full"
          aria-label={t('close')}
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center space-y-3">
          <div className="w-16 h-16 mx-auto rounded-full bg-[#C69A55]/15 border border-[#C69A55]/40 flex items-center justify-center text-[#C69A55] animate-bounce">
            <CheckCircle className="w-9 h-9" />
          </div>

          <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#F8F1E8]">
            {t('orderSuccessTitle')}
          </h2>

          <p className="text-xs sm:text-sm text-[#E8D9C6]/80 max-w-md mx-auto">
            {t('orderSuccessSubtitle')}
          </p>

          {/* Reference Card */}
          <div className="my-6 p-4 bg-[#120E0B] border border-[#C69A55]/30 rounded text-center">
            <span className="text-[11px] uppercase tracking-widest text-[#E8D9C6]/60 block mb-1">
              {t('orderReferenceLabel')}
            </span>
            <span className="font-mono text-2xl font-bold text-[#C69A55] tracking-wider select-all">
              {order.reference}
            </span>
          </div>
        </div>

        {/* Notice of phone call */}
        <div className="p-4 bg-[#1B1612] border border-[#C69A55]/20 rounded text-xs space-y-2 mb-6">
          <div className="flex items-center gap-2 text-[#C69A55] font-semibold">
            <PhoneCall className="w-4 h-4 shrink-0" />
            <span>{isFrench ? 'Confirmation Téléphonique' : 'التأكيد عبر الهاتف'}</span>
          </div>
          <p className="text-[#E8D9C6]/75 leading-relaxed">
            {t('orderConfirmationNotice')}
          </p>
        </div>

        {/* Summary */}
        <div className="border border-[#C69A55]/15 rounded bg-[#130F0C] p-4 text-xs space-y-2 mb-6">
          <h4 className="font-semibold uppercase tracking-wider text-[#C69A55] mb-2 flex items-center gap-1.5">
            <Package className="w-3.5 h-3.5" />
            <span>{t('orderSummaryTitle')}</span>
          </h4>

          <div className="flex justify-between text-[#E8D9C6]/80">
            <span>{isFrench ? 'Client' : 'الزبون'}</span>
            <span className="font-medium text-[#F8F1E8]">{order.customerName}</span>
          </div>
          <div className="flex justify-between text-[#E8D9C6]/80">
            <span>{isFrench ? 'Téléphone' : 'الهاتف'}</span>
            <span className="font-mono text-[#F8F1E8]">{order.phoneNumber}</span>
          </div>
          <div className="flex justify-between text-[#E8D9C6]/80">
            <span>{isFrench ? 'Destination' : 'الولاية / العنوان'}</span>
            <span className="text-[#F8F1E8]">{order.wilayaName} ({order.commune})</span>
          </div>
          <div className="flex justify-between text-[#E8D9C6]/80">
            <span>{t('deliveryMethod')}</span>
            <span className="text-[#C69A55]">
              {order.deliveryMethod === 'home' ? t('homeDelivery') : t('deskDelivery')}
            </span>
          </div>

          <div className="pt-2 border-t border-[#C69A55]/10 flex justify-between text-sm font-bold text-[#F8F1E8]">
            <span>{t('totalToPay')}</span>
            <span className="font-mono text-base text-[#C69A55] tabular-nums">
              {order.total.toLocaleString()} {isFrench ? 'DZD' : 'دج'}
            </span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <button
            onClick={onClose}
            className="w-full py-3 px-4 bg-[#C69A55] hover:bg-[#d8af6f] text-[#17130F] font-bold text-xs uppercase tracking-wider rounded-sm transition-colors text-center"
          >
            {t('backToHome')}
          </button>
          <button
            onClick={() => {
              onClose();
              onTrackOrder(order.reference);
            }}
            className="w-full py-3 px-4 border border-[#C69A55]/40 hover:border-[#C69A55] text-[#E8D9C6] hover:text-[#C69A55] font-semibold text-xs uppercase tracking-wider rounded-sm transition-colors flex items-center justify-center gap-1.5"
          >
            <span>{t('trackMyOrder')}</span>
            {dir === 'rtl' ? <ArrowLeft className="w-3.5 h-3.5" /> : <ArrowRight className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>
    </div>
  );
};
