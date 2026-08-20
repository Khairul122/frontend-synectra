import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { fadeUp } from './animations';

export function CTAFinal({ transitionTo }) {
  const { t } = useTranslation();

  return (
    <section className="border-b-2 border-neu-black bg-neu-primary overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 lg:px-6">
        <motion.div className="py-24 flex flex-col items-center text-center" {...fadeUp()}>
          <div className="h-px w-12 bg-neu-black/30 mb-8" />
          <h2 className="font-display font-black text-4xl lg:text-5xl text-neu-black mb-5 leading-[0.95] max-w-2xl">
            {t('landing.cta.title').split('\n').map((l, i) => <span key={i} className="block">{l}</span>)}
          </h2>
          <p className="font-body text-base text-neu-black/65 mb-10 max-w-md leading-relaxed">
            {t('landing.cta.subtitle')}
          </p>
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={() => transitionTo('/register')}
              className="px-10 py-4 bg-neu-black border-2 border-neu-black rounded-neu-sm text-neu-white font-display font-bold text-sm uppercase shadow-[3px_3px_0px_#0D0D0D,7px_10px_20px_-4px_rgba(13,13,13,0.35)] hover:translate-x-[3px] hover:translate-y-[3px] hover:shadow-none transition-all duration-150">
              {t('landing.cta.primary')}
            </button>
            <button
              onClick={() => transitionTo('/login')}
              className="px-10 py-4 bg-transparent border-2 border-neu-black rounded-neu-sm text-neu-black font-display font-bold text-sm uppercase hover:bg-neu-black/10 transition-all duration-150">
              {t('landing.cta.secondary')}
            </button>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
