import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { supaImg } from '../../utils/imageUrl';
import { fadeUp, cardAnim, STAGGER } from './animations';
import { TiltCard } from './TiltCard';
import { ErrorState } from './ErrorState';
import { TactileButton } from './TactileButton';
import { SectionTag } from './helpers';

export function Portfolio({ portfolios, isLoading, error, portfolioRef, setActivePortfolio, transitionTo }) {
  const { t } = useTranslation();

  return (
    <section id="portofolio" ref={portfolioRef} className="module-card max-w-7xl mx-auto w-full bg-neu-white p-6 sm:p-8 lg:p-12">
      <div className="flex items-end justify-between mb-10 flex-wrap gap-4">
        <motion.div {...fadeUp()}>
          <SectionTag rotate="-rotate-2">{t('landing.portfolio.tag')} // SELECTED_WORKS</SectionTag>
          <h2 className="font-display font-black text-3xl lg:text-4xl text-neu-black leading-tight mt-4 uppercase tracking-tighter">{t('landing.portfolio.title')}</h2>
          <p className="font-body text-sm text-neu-black/60 mt-2 max-w-md font-medium">{t('landing.portfolio.subtitle')}</p>
        </motion.div>
        <TactileButton variant="gold" className="!px-5 !py-2.5 !text-xs" onClick={() => transitionTo('/register')}>{t('landing.portfolio.cta')}</TactileButton>
      </div>
      {error ? (
        <ErrorState message="Gagal memuat portofolio." />
      ) : isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">{[1,2,3].map(i => <div key={i} className="border-4 border-neu-black rounded-neu-lg bg-neu-bg h-72 animate-pulse" />)}</div>
      ) : portfolios.length === 0 ? (
        <div className="border-4 border-dashed border-neu-black rounded-neu-lg p-16 text-center"><p className="font-body text-neu-black/40">{t('landing.portfolio.noPortfolio')}</p></div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {portfolios.map((item, i) => {
            const imgs = item.images?.length ? item.images : (item.image ? [item.image] : []);
            return (
              <TiltCard key={item.id} maxTilt={6}>
                <motion.div
                  {...cardAnim(Math.min(i * STAGGER, 0.42))}
                  className="border-4 border-neu-black rounded-neu-lg shadow-neu-solid-lg bg-neu-black overflow-hidden group cursor-pointer transition-transform duration-200 hover:-translate-y-2"
                  onClick={() => setActivePortfolio(item)}
                >
                  <div className="relative bg-neu-bg border-b-4 border-neu-black overflow-hidden aspect-video">
                    {imgs[0]
                      ? <img src={supaImg(imgs[0], { width: 600 })} alt={item.title} width="600" height="338" className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-400" loading="lazy" decoding="async" />
                      : <div className="w-full h-full flex items-center justify-center"><span className="font-display font-bold text-5xl text-neu-black/15">{item.title?.charAt(0)}</span></div>}
                    <div className="absolute inset-0 bg-neu-black/20" />
                    {item.category && <span className="absolute top-3 left-3 bg-neu-purple text-neu-white font-mono font-black text-[10px] uppercase px-2.5 py-1 border-2 border-neu-black rounded-neu-sm z-10">{item.category.replace(/_/g,' ')}</span>}
                    <div className="absolute inset-0 group-hover:bg-neu-black/20 transition-all duration-300 flex items-center justify-center z-10">
                      <span className="opacity-0 group-hover:opacity-100 transition-opacity font-display font-bold text-sm text-neu-white px-4 py-2 border-2 border-neu-white/40 bg-neu-black/70 rounded-neu-sm">{item.title}</span>
                    </div>
                  </div>
                  <div className="p-5 bg-neu-white flex items-center justify-between gap-3">
                    <h3 className="font-display font-black text-sm text-neu-black leading-tight uppercase">{item.title}</h3>
                    <button className="flex-shrink-0 px-4 py-2 bg-neu-primary border-2 border-neu-black rounded-neu-sm shadow-neu-solid-sm font-display font-bold text-xs uppercase text-neu-black transition-all duration-150 group-hover:translate-x-[2px] group-hover:translate-y-[2px] group-hover:shadow-none">{t('landing.portfolio.viewDetail')}</button>
                  </div>
                </motion.div>
              </TiltCard>
            );
          })}
        </div>
      )}
    </section>
  );
}
