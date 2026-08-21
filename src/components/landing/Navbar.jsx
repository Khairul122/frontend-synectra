import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { cn } from '../../utils/cn';
import { LanguageSwitcher } from '../ui/LanguageSwitcher';
import { TactileButton } from './TactileButton';

const NAV_LINKS = [
  { tKey: 'nav.services',    id: 'layanan'   },
  { tKey: 'nav.packages',    id: 'paket'     },
  { tKey: 'nav.software',    id: 'software'  },
  { tKey: 'nav.portfolio',   id: 'portofolio'},
  { tKey: 'nav.howItWorks',  id: 'cara-kerja'},
  { tKey: 'nav.reviews',     id: 'ulasan'    },
  { tKey: 'nav.contact',     id: 'kontak'    },
];

export function Navbar({ activeSection, menuOpen, setMenuOpen, transitionTo, scaleX }) {
  const { t } = useTranslation();

  return (
    <>
      <motion.div
        className="fixed top-0 left-0 right-0 h-[3.5px] bg-neu-accent z-[99] origin-left"
        style={{ scaleX }}
      />
      {/* ── Floating module navbar ── */}
      <div className="sticky top-0 z-40 px-4 pt-4 pb-3">
        <nav className="max-w-7xl mx-auto bg-neu-white border-4 border-neu-black rounded-neu-xl shadow-neu-module-sm">
          <div className="h-16 flex items-center justify-between px-4 lg:px-6">
            <div className="flex items-center gap-5">
              <picture>
                <source srcSet="/logo-synectra.webp" type="image/webp" />
                <img src="/logo-synectra.jpeg" alt="Synectra" width="120" height="36"
                  className="h-9 w-auto max-w-[120px] border-2 border-neu-black rounded-neu-sm object-contain" />
              </picture>
              <div className="hidden md:flex items-center gap-2">
                {NAV_LINKS.map(({ tKey, id }) => (
                  <button key={id}
                    onClick={() => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })}
                    className={cn(
                      'font-display font-bold text-xs uppercase tracking-wide px-3 py-1.5 border-2 rounded-neu-sm transition-all duration-150',
                      activeSection === id
                        ? 'text-neu-black bg-neu-primary border-neu-black shadow-neu-solid-sm'
                        : 'text-neu-black/70 border-transparent hover:border-neu-black hover:-translate-y-0.5',
                    )}>
                    {t(tKey)}
                  </button>
                ))}
              </div>
            </div>
            <div className="hidden sm:flex items-center gap-3">
              <LanguageSwitcher variant="light" />
              <button onClick={() => transitionTo('/login')} className="px-4 py-2 border-2 border-neu-black rounded-neu-sm font-display font-bold text-xs uppercase text-neu-black hover:bg-neu-bg transition-colors">{t('nav.login')}</button>
              <TactileButton variant="gold" className="!px-4 !py-2 !text-xs" onClick={() => transitionTo('/register')}>{t('nav.register')}</TactileButton>
            </div>
            <button
              onClick={() => setMenuOpen(o => !o)}
              aria-expanded={menuOpen}
              aria-label={menuOpen ? 'Tutup menu' : 'Buka menu'}
              className="sm:hidden w-11 h-11 border-2 border-neu-black rounded-neu-sm flex items-center justify-center bg-neu-primary">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                {menuOpen ? <><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></> : <><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></>}
              </svg>
            </button>
          </div>
          {menuOpen && (
            <div className="sm:hidden border-t-4 border-neu-black px-4 py-3 flex flex-col gap-1">
              {NAV_LINKS.map(({ tKey, id }) => (
                <button key={id}
                  onClick={() => { document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' }); setMenuOpen(false); }}
                  className="font-display font-bold text-sm uppercase text-neu-black text-left py-1.5 border-b border-neu-black/10 last:border-0">
                  {t(tKey)}
                </button>
              ))}
              <div className="pt-2 flex flex-col gap-2">
                <button onClick={() => { transitionTo('/login'); setMenuOpen(false); }} className="font-display font-bold text-sm uppercase text-neu-black text-left py-1.5">{t('nav.login')}</button>
                <button onClick={() => { transitionTo('/register'); setMenuOpen(false); }} className="px-4 py-2 bg-neu-primary border-2 border-neu-black rounded-neu-sm font-display font-bold text-sm uppercase text-neu-black text-center">{t('nav.register')}</button>
                <div className="flex items-center gap-2 py-1">
                  <span className="font-mono text-xs text-neu-black/40 uppercase">Lang</span>
                  <LanguageSwitcher variant="light" />
                </div>
              </div>
            </div>
          )}
        </nav>
      </div>
    </>
  );
}
