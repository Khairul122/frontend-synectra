import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '../ui/dialog';
import { supaImg } from '../../utils/imageUrl';
import { useLang } from './hooks';

function parseList(val, fallback = []) {
  if (!val) return fallback;
  if (Array.isArray(val)) return val.filter(Boolean);
  if (typeof val === 'string') {
    const trimmed = val.trim();
    if (trimmed.startsWith('[') && trimmed.endsWith(']')) {
      try {
        const parsed = JSON.parse(trimmed);
        if (Array.isArray(parsed)) return parsed.filter(Boolean);
      } catch {
        // ignore JSON parse error and fallback to string splitting
      }
    }
    if (trimmed.includes('\n')) {
      return trimmed.split('\n').map(s => s.replace(/^[•\-*]\s*/, '').trim()).filter(Boolean);
    }
    if (trimmed.includes(',')) {
      return trimmed.split(',').map(s => s.trim()).filter(Boolean);
    }
    return [trimmed];
  }
  return fallback;
}

function parseImages(item) {
  if (!item) return [];
  if (Array.isArray(item.images) && item.images.length > 0) return item.images.filter(Boolean);
  if (Array.isArray(item.photos) && item.photos.length > 0) return item.photos.filter(Boolean);
  const single = item.image || item.thumbnailUrl || item.thumbnail || item.previewUrl;
  return single ? [single] : [];
}

