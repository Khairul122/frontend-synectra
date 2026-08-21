import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { cn } from '../../utils/cn';
import { scaleUp, STAGGER } from './animations';
import { AnimatedCounter } from './helpers';
import { ErrorState } from './ErrorState';

const ACCENTS = ['bg-neu-primary text-neu-black', 'bg-neu-green text-neu-black', 'bg-neu-purple text-neu-white', 'bg-neu-accent text-neu-black'];

export function Stats({ stats, isLoading, error }) {
  const { t } = useTranslation();

  return (
    <section id="statistik" className="border-b-4 border-neu-black bg-neu-black py-10 lg:py-12">
      <div className="max-w-7xl mx-auto px-4 lg:px-6 flex flex-col lg:flex-row items-center gap-8 lg:gap-12">
        <div className="lg:w-1/4 flex-shrink-0">
          <div className="inline-block bg-neu-primary text-neu-black border-4 border-neu-black px-5 py-2.5 shadow-neu-solid-lg -rotate-2 rounded-neu-sm">
            <span className="font-mono font-black tracking-tighter text-sm lg:text-base uppercase">SYNECTRA_METRICS</span>
          </div>
        </div>

        {error ? (
          <div className="flex-1 w-full"><ErrorState message="Gagal memuat statistik." dark /></div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 lg:gap-6 w-full lg:w-3/4">
            {isLoading
              ? Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="bg-neu-white/5 border-4 border-neu-white/15 rounded-neu-lg p-6 h-28 animate-pulse" />
                ))
              : stats.map((s, i) => (
                  <motion.div
                    key={s.labelKey}
                    {...scaleUp(Math.min(i * STAGGER, 0.42))}
                    className="relative bg-neu-white border-4 border-neu-black rounded-neu-lg p-5 pt-6 shadow-neu-solid-lg hover:-translate-y-1.5 transition-transform"
                  >
                    <span className={cn('absolute -top-3.5 left-4 border-4 border-neu-black px-3 py-0.5 font-mono font-black text-[10px] uppercase tracking-wide rounded-neu-sm', ACCENTS[i % ACCENTS.length])}>
                      {t(s.labelKey)}
                    </span>
                    <p className="font-display font-black text-3xl lg:text-4xl text-neu-black tracking-tighter mt-1">
                      <AnimatedCounter key={s.value} target={s.value} suffix={s.suffix} />
                    </p>
                  </motion.div>
                ))}
          </div>
        )}
      </div>
    </section>
  );
}
