import { useTranslation } from 'react-i18next';
import { cn } from '../../utils/cn';
import { LanguageSwitcher } from '../ui/LanguageSwitcher';

const NAV_LINKS = [
  { tKey: 'nav.services',    id: 'layanan',    label: 'Layanan' },
  { tKey: 'nav.packages',    id: 'paket',      label: 'Paket' },
  { tKey: 'nav.software',    id: 'software',   label: 'Software' },
  { tKey: 'nav.portfolio',   id: 'portofolio', label: 'Portofolio' },
  { tKey: 'nav.howItWorks',  id: 'cara-kerja', label: 'Cara Kerja' },
  { tKey: 'nav.reviews',     id: 'ulasan',     label: 'Ulasan' },
  { tKey: 'nav.contact',     id: 'kontak',     label: 'Kontak' },
];

export function Navbar({ activeSection, menuOpen, setMenuOpen, transitionTo, progressBarRef }) {
  const { t } = useTranslation();

  const handleScroll = (id) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <>
      <div
        ref={progressBarRef}
        className="fixed top-0 left-0 right-0 h-[3.5px] bg-secondary-container z-[99] origin-left"
        style={{ transform: 'scaleX(0)' }}
      />
      <header className="sticky top-0 z-50 w-full bg-neu-white border-b-4 border-neu-black py-4 px-4 md:px-8 transform-gpu">
        <div className="max-w-7xl mx-auto flex justify-between items-center preserve-3d">
          {/* Brand */}
          <a
            onClick={(e) => { e.preventDefault(); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
            className="font-headline-md text-2xl md:text-3xl font-black tracking-tighter text-on-surface flex items-center gap-3 group hover:rotate-2 transition-transform cursor-pointer"
            href="#"
          >
            <div className="w-11 h-11 md:w-12 md:h-12 bg-neu-white border-4 border-neu-black rounded-lg flex items-center justify-center deep-shadow-sm group-hover:scale-110 transition-all preserve-3d overflow-hidden flex-shrink-0">
              <picture className="w-full h-full flex items-center justify-center">
                <source srcSet="/logo-synectra-sm.webp" type="image/webp" />
                <img
                  src="/logo-synectra-sm.jpeg"
                  alt="Synectra"
                  width={48}
                  height={48}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
              </picture>
            </div>
            <span className="drop-shadow-[2px_2px_0px_#FFD000] text-neu-black">Synectra</span>
          </a>

          {/* Navigation Links (Desktop) */}
          <nav className="hidden md:flex items-center gap-4 lg:gap-6 preserve-3d">
            {NAV_LINKS.slice(0, 4).map(({ id, tKey, label }, i) => {
              const isActive = activeSection === id;
              return (
                <button
                  key={id}
                  onClick={() => handleScroll(id)}
                  className={cn(
                    'border-2 border-neu-black px-4 py-2 font-black font-label-caps text-sm uppercase transform hover:-translate-y-2 shadow-[4px_4px_0px_0px_#0D0D0D] transition-all cursor-pointer rounded',
                    i % 2 === 0 ? 'hover:rotate-2' : 'hover:-rotate-2',
                    isActive ? 'bg-primary-container text-neu-black' : 'bg-neu-white text-neu-black hover:bg-surface-dim'
                  )}
                >
                  {t(tKey, label)}
                </button>
              );
            })}
          </nav>

          {/* Actions (Desktop) */}
          <div className="hidden md:flex items-center gap-3 lg:gap-4 preserve-3d">
            <LanguageSwitcher variant="light" />
            <button
              onClick={() => transitionTo('/login')}
              className="font-label-caps text-sm uppercase font-bold text-neu-black bg-neu-white px-5 py-2.5 lg:px-6 lg:py-3 border-4 border-neu-black rounded-lg transition-all shadow-[6px_6px_0px_0px_rgba(13,13,13,1)] hover:shadow-[8px_8px_0px_0px_rgba(13,13,13,1)] hover:-translate-y-1 btn-press cursor-pointer"
            >
              {t('nav.login', 'Masuk')}
            </button>
            <button
              onClick={() => transitionTo('/register')}
              className="font-label-caps text-sm uppercase font-black text-neu-black bg-primary-container px-6 py-2.5 lg:px-8 lg:py-3 border-4 border-neu-black rounded-lg transition-all shadow-[6px_6px_0px_0px_rgba(13,13,13,1)] hover:shadow-[8px_8px_0px_0px_rgba(13,13,13,1)] hover:-translate-y-1 btn-press hover:rotate-2 cursor-pointer"
            >
              {t('nav.register', 'Daftar Gratis')}
            </button>
          </div>

          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            aria-expanded={menuOpen}
            aria-label={menuOpen ? 'Tutup menu' : 'Buka menu'}
            className="md:hidden flex items-center justify-center p-2.5 border-4 border-neu-black bg-primary-container rounded-lg shadow-[4px_4px_0px_0px_rgba(13,13,13,1)] btn-press cursor-pointer"
          >
            <span className="material-symbols-outlined text-2xl font-bold">
              {menuOpen ? 'close' : 'menu'}
            </span>
          </button>
        </div>

        {/* Mobile Dropdown */}
        {menuOpen && (
          <div className="md:hidden border-t-4 border-neu-black mt-4 pt-4 flex flex-col gap-2.5 animate-fadeIn">
            {NAV_LINKS.map(({ id, tKey, label }) => (
              <button
                key={id}
                onClick={() => { handleScroll(id); setMenuOpen(false); }}
                className={cn(
                  'w-full text-left font-display font-bold text-sm uppercase px-4 py-2 border-2 border-neu-black rounded-md shadow-[2px_2px_0px_0px_#0D0D0D]',
                  activeSection === id ? 'bg-primary-container text-neu-black' : 'bg-neu-white text-neu-black'
                )}
              >
                {t(tKey, label)}
              </button>
            ))}
            <div className="pt-2 flex flex-col gap-2 border-t-2 border-neu-black/10">
              <button
                onClick={() => { transitionTo('/login'); setMenuOpen(false); }}
                className="w-full py-2.5 bg-neu-white border-2 border-neu-black rounded-md font-display font-bold text-sm uppercase text-neu-black shadow-[2px_2px_0px_0px_#0D0D0D]"
              >
                {t('nav.login', 'Masuk')}
              </button>
              <button
                onClick={() => { transitionTo('/register'); setMenuOpen(false); }}
                className="w-full py-2.5 bg-primary-container border-2 border-neu-black rounded-md font-display font-bold text-sm uppercase text-neu-black shadow-[2px_2px_0px_0px_#0D0D0D]"
              >
                {t('nav.register', 'Daftar Gratis')}
              </button>
              <div className="flex items-center justify-between px-2 py-1">
                <span className="font-mono text-xs text-neu-black/60 uppercase font-bold">Bahasa / Lang</span>
                <LanguageSwitcher variant="light" />
              </div>
            </div>
          </div>
        )}
      </header>
    </>
  );
}
