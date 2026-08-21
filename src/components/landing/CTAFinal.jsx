import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { fadeUp } from './animations';
import { TactileButton } from './TactileButton';

export function CTAFinal({ transitionTo }) {
  const { t } = useTranslation();

  return (
    <section className="border-b-2 border-neu-black bg-neu-gold overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 lg:px-6">
        <motion.div className="py-24 flex flex-col items-center text-center" {...fadeUp()}>
          <div className="h-px w-12 bg-neu-black/30 mb-8" />
          <h2 className="font-display font-black text-4xl lg:text-5xl text-neu-black mb-5 leading-[0.95] max-w-2xl">
            {t('landing.cta.title').split('\n').map((l, i) => <span key={i} className="block">{l}</span>)}
          </h2>
          <p className="font-body text-base text-neu-black/65 mb-10 max-w-md leading-relaxed">
            {t('landing.cta.subtitle')}
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <TactileButton variant="black" onClick={() => transitionTo('/register')}>
              {t('landing.cta.primary')}
            </TactileButton>
            <TactileButton variant="ghost" onClick={() => transitionTo('/login')}>
              {t('landing.cta.secondary')}
            </TactileButton>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
