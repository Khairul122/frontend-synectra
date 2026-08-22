import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '../ui/dialog';
import { supaImg } from '../../utils/imageUrl';
import { useLang } from './hooks';

export function BannerDetailModal({ banner, isOpen, onClose, onAction }) {
  const { t } = useTranslation();
  const lang = useLang();
  // State: collapsed (false) -> expanded (true)
  const [isExpanded, setIsExpanded] = useState(false);

  // Reset to collapsed state whenever modal opens or banner changes
  useEffect(() => {
    if (isOpen) {
      setIsExpanded(false);
    }
  }, [isOpen, banner]);

  if (!banner) return null;

  const title = lang(banner.title, banner.titleEn) || banner.title || 'Banner Promo';
  const desc = banner.description || '';
  const badgeText = banner.promoCode ? `KODE: ${banner.promoCode}` : (banner.badge || 'PROMO');
  const imageUrl = banner.image ? supaImg(banner.image, { width: 1200 }) : null;

  const handleAction = () => {
    onClose();
    if (onAction) {
      onAction(banner);
    } else {
      const el = document.getElementById('kontak');
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleCollapseOrClose = () => {
    if (isExpanded) {
      setIsExpanded(false);
    } else {
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => { if (!open) onClose(); }}>
      <DialogContent
        data-lenis-prevent="true"
        onWheel={(e) => e.stopPropagation()}
        className="p-0 border-0 bg-transparent shadow-none max-w-none sm:max-w-none w-full max-w-[94vw] md:max-w-none md:w-auto flex items-center justify-center p-2 sm:p-4"
      >
        <DialogTitle className="sr-only">{title}</DialogTitle>
        <DialogDescription className="sr-only">Detail pengumuman promo {title}</DialogDescription>

        {/* ── DESKTOP MODAL (400px Collapsed -> 900px Expanded, 600px Height) ── */}
        <div
          data-lenis-prevent="true"
          className={`hidden md:flex bg-neu-white border-4 border-neu-black rounded-2xl shadow-[12px_12px_0px_0px_#0D0D0D] flex-row overflow-hidden relative h-[600px] transition-all duration-350 ease-in-out select-none ${
            isExpanded ? 'w-[900px]' : 'w-[400px]'
          }`}
        >
          {/* Left Panel (Visual/Banner) */}
          <div
            onClick={() => !isExpanded && setIsExpanded(true)}
            className={`bg-neu-black/5 relative h-full overflow-hidden transition-all duration-350 ease-in-out shrink-0 ${
              isExpanded
                ? 'w-[450px] border-r-4 border-neu-black cursor-default'
                : 'w-[400px] cursor-pointer hover:opacity-95'
            }`}
          >
            {/* Scrim Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-neu-black/85 via-neu-black/30 to-transparent z-10 pointer-events-none" />

            {/* Promo Badge (Top Left) */}
            <div className="absolute top-4 left-4 z-20 bg-secondary-container border-2 border-neu-black text-neu-white px-3 py-1 font-display font-bold text-xs rounded shadow-[2px_2px_0px_0px_#0D0D0D] uppercase">
              {badgeText}
            </div>

            {/* Close Button when Collapsed (Top Right) */}
            {!isExpanded && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onClose();
                }}
                aria-label="Tutup modal"
                className="absolute top-4 right-4 z-20 w-8 h-8 flex items-center justify-center bg-neu-white border-2 border-neu-black rounded-full shadow-[2px_2px_0px_0px_#0D0D0D] hover:bg-secondary-container hover:text-neu-white transition-all cursor-pointer"
              >
                <span className="material-symbols-outlined text-sm font-bold">close</span>
              </button>
            )}

            {/* Background Image / Placeholder */}
            {imageUrl ? (
              <img
                src={imageUrl}
                alt={title}
                className="absolute inset-0 w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center p-8 text-center bg-primary-container">
                <span className="material-symbols-outlined text-8xl text-neu-black mb-3">
                  {banner.icon || 'campaign'}
                </span>
              </div>
            )}

            {/* Overlay for Branding on Left Panel */}
            <div className="absolute bottom-6 left-6 right-6 p-4 flex flex-col justify-between z-20 pointer-events-none">
              <div>
                <h3 className="font-display font-black text-2xl text-neu-white mb-1 leading-tight drop-shadow-md">
                  {title}
                </h3>
                <p className="font-body font-medium text-sm text-neu-white opacity-90 line-clamp-2">
                  {desc ? desc.replace(/<[^>]*>/g, ' ').replace(/&nbsp;/g, ' ').trim() : 'Detail Singkat'}
                </p>
              </div>

              {/* Trigger text shown only when collapsed */}
              {!isExpanded && (
                <div className="mt-4 font-display font-bold text-neu-white text-sm flex items-center gap-2 pointer-events-auto">
                  <span>Klik untuk lihat detail</span>
                  <span className="material-symbols-outlined text-sm">arrow_forward</span>
                </div>
              )}
            </div>
          </div>

          {/* Right Panel (Content: Width 450px when Expanded, Width 0 when Collapsed) */}
          <div
            className={`flex flex-col h-full bg-neu-white shrink-0 transition-all duration-350 ease-in-out ${
              isExpanded
                ? 'w-[450px] opacity-100'
                : 'w-0 opacity-0 pointer-events-none p-0 overflow-hidden'
            }`}
          >
            {/* Header */}
            <div className="p-6 md:p-8 border-b-4 border-neu-black bg-surface-dim flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3 min-w-0">
                <div className="bg-secondary-container border-2 border-neu-black text-neu-white px-3 py-1 font-display font-bold text-xs rounded shadow-[2px_2px_0px_0px_#0D0D0D] shrink-0 uppercase">
                  {badgeText}
                </div>
                <h2 className="font-display font-black text-2xl text-neu-black truncate" id="modal-title">
                  {title}
                </h2>
              </div>

              {/* Close Button */}
              <button
                type="button"
                onClick={handleCollapseOrClose}
                aria-label="Tutup modal"
                className="w-8 h-8 flex items-center justify-center bg-neu-white border-2 border-neu-black rounded-full shadow-[2px_2px_0px_0px_#0D0D0D] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none transition-all shrink-0 cursor-pointer"
              >
                <span className="material-symbols-outlined text-neu-black text-sm font-bold">close</span>
              </button>
            </div>

            {/* Scrollable Body Content */}
            <div
              data-lenis-prevent="true"
              onWheel={(e) => e.stopPropagation()}
              className="p-6 md:p-8 overflow-y-auto overscroll-contain flex-1 space-y-6"
            >
              {desc ? (
                <div
                  className="space-y-4 text-on-surface-variant font-body text-sm leading-relaxed prose prose-sm max-w-none text-neu-black"
                  dangerouslySetInnerHTML={{ __html: desc }}
                />
              ) : (
                <div className="space-y-4 text-on-surface-variant font-body text-sm leading-relaxed">
                  <p className="font-bold text-neu-black text-base">Fitur Utama &amp; Lingkup Kerja:</p>
                  <ul className="list-disc pl-5 space-y-2 text-neu-black font-medium">
                    <li>Konsultasi Arsitektur Sistem End-to-End</li>
                    <li>Pengembangan Hardware &amp; Firmware Custom</li>
                    <li>Integrasi Cloud Dashboard &amp; Real-time Monitoring</li>
                    <li>Optimasi Performa &amp; Debugging Kode Kompleks</li>
                  </ul>
                  <p className="text-neu-black/90">
                    Kami menyediakan solusi teknologi terintegrasi yang dirancang khusus untuk kebutuhan bisnis maupun riset akademik Anda.
                  </p>
                </div>
              )}
            </div>

            {/* Footer Actions */}
            <div className="p-6 md:p-8 border-t-4 border-neu-black bg-surface-dim flex flex-col sm:flex-row gap-4 justify-end shrink-0">
              <button
                type="button"
                onClick={handleCollapseOrClose}
                className="px-6 py-3 bg-neu-white border-2 border-neu-black text-neu-black font-display font-bold text-sm rounded shadow-[2px_2px_0px_0px_#0D0D0D] hover:bg-surface-dim hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all w-full sm:w-auto text-center order-2 sm:order-1 cursor-pointer"
              >
                {isExpanded ? 'KEMBALI' : 'TUTUP'}
              </button>
              <button
                type="button"
                onClick={handleAction}
                className="px-6 py-3 bg-primary-container border-2 border-neu-black text-neu-black font-display font-black text-sm rounded shadow-[2px_2px_0px_0px_#0D0D0D] hover:bg-primary-fixed hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all w-full sm:w-auto text-center order-1 sm:order-2 cursor-pointer"
              >
                PELAJARI LEBIH LANJUT
              </button>
            </div>
          </div>
        </div>

        {/* ── MOBILE MODAL (Responsive, Full-Width Proportion, Clean Neubrutalist) ── */}
        <div
          data-lenis-prevent="true"
          className="flex md:hidden w-full max-w-[420px] bg-neu-white border-4 border-neu-black rounded-2xl shadow-[8px_8px_0px_0px_#0D0D0D] flex-col max-h-[85vh] overflow-hidden select-none"
        >
          {/* Section 1: Top Banner Image Poster */}
          <div className="relative w-full h-52 sm:h-56 shrink-0 border-b-4 border-neu-black overflow-hidden bg-surface-dim">
            {imageUrl ? (
              <img
                src={imageUrl}
                alt={title}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-primary-container">
                <span className="material-symbols-outlined text-6xl text-neu-black">
                  {banner.icon || 'campaign'}
                </span>
              </div>
            )}

            {/* Gradient Scrim Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-neu-black/90 via-neu-black/40 to-transparent pointer-events-none" />

            {/* Promo Badge */}
            <div className="absolute top-3.5 left-3.5 bg-secondary-container text-neu-white font-mono text-xs font-bold px-3 py-1 border-2 border-neu-black shadow-[2px_2px_0px_0px_#0D0D0D] rounded uppercase z-20">
              {badgeText}
            </div>

            {/* Close Button */}
            <button
              type="button"
              onClick={onClose}
              aria-label="Tutup modal"
              className="absolute top-3.5 right-3.5 w-9 h-9 flex items-center justify-center bg-neu-white border-2 border-neu-black rounded-full shadow-[2px_2px_0px_0px_#0D0D0D] hover:bg-secondary-container hover:text-neu-white transition-all cursor-pointer z-20"
            >
              <span className="material-symbols-outlined text-base font-bold text-neu-black">close</span>
            </button>

            {/* Banner Text on Poster */}
            <div className="absolute bottom-3.5 left-3.5 right-3.5 text-neu-white z-10">
              <h2 className="font-display font-black text-lg sm:text-xl mb-0.5 leading-tight line-clamp-2 drop-shadow-md">
                {title}
              </h2>
            </div>
          </div>

          {/* Section 2: Scrollable Content Body */}
          <div
            data-lenis-prevent="true"
            onWheel={(e) => e.stopPropagation()}
            onTouchMove={(e) => e.stopPropagation()}
            className="flex-1 overflow-y-auto overscroll-contain p-5 space-y-4 bg-neu-white text-neu-black"
          >
            {desc ? (
              <div
                className="font-body text-sm sm:text-base text-neu-black leading-relaxed prose prose-sm max-w-none"
                dangerouslySetInnerHTML={{ __html: desc }}
              />
            ) : (
              <p className="font-body text-sm sm:text-base text-neu-black leading-relaxed">
                Kami menyediakan solusi teknologi terintegrasi yang dirancang khusus untuk kebutuhan bisnis maupun riset akademik Anda dengan standar arsitektur modern.
              </p>
            )}
          </div>

          {/* Section 3: Action Buttons Footer */}
          <div className="p-4 sm:p-5 bg-surface-dim border-t-4 border-neu-black flex flex-col gap-2.5 shrink-0">
            <button
              type="button"
              onClick={handleAction}
              className="w-full bg-primary-container text-neu-black font-display font-black text-sm sm:text-base py-3.5 border-2 border-neu-black rounded-lg shadow-[2px_2px_0px_0px_#0D0D0D] hover:bg-primary-fixed active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all flex justify-center items-center gap-2 uppercase cursor-pointer"
            >
              <span>PELAJARI LEBIH LANJUT</span>
              <span className="material-symbols-outlined text-base font-bold">arrow_forward</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="w-full bg-neu-white text-neu-black font-display font-bold text-xs sm:text-sm py-2.5 border-2 border-neu-black rounded-lg shadow-[2px_2px_0px_0px_#0D0D0D] hover:bg-surface-dim active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all uppercase cursor-pointer"
            >
              TUTUP
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
