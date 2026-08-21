import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { getPlatform } from '../../constants/platforms';
import { fadeUp } from './animations';
import { useLang } from './hooks';

export function Footer({ socialMedia, services, transitionTo }) {
  const { t } = useTranslation();
  const lang = useLang();

  return (
    <motion.footer className="bg-neu-black relative overflow-hidden" {...fadeUp()}>
      {/* Top strip */}
      <div className="border-b border-neu-white/10">
        <div className="max-w-7xl mx-auto px-4 lg:px-6 py-10 grid grid-cols-1 lg:grid-cols-4 gap-10">

          {/* Brand col — 2/5 */}
          <div className="lg:col-span-2">
            <div className="flex items-center gap-3 mb-5">
              <picture>
                <source srcSet="/logo-synectra.webp" type="image/webp" />
                <img src="/logo-synectra.jpeg" alt="Synectra" width="130" height="36" loading="lazy" decoding="async"
                  className="h-9 w-auto max-w-[130px] border-2 border-neu-white/30 rounded-neu object-contain brightness-0 invert" />
              </picture>
            </div>
            <p className="font-body text-sm text-neu-white/50 leading-relaxed mb-6 max-w-sm">
              {t('landing.footer.desc')}
            </p>
            {/* Social icons */}
            {socialMedia.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {socialMedia.slice(0, 6).map(s => {
                  const { Icon, color } = getPlatform(s.icon ?? s.platformName?.toLowerCase());
                  return (
                    <a key={s.id} href={s.url} target="_blank" rel="noopener noreferrer"
                      title={s.platformName}
                      className="group w-9 h-9 border border-neu-white/15 rounded-neu flex items-center justify-center hover:border-neu-gold hover:bg-neu-gold transition-all duration-200">
                      <Icon style={{ color: '#ffffff50' }} className="w-4 h-4 group-hover:!text-neu-black transition-colors duration-200" />
                    </a>
                  );
                })}
              </div>
            )}
          </div>

          {/* Layanan — dari data yang sama dengan section Layanan */}
          {services.length > 0 && (
            <div>
              <p className="font-mono font-bold text-[10px] text-neu-white/30 uppercase tracking-widest mb-5">{t('landing.footer.services')}</p>
              <ul className="flex flex-col gap-2.5">
                {services.slice(0, 6).map(svc => (
                  <li key={svc.id}>
                    <button onClick={() => transitionTo('/register')}
                      className="font-body text-sm text-neu-white/50 hover:text-neu-gold transition-colors text-left leading-none">
                      {lang(svc.title, svc.titleEn)}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Perusahaan */}
          <div>
            <p className="font-mono font-bold text-[10px] text-neu-white/30 uppercase tracking-widest mb-5">{t('landing.footer.company')}</p>
            <ul className="flex flex-col gap-2.5">
              {[
                [t('landing.footer.links.home'), '/'],
                [t('landing.footer.links.portfolio'), '/'],
                [t('landing.footer.links.howItWorks'), '/'],
                [t('landing.footer.links.pricing'), '/'],
                [t('nav.login'), '/login'],
                [t('nav.register'), '/register'],
              ].map(([label, href]) => (
                <li key={label}>
                  <button onClick={() => transitionTo(href)}
                    className="font-body text-sm text-neu-white/50 hover:text-neu-gold transition-colors text-left leading-none">
                    {label}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="max-w-7xl mx-auto px-4 lg:px-6 py-5 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-4 flex-wrap">
          <p className="font-mono text-[11px] text-neu-white/25">
            © {new Date().getFullYear()} Synectra. {t('landing.footer.rights')}
          </p>
        </div>
        <div className="flex items-center gap-4">
          {[t('landing.footer.privacy'), t('landing.footer.terms')].map(label => (
            <button key={label}
              className="font-mono text-[11px] text-neu-white/25 hover:text-neu-white/60 transition-colors">
              {label}
            </button>
          ))}
        </div>
      </div>
    </motion.footer>
  );
}
