import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { fadeLeft, fadeUp, STAGGER } from './animations';
import { TiltCard } from './TiltCard';
import { ErrorState } from './ErrorState';
import { useLang } from './hooks';

const ICONS = {
  code: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
      <polyline points="16 18 22 12 16 6" /><polyline points="8 6 2 12 8 18" />
    </svg>
  ),
  mobile: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
      <rect x="6" y="2" width="12" height="20" rx="2" /><line x1="11" y1="18" x2="13" y2="18" />
    </svg>
  ),
  design: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
      <circle cx="12" cy="12" r="10" /><path d="M8 14s1.5 2 4 2 4-2 4-2" /><line x1="9" y1="9" x2="9.01" y2="9" /><line x1="15" y1="9" x2="15.01" y2="9" />
    </svg>
  ),
  api: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
      <rect x="3" y="4" width="18" height="6" rx="1" /><rect x="3" y="14" width="18" height="6" rx="1" /><line x1="7" y1="7" x2="7.01" y2="7" /><line x1="7" y1="17" x2="7.01" y2="17" />
    </svg>
  ),
  cloud: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
      <path d="M18 10h-1.26A8 8 0 109 20h9a5 5 0 000-10z" />
    </svg>
  ),
  chat: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
    </svg>
  ),
};

export function Services({ services, isLoading, error }) {
  const { t } = useTranslation();
  const lang = useLang();

  return (
    <section id="layanan" className="border-b-2 border-neu-black py-16 lg:py-20 bg-paper-grid">
      <div className="max-w-7xl mx-auto px-4 lg:px-6">
        <div className="flex items-start justify-between gap-6 mb-12 flex-wrap">
          <motion.div {...fadeLeft()}>
            <span className="font-mono text-[10px] text-neu-black/50 uppercase tracking-widest block mb-2">{t('landing.services.tag')}</span>
            <div className="h-1.5 w-10 bg-neu-gold rounded-full mb-4" />
            <h2 className="font-display font-bold text-3xl lg:text-4xl text-neu-black max-w-md leading-tight">{t('landing.services.title').split('\n').map((line, i) => <span key={i}>{line}{i === 0 && <br />}</span>)}</h2>
          </motion.div>
          {!isLoading && !error && (
            <motion.p {...fadeUp(0.1)} className="font-mono text-[10px] text-neu-black/30 uppercase tracking-widest self-end hidden lg:block">
              — {services.length} {t('landing.services.tag').toLowerCase()}
            </motion.p>
          )}
        </div>

        {error ? (
          <ErrorState message="Gagal memuat daftar layanan." />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {isLoading
              ? Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="border-2 border-neu-black rounded-neu bg-neu-white p-7 animate-pulse">
                    <div className="w-10 h-10 rounded-neu bg-neu-black/10 mb-5" />
                    <div className="h-4 w-2/3 bg-neu-black/10 rounded-full mb-3" />
                    <div className="h-3 w-full bg-neu-black/10 rounded-full mb-1.5" />
                    <div className="h-3 w-4/5 bg-neu-black/10 rounded-full" />
                  </div>
                ))
              : services.map((svc, i) => (
                  <TiltCard key={svc.id} maxTilt={5}>
                    <motion.div
                      {...fadeUp(Math.min(i * STAGGER, 0.42))}
                      className="relative h-full p-7 group border-2 border-neu-black rounded-neu bg-neu-white shadow-neu-solid transition-shadow duration-150 hover:shadow-neu-solid-lg"
                    >
                      <span className="absolute top-5 right-5 font-mono text-xs font-bold text-neu-black/20">
                        {String(i + 1).padStart(2, '0')}
                      </span>

                      <div className="w-10 h-10 border-2 border-neu-black rounded-neu bg-neu-gold text-neu-black flex items-center justify-center mb-5">
                        {ICONS[svc.iconKey] ?? ICONS.code}
                      </div>

                      <h3 className="font-display font-bold text-base text-neu-black mb-2">{lang(svc.title, svc.titleEn)}</h3>
                      <p className="font-body text-sm leading-relaxed text-neu-black/55">{lang(svc.description, svc.descriptionEn)}</p>

                      <div className="mt-5 h-1 w-full bg-neu-gold origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-300 rounded-full" />
                    </motion.div>
                  </TiltCard>
                ))}
          </div>
        )}

        {!isLoading && !error && services.length === 0 && (
          <p className="font-body text-sm text-neu-black/40 text-center py-10">Belum ada layanan yang ditambahkan.</p>
        )}
      </div>
    </section>
  );
}
