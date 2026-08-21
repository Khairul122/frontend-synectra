import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { fadeUp, STAGGER } from './animations';

export function HowItWorks() {
  const { t } = useTranslation();
  const steps = t('landing.howItWorks.steps', { returnObjects: true });

  return (
    <section id="cara-kerja" className="border-b-2 border-neu-black bg-neu-black py-20 lg:py-24">
      <div className="max-w-7xl mx-auto px-4 lg:px-6">
        <motion.div className="mb-14" {...fadeUp()}>
          <span className="font-mono text-[10px] text-neu-white/40 uppercase tracking-widest block mb-2">{t('landing.howItWorks.tag')}</span>
          <div className="h-px w-8 bg-neu-gold mb-4" />
          <h2 className="font-display font-bold text-3xl lg:text-4xl text-neu-white leading-tight">{t('landing.howItWorks.title')}</h2>
        </motion.div>

        {/* Steps */}
        <div className="relative grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
          {/* Connector line (desktop only) */}
          <div className="hidden lg:block absolute top-[1.4rem] left-[12.5%] right-[12.5%] h-px border-t-2 border-dashed border-neu-white/15 z-0" />

          {steps.map((step, si) => (
            <motion.div
              key={step.no}
              {...fadeUp(Math.min(si * STAGGER, 0.42))}
              className="relative z-10 border-b-2 border-r-0 sm:border-r-2 border-neu-white/10 last:border-r-0 lg:border-b-0 px-6 pb-10 lg:pb-0 pt-4 lg:pt-0 first:pl-0 lg:first:pl-0"
            >
              {/* Step numeral — sharp, on-brand */}
              <div className="inline-flex items-center justify-center w-11 h-11 bg-neu-gold border-2 border-neu-gold rounded-neu-sm mb-5 relative">
                <span className="font-mono font-bold text-base text-neu-black">{step.no}</span>
              </div>
              <h3 className="font-display font-bold text-lg text-neu-white mb-2">{step.title}</h3>
              <p className="font-body text-xs text-neu-white/50 leading-relaxed">{step.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