export function PortfolioModal({ item, open, onClose, transitionTo }) {
  const { t } = useTranslation();
  const lang = useLang();
  const [imgIdx, setImgIdx] = useState(0);

  useEffect(() => {
    if (open) setImgIdx(0);
  }, [open, item]);

  if (!item) return null;

  const title = lang(item.title, item.titleEn) || item.title || item.name || 'Detail Portofolio';
  const desc = lang(item.description, item.descriptionEn) || item.description || '';
  const imgs = parseImages(item);
  const techList = parseList(item.techStack || item.tags, ['React', 'Node.js', 'PostgreSQL', 'Tailwind CSS']);
  const featuresList = parseList(item.features || item.featuresEn, [
    'Dashboard real-time analitik & monitoring data',
    'Arsitektur backend scalable dengan proteksi keamanan',
    'Integrasi REST API dan database terenkripsi',
    'Desain UI/UX modern, responsif, dan mobile-friendly',
    'Ekspor laporan analitik dan manajemen multi-user',
  ]);
  const category = item.category ? item.category.replace(/_/g, ' ') : 'WEB APP';
  const link = item.link || item.demoUrl || item.previewUrl || item.url;

  const handleOrder = () => {
    onClose();
    if (transitionTo) {
      setTimeout(() => transitionTo('/register'), 250);
    } else {
      const el = document.getElementById('kontak');
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) onClose(); }}>
      <DialogContent
        data-lenis-prevent="true"
        onWheel={(e) => e.stopPropagation()}
        className="p-0 border-0 bg-transparent shadow-none max-w-none sm:max-w-none w-auto flex items-center justify-center p-3 sm:p-4"
      >
        <DialogTitle className="sr-only">{title}</DialogTitle>
        <DialogDescription className="sr-only">Detail portofolio project {title}</DialogDescription>

        {/* ── Modal Container (100% matches portofolio-modal.html and portofolio-modal-mobile.html) ── */}
        <div
          data-lenis-prevent="true"
          className="relative w-full max-w-2xl md:max-w-3xl bg-neu-white border-4 border-neu-black rounded-xl shadow-[12px_12px_0px_0px_#0D0D0D] overflow-hidden flex flex-col max-h-[90vh]"
        >
          {/* Close Button (Absolute Top Right) */}
          <button
            type="button"
            onClick={onClose}
            aria-label="Tutup modal"
            className="absolute top-4 right-4 z-50 w-9 h-9 flex items-center justify-center bg-neu-white border-2 border-neu-black rounded-lg shadow-[2px_2px_0px_0px_#0D0D0D] hover:translate-y-[1px] hover:translate-x-[1px] hover:shadow-none transition-all cursor-pointer"
          >
            <span className="material-symbols-outlined text-neu-black text-lg font-bold">close</span>
          </button>

          {/* Header */}
          <div className="bg-neu-black text-neu-white p-5 sm:p-6 flex flex-col gap-2 border-b-4 border-neu-black pr-14 select-none shrink-0">
            <h2 className="font-display font-black text-lg sm:text-2xl text-neu-white leading-tight">
              {title}
            </h2>
            <div className="flex flex-wrap gap-2 font-mono text-xs font-bold text-outline-variant">
              <span className="bg-primary-container text-neu-black px-2.5 py-0.5 rounded border border-neu-black font-mono font-bold uppercase">
                {category}
              </span>
              {item.client && (
                <span className="bg-surface-dim text-neu-black px-2.5 py-0.5 rounded font-mono font-bold text-[11px] uppercase">
                  KLIEN: {item.client}
                </span>
              )}
            </div>
          </div>

          {/* Scrollable Content Body */}
          <div
            data-lenis-prevent="true"
            onWheel={(e) => e.stopPropagation()}
            onTouchMove={(e) => e.stopPropagation()}
            className="flex-1 overflow-y-auto overscroll-contain bg-neu-white"
            style={{
              WebkitOverflowScrolling: 'touch',
            }}
          >
            {/* Image Preview / Gallery Section */}
            <div className="p-4 sm:p-6 border-b-4 border-neu-black bg-surface-dim select-none">
              <div className="relative w-full aspect-video bg-neu-black border-2 border-neu-black rounded-lg shadow-[4px_4px_0px_0px_#0D0D0D] overflow-hidden flex items-center justify-center">
                {imgs.length > 0 ? (
                  <>
                    <img
                      src={supaImg(imgs[imgIdx], { width: 1000 })}
                      alt={title}
                      className="w-full h-full object-contain"
                      loading="lazy"
                      decoding="async"
                    />
                    {imgs.length > 1 && (
                      <>
                        <button
                          type="button"
                          onClick={() => setImgIdx((i) => (i - 1 + imgs.length) % imgs.length)}
                          className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-neu-white/90 border-2 border-neu-black rounded font-mono text-sm flex items-center justify-center shadow-[2px_2px_0px_0px_#0D0D0D] hover:bg-primary-container transition-colors cursor-pointer"
                        >
                          ←
                        </button>
                        <button
                          type="button"
                          onClick={() => setImgIdx((i) => (i + 1) % imgs.length)}
                          className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-neu-white/90 border-2 border-neu-black rounded font-mono text-sm flex items-center justify-center shadow-[2px_2px_0px_0px_#0D0D0D] hover:bg-primary-container transition-colors cursor-pointer"
                        >
                          →
                        </button>
                      </>
                    )}
                    <div className="absolute bottom-3 right-3 px-2 py-1 bg-neu-black/90 text-neu-white text-[10px] font-mono rounded border border-neu-white/40">
                      {imgIdx + 1} / {imgs.length}
                    </div>
                  </>
                ) : (
                  <div className="flex flex-col items-center justify-center gap-2 text-neu-white/50">
                    <span className="material-symbols-outlined text-6xl">image</span>
                    <span className="font-mono text-xs tracking-widest uppercase font-bold">PREVIEW_PORTFOLIO</span>
                    <span className="absolute bottom-3 right-3 px-2 py-1 bg-neu-black text-neu-white text-[10px] font-mono rounded border border-neu-white/20">
                      16:9 ASPECT
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Description Section */}
            <div className="p-5 sm:p-6 bg-neu-white">
              <span className="block font-mono text-xs tracking-widest text-neu-black uppercase mb-2 font-bold select-none">
                Deskripsi
              </span>
              <div
                className="font-body text-sm sm:text-base text-neu-black/90 leading-relaxed prose prose-sm max-w-none"
                dangerouslySetInnerHTML={{ __html: desc || 'Proyek implementasi sistem digital terintegrasi dengan standar arsitektur dan kualitas kode tinggi.' }}
              />
            </div>
          </div>

          {/* Action Buttons Footer */}
          <div className="p-4 sm:p-5 bg-neu-bg border-t-2 border-neu-black flex flex-row gap-3 mt-auto select-none shrink-0">
            {link && (
              <a
                href={link}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 py-3 px-4 bg-neu-white border-2 border-neu-black rounded shadow-[2px_2px_0px_0px_#0D0D0D] font-display font-bold text-xs sm:text-sm text-neu-black hover:translate-y-[1px] hover:translate-x-[1px] hover:shadow-none transition-all cursor-pointer uppercase text-center"
              >
                LIHAT LIVE
              </a>
            )}
            <button
              type="button"
              onClick={handleOrder}
              className="flex-[2] py-3 px-4 bg-primary-container border-2 border-neu-black rounded shadow-[2px_2px_0px_0px_#0D0D0D] font-display font-black text-xs sm:text-sm text-neu-black hover:bg-primary-fixed hover:translate-y-[1px] hover:translate-x-[1px] hover:shadow-none transition-all cursor-pointer uppercase text-center"
            >
              KONSULTASI / PESAN
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 px-4 bg-neu-white border-2 border-neu-black rounded shadow-[2px_2px_0px_0px_#0D0D0D] font-display font-bold text-xs sm:text-sm text-neu-black hover:bg-surface-dim hover:translate-y-[1px] hover:translate-x-[1px] hover:shadow-none transition-all cursor-pointer uppercase text-center"
            >
              TUTUP
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
