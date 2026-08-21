import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { fadeUp } from './animations';
import { AnimatedCounter, SectionTag } from './helpers';

const PANEL_KEYS = ['landing.stats.experience', 'landing.stats.projects', 'landing.stats.satisfaction'];
const ROW_STYLES = [
  'bg-neu-primary text-neu-black',
  'bg-neu-purple text-neu-white',
  'bg-neu-bg text-neu-black',
];
const ROW_ICONS = [
  <svg className="w-7 h-7" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M13 2L3 14h7l-1 8 10-12h-7l1-8z" /></svg>,
  <svg className="w-7 h-7" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" /><rect x="3" y="14" width="7" height="7" rx="1" /><rect x="14" y="14" width="7" height="7" rx="1" /></svg>,
  <svg className="w-7 h-7" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><circle cx="12" cy="12" r="9" /><path strokeLinecap="round" strokeLinejoin="round" d="M12 7v5l3 3" /></svg>,
];

export function About({ stats, isLoading }) {
  const { t } = useTranslation();
  const panelStats = PANEL_KEYS.map(key => stats.find(s => s.labelKey === key)).filter(Boolean);
  const features = t('landing.about.features', { returnObjects: true });

  return (
    <section className="border-b-4 border-neu-black bg-neu-white py-16 lg:py-20">
      <div className="max-w-7xl mx-auto px-4 lg:px-6 flex flex-col lg:flex-row gap-10 lg:gap-12 items-center">

        {/* Left — text + features */}
        <motion.div {...fadeUp()} className="flex-1">
          <div className="mb-6"><SectionTag rotate="-rotate-2">{t('landing.about.tag')}</SectionTag></div>
          <h2 className="font-display font-black text-3xl lg:text-5xl text-neu-black mb-5 uppercase tracking-tighter leading-[0.95]">
            {t('landing.about.title').split('\n').map((l, i) => <span key={i} className="block">{l}</span>)}
          </h2>
          <p className="font-body text-base text-neu-black/70 leading-relaxed mb-8 font-medium">
            {t('landing.about.subtitle')}
          </p>
          <div className="flex flex-col gap-4 w-full">
            {features.map((f, fi) => (
              <div key={f} className={`flex items-center gap-5 border-4 border-neu-black rounded-neu-lg p-5 shadow-neu-solid transition-transform hover:translate-x-1.5 ${ROW_STYLES[fi % ROW_STYLES.length]}`}>
                <span className="w-14 h-14 bg-neu-white border-4 border-neu-black rounded-neu-lg flex items-center justify-center flex-shrink-0 text-neu-black">
                  {ROW_ICONS[fi % ROW_ICONS.length]}
                </span>
                <span className="font-mono font-black text-sm sm:text-base uppercase">{f}</span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Right — stats panel (data yang sama dengan section Stats) */}
        <motion.div {...fadeUp(0.15)} className="w-full lg:w-auto flex-shrink-0 bg-neu-black border-4 border-neu-black rounded-neu-lg overflow-hidden shadow-neu-solid-lg">
          <div className="grid grid-cols-3 divide-x-2 divide-neu-white/15">
            {(isLoading ? Array.from({ length: 3 }) : panelStats).map((s, i) => (
              <div key={i} className="px-6 py-10 text-center">
                {isLoading ? (
                  <div className="h-9 w-14 bg-neu-white/10 animate-pulse rounded-neu mx-auto mb-2" />
                ) : (
                  <p className="font-display font-black text-4xl lg:text-5xl text-neu-primary leading-none mb-3">
                    <AnimatedCounter target={s.value} suffix={s.suffix} />
                  </p>
                )}
                <p className="font-mono text-[10px] text-neu-white/50 uppercase tracking-wider leading-snug">{isLoading ? '' : t(s.labelKey)}</p>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
