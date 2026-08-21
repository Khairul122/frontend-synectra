import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { supaImg } from '../../utils/imageUrl';
import { fadeUp, cardAnim } from './animations';
import { TiltCard } from './TiltCard';
import { ErrorState } from './ErrorState';
import { SectionTag } from './helpers';

export function Software({ softwareProducts, isLoading, error, swSliderRef, swDrag, scrollSlider, setActiveSoftware, navigateProtected }) {
  const { t, i18n } = useTranslation();

  if (!isLoading && !error && softwareProducts.length === 0) return null;

  return (
    <section id="software" className="module-card max-w-7xl mx-auto w-full bg-neu-bg p-6 sm:p-8 lg:p-12">

      {/* Header */}
      <div className="flex items-end justify-between mb-10 flex-wrap gap-4">
        <motion.div {...fadeUp()}>
          <SectionTag rotate="rotate-1">{t('landing.software.title')} // READY_TO_DEPLOY</SectionTag>
          <h2 className="font-display font-bold text-2xl lg:text-3xl text-neu-black leading-tight mt-4 max-w-xl">
            {t('landing.software.subtitle')}
          </h2>
        </motion.div>
        {/* Navigation arrows */}
        {!error && (
          <div className="flex gap-2">
            <button
              onClick={() => scrollSlider(swSliderRef, 'left')}
              aria-label="Scroll left"
              className="w-11 h-11 border-4 border-neu-black rounded-neu-sm bg-neu-white shadow-neu-solid-sm flex items-center justify-center font-black hover:bg-neu-primary active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all"
            >
              ←
            </button>
            <button
              onClick={() => scrollSlider(swSliderRef, 'right')}
              aria-label="Scroll right"
              className="w-11 h-11 border-4 border-neu-black rounded-neu-sm bg-neu-primary shadow-neu-solid-sm flex items-center justify-center font-black hover:bg-neu-white active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all"
            >
              →
            </button>
          </div>
        )}
      </div>

      {error ? (
        <ErrorState message="Gagal memuat daftar software." />
      ) : (
      <div className="relative">
      {isLoading ? (
        <div className="flex gap-5 pt-5 pb-3">
          {[1,2,3].map(i => <div key={i} className="flex-shrink-0 w-72 h-80 border-4 border-neu-black rounded-neu-lg animate-pulse bg-neu-white" />)}
        </div>
      ) : (
      <div
        ref={swSliderRef}
        className="flex gap-5 overflow-x-auto pt-5 pb-3 select-none"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none', cursor: 'grab' }}
        onMouseDown={e => {
          const el = swSliderRef.current;
          swDrag.current = { active: true, startX: e.pageX, scrollLeft: el.scrollLeft };
          el.style.cursor = 'grabbing';
        }}
        onMouseMove={e => {
          if (!swDrag.current.active) return;
          swSliderRef.current.scrollLeft = swDrag.current.scrollLeft - (e.pageX - swDrag.current.startX);
        }}
        onMouseUp={() => { swDrag.current.active = false; swSliderRef.current.style.cursor = 'grab'; }}
        onMouseLeave={() => { if (swDrag.current.active) { swDrag.current.active = false; swSliderRef.current.style.cursor = 'grab'; } }}
        onTouchStart={e => {
          const el = swSliderRef.current;
          swDrag.current = { active: true, startX: e.touches[0].pageX, scrollLeft: el.scrollLeft };
        }}
        onTouchMove={e => {
          if (!swDrag.current.active) return;
          const el = swSliderRef.current;
          el.scrollLeft = swDrag.current.scrollLeft - (e.touches[0].pageX - swDrag.current.startX);
        }}
        onTouchEnd={() => { swDrag.current.active = false; }}
      >
        {softwareProducts.map(sw => {
          const isEn   = i18n.language === 'en';
          const swName = (isEn && sw.nameEn)        ? sw.nameEn        : sw.name;
          const swDesc = (isEn && sw.descriptionEn) ? sw.descriptionEn : sw.description;
          const fmt    = (v) => `Rp ${Number(v).toLocaleString('id-ID')}`;
          return (
            <TiltCard key={sw.id} maxTilt={5} className="flex-shrink-0 w-72">
              <motion.div onClick={() => setActiveSoftware(sw)} {...cardAnim(0)} className="flex flex-col bg-neu-white border-4 border-neu-black rounded-neu-lg shadow-neu-solid-lg transition-transform duration-200 hover:-translate-y-2 cursor-pointer select-none">

                {/* Thumbnail */}
                <div className="relative border-b-4 border-neu-black h-40 bg-neu-bg overflow-hidden flex items-center justify-center">
                  {sw.thumbnailUrl ? (
                    <img src={supaImg(sw.thumbnailUrl, { width: 576 })} alt={swName} width="288" height="160" className="w-full h-full object-cover pointer-events-none" loading="lazy" decoding="async" draggable="false" />
                  ) : (
                    <svg className="w-12 h-12 text-neu-black/15" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24" draggable="false">
                      <rect x="2" y="3" width="20" height="14" /><line x1="8" y1="21" x2="16" y2="21" /><line x1="12" y1="17" x2="12" y2="21" />
                    </svg>
                  )}
                  {sw.category && (
                    <span className="absolute top-2 right-2 font-mono text-[10px] font-black uppercase px-2.5 py-1 bg-neu-purple text-neu-white border-2 border-neu-black rounded-neu-sm">
                      {sw.category}
                    </span>
                  )}
                </div>

                {/* Body */}
                <div className="p-5 flex-1 flex flex-col gap-2">
                  <p className="font-display font-black text-base text-neu-black leading-tight uppercase">{swName}</p>
                  {swDesc && (
                    <p className="font-body text-xs text-neu-black/60 line-clamp-2 leading-relaxed">{swDesc}</p>
                  )}
                  {sw.techStack && (
                    <div className="flex flex-wrap gap-1.5 mt-auto pt-2">
                      {sw.techStack.split('\n').filter(s => s.trim()).slice(0, 3).map(s => (
                        <span key={s} className="font-mono text-[9px] font-bold border-2 border-neu-black rounded-neu-sm text-neu-black bg-neu-bg px-2 py-0.5">{s.trim()}</span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Footer */}
                <div className="px-5 pb-5 border-t-4 border-neu-black pt-3">
                  <p className="font-display font-black text-xl text-neu-black mb-3">{fmt(sw.price)}</p>
                  <div className="flex gap-2">
                    {sw.demoUrl && (
                      <a href={sw.demoUrl} target="_blank" rel="noopener noreferrer"
                        onMouseDown={e => e.stopPropagation()}
                        onClick={e => e.stopPropagation()}
                        className="flex-1 text-center px-3 py-2.5 border-2 border-neu-black rounded-neu-sm bg-neu-white font-display font-bold text-[10px] uppercase text-neu-black transition-all duration-150 hover:bg-neu-bg">
                        {t('landing.software.demo')}
                      </a>
                    )}
                    <button
                      onMouseDown={e => e.stopPropagation()}
                      onClick={e => { e.stopPropagation(); navigateProtected('/my-software'); }}
                      className="flex-1 px-3 py-2.5 bg-neu-primary border-2 border-neu-black rounded-neu-sm shadow-neu-solid-sm font-display font-bold text-[10px] uppercase text-neu-black transition-all duration-150 hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none">
                      {t('landing.software.buyNow')}
                    </button>
                  </div>
                </div>
              </motion.div>
            </TiltCard>
          );
        })}
      </div>
      )}
      {/* Fade overlay kanan */}
      <div className="absolute right-0 top-0 bottom-3 w-16 bg-gradient-to-l from-neu-bg to-transparent pointer-events-none" />
      </div>
      )}
    </section>
  );
}
