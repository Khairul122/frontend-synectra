import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { supaImg } from '../../utils/imageUrl';
import { fadeUp, cardAnim, STAGGER } from './animations';
import { useLang } from './hooks';

export function Banners({ banners, setBannerModal, setBannerModalExp }) {
  const { t } = useTranslation();
  const lang = useLang();

  if (banners.length === 0) return null;

  return (
    <section className="border-b-2 border-neu-black bg-neu-primary py-10">
      <div className="max-w-7xl mx-auto px-4 lg:px-6">
        <motion.div {...fadeUp()} className="flex items-center gap-3 mb-5"><div className="h-1 w-8 bg-neu-black" /><h2 className="font-display font-bold text-lg uppercase tracking-wide text-neu-black">{t('landing.banner.title')}</h2></motion.div>
        <div className="flex gap-4 overflow-x-auto pb-2 snap-x -mx-4 px-4 lg:mx-0 lg:px-0">
          {banners.map((b, bi) => (
            <motion.div key={b.id} {...cardAnim(Math.min(bi * STAGGER, 0.42))}
              onClick={() => { setBannerModal(b); setBannerModalExp(false); }}
              className="flex-shrink-0 w-72 snap-start border-2 border-neu-black rounded-neu-lg shadow-neu bg-neu-white overflow-hidden cursor-pointer group hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-neu-md transition-all duration-150">
              {b.image && (
                <div className="relative border-b-2 border-neu-black overflow-hidden">
                  <img src={supaImg(b.image, { width: 576 })} alt={b.title} width="288" height="144" className="w-full h-36 object-cover group-hover:scale-105 transition-transform duration-300" loading="lazy" decoding="async" />
                  <div className="absolute inset-0 bg-neu-black/0 group-hover:bg-neu-black/20 transition-all duration-200 flex items-center justify-center">
                    <span className="opacity-0 group-hover:opacity-100 transition-opacity font-mono text-xs text-neu-white bg-neu-black/70 px-3 py-1.5">{t('landing.portfolio.clickView')}</span>
                  </div>
                </div>
              )}
              <div className="p-4">
                <p className="font-display font-bold text-sm text-neu-black">{lang(b.title, b.titleEn)}</p>
                {b.description && <p className="font-body text-xs text-neu-black/60 mt-1 line-clamp-2" dangerouslySetInnerHTML={{ __html: lang(b.description, b.descriptionEn)?.replace(/<[^>]*>/g,' ') }} />}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
