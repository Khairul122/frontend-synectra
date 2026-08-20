import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';

export function FloatingCTA({ showScrollTop, transitionTo }) {
  const { t } = useTranslation();

  return (
    <>
      {/* ── Back-to-Top Button ── */}
      <AnimatePresence>
        {showScrollTop && (
          <motion.button
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.2 }}
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            aria-label="Kembali ke atas"
            className="fixed bottom-20 sm:bottom-6 right-4 sm:right-6 z-50 w-11 h-11 bg-neu-black border-2 border-neu-black rounded-neu-sm shadow-neu text-neu-white flex items-center justify-center hover:bg-neu-primary hover:text-neu-black transition-colors duration-150">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 15l7-7 7 7" />
            </svg>
          </motion.button>
        )}
      </AnimatePresence>

      {/* ── Mobile Sticky CTA Bar (≤640px) ── */}
      <AnimatePresence>
        {showScrollTop && (
          <motion.div
            initial={{ y: 80 }}
            animate={{ y: 0 }}
            exit={{ y: 80 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            className="sm:hidden fixed bottom-0 left-0 right-0 z-50 bg-neu-white border-t-2 border-neu-black px-4 py-3 flex gap-3">
            <button
              onClick={() => transitionTo('/register')}
              className="flex-1 py-3 bg-neu-primary border-2 border-neu-black rounded-neu-sm shadow-neu-sm font-display font-bold text-sm uppercase text-neu-black transition-all duration-150 hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none">
              {t('nav.register')}
            </button>
            <button
              onClick={() => transitionTo('/login')}
              className="px-5 py-3 bg-neu-white border-2 border-neu-black rounded-neu-sm font-display font-bold text-sm uppercase text-neu-black/70 hover:text-neu-black transition-colors">
              {t('nav.login')}
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
