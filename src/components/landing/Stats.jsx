import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { cn } from '../../utils/cn';
import { scaleUp, STAGGER } from './animations';
import { AnimatedCounter } from './helpers';

export function Stats({ stats }) {
  const { t } = useTranslation();

  return (
    <section id="statistik" className="border-b-2 border-neu-black bg-neu-black py-16 lg:py-20">
      <div className="max-w-7xl mx-auto px-4 lg:px-6">
        <div className="grid grid-cols-2 lg:grid-cols-4 divide-neu-white/10 divide-x-0 lg:divide-x-2">
          {stats.map((s, i) => (
            <motion.div
              key={s.labelKey}
              {...scaleUp(Math.min(i * STAGGER, 0.42))}
              className={cn('px-6 lg:px-10 py-8 flex flex-col justify-center', i > 0 && 'border-t-2 lg:border-t-0 border-neu-white/10')}
            >
              <p className={cn(
                'font-display font-black leading-none tracking-tighter',
                'text-[3.5rem] sm:text-[4.5rem] lg:text-[4.75rem]',
                i === 3 ? 'text-neu-primary' : 'text-neu-white',
              )}>
                <AnimatedCounter key={s.value} target={s.value} suffix={s.suffix} />
              </p>
              <p className="font-mono text-[10px] text-neu-white/40 uppercase tracking-[0.2em] mt-3">{t(s.labelKey)}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
