import { useLang } from './hooks';

// Toast promo kecil di pojok - sengaja TANPA <img> sama sekali supaya tidak
// pernah jadi kandidat LCP (masalah sebelumnya: popup besar otomatis muncul
// begitu load, selalu "menang" jadi elemen tercat terbesar). Gambar penuh
// cuma dimuat kalau user klik "Lihat Detail", lewat BannerDetailModal.
export function BannerToast({ banner, onViewDetail, onClose }) {
  const lang = useLang();
  if (!banner) return null;

  const title = lang(banner.title, banner.titleEn) || banner.title || 'Info Promo';
  const badgeText = banner.promoCode ? `KODE: ${banner.promoCode}` : (banner.badge || 'PROMO');

  return (
    <div
      role="status"
      className="fixed z-40 bottom-4 left-4 right-4 md:left-auto md:right-6 md:bottom-6 md:w-[340px] bg-neu-white border-2 border-neu-black rounded-xl shadow-[6px_6px_0px_0px_#0D0D0D] p-4 flex items-start gap-3"
    >
      <div className="flex-1 min-w-0">
        <span className="inline-block bg-secondary-container text-neu-white font-mono text-[10px] font-bold px-2 py-0.5 border border-neu-black rounded uppercase mb-1.5">
          {badgeText}
        </span>
        <h3 className="font-display font-black text-sm text-neu-black leading-snug line-clamp-2 mb-2">
          {title}
        </h3>
        <button
          type="button"
          onClick={onViewDetail}
          className="text-xs font-display font-bold text-neu-black underline decoration-2 underline-offset-2 hover:decoration-secondary-container cursor-pointer"
        >
          Lihat Detail →
        </button>
      </div>
      <button
        type="button"
        onClick={onClose}
        aria-label="Tutup"
        className="shrink-0 w-7 h-7 flex items-center justify-center bg-neu-white border-2 border-neu-black rounded-full shadow-[2px_2px_0px_0px_#0D0D0D] hover:bg-surface-dim transition-all cursor-pointer"
      >
        <span className="text-neu-black text-xs font-bold leading-none">×</span>
      </button>
    </div>
  );
}
