import React, { useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { Mail, Phone, Clock, MessageSquare, Send, CheckCircle2, AlertCircle } from 'lucide-react';

interface ContactSectionProps {
  supportPhone?: string;
  supportEmail?: string;
  whatsappNumber?: string;
}

export const ContactSection: React.FC<ContactSectionProps> = ({
  supportPhone = '+213 550 00 26 26',
  supportEmail = 'contact@senta.dz',
  whatsappNumber = '213550002626',
}) => {
  const { language, t } = useLanguage();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [sentSuccess, setSentSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const isFrench = language === 'fr';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !message.trim()) return;

    setSending(true);
    setErrorMessage('');
    setSentSuccess(false);

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, phone, message }),
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Erreur lors de l’envoi');
      }

      setSentSuccess(true);
      setName('');
      setEmail('');
      setPhone('');
      setMessage('');
    } catch (err: any) {
      setErrorMessage(err.message || 'Impossible d’envoyer le message.');
    } finally {
      setSending(false);
    }
  };

  const whatsappUrl = `https://wa.me/${whatsappNumber.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(
    isFrench
      ? 'Bonjour SENTA.DZ, je souhaite me renseigner sur vos parfums.'
      : 'مرحباً سينتا.ديزاد، أود الاستفسار بخصوص عطوركم.'
  )}`;

  return (
    <section id="contact" className="py-20 bg-[#17130F] border-t border-[#C69A55]/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.25em] text-[#C69A55] font-medium mb-3">
            <MessageSquare className="w-3.5 h-3.5" />
            <span>{isFrench ? 'SERVICE CONSEIL' : 'خدمة الاستشارات'}</span>
          </div>
          <h2 className="font-serif text-3xl sm:text-4xl font-bold text-[#F8F1E8] mb-4 text-balance">
            {t('contactTitle')}
          </h2>
          <p className="text-sm sm:text-base text-[#E8D9C6]/80 font-light text-balance">
            {t('contactSubtitle')}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* Info & Direct Contact */}
          <div className="lg:col-span-5 space-y-6">
            <div className="p-6 bg-[#1A1511] border border-[#C69A55]/20 rounded-sm space-y-6">
              <h3 className="font-serif text-xl font-bold text-[#F8F1E8]">
                {isFrench ? 'Nos Coordonnées' : 'معلومات التواصل'}
              </h3>

              <div className="space-y-4 text-sm">
                <div className="flex items-center gap-3 text-[#E8D9C6]">
                  <div className="w-10 h-10 rounded-sm bg-[#C69A55]/10 border border-[#C69A55]/30 flex items-center justify-center text-[#C69A55] shrink-0">
                    <Phone className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-[11px] uppercase tracking-wider text-[#E8D9C6]/60 block">
                      {t('contactDirectPhone')}
                    </span>
                    <a href={`tel:${supportPhone}`} className="font-mono text-[#F8F1E8] hover:text-[#C69A55] transition-colors">
                      {supportPhone}
                    </a>
                  </div>
                </div>

                <div className="flex items-center gap-3 text-[#E8D9C6]">
                  <div className="w-10 h-10 rounded-sm bg-[#C69A55]/10 border border-[#C69A55]/30 flex items-center justify-center text-[#C69A55] shrink-0">
                    <Mail className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-[11px] uppercase tracking-wider text-[#E8D9C6]/60 block">
                      Email
                    </span>
                    <a href={`mailto:${supportEmail}`} className="text-[#F8F1E8] hover:text-[#C69A55] transition-colors">
                      {supportEmail}
                    </a>
                  </div>
                </div>

                <div className="flex items-center gap-3 text-[#E8D9C6]">
                  <div className="w-10 h-10 rounded-sm bg-[#C69A55]/10 border border-[#C69A55]/30 flex items-center justify-center text-[#C69A55] shrink-0">
                    <Clock className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-[11px] uppercase tracking-wider text-[#E8D9C6]/60 block">
                      {isFrench ? 'Horaires d’ouverture' : 'أوقات العمل'}
                    </span>
                    <span className="text-xs text-[#E8D9C6]/90">
                      {t('contactHours')}
                    </span>
                  </div>
                </div>
              </div>

              {/* Direct WhatsApp Button */}
              <div className="pt-4 border-t border-[#C69A55]/15">
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-3.5 px-4 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs tracking-wider uppercase rounded-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-950/40 transition-colors"
                >
                  <MessageSquare className="w-4 h-4" />
                  <span>{t('contactDirectWhatsapp')}</span>
                </a>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div className="lg:col-span-7">
            <form onSubmit={handleSubmit} className="p-6 sm:p-8 bg-[#1A1511] border border-[#C69A55]/20 rounded-sm space-y-4">
              {sentSuccess && (
                <div className="p-4 bg-emerald-950/40 border border-emerald-500/40 text-emerald-300 text-xs rounded flex items-center gap-3">
                  <CheckCircle2 className="w-5 h-5 shrink-0" />
                  <span>{t('contactSuccess')}</span>
                </div>
              )}

              {errorMessage && (
                <div className="p-4 bg-rose-950/40 border border-rose-500/40 text-rose-300 text-xs rounded flex items-center gap-3">
                  <AlertCircle className="w-5 h-5 shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-[#E8D9C6] mb-1.5">
                    {t('contactFormName')} *
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-[#14100D] border border-[#C69A55]/30 rounded text-sm text-[#F8F1E8] focus:outline-none focus:border-[#C69A55]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-[#E8D9C6] mb-1.5">
                    {t('contactFormPhone')}
                  </label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-[#14100D] border border-[#C69A55]/30 rounded text-sm text-[#F8F1E8] focus:outline-none focus:border-[#C69A55] font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-[#E8D9C6] mb-1.5">
                  {t('contactFormEmail')}
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-[#14100D] border border-[#C69A55]/30 rounded text-sm text-[#F8F1E8] focus:outline-none focus:border-[#C69A55]"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[#E8D9C6] mb-1.5">
                  {t('contactFormMessage')} *
                </label>
                <textarea
                  required
                  rows={4}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-[#14100D] border border-[#C69A55]/30 rounded text-sm text-[#F8F1E8] focus:outline-none focus:border-[#C69A55]"
                />
              </div>

              <button
                type="submit"
                disabled={sending}
                className="w-full sm:w-auto px-8 py-3.5 bg-[#C69A55] hover:bg-[#d8af6f] disabled:bg-neutral-800 text-[#17130F] font-bold text-xs uppercase tracking-wider rounded-sm transition-colors flex items-center justify-center gap-2 cursor-pointer"
              >
                <Send className="w-4 h-4" />
                <span>{sending ? t('contactSending') : t('contactFormSend')}</span>
              </button>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
};
