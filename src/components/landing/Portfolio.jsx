import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { supaImg } from '../../utils/imageUrl';
import { fadeUp, cardAnim, STAGGER } from './animations';
import { TiltCard } from './TiltCard';
import { ErrorState } from './ErrorState';
import { TactileButton } from './TactileButton';

export function Portfolio({ portfolios, isLoading, error, portfolioRef, setActivePortfolio, transitionTo }) {
  const { t } = useTranslation();

  return (
    <section id="portofolio" ref={portfolioRef} className="border-b-2 border-neu-black py-20 lg:py-24 bg-paper-grid">
      <div className="max-w-7xl mx-auto px-4 lg:px-6">
        <div className="flex items-end justify-between mb-10 flex-wrap gap-4">
          <motion.div {...fadeUp()}>
            <span className="font-mono text-[10px] text-neu-black/50 uppercase tracking-widest block mb-2">{t('landing.portfolio.tag')}</span>
            <div className="h-1.5 w-10 bg-neu-gold rounded-full mb-4" />
            <h2 className="font-display font-bold text-3xl lg:text-4xl text-neu-black leading-tight">{t('landing.portfolio.title')}</h2>
            <p className="font-body text-sm text-neu-black/55 mt-2 max-w-md">{t('landing.portfolio.subtitle')}</p>
          </motion.div>
          <TactileButton variant="gold" className="!px-5 !py-2.5 !text-xs" onClick={() => transitionTo('/register')}>{t('landing.portfolio.cta')}</TactileButton>
        </div>
        {error ? (
          <ErrorState message="Gagal memuat portofolio." />
        ) : isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">{[1,2,3].map(i => <div key={i} className="border-2 border-neu-black rounded-neu bg-neu-white h-64 animate-pulse" />)}</div>
        ) : portfolios.length === 0 ? (
          <div className="border-2 border-dashed border-neu-black rounded-neu p-16 text-center"><p className="font-body text-neu-black/40">{t('landing.portfolio.noPortfolio')}</p></div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {portfolios.map((item, i) => {
              const imgs = item.images?.length ? item.images : (item.image ? [item.image] : []);
              return (
                <TiltCard key={item.id} maxTilt={6}>
                  <motion.div
                    {...cardAnim(Math.min(i * STAGGER, 0.42))}
                    className="border-2 border-neu-black rounded-neu shadow-neu-solid bg-neu-white overflow-hidden group cursor-pointer transition-shadow duration-200 hover:shadow-neu-solid-lg"
                    onClick={() => setActivePortfolio(item)}
                  >
                    <div className="relative bg-neu-cream border-b-2 border-neu-black overflow-hidden aspect-video">
                      {imgs[0]
                        ? <img src={supaImg(imgs[0], { width: 600 })} alt={item.title} width="600" height="338" className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-400" loading="lazy" decoding="async" />
                        : <div className="w-full h-full flex items-center justify-center"><span className="font-display font-bold text-5xl text-neu-black/15">{item.title?.charAt(0)}</span></div>}
                      {/* Overlay selalu tipis agar teks screenshot tidak terbaca mentah */}
                      <div className="absolute inset-0 bg-neu-black/20" />
                      {item.category && <span className="absolute top-2 left-2 bg-neu-black text-neu-white font-mono font-bold text-[10px] uppercase px-2 py-0.5 z-10">{item.category.replace(/_/g,' ')}</span>}
                      <div className="absolute inset-0 group-hover:bg-neu-black/20 transition-all duration-300 flex items-center justify-center z-10">
                        <span className="opacity-0 group-hover:opacity-100 transition-opacity font-display font-bold text-sm text-neu-white px-4 py-2 border border-neu-white/30 bg-neu-black/70">{item.title}</span>
                      </div>
                    </div>
                    <div className="p-4 flex items-center justify-between gap-3">
                      <h3 className="font-display font-bold text-sm text-neu-black leading-tight">{item.title}</h3>
                      <button className="flex-shrink-0 px-4 py-2 bg-neu-gold border-2 border-neu-black rounded-neu-sm shadow-neu-solid-sm font-display font-bold text-xs uppercase text-neu-black transition-all duration-150 group-hover:translate-x-[2px] group-hover:translate-y-[2px] group-hover:shadow-none">{t('landing.portfolio.viewDetail')}</button>
                    </div>
                  </motion.div>
                </TiltCard>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
