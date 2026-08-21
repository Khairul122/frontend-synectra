import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { getPlatform } from '../../constants/platforms';
import { fadeUp } from './animations';
import { fixContactUrl } from './hooks';
import { SectionTag } from './helpers';

export function Contact({ contacts, socialMedia, showToast }) {
  const { t } = useTranslation();

  if (contacts.length === 0 && socialMedia.length === 0) return null;

  return (
    <section id="kontak" className="module-card max-w-7xl mx-auto w-full bg-neu-white p-6 sm:p-8 lg:p-12">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        <motion.div {...fadeUp()}>
          <div className="mb-6"><SectionTag rotate="rotate-1">{t('landing.contact.tag')}</SectionTag></div>
          <h2 className="font-display font-black text-3xl lg:text-4xl text-neu-black mb-4 leading-tight uppercase tracking-tighter">
            {t('landing.contact.title').split('\n').map((l, i) => <span key={i} className="block">{l}</span>)}
          </h2>
          <p className="font-body text-sm text-neu-black/60 mb-6 leading-relaxed max-w-sm font-medium">{t('landing.contact.subtitle')}</p>
          {contacts.length > 0 && (
            <div className="space-y-4">
              {contacts.map(ct => {
                const iconKey = (ct.icon || '').toLowerCase();
                const { Icon, color } = getPlatform(iconKey);
                const href = fixContactUrl(ct.linkUrl, iconKey);
                const isEmail = iconKey === 'email' || href.startsWith('mailto:');
                const isPhone = iconKey === 'phone' || href.startsWith('tel:');
                return (
                  <a key={ct.id} href={href}
                    target={isEmail || isPhone ? '_self' : '_blank'}
                    rel="noopener noreferrer"
                    onClick={(e) => {
                      if (isEmail) {
                        try {
                          const emailAddr = href.replace('mailto:', '');
                          navigator.clipboard.writeText(emailAddr);
                          showToast(t('landing.contact.emailCopied', { email: emailAddr }));
                        } catch (err) {}
                      }
                    }}
                    className="flex items-center gap-5 p-5 bg-neu-bg border-4 border-neu-black rounded-neu-lg shadow-neu-solid-lg hover:-translate-y-1.5 transition-transform duration-150">
                    <div className="w-14 h-14 bg-neu-white border-4 border-neu-black rounded-neu-lg flex items-center justify-center flex-shrink-0">
                      <Icon style={{ color }} className="w-6 h-6" />
                    </div>
                    <div><p className="font-display font-black text-base text-neu-black uppercase">{ct.nama}</p><p className="font-mono text-xs text-neu-black/50">{ct.contactInfo}</p></div>
                    <svg className="w-5 h-5 text-neu-black/30 ml-auto" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
                  </a>
                );
              })}
            </div>
          )}
        </motion.div>
        {socialMedia.length > 0 && (
          <motion.div {...fadeUp()}>
            <p className="font-display font-black text-sm text-neu-black uppercase mb-4 tracking-widest">{t('landing.contact.social')}</p>
            <div className="grid grid-cols-2 gap-4">
              {socialMedia.map(s => {
                const { Icon, color } = getPlatform(s.icon ?? s.platformName?.toLowerCase());
                return (
                  <a key={s.id} href={s.url} target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-3 p-4 bg-neu-bg border-4 border-neu-black rounded-neu-lg shadow-neu-solid hover:-translate-y-1 transition-transform duration-150">
                    <Icon style={{ color }} className="w-6 h-6 flex-shrink-0" />
                    <div className="min-w-0"><p className="font-display font-bold text-xs text-neu-black truncate">{s.platformName}</p><p className="font-mono text-[10px] text-neu-black/40 truncate">{s.accountName}</p></div>
                  </a>
                );
              })}
            </div>
          </motion.div>
        )}
      </div>
    </section>
  );
}
