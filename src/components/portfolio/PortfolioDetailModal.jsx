import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { gsap } from 'gsap';
import { cn } from '../../utils/cn';

const CATEGORY_COLORS = {
  'Web App': 'bg-neu-blue text-neu-white',
  'Mobile':  'bg-neu-green text-neu-white',
  'Design':  'bg-neu-purple text-neu-white',
  'Backend': 'bg-neu-accent text-neu-white',
};
const categoryColor = (cat) => CATEGORY_COLORS[cat] ?? 'bg-neu-black text-neu-white';

export function PortfolioDetailModal({ item, onClose }) {
  const backdropRef = useRef(null);
  const cardRef     = useRef(null);
  const [imgIdx, setImgIdx] = useState(0);

  const imgs = item?.images?.length ? item.images : (item?.image ? [item.image] : []);

  useEffect(() => {
    setImgIdx(0);
    gsap.fromTo(backdropRef.current, { opacity: 0 }, { opacity: 1, duration: 0.2 });
    gsap.fromTo(cardRef.current,
      { y: 40, opacity: 0, scale: 0.97 },
      { y: 0,  opacity: 1, scale: 1, duration: 0.35, ease: 'power3.out' },
    );
  }, [item]);

  const handleClose = () => {
    gsap.to(cardRef.current,     { y: 30, opacity: 0, scale: 0.97, duration: 0.2, ease: 'power2.in' });
    gsap.to(backdropRef.current, { opacity: 0, duration: 0.2, onComplete: onClose });
  };

  if (!item) return null;

  return createPortal(
    <div
      ref={backdropRef}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neu-black/60 overflow-y-auto"
      onClick={e => { if (e.target === e.currentTarget) handleClose(); }}
    >
      <div
        ref={cardRef}
        className="w-full max-w-2xl bg-neu-white border-2 border-neu-black shadow-neu-xl my-auto"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b-2 border-neu-black bg-neu-primary">
          <div className="flex items-center gap-3">
            {item.category && (
              <span className={cn('px-2.5 py-0.5 border-2 border-neu-black font-mono font-bold text-xs uppercase', categoryColor(item.category))}>
                {item.category}
              </span>
            )}
            <h2 className="font-display font-bold text-base text-neu-black leading-tight">
              {item.title}
            </h2>
          </div>
          <button
            onClick={handleClose}
            className="w-8 h-8 flex items-center justify-center border-2 border-neu-black bg-neu-white font-mono text-lg hover:bg-neu-accent hover:text-neu-white transition-colors duration-150"
          >
            ×
          </button>
        </div>

        {/* Gambar carousel */}
        {imgs.length > 0 && (
          <div className="relative border-b-2 border-neu-black bg-neu-bg overflow-hidden" style={{ height: '280px' }}>
            <img
              src={imgs[imgIdx]}
              alt={item.title}
              className="w-full h-full object-cover"
              onError={e => { e.target.style.display = 'none'; }}
            />

            {imgs.length > 1 && (
              <>
                <button
                  onClick={() => setImgIdx(i => (i - 1 + imgs.length) % imgs.length)}
                  className="absolute left-3 top-1/2 -translate-y-1/2 w-8 h-8 bg-neu-white/90 border-2 border-neu-black font-mono flex items-center justify-center hover:bg-neu-primary transition-colors"
                >←</button>
                <button
                  onClick={() => setImgIdx(i => (i + 1) % imgs.length)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 bg-neu-white/90 border-2 border-neu-black font-mono flex items-center justify-center hover:bg-neu-primary transition-colors"
                >→</button>

                {/* Dot indicator */}
                <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
                  {imgs.map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setImgIdx(i)}
                      className={cn('w-2 h-2 border border-neu-black transition-all', i === imgIdx ? 'bg-neu-primary' : 'bg-neu-white/70')}
                    />
                  ))}
                </div>

                {/* Counter */}
                <span className="absolute top-3 right-3 px-2 py-0.5 bg-neu-black/70 text-neu-white font-mono text-xs">
                  {imgIdx + 1}/{imgs.length}
                </span>
              </>
            )}
          </div>
        )}

        {/* Konten */}
        <div className="p-6 flex flex-col gap-4">
          {/* Deskripsi — render HTML dari rich text editor */}
          {item.description ? (
            <div
              className="tiptap font-body text-sm text-neu-black leading-relaxed"
              dangerouslySetInnerHTML={{ __html: item.description }}
            />
          ) : (
            <p className="font-body text-sm text-neu-black/40 italic">Tidak ada deskripsi.</p>
          )}

          {/* Footer info */}
          <div className="flex items-center justify-between pt-4 border-t-2 border-neu-black/10">
            <p className="font-mono text-xs text-neu-black/40">
              {new Date(item.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
            </p>
            {imgs.length > 1 && (
              <p className="font-mono text-xs text-neu-black/40">{imgs.length} gambar</p>
            )}
          </div>
        </div>

        {/* Tombol tutup */}
        <div className="px-6 pb-5">
          <button
            onClick={handleClose}
            className="w-full py-2.5 font-display font-bold text-xs uppercase tracking-wide border-2 border-neu-black bg-neu-white shadow-neu hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-neu-sm transition-all duration-150 active:translate-x-1 active:translate-y-1 active:shadow-none"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
}
