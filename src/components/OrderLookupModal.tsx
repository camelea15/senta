import React, { useState, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { X, Search, Package, Clock, CheckCircle2, Truck, AlertTriangle, XCircle } from 'lucide-react';

interface OrderLookupModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialReference?: string;
}

export const OrderLookupModal: React.FC<OrderLookupModalProps> = ({
  isOpen,
  onClose,
  initialReference = '',
}) => {
  const { language, t } = useLanguage();
  const [refInput, setRefInput] = useState(initialReference);
  const [phoneInput, setPhoneInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    if (initialReference) {
      setRefInput(initialReference);
    }
  }, [initialReference]);

  if (!isOpen) return null;
  const isFrench = language === 'fr';

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!refInput.trim()) return;

    setLoading(true);
    setError('');
    setResult(null);

    try {
      const url = `/api/orders/lookup/${encodeURIComponent(refInput.trim())}${
        phoneInput.trim() ? `?phone=${encodeURIComponent(phoneInput.trim())}` : ''
      }`;
      const res = await fetch(url);
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Commande introuvable');
      } else {
        setResult(data);
      }
    } catch {
      setError('Erreur lors de la recherche.');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return {
          label: t('statusPending'),
          icon: Clock,
          color: 'text-amber-400 bg-amber-950/40 border-amber-500/30',
        };
      case 'confirmed':
        return {
          label: t('statusConfirmed'),
          icon: CheckCircle2,
          color: 'text-sky-400 bg-sky-950/40 border-sky-500/30',
        };
      case 'preparing':
        return {
          label: t('statusPreparing'),
          icon: Package,
          color: 'text-purple-400 bg-purple-950/40 border-purple-500/30',
        };
      case 'shipped':
        return {
          label: t('statusShipped'),
          icon: Truck,
          color: 'text-indigo-400 bg-indigo-950/40 border-indigo-500/30',
        };
      case 'delivered':
        return {
          label: t('statusDelivered'),
          icon: CheckCircle2,
          color: 'text-emerald-400 bg-emerald-950/40 border-emerald-500/30',
        };
      case 'cancelled':
        return {
          label: t('statusCancelled'),
          icon: XCircle,
          color: 'text-rose-400 bg-rose-950/40 border-rose-500/30',
        };
      default:
        return {
          label: status,
          icon: Clock,
          color: 'text-neutral-400 bg-neutral-900 border-neutral-700',
        };
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 animate-fadeIn">
      <div
        className="relative w-full max-w-lg bg-[#17130F] border border-[#C69A55]/30 rounded-sm shadow-2xl overflow-hidden my-6 p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 text-[#E8D9C6]/60 hover:text-[#C69A55] rounded-full"
          aria-label={t('close')}
        >
          <X className="w-5 h-5" />
        </button>

        <div className="mb-6">
          <h2 className="font-serif text-2xl font-bold text-[#F8F1E8]">
            {t('trackOrderTitle')}
          </h2>
          <p className="text-xs text-[#E8D9C6]/70 mt-1">
            {isFrench
              ? 'Entrez la référence reçue lors de votre commande pour voir son avancement.'
              : 'أدخل رقم المرجع الخاص بطلبيتك لمعرفة حالتها الحالية ومسار التوصيل.'}
          </p>
        </div>

        <form onSubmit={handleSearch} className="space-y-3 mb-6">
          <div>
            <label className="block text-xs font-medium text-[#E8D9C6] mb-1">
              {t('orderReferenceLabel')} *
            </label>
            <input
              type="text"
              required
              value={refInput}
              onChange={(e) => setRefInput(e.target.value.toUpperCase())}
              placeholder={t('trackOrderRefPlaceholder')}
              className="w-full px-3.5 py-2.5 bg-[#1B1612] border border-[#C69A55]/30 rounded text-sm text-[#F8F1E8] font-mono uppercase focus:outline-none focus:border-[#C69A55]"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-[#E8D9C6] mb-1">
              {t('phone')} ({isFrench ? 'Facultatif' : 'اختياري'})
            </label>
            <input
              type="tel"
              value={phoneInput}
              onChange={(e) => setPhoneInput(e.target.value)}
              placeholder={t('trackOrderPhonePlaceholder')}
              className="w-full px-3.5 py-2.5 bg-[#1B1612] border border-[#C69A55]/30 rounded text-sm text-[#F8F1E8] font-mono focus:outline-none focus:border-[#C69A55]"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-[#C69A55] hover:bg-[#d8af6f] disabled:bg-neutral-800 text-[#17130F] font-bold text-xs uppercase tracking-wider rounded-sm transition-colors flex items-center justify-center gap-2 cursor-pointer"
          >
            <Search className="w-4 h-4" />
            <span>{loading ? (isFrench ? 'Recherche...' : 'جاري البحث...') : t('trackButton')}</span>
          </button>
        </form>

        {error && (
          <div className="p-3 bg-rose-950/40 border border-rose-500/40 text-rose-300 text-xs rounded flex items-center gap-2 mb-4">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {result && (
          <div className="border border-[#C69A55]/30 bg-[#120E0B] p-4 rounded space-y-4 animate-fadeIn">
            <div className="flex items-center justify-between border-b border-[#C69A55]/15 pb-3">
              <div>
                <span className="text-[10px] uppercase tracking-wider text-[#E8D9C6]/60">
                  {t('orderReferenceLabel')}
                </span>
                <p className="font-mono text-lg font-bold text-[#C69A55]">
                  {result.reference}
                </p>
              </div>
              <div className="text-right">
                <span className="text-[10px] uppercase tracking-wider text-[#E8D9C6]/60">
                  {isFrench ? 'Destination' : 'الوجهة'}
                </span>
                <p className="text-xs font-medium text-[#F8F1E8]">
                  {result.wilayaName}
                </p>
              </div>
            </div>

            {/* Current Status Badge */}
            <div>
              <span className="text-[11px] uppercase tracking-wider text-[#E8D9C6]/60 block mb-1.5">
                {t('orderFoundStatus')}
              </span>
              {(() => {
                const badge = getStatusBadge(result.status);
                const Icon = badge.icon;
                return (
                  <div className={`p-3 rounded border flex items-center gap-3 ${badge.color}`}>
                    <Icon className="w-5 h-5 shrink-0" />
                    <div>
                      <p className="text-xs font-bold">{badge.label}</p>
                      <p className="text-[10px] opacity-80">
                        {isFrench ? 'Dernière mise à jour :' : 'آخر تحديث :'} {new Date(result.updatedAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                );
              })()}
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs pt-2 border-t border-[#C69A55]/15 text-[#E8D9C6]/80">
              <div>
                <span className="opacity-60">{isFrench ? 'Articles :' : 'عدد العطور :'}</span>{' '}
                <span className="text-[#F8F1E8] font-mono">{result.itemsCount}</span>
              </div>
              <div className="text-right">
                <span className="opacity-60">{isFrench ? 'Total :' : 'المجموع :'}</span>{' '}
                <span className="text-[#C69A55] font-mono font-bold">
                  {result.total?.toLocaleString()} {isFrench ? 'DZD' : 'دج'}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
