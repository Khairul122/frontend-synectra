import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { fadeUp } from './animations';
import { TactileButton } from './TactileButton';

export function CTAFinal({ transitionTo }) {
  const { t } = useTranslation();

  return (
    <section className="border-b-4 border-neu-black bg-neu-primary py-20 lg:py-24 px-6 text-center">
      <motion.div className="max-w-7xl mx-auto flex flex-col items-center" {...fadeUp()}>
        <h2 className="font-display font-black text-4xl lg:text-6xl text-neu-black mb-6 leading-[0.95] max-w-3xl uppercase tracking-tighter">
          {t('landing.cta.title').split('\n').map((l, i) => <span key={i} className="block">{l}</span>)}
        </h2>
        <p className="font-body text-base text-neu-black/70 mb-10 max-w-md leading-relaxed font-medium">
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
    </section>
  );
}
