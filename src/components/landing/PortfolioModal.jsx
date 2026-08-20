import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Dialog, DialogClose, DialogContent, DialogFooter,
  DialogHeader, DialogTitle,
} from '../ui/dialog';
import { supaImg } from '../../utils/imageUrl';
import { cn } from '../../utils/cn';

/* ─── Portfolio Modal ───────────────────────────────────────────────── */
export function PortfolioModal({ item, open, onClose, transitionTo }) {
  const { t } = useTranslation();
  const [imgIdx, setImgIdx] = useState(0);

  useEffect(() => { if (open) setImgIdx(0); }, [open]);

  const imgs = item?.images?.length ? item.images : (item?.image ? [item.image] : []);

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) onClose(); }}>
      <DialogContent className="sm:max-w-2xl p-0 flex flex-col max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>{item?.title}</DialogTitle>
          {item?.category && (
            <span className="font-mono text-xs text-neu-white/60 uppercase">
              {item.category.replace(/_/g, ' ')}
            </span>
          )}
        </DialogHeader>

        <div className="flex-1 overflow-y-auto min-h-0">
          {imgs.length > 0 && (
            <div className="border-b-2 border-neu-black">
              {/* Image area */}
              <div className="relative bg-neu-black flex items-center justify-center" style={{ maxHeight: '65vh', minHeight: '200px' }}>
                <img
                  key={imgs[imgIdx]}
                  src={supaImg(imgs[imgIdx], { width: 900 })}
                  alt={item?.title}
                  className="max-w-full object-contain block"
                  style={{ maxHeight: '65vh', animation: 'imgFadeIn 0.2s ease' }}
                  loading="lazy"
                  decoding="async"
                />
                {imgs.length > 1 && (
                  <>
                    <button onClick={() => setImgIdx(i => (i - 1 + imgs.length) % imgs.length)}
                      className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-neu-white/90 border-2 border-neu-black rounded-neu-sm font-mono text-sm flex items-center justify-center hover:bg-neu-primary transition-colors">←</button>
                    <button onClick={() => setImgIdx(i => (i + 1) % imgs.length)}
                      className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-neu-white/90 border-2 border-neu-black rounded-neu-sm font-mono text-sm flex items-center justify-center hover:bg-neu-primary transition-colors">→</button>
                  </>
                )}
              </div>
              {/* Dot indicators */}
              {imgs.length > 1 && (
                <div className="flex justify-center gap-1.5 py-2.5 bg-neu-bg border-t border-neu-black/10">
                  {imgs.map((_, idx) => (
                    <button
                      key={idx}
                      onClick={() => setImgIdx(idx)}
                      className={cn('w-2 h-2 rounded-full border border-neu-black transition-all duration-150', idx === imgIdx ? 'bg-neu-primary' : 'bg-neu-black/20')}
                      aria-label={`Foto ${idx + 1}`}
                    />
                  ))}
                </div>
              )}
            </div>
          )}
          <div className="px-5 py-4 border-b-2 border-neu-black">
            {item?.description
              ? <div className="font-body text-sm text-neu-black/80 leading-relaxed prose prose-sm max-w-none" dangerouslySetInnerHTML={{ __html: item.description }} />
              : <p className="font-body text-sm text-neu-black/40 italic">Tidak ada deskripsi.</p>}
          </div>
        </div>

        <DialogFooter className="gap-3 flex-wrap sm:flex-wrap">
          <button
            onClick={() => { onClose(); setTimeout(() => transitionTo('/register'), 350); }}
            className="flex-1 py-2.5 bg-neu-primary border-2 border-neu-black rounded-neu shadow-neu font-display font-bold text-sm uppercase text-neu-black transition-all duration-150 hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-neu-sm">
            {t('landing.order')}
          </button>
          <DialogClose className="px-5 py-2.5 bg-neu-white border-2 border-neu-black rounded-neu shadow-neu font-display font-bold text-sm uppercase text-neu-black transition-all duration-150 hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-neu-sm">
            Tutup
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
