import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { fadeUp } from './animations';
import { PackageCard } from './PackageCard';

export function Packages({ packages, isLoading, pkgSliderRef, pkgDrag, scrollSlider, navigateProtected }) {
  const { t } = useTranslation();

  if (packages.length === 0) return null;

  return (
    <section id="paket" className="border-b-2 border-neu-black bg-neu-bg py-16 lg:py-20">
      <div className="max-w-7xl mx-auto px-4 lg:px-6">

        {/* Section header */}
        <div className="flex items-end justify-between mb-8">
          <motion.div {...fadeUp()}>
            <div className="h-px w-8 bg-neu-primary mb-4" />
            <h2 className="font-display font-bold text-3xl lg:text-4xl text-neu-black leading-tight">{t('landing.packages.title')}</h2>
          </motion.div>
          {/* Navigation arrows */}
          <div className="flex gap-2">
            <button
              onClick={() => scrollSlider(pkgSliderRef, 'left')}
              aria-label="Scroll left"
              className="w-10 h-10 border-2 border-neu-black rounded-neu-sm bg-neu-white shadow-neu-sm flex items-center justify-center font-bold hover:bg-neu-primary active:translate-x-[1px] active:translate-y-[1px] active:shadow-none transition-all"
            >
              ←
            </button>
            <button
              onClick={() => scrollSlider(pkgSliderRef, 'right')}
              aria-label="Scroll right"
              className="w-10 h-10 border-2 border-neu-black rounded-neu-sm bg-neu-primary shadow-neu-sm flex items-center justify-center font-bold hover:bg-neu-white active:translate-x-[1px] active:translate-y-[1px] active:shadow-none transition-all"
            >
              →
            </button>
          </div>
        </div>

        {/* Drag-to-scroll slider */}
        <div className="relative">
          {isLoading ? (
            <div className="flex gap-5 pt-5 pb-3">
              {[1,2,3].map(i => <div key={i} className="flex-shrink-0 w-72 h-80 border-2 border-neu-black rounded-neu-lg animate-pulse bg-neu-white" />)}
            </div>
          ) : (
          <div
            ref={pkgSliderRef}
            className="flex gap-5 overflow-x-auto pt-5 pb-3 snap-x snap-mandatory -mx-4 px-4 lg:mx-0 lg:px-0 select-none"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none', cursor: 'grab' }}
            onMouseDown={e => {
              const el = pkgSliderRef.current;
              pkgDrag.current = { active: true, startX: e.pageX, scrollLeft: el.scrollLeft };
              el.style.cursor = 'grabbing';
              el.style.scrollSnapType = 'none';
            }}
            onMouseMove={e => {
              if (!pkgDrag.current.active) return;
              pkgSliderRef.current.scrollLeft = pkgDrag.current.scrollLeft - (e.pageX - pkgDrag.current.startX);
            }}
            onMouseUp={() => {
              pkgDrag.current.active = false;
              const el = pkgSliderRef.current;
              el.style.cursor = 'grab';
              el.style.scrollSnapType = 'x mandatory';
            }}
            onMouseLeave={() => {
              if (!pkgDrag.current.active) return;
              pkgDrag.current.active = false;
              const el = pkgSliderRef.current;
              el.style.cursor = 'grab';
              el.style.scrollSnapType = 'x mandatory';
            }}
            onTouchStart={e => {
              const el = pkgSliderRef.current;
              pkgDrag.current = { active: true, startX: e.touches[0].pageX, scrollLeft: el.scrollLeft };
            }}
            onTouchMove={e => {
              if (!pkgDrag.current.active) return;
              const el = pkgSliderRef.current;
              el.scrollLeft = pkgDrag.current.scrollLeft - (e.touches[0].pageX - pkgDrag.current.startX);
            }}
            onTouchEnd={() => { pkgDrag.current.active = false; }}
          >
            {packages.map((pkg, pi) => (
              <div key={pkg.id} className="flex-shrink-0 w-72 snap-start">
                <PackageCard pkg={{ ...pkg, _idx: pi + 1 }} onOrder={() => navigateProtected('/my-orders/new')} />
              </div>
            ))}
          </div>
          )}
          {/* Fade overlay kanan */}
          <div className="absolute right-0 top-0 bottom-3 w-16 bg-gradient-to-l from-neu-bg to-transparent pointer-events-none" />
        </div>
      </div>
    </section>
  );
}
