import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { fadeUp, STAGGER } from './animations';
import { SectionTag } from './helpers';

const STEP_BG = ['bg-neu-primary', 'bg-neu-green', 'bg-neu-purple text-neu-white', 'bg-neu-accent'];

export function HowItWorks() {
  const { t } = useTranslation();
  const steps = t('landing.howItWorks.steps', { returnObjects: true });

  return (
    <section id="cara-kerja" className="border-b-4 border-neu-black bg-neu-bg py-20 lg:py-24">
      <div className="max-w-7xl mx-auto px-4 lg:px-6">
      <motion.div className="flex justify-center mb-14" {...fadeUp()}>
        <SectionTag rotate="-rotate-1">{t('landing.howItWorks.tag')} // {t('landing.howItWorks.title')}</SectionTag>
      </motion.div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {steps.map((step, si) => (
          <motion.div
            key={step.no}
            {...fadeUp(Math.min(si * STAGGER, 0.42))}
            className="relative bg-neu-white border-4 border-neu-black rounded-neu-lg p-7 pt-9 text-center shadow-neu-solid-lg mt-5"
          >
            <div className={`absolute -top-6 left-1/2 -translate-x-1/2 w-12 h-12 border-4 border-neu-black rounded-neu-lg flex items-center justify-center font-display font-black text-lg shadow-neu-solid-sm ${STEP_BG[si % STEP_BG.length]}`}>
              {step.no}
            </div>
            <h3 className="font-display font-black text-lg text-neu-black mb-2 uppercase">{step.title}</h3>
            <p className="font-body text-sm text-neu-black/60 leading-relaxed font-medium">{step.desc}</p>
          </motion.div>
        ))}
      </div>
      </div>
    </section>
  );
}
