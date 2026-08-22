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
        // ignore JSON parse error
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
  const single = item.thumbnailUrl || item.thumbnail || item.image || item.previewUrl;
  return single ? [single] : [];
}

export function SoftwareDetailModal({ sw, open, onClose, transitionTo }) {
  const { t } = useTranslation();
  const lang = useLang();
  const [imgIdx, setImgIdx] = useState(0);

  useEffect(() => {
    if (open) setImgIdx(0);
  }, [open, sw]);

  if (!sw) return null;

  const title = lang(sw.name, sw.nameEn) || sw.name || sw.title || 'Detail Software';
  const desc = lang(sw.description, sw.descriptionEn) || sw.description || '';
  const imgs = parseImages(sw);
  const category = sw.category || 'WEB APP';
  const techList = parseList(sw.techStack || sw.tags, ['React 18', 'Node.js', 'PostgreSQL', 'Tailwind CSS']);
  const featuresList = parseList(sw.features || sw.featuresEn, [
    'Dashboard analitik & real-time monitoring',
    'Arsitektur scalable & performa tinggi',
    'Integrasi API & database terenkripsi',
    'UI responsif dan mobile-friendly',
    'Ekspor laporan dan manajemen data otomatis',
  ]);
  const price = sw.price
    ? `Rp ${Number(sw.price).toLocaleString('id-ID')}`
    : 'Hubungi Kami';

  const handleBuy = () => {
    onClose();
    if (transitionTo) {
      setTimeout(() => transitionTo('/my-software'), 250);
    } else {
      const el = document.getElementById('kontak');
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleConsultation = () => {
    const waNumber = '6281234567890';
    const msg = `Halo Synectra, saya tertarik untuk konsultasi mengenai produk software "${title}".`;
    const waUrl = `https://wa.me/${waNumber}?text=${encodeURIComponent(msg)}`;
    window.open(waUrl, '_blank', 'noopener,noreferrer');
  };

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) onClose(); }}>
      <DialogContent
        data-lenis-prevent="true"
        onWheel={(e) => e.stopPropagation()}
        className="p-0 border-0 bg-transparent shadow-none max-w-none sm:max-w-none w-auto flex items-center justify-center p-3 sm:p-4"
      >
        <DialogTitle className="sr-only">{title}</DialogTitle>
        <DialogDescription className="sr-only">Detail produk software aplikasi {title}</DialogDescription>

        {/* ── Modal Container (100% matches portofolio-modal.html & portofolio-modal-mobile.html) ── */}
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
            <div className="flex gap-2 font-mono text-xs font-bold text-outline-variant">
              <span className="bg-primary-container text-neu-black px-2.5 py-0.5 rounded border border-neu-black font-mono font-bold uppercase">
                {category}
              </span>
              {sw.version && (
                <span className="bg-neu-white text-neu-black px-2 py-0.5 rounded font-mono font-bold text-[11px]">
                  v{sw.version}
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
                    <span className="material-symbols-outlined text-6xl">deployed_code</span>
                    <span className="font-mono text-xs tracking-widest uppercase font-bold">PREVIEW_SOFTWARE</span>
                    <span className="absolute bottom-3 right-3 px-2 py-1 bg-neu-black text-neu-white text-[10px] font-mono rounded border border-neu-white/20">
                      16:9 ASPECT
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Description Section */}
            <div className="p-5 sm:p-6 border-b-4 border-neu-black bg-neu-white">
              <span className="block font-mono text-xs tracking-widest text-neu-black uppercase mb-2 font-bold select-none">
                Deskripsi
              </span>
              <div
                className="font-body text-sm sm:text-base text-neu-black/90 leading-relaxed prose prose-sm max-w-none"
                dangerouslySetInnerHTML={{ __html: desc || 'Sistem aplikasi siap pakai dengan fitur lengkap dan arsitektur kode terstruktur.' }}
              />
            </div>

            {/* Features Section */}
            <div className="p-5 sm:p-6 border-b-4 border-neu-black bg-neu-bg">
              <span className="block font-mono text-xs tracking-widest text-neu-black uppercase mb-4 font-bold select-none">
                Fitur Unggulan
              </span>
              <ul className="space-y-3">
                {featuresList.map((feature, fIdx) => (
                  <li key={fIdx} className="flex gap-3 items-center">
                    <div className="w-6 h-6 shrink-0 bg-primary-container border-2 border-neu-black rounded flex items-center justify-center shadow-[1px_1px_0px_0px_#0D0D0D]">
                      <span className="material-symbols-outlined text-sm text-neu-black font-black">check</span>
                    </div>
                    <span className="font-body text-sm sm:text-base font-medium text-neu-black">
                      {feature}
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Tech Stack Section */}
            <div className="p-5 sm:p-6 border-b-4 border-neu-black bg-neu-white">
              <span className="block font-mono text-xs tracking-widest text-neu-black uppercase mb-3 font-bold select-none">
                Tech Stack
              </span>
              <div className="flex flex-wrap gap-2">
                {techList.map((tech, tIdx) => (
                  <span
                    key={tIdx}
                    className="px-3 py-1.5 bg-neu-black text-neu-white border-2 border-neu-black rounded font-mono text-xs font-bold shadow-[2px_2px_0px_0px_#0D0D0D]"
                  >
                    {tech}
                  </span>
                ))}
              </div>
            </div>

            {/* Price Section */}
            <div className="px-5 py-4 border-b-4 border-neu-black flex justify-between items-center bg-surface-bright select-none">
              <div className="flex flex-col">
                <span className="font-mono text-xs tracking-widest text-neu-black uppercase font-bold">
                  HARGA LISENSI
                </span>
              </div>
              <div className="flex flex-col items-end">
                <span className="font-display font-black text-2xl sm:text-3xl text-neu-black">
                  {price}
                </span>
              </div>
            </div>
          </div>

          {/* Action Buttons Footer: ONLY KONSULTASI (Direct WA) & BELI */}
          <div className="p-4 sm:p-5 bg-neu-bg border-t-2 border-neu-black flex flex-row gap-3 sm:gap-4 mt-auto select-none shrink-0">
            <button
              type="button"
              onClick={handleConsultation}
              className="flex-1 py-3.5 px-4 bg-neu-white border-2 border-neu-black rounded shadow-[2px_2px_0px_0px_#0D0D0D] font-display font-bold text-xs sm:text-sm text-neu-black hover:bg-surface-dim hover:translate-y-[1px] hover:translate-x-[1px] hover:shadow-none transition-all cursor-pointer uppercase text-center flex items-center justify-center gap-2"
            >
              <span className="material-symbols-outlined text-base font-bold text-neu-green">chat</span>
              <span>KONSULTASI</span>
            </button>
            <button
              type="button"
              onClick={handleBuy}
              className="flex-1 py-3.5 px-4 bg-primary-container border-2 border-neu-black rounded shadow-[2px_2px_0px_0px_#0D0D0D] font-display font-black text-xs sm:text-sm text-neu-black hover:bg-primary-fixed hover:translate-y-[1px] hover:translate-x-[1px] hover:shadow-none transition-all cursor-pointer uppercase text-center flex items-center justify-center gap-2"
            >
              <span className="material-symbols-outlined text-base font-bold">shopping_cart</span>
              <span>BELI</span>
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
