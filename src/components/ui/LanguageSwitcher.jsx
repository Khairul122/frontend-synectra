import { useTranslation } from 'react-i18next';
import { cn } from '../../utils/cn';

export function LanguageSwitcher({ variant = 'light' }) {
  const { i18n } = useTranslation();
  const current  = i18n.language;

  const toggle = (lang) => {
    i18n.changeLanguage(lang);
    localStorage.setItem('synectra_lang', lang);
  };

  const isLight = variant === 'light';

  return (
    <div className="flex items-center border-2 border-neu-black overflow-hidden">
      {['id', 'en'].map(lang => (
        <button
          key={lang}
          onClick={() => toggle(lang)}
          className={cn(
            'px-2.5 py-1 font-mono font-bold text-[10px] uppercase tracking-wider transition-colors duration-150',
            current === lang
              ? isLight
                ? 'bg-neu-black text-neu-white'
                : 'bg-neu-primary text-neu-black'
              : isLight
                ? 'bg-neu-white text-neu-black hover:bg-neu-bg'
                : 'bg-transparent text-neu-white/70 hover:text-neu-white',
          )}
        >
          {lang.toUpperCase()}
        </button>
      ))}
    </div>
  );
}
