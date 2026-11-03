import React from 'react';
import { useCart } from '../context/CartContext';
import { useLanguage } from '../context/LanguageContext';
import { CheckCircle2, ShoppingBag, X } from 'lucide-react';

export const CartToast: React.FC = () => {
  const { addedToastProduct, dismissToast, setIsCartOpen } = useCart();
  const { language, t } = useLanguage();

  if (!addedToastProduct) return null;

  const isFrench = language === 'fr';
  const name = isFrench ? addedToastProduct.name : addedToastProduct.nameAr;

  return (
    <div className="fixed bottom-6 right-6 z-50 max-w-sm w-full bg-[#17130F] border border-[#C69A55] rounded shadow-2xl p-4 flex items-center gap-3 animate-slideUp">
      <img
        src={addedToastProduct.image}
        alt={name}
        className="w-12 h-12 object-cover rounded bg-[#110E0B] border border-[#C69A55]/30 shrink-0"
        referrerPolicy="no-referrer"
      />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-semibold mb-0.5">
          <CheckCircle2 className="w-3.5 h-3.5" />
          <span>{isFrench ? 'Ajouté au panier' : 'تمت الإضافة للسلة'}</span>
        </div>
        <p className="font-serif text-sm font-bold text-[#F8F1E8] truncate">{name}</p>
        <p className="text-[11px] text-[#C69A55] font-mono tabular-nums">
          {addedToastProduct.price.toLocaleString()} {isFrench ? 'DZD' : 'دج'}
        </p>
      </div>

      <div className="flex items-center gap-1">
        <button
          onClick={() => {
            dismissToast();
            setIsCartOpen(true);
          }}
          className="p-2 bg-[#C69A55] text-[#17130F] rounded hover:bg-[#d8af6f] transition-colors"
          title="Voir le panier"
        >
          <ShoppingBag className="w-4 h-4" />
        </button>
        <button
          onClick={dismissToast}
          className="p-1.5 text-[#E8D9C6]/60 hover:text-[#C69A55]"
          title="Fermer"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
