import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { fadeUp, STAGGER } from './animations';
import { TiltCard } from './TiltCard';
import { ErrorState } from './ErrorState';
import { SectionTag } from './helpers';
import { useLang } from './hooks';

const ICONS = {
  code: (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
      <polyline points="16 18 22 12 16 6" /><polyline points="8 6 2 12 8 18" />
    </svg>
  ),
  mobile: (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
      <rect x="6" y="2" width="12" height="20" rx="2" /><line x1="11" y1="18" x2="13" y2="18" />
    </svg>
  ),
  design: (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
      <circle cx="12" cy="12" r="10" /><path d="M8 14s1.5 2 4 2 4-2 4-2" /><line x1="9" y1="9" x2="9.01" y2="9" /><line x1="15" y1="9" x2="15.01" y2="9" />
    </svg>
  ),
  api: (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
      <rect x="3" y="4" width="18" height="6" rx="1" /><rect x="3" y="14" width="18" height="6" rx="1" /><line x1="7" y1="7" x2="7.01" y2="7" /><line x1="7" y1="17" x2="7.01" y2="17" />
    </svg>
  ),
  cloud: (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
      <path d="M18 10h-1.26A8 8 0 109 20h9a5 5 0 000-10z" />
    </svg>
  ),
  chat: (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
    </svg>
  ),
};

const TAGS = {
  code: ['WEB_DEV', 'bg-neu-green'],
  mobile: ['MOBILE_DEV', 'bg-neu-primary'],
  design: ['UI_UX', 'bg-neu-purple text-neu-white'],
  api: ['BACKEND', 'bg-neu-accent'],
  cloud: ['CLOUD', 'bg-neu-green'],
  chat: ['SUPPORT', 'bg-neu-primary'],
};

export function Services({ services, isLoading, error }) {
  const { t } = useTranslation();
  const lang = useLang();

  return (
    <section id="layanan" className="border-b-4 border-neu-black bg-neu-bg py-16 lg:py-20">
      <div className="max-w-7xl mx-auto px-4 lg:px-6">
      <div className="flex justify-center mb-12">
        <motion.div {...fadeUp()}><SectionTag>{t('landing.services.tag')} // WHAT_WE_DO</SectionTag></motion.div>
      </div>

      {error ? (
        <ErrorState message="Gagal memuat daftar layanan." />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          {isLoading
            ? Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="border-4 border-neu-black rounded-neu-lg bg-neu-white p-8 animate-pulse">
                  <div className="w-16 h-16 rounded-neu-lg bg-neu-black/10 mb-6" />
                  <div className="h-5 w-2/3 bg-neu-black/10 rounded-full mb-3" />
                  <div className="h-3 w-full bg-neu-black/10 rounded-full mb-1.5" />
                  <div className="h-3 w-4/5 bg-neu-black/10 rounded-full" />
                </div>
              ))
            : services.map((svc, i) => {
                const [tagLabel, tagColor] = TAGS[svc.iconKey] ?? TAGS.code;
                return (
                  <TiltCard key={svc.id} maxTilt={5}>
                    <motion.div
                      {...fadeUp(Math.min(i * STAGGER, 0.42))}
                      className="relative h-full p-8 group border-4 border-neu-black rounded-neu-lg bg-neu-white shadow-neu-solid-lg transition-transform duration-200 hover:-translate-y-2 flex flex-col items-start"
                    >
                      <span className={`inline-block ${tagColor} border-4 border-neu-black px-4 py-1.5 rounded-neu-sm font-mono font-bold text-xs mb-6`}>{tagLabel}</span>
                      <span className="w-14 h-14 border-4 border-neu-black rounded-neu-lg bg-neu-bg text-neu-black flex items-center justify-center mb-4">
                        {ICONS[svc.iconKey] ?? ICONS.code}
                      </span>
                      <h3 className="font-display font-black text-xl text-neu-black mb-3 uppercase">{lang(svc.title, svc.titleEn)}</h3>
                      <p className="font-body text-sm leading-relaxed text-neu-black/70 font-medium">{lang(svc.description, svc.descriptionEn)}</p>
                    </motion.div>
                  </TiltCard>
                );
              })}
        </div>
      )}

      {!isLoading && !error && services.length === 0 && (
        <p className="font-body text-sm text-neu-black/40 text-center py-10">Belum ada layanan yang ditambahkan.</p>
      )}
      </div>
    </section>
  );
}
