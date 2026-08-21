import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { fadeUp } from './animations';
import { AnimatedCounter } from './helpers';

const PANEL_KEYS = ['landing.stats.experience', 'landing.stats.projects', 'landing.stats.satisfaction'];

export function About({ stats, isLoading }) {
  const { t } = useTranslation();
  const panelStats = PANEL_KEYS.map(key => stats.find(s => s.labelKey === key)).filter(Boolean);

  return (
    <section className="border-b-2 border-neu-black bg-neu-black py-20 lg:py-24 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 lg:px-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">

          {/* Left — text + features */}
          <motion.div {...fadeUp()} className="border-l-4 border-neu-gold pl-6">
            <span className="font-mono text-[10px] text-neu-white/40 uppercase tracking-widest block mb-2">{t('landing.about.tag')}</span>
            <div className="h-1 w-8 bg-neu-gold rounded-full mb-4" />
            <h2 className="font-display font-bold text-3xl lg:text-4xl text-neu-white mb-4 leading-tight">
              {t('landing.about.title').split('\n').map((l, i) => <span key={i} className="block">{l}</span>)}
            </h2>
            <p className="font-body text-sm text-neu-white/55 leading-relaxed mb-8">
              {t('landing.about.subtitle')}
            </p>
            <div className="flex flex-col gap-4 border-t border-neu-white/10 pt-6">
              {(t('landing.about.features', { returnObjects: true })).map((f, fi) => (
                <div key={f} className="flex items-start gap-4">
                  <span className="font-mono font-bold text-xs text-neu-gold/70 flex-shrink-0 mt-0.5">
                    {String(fi + 1).padStart(2, '0')}.
                  </span>
                  <p className="font-body text-sm text-neu-white/65 leading-relaxed">{f}</p>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Right — stats panel (dari data yang sama dengan section Stats) */}
          <motion.div {...fadeUp(0.15)} className="border-2 border-neu-white/20 rounded-neu overflow-hidden" style={{ boxShadow: '4px 4px 0px #FFCC00, 9px 13px 26px -5px rgba(255,204,0,0.25)' }}>
            <div className="grid grid-cols-3 divide-x divide-neu-white/15">
              {(isLoading ? Array.from({ length: 3 }) : panelStats).map((s, i) => (
                <div key={i} className="px-5 py-8 text-center">
                  {isLoading ? (
                    <div className="h-8 w-12 bg-neu-white/10 animate-pulse rounded-neu mx-auto mb-2" />
                  ) : (
                    <p className="font-display font-black text-3xl lg:text-4xl text-neu-gold leading-none mb-2">
                      <AnimatedCounter target={s.value} suffix={s.suffix} />
                    </p>
                  )}
                  <p className="font-mono text-[10px] text-neu-white/45 uppercase tracking-wider leading-snug">{isLoading ? '' : t(s.labelKey)}</p>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
