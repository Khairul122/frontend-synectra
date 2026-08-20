import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { cn } from '../../utils/cn';
import { LanguageSwitcher } from '../ui/LanguageSwitcher';

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
      <nav className="sticky top-0 z-40 bg-neu-white border-b-2 border-neu-black">
        <div className="max-w-7xl mx-auto px-4 lg:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-5">
            <picture>
              <source srcSet="/logo-synectra.webp" type="image/webp" />
              <img src="/logo-synectra.jpeg" alt="Synectra" width="120" height="36"
                className="h-9 w-auto max-w-[120px] border-2 border-neu-black rounded-neu-sm object-contain shadow-neu-sm" />
            </picture>
            <div className="hidden md:flex items-center gap-6">
              {NAV_LINKS.map(({ tKey, id }) => (
                <button key={id}
                  onClick={() => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })}
                  className={cn(
                    'font-display font-bold text-xs uppercase tracking-wide transition-all duration-200 pb-0.5',
                    activeSection === id
                      ? 'text-neu-primary border-b-2 border-neu-primary'
                      : 'text-neu-black/60 hover:text-neu-black border-b-2 border-transparent',
                  )}>
                  {t(tKey)}
                </button>
              ))}
            </div>
          </div>
          <div className="hidden sm:flex items-center gap-3">
            <LanguageSwitcher variant="light" />
            <button onClick={() => transitionTo('/login')} className="px-4 py-2 border-2 border-neu-black rounded-neu-sm font-display font-bold text-xs uppercase text-neu-black hover:bg-neu-bg transition-colors">{t('nav.login')}</button>
            <button onClick={() => transitionTo('/register')} className="px-4 py-2 bg-neu-primary border-2 border-neu-black rounded-neu-sm shadow-neu-sm font-display font-bold text-xs uppercase text-neu-black transition-all duration-150 hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none">{t('nav.register')}</button>
          </div>
          <button
            onClick={() => setMenuOpen(o => !o)}
            aria-expanded={menuOpen}
            aria-label={menuOpen ? 'Tutup menu' : 'Buka menu'}
            className="sm:hidden w-11 h-11 border-2 border-neu-black rounded-neu-sm flex items-center justify-center">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              {menuOpen ? <><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></> : <><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></>}
            </svg>
          </button>
        </div>
        {menuOpen && (
          <div className="sm:hidden border-t-2 border-neu-black bg-neu-white px-4 py-3 flex flex-col gap-1">
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
    </>
  );
}
