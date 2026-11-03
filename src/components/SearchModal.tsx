import React, { useState, useEffect, useRef } from 'react';
import { Product } from '../types';
import { useLanguage } from '../context/LanguageContext';
import { Search, X, ShoppingBag } from 'lucide-react';
import { resolveProductImage } from '../assets/images';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  products: Product[];
  onSelectProduct: (p: Product) => void;
}

export const SearchModal: React.FC<SearchModalProps> = ({
  isOpen,
  onClose,
  products,
  onSelectProduct,
}) => {
  const { language, t } = useLanguage();
  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
    } else {
      setQuery('');
    }
  }, [isOpen]);

  if (!isOpen) return null;
  const isFrench = language === 'fr';

  const filtered = query.trim()
    ? products.filter((p) => {
        const q = query.toLowerCase().trim();
        return (
          p.name.toLowerCase().includes(q) ||
          p.nameAr.toLowerCase().includes(q) ||
          p.descriptionFr.toLowerCase().includes(q) ||
          p.descriptionAr.toLowerCase().includes(q) ||
          p.topNotesFr?.toLowerCase().includes(q) ||
          p.topNotesAr?.toLowerCase().includes(q) ||
          p.heartNotesFr?.toLowerCase().includes(q) ||
          p.heartNotesAr?.toLowerCase().includes(q) ||
          p.baseNotesFr?.toLowerCase().includes(q) ||
          p.baseNotesAr?.toLowerCase().includes(q)
        );
      })
    : [];

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/85 backdrop-blur-md flex items-start justify-center p-4 sm:p-6 pt-16 sm:pt-24 animate-fadeIn">
      <div
        className="relative w-full max-w-2xl bg-[#17130F] border border-[#C69A55]/30 rounded-sm shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-4 border-b border-[#C69A55]/20 flex items-center gap-3 bg-[#130F0C]">
          <Search className="w-5 h-5 text-[#C69A55] shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t('searchPlaceholder')}
            className="w-full bg-transparent text-sm sm:text-base text-[#F8F1E8] placeholder:text-[#E8D9C6]/40 focus:outline-none"
          />
          <button
            onClick={onClose}
            className="p-1.5 text-[#E8D9C6]/60 hover:text-[#C69A55] rounded-full"
            aria-label={t('close')}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Results List */}
        <div className="max-h-96 overflow-y-auto p-4 divide-y divide-[#C69A55]/10">
          {query.trim() === '' ? (
            <div className="py-8 text-center text-xs text-[#E8D9C6]/50">
              {isFrench
                ? 'Tapez un nom de parfum (ex: Oud, Rose, Ambrée) ou une note olfactive...'
                : 'اكتب اسم العطر (مثل: عود، ورد، عنبر) أو المكونات للبحث...'}
            </div>
          ) : filtered.length === 0 ? (
            <div className="py-8 text-center text-xs text-[#E8D9C6]/60">
              {isFrench ? 'Aucun parfum ne correspond à votre recherche.' : 'لم يتم العثور على أي عطر يطابق بحثك.'}
            </div>
          ) : (
            filtered.map((p) => {
              const pName = isFrench ? p.name : p.nameAr;
              return (
                <div
                  key={p.id}
                  onClick={() => {
                    onClose();
                    onSelectProduct(p);
                  }}
                  className="py-3 px-2 flex items-center justify-between gap-4 hover:bg-[#C69A55]/10 rounded cursor-pointer transition-colors group"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <img
                      src={resolveProductImage(p.image, p.id)}
                      alt={pName}
                      className="w-12 h-12 object-cover rounded bg-[#110E0B] border border-[#C69A55]/20 shrink-0"
                      referrerPolicy="no-referrer"
                    />
                    <div className="min-w-0">
                      <p className="font-serif font-bold text-sm text-[#F8F1E8] group-hover:text-[#C69A55] transition-colors truncate">
                        {pName}
                      </p>
                      <p className="text-[11px] text-[#E8D9C6]/60 truncate">
                        {p.volume} • {p.category}
                      </p>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <span className="font-mono text-sm font-bold text-[#C69A55] tabular-nums">
                      {p.price.toLocaleString()} {isFrench ? 'DZD' : 'دج'}
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
