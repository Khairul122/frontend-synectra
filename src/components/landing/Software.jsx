import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { supaImg } from '../../utils/imageUrl';
import { fadeLeft, cardAnim } from './animations';

export function Software({ softwareProducts, isLoading, swSliderRef, swDrag, scrollSlider, setActiveSoftware, navigateProtected }) {
  const { t, i18n } = useTranslation();

  if (softwareProducts.length === 0) return null;

  return (
    <section id="software" className="border-b-2 border-neu-black bg-neu-black py-16 lg:py-20">
      <div className="max-w-7xl mx-auto px-4 lg:px-6">

        {/* Header */}
        <div className="flex items-end justify-between mb-10">
          <motion.div {...fadeLeft()}>
            <span className="font-mono text-[10px] text-neu-white/40 uppercase tracking-widest block mb-2">{t('landing.software.title')}</span>
            <div className="h-px w-8 bg-neu-primary mb-4" />
            <h2 className="font-display font-bold text-3xl lg:text-4xl text-neu-white leading-tight">
              {t('landing.software.subtitle')}
            </h2>
          </motion.div>
          {/* Navigation arrows */}
          <div className="flex gap-2">
            <button
              onClick={() => scrollSlider(swSliderRef, 'left')}
              aria-label="Scroll left"
              className="w-10 h-10 border-2 border-neu-black rounded-neu-sm bg-neu-white shadow-neu-sm flex items-center justify-center font-bold hover:bg-neu-primary active:translate-x-[1px] active:translate-y-[1px] active:shadow-none transition-all"
            >
              ←
            </button>
            <button
              onClick={() => scrollSlider(swSliderRef, 'right')}
              aria-label="Scroll right"
              className="w-10 h-10 border-2 border-neu-primary rounded-neu-sm bg-neu-primary shadow-neu-sm flex items-center justify-center font-bold hover:bg-neu-white active:translate-x-[1px] active:translate-y-[1px] active:shadow-none transition-all"
            >
              →
            </button>
          </div>
        </div>

        {/* Drag-to-scroll slider — no scrollbar UI */}
        <div className="relative">
        {isLoading ? (
          <div className="flex gap-5 pt-5 pb-3">
            {[1,2,3].map(i => <div key={i} className="flex-shrink-0 w-72 h-72 border-2 border-neu-white/20 rounded-neu-lg animate-pulse bg-neu-white/10" />)}
          </div>
        ) : (
        <div
          ref={swSliderRef}
          className="flex gap-5 overflow-x-auto pt-5 pb-3 -mx-4 px-4 lg:mx-0 lg:px-0 select-none"
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
              <motion.div key={sw.id} onClick={() => setActiveSoftware(sw)} {...cardAnim(0)} className="flex-shrink-0 w-72 flex flex-col bg-neu-white border-2 border-neu-black rounded-neu-lg shadow-neu transition-all duration-200 hover:-translate-x-2 hover:-translate-y-2 hover:shadow-neu-lg hover:rotate-[-0.5deg] cursor-pointer select-none">

                {/* Thumbnail / Flat Graphic */}
                <div className="relative border-b-2 border-neu-black h-40 bg-neu-bg overflow-hidden flex items-center justify-center">
                  {sw.thumbnailUrl ? (
                    <img src={supaImg(sw.thumbnailUrl, { width: 576 })} alt={swName} width="288" height="160" className="w-full h-full object-cover pointer-events-none" loading="lazy" decoding="async" draggable="false" />
                  ) : (
                    <svg className="w-12 h-12 text-neu-black/15" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24" draggable="false">
                      <rect x="2" y="3" width="20" height="14" /><line x1="8" y1="21" x2="16" y2="21" /><line x1="12" y1="17" x2="12" y2="21" />
                    </svg>
                  )}
                  {sw.category && (
                    <span className="absolute top-2 right-2 font-mono text-[9px] font-bold uppercase px-2 py-0.5 bg-neu-white border border-neu-black rounded-neu-sm text-neu-black">
                      {sw.category}
                    </span>
                  )}
                </div>

                {/* Body */}
                <div className="p-4 flex-1 flex flex-col gap-2">
                  <p className="font-display font-bold text-sm text-neu-black leading-tight">{swName}</p>
                  {swDesc && (
                    <p className="font-body text-xs text-neu-black/60 line-clamp-2 leading-relaxed">{swDesc}</p>
                  )}
                  {sw.techStack && (
                    <div className="flex flex-wrap gap-1 mt-auto pt-1">
                      {sw.techStack.split('\n').filter(s => s.trim()).slice(0, 3).map(s => (
                        <span key={s} className="font-mono text-[9px] border border-neu-black rounded-neu-sm text-neu-black bg-transparent px-2 py-0.5">{s.trim()}</span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Footer */}
                <div className="px-4 pb-4 border-t-2 border-neu-black pt-3 flex items-center justify-between gap-2">
                  <span className="font-mono font-bold text-sm text-neu-black whitespace-nowrap">{fmt(sw.price)}</span>
                  <div className="flex gap-1.5">
                    {sw.demoUrl && (
                      <a href={sw.demoUrl} target="_blank" rel="noopener noreferrer"
                        onMouseDown={e => e.stopPropagation()}
                        onClick={e => e.stopPropagation()}
                        className="px-2.5 py-1.5 border-2 border-neu-black rounded-neu-sm bg-neu-white font-display font-bold text-[10px] uppercase text-neu-black transition-all duration-150 hover:bg-neu-bg hover:translate-x-[1px] hover:translate-y-[1px]">
                        {t('landing.software.demo')}
                      </a>
                    )}
                    <button
                      onMouseDown={e => e.stopPropagation()}
                      onClick={e => { e.stopPropagation(); navigateProtected('/my-software'); }}
                      className="px-2.5 py-1.5 bg-neu-primary border-2 border-neu-black rounded-neu-sm shadow-neu-sm font-display font-bold text-[10px] uppercase text-neu-black transition-all duration-150 hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none">
                      {t('landing.software.buyNow')}
                    </button>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
        )}
        {/* Fade overlay kanan */}
        <div className="absolute right-0 top-0 bottom-3 w-16 bg-gradient-to-l from-neu-black to-transparent pointer-events-none" />
        </div>
      </div>
    </section>
  );
}
