import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { fadeLeft, fadeUp, STAGGER } from './animations';

export function WhyChooseUs() {
  const { t } = useTranslation();
  const items = t('landing.why.items', { returnObjects: true });

  return (
    <section className="border-b-2 border-t-4 border-neu-black bg-neu-white overflow-hidden">
      {/* Static value-prop band */}
      <div className="bg-neu-primary border-b-2 border-neu-black py-3 px-4 lg:px-6">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center gap-x-6 gap-y-2">
          {items.map((w, i) => (
            <span key={w.title} className="inline-flex items-center gap-6 font-mono font-bold text-[11px] uppercase tracking-widest text-neu-black">
              {i > 0 && <span className="text-neu-black/30">/</span>}
              {w.title}
            </span>
          ))}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 lg:px-6 py-20 lg:py-24">
        {/* Header */}
        <motion.div className="mb-12" {...fadeLeft()}>
          <div className="h-px w-8 bg-neu-primary mb-4" />
          <h2 className="font-display font-bold text-3xl lg:text-4xl text-neu-black leading-tight max-w-lg">
            {t('landing.why.title')}
          </h2>
        </motion.div>

        {/* Items — sharp small numeral, no icon box */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-0 border-l-2 border-t-2 border-neu-black rounded-neu overflow-hidden">
          {items.map((w, i) => (
            <motion.div
              key={w.title}
              {...fadeUp(Math.min(i * STAGGER, 0.42))}
              className="border-r-2 border-b-2 border-neu-black p-6 lg:p-8 hover:bg-neu-bg transition-colors duration-150"
            >
              <div className="flex items-center gap-2 mb-4">
                <span className="font-mono font-bold text-xs text-neu-primary bg-neu-black rounded-neu-sm px-1.5 py-0.5">{String(i + 1).padStart(2, '0')}</span>
              </div>
              <h3 className="font-display font-bold text-base text-neu-black mb-2">{w.title}</h3>
              <p className="font-body text-sm text-neu-black/55 leading-relaxed">{w.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
