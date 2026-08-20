import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { getPlatform } from '../../constants/platforms';
import { fadeUp } from './animations';
import { fixContactUrl } from './hooks';

export function Contact({ contacts, socialMedia, showToast }) {
  const { t } = useTranslation();

  if (contacts.length === 0 && socialMedia.length === 0) return null;

  return (
    <section id="kontak" className="border-b-2 border-neu-black py-20 lg:py-24">
      <div className="max-w-7xl mx-auto px-4 lg:px-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <motion.div {...fadeUp()}>
            <span className="font-mono text-[10px] text-neu-black/50 uppercase tracking-widest block mb-2">{t('landing.contact.tag')}</span>
            <div className="h-px w-8 bg-neu-primary mb-4" />
            <h2 className="font-display font-bold text-3xl lg:text-4xl text-neu-black mb-4 leading-tight">
              {t('landing.contact.title').split('\n').map((l, i) => <span key={i} className="block">{l}</span>)}
            </h2>
            <p className="font-body text-sm text-neu-black/55 mb-6 leading-relaxed max-w-sm">{t('landing.contact.subtitle')}</p>
            {contacts.length > 0 && (
              <div className="space-y-3">
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
                      className="flex items-center gap-4 p-4 bg-neu-white border-2 border-neu-black rounded-neu border-l-4 shadow-neu-sm hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-neu transition-all duration-150" style={{ borderLeftColor: color }}>
                      <div className="w-9 h-9 flex items-center justify-center flex-shrink-0">
                        <Icon style={{ color }} className="w-5 h-5" />
                      </div>
                      <div><p className="font-display font-bold text-sm text-neu-black">{ct.nama}</p><p className="font-mono text-xs text-neu-black/50">{ct.contactInfo}</p></div>
                      <svg className="w-4 h-4 text-neu-black/30 ml-auto" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
                    </a>
                  );
                })}
              </div>
            )}
          </motion.div>
          {socialMedia.length > 0 && (
            <motion.div {...fadeUp()}>
              <p className="font-display font-bold text-sm text-neu-black uppercase mb-4">{t('landing.contact.social')}</p>
              <div className="grid grid-cols-2 gap-3">
                {socialMedia.map(s => {
                  const { Icon, color } = getPlatform(s.icon ?? s.platformName?.toLowerCase());
                  return (
                    <a key={s.id} href={s.url} target="_blank" rel="noopener noreferrer"
                      className="flex items-center gap-3 p-3 bg-neu-white border-2 border-neu-black rounded-neu shadow-neu-sm hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-neu transition-all duration-150">
                      <Icon style={{ color }} className="w-5 h-5 flex-shrink-0" />
                      <div className="min-w-0"><p className="font-display font-bold text-xs text-neu-black truncate">{s.platformName}</p><p className="font-mono text-[10px] text-neu-black/40 truncate">{s.accountName}</p></div>
                    </a>
                  );
                })}
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </section>
  );
}
