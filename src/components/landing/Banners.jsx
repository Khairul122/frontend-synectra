import { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useLang } from './hooks';
import { supaImg } from '../../utils/imageUrl';

const THEME_PRESETS = [
  {
    badge: 'NEW',
    badgeBg: 'bg-neu-green text-neu-black rotate-2',
    icon: 'memory',
    leftBg: 'bg-surface-dim',
    rightBg: 'bg-primary-container text-neu-black',
    titleColor: 'text-neu-black',
    descColor: 'text-neu-black',
    btnText: 'Detail',
    btnStyle: 'bg-neu-black text-primary-container shadow-[6px_6px_0px_0px_#FAFAFA] hover:shadow-none hover:translate-x-1 hover:translate-y-1',
    boxRotation: '-rotate-2',
  },
  {
    badge: 'PROMO',
    badgeBg: 'bg-secondary-container text-neu-black -rotate-2',
    icon: 'campaign',
    leftBg: 'bg-neu-purple',
    rightBg: 'bg-primary-container text-neu-black',
    titleColor: 'text-neu-white',
    descColor: 'text-neu-white',
    btnText: 'KLAIM PROMO',
    btnStyle: 'bg-neu-white text-neu-black shadow-[6px_6px_0px_0px_#0D0D0D] hover:shadow-none hover:translate-x-1 hover:translate-y-1',
    boxRotation: 'rotate-2',
  },
  {
    badge: 'UPDATE',
    badgeBg: 'bg-neu-white text-neu-black rotate-3',
    icon: 'update',
    leftBg: 'bg-neu-green',
    rightBg: 'bg-primary-container text-neu-black',
    titleColor: 'text-neu-black',
    descColor: 'text-neu-black',
    btnText: 'PELAJARI LEBIH LANJUT',
    btnStyle: 'bg-neu-black text-primary-container shadow-[6px_6px_0px_0px_#FAFAFA] hover:shadow-none hover:translate-x-1 hover:translate-y-1',
    boxRotation: '-rotate-1',
  },
  {
    badge: 'SPECIAL',
    badgeBg: 'bg-primary-container text-neu-black -rotate-1',
    icon: 'star',
    leftBg: 'bg-secondary-container',
    rightBg: 'bg-primary-container text-neu-black',
    titleColor: 'text-neu-black',
    descColor: 'text-neu-black',
    btnText: 'KONSULTASI SEKARANG',
    btnStyle: 'bg-neu-white text-neu-black shadow-[6px_6px_0px_0px_#0D0D0D] hover:shadow-none hover:translate-x-1 hover:translate-y-1',
    boxRotation: 'rotate-1',
  },
  {
    badge: 'FEATURED',
    badgeBg: 'bg-neu-purple text-neu-white rotate-2',
    icon: 'bolt',
    leftBg: 'bg-surface-dim',
    rightBg: 'bg-primary-container text-neu-black',
    titleColor: 'text-neu-black',
    descColor: 'text-neu-black',
    btnText: 'LIHAT DETAIL',
    btnStyle: 'bg-neu-black text-primary-container shadow-[6px_6px_0px_0px_#FAFAFA] hover:shadow-none hover:translate-x-1 hover:translate-y-1',
    boxRotation: '-rotate-2',
  },
];

const DEFAULT_BANNERS = [
  {
    id: 'banner-1',
    badge: 'NEW',
    title: 'Jasa Pembuatan Alat IoT & Android',
    titleEn: 'IoT & Android Hardware-Software Development',
    desc: 'Solusi hardware & software terintegrasi untuk otomasi industri dan personal.',
    descEn: 'Integrated hardware & software solutions for industrial automation and personal use.',
    btnText: 'Detail',
  },
  {
    id: 'banner-2',
    badge: 'PROMO',
    title: 'Diskon 20% Website Company Profile',
    titleEn: '20% OFF Company Profile Website',
    desc: 'Bangun citra profesional bisnismu bulan ini dengan harga spesial. Terbatas!',
    descEn: 'Build your professional business brand this month with special discount. Limited offer!',
    btnText: 'KLAIM PROMO',
  },
  {
    id: 'banner-3',
    badge: 'UPDATE',
    title: 'Layanan Maintenance 24/7',
    titleEn: '24/7 Maintenance Service',
    desc: 'Kini Synectra menyediakan dukungan penuh untuk menjaga sistem Anda tetap optimal tanpa henti.',
    descEn: 'Synectra now provides 24/7 full maintenance support to keep your systems running smoothly.',
    btnText: 'PELAJARI LEBIH LANJUT',
  },
];

export function Banners({ banners, onOpenModal }) {
  const { t } = useTranslation();
  const lang = useLang();
  const [currentIdx, setCurrentIdx] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const touchStartX = useRef(0);
  const touchEndX = useRef(0);

  // Dynamically map any number of banners (1 to N) with rotating theme presets
  const bannerList = (banners && banners.length > 0)
    ? banners.map((b, i) => {
        const theme = THEME_PRESETS[i % THEME_PRESETS.length];
        return {
          id: b.id || `banner-${i}`,
          badge: b.promoCode ? `KODE: ${b.promoCode}` : (b.badge || theme.badge),
          badgeBg: theme.badgeBg,
          icon: b.icon || theme.icon,
          image: b.image,
          leftBg: theme.leftBg,
          rightBg: theme.rightBg,
          title: lang(b.title, b.titleEn) || 'PENGUMUMAN TERBARU',
          titleColor: theme.titleColor,
          desc: b.description
            ? b.description.replace(/<[^>]*>/g, ' ').replace(/&nbsp;/g, ' ').trim()
            : (lang(b.title, b.titleEn) ? `Informasi promo dan pengumuman terbaru mengenai ${lang(b.title, b.titleEn)}.` : 'Solusi digital terintegrasi untuk kebutuhan bisnis dan akademik Anda.'),
          descColor: theme.descColor,
          btnText: theme.btnText,
          btnStyle: theme.btnStyle,
          boxRotation: theme.boxRotation,
          rawBanner: b,
        };
      })
    : DEFAULT_BANNERS.map((b, i) => {
        const theme = THEME_PRESETS[i % THEME_PRESETS.length];
        return {
          ...b,
          ...theme,
          title: lang(b.title, b.titleEn),
          desc: lang(b.desc, b.descEn),
          btnText: b.btnText || theme.btnText,
        };
      });

  const totalBanners = bannerList.length;

  // Auto-slide every 6s if not hovered and there are 2 or more banners
  useEffect(() => {
    if (isPaused || totalBanners <= 1) return;
    const timer = setInterval(() => {
      setCurrentIdx((prev) => (prev + 1) % totalBanners);
    }, 6000);
    return () => clearInterval(timer);
  }, [isPaused, totalBanners]);

  const handleNext = () => {
    setCurrentIdx((prev) => (prev + 1) % totalBanners);
  };

  const handlePrev = () => {
    setCurrentIdx((prev) => (prev - 1 + totalBanners) % totalBanners);
  };

  // Touch Swipe handlers
  const handleTouchStart = (e) => {
    touchStartX.current = e.targetTouches[0].clientX;
  };

  const handleTouchMove = (e) => {
    touchEndX.current = e.targetTouches[0].clientX;
  };

  const handleTouchEnd = () => {
    if (!touchStartX.current || !touchEndX.current) return;
    const diff = touchStartX.current - touchEndX.current;
    if (diff > 50) handleNext(); // swipe left -> next
    if (diff < -50) handlePrev(); // swipe right -> prev
    touchStartX.current = 0;
    touchEndX.current = 0;
  };

  const handleButtonClick = (item) => {
    if (onOpenModal) {
      onOpenModal(item.rawBanner || item);
    } else {
      const el = document.getElementById('kontak');
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section className="w-full bg-neu-white py-14 md:py-20 px-4 md:px-8 border-b-4 border-neu-black relative select-none">
      <div
        className="max-w-7xl mx-auto w-full relative"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {/* Header Row */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 mb-6 md:mb-8">
          <div className="bg-neu-black text-neu-white font-mono text-base md:text-xl font-bold px-6 md:px-8 py-3 border-4 border-neu-black rounded-lg shadow-[8px_8px_0px_0px_#FFD000] transform -rotate-1 uppercase tracking-wide">
            {t('landing.banner.title', 'ANNOUNCEMENTS')} // RECENT_UPDATES
          </div>

          {/* Desktop Controls (Slide Counter & Navigation Buttons) */}
          {totalBanners > 1 && (
            <div className="hidden md:flex items-center gap-4">
              {/* Numerical Slide Counter */}
              <div className="bg-surface-dim text-neu-black border-2 border-neu-black px-3.5 py-1.5 rounded-md font-mono text-xs font-black shadow-[2px_2px_0px_0px_#0D0D0D]">
                {String(currentIdx + 1).padStart(2, '0')} / {String(totalBanners).padStart(2, '0')}
              </div>

              {/* Indicator dots (auto wrapped if > 6) */}
              <div className="flex items-center gap-1.5 max-w-[200px] overflow-hidden">
                {bannerList.map((_, dotIdx) => (
                  <button
                    key={dotIdx}
                    onClick={() => setCurrentIdx(dotIdx)}
                    aria-label={`Slide ${dotIdx + 1}`}
                    className={`h-2.5 rounded-full border-2 border-neu-black transition-all cursor-pointer ${
                      dotIdx === currentIdx
                        ? 'w-6 bg-neu-black'
                        : 'w-2.5 bg-neu-white hover:bg-neu-white/80'
                    }`}
                  />
                ))}
              </div>

              <div className="flex gap-2">
                <button
                  onClick={handlePrev}
                  aria-label="Previous banner"
                  className="w-11 h-11 bg-neu-white border-4 border-neu-black flex items-center justify-center shadow-[4px_4px_0px_0px_#0D0D0D] hover:shadow-[2px_2px_0px_0px_#0D0D0D] hover:translate-x-[2px] hover:translate-y-[2px] transition-all rounded-lg btn-press cursor-pointer"
                >
                  <span className="material-symbols-outlined font-black text-2xl">arrow_back</span>
                </button>
                <button
                  onClick={handleNext}
                  aria-label="Next banner"
                  className="w-11 h-11 bg-neu-white border-4 border-neu-black flex items-center justify-center shadow-[4px_4px_0px_0px_#0D0D0D] hover:shadow-[2px_2px_0px_0px_#0D0D0D] hover:translate-x-[2px] hover:translate-y-[2px] transition-all rounded-lg btn-press cursor-pointer"
                >
                  <span className="material-symbols-outlined font-black text-2xl">arrow_forward</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Carousel Container (Calculated dynamically for N slides) */}
        <div className="overflow-hidden border-4 border-neu-black rounded-xl shadow-[12px_12px_0px_0px_#0D0D0D] bg-primary-container relative">
          <div
            className="flex transition-transform duration-500 ease-in-out"
            style={{
              width: `${totalBanners * 100}%`,
              transform: `translateX(-${(currentIdx * 100) / totalBanners}%)`,
            }}
          >
            {bannerList.map((banner, index) => (
              <div
                key={banner.id || index}
                style={{ width: `${100 / totalBanners}%` }}
                className="flex flex-col md:flex-row shrink-0 items-stretch"
              >
                {/* Left Graphic / Image Box (clickable to open modal) */}
                <div
                  onClick={() => handleButtonClick(banner)}
                  className={`w-full md:w-2/5 p-6 sm:p-8 md:p-10 border-b-4 md:border-b-0 md:border-r-4 border-neu-black ${banner.leftBg} flex items-center justify-center cursor-pointer group`}
                  title="Klik untuk lihat detail"
                >
                  <div
                    className={`w-full max-w-[280px] sm:max-w-[340px] md:max-w-[380px] h-48 sm:h-56 md:h-64 border-4 border-neu-black bg-neu-white rounded-xl shadow-[6px_6px_0px_0px_#0D0D0D] flex items-center justify-center transform ${banner.boxRotation} group-hover:scale-105 transition-transform duration-300 overflow-hidden relative`}
                  >
                    {banner.image ? (
                      <img
                        src={supaImg(banner.image, { width: 800 })}
                        alt={banner.title}
                        className="w-full h-full object-cover object-center"
                      />
                    ) : (
                      <span className="material-symbols-outlined text-6xl md:text-7xl text-neu-black opacity-50">
                        {banner.icon}
                      </span>
                    )}
                  </div>
                </div>

                {/* Right Content Box */}
                <div className="w-full md:w-3/5 p-6 sm:p-8 md:p-12 flex flex-col justify-center items-start">
                  <span
                    className={`${banner.badgeBg} border-4 border-neu-black px-3.5 py-1.5 rounded-md font-mono font-black text-xs uppercase mb-3 md:mb-4 shadow-[4px_4px_0px_0px_#0D0D0D]`}
                  >
                    {banner.badge}
                  </span>

                  <h3
                    onClick={() => handleButtonClick(banner)}
                    className={`font-display text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black uppercase tracking-tighter mb-3 md:mb-4 leading-tight break-words max-w-2xl cursor-pointer hover:underline ${banner.titleColor}`}
                  >
                    {banner.title}
                  </h3>

                  {/* 2-line description snippet */}
                  {banner.desc && (
                    <p
                      title={banner.desc}
                      className={`font-body font-bold mb-6 md:mb-8 text-sm sm:text-base md:text-lg opacity-90 leading-relaxed max-w-2xl break-words line-clamp-2 ${banner.descColor}`}
                    >
                      {banner.desc}
                    </p>
                  )}

                  <button
                    onClick={() => handleButtonClick(banner)}
                    className={`font-display font-black text-base md:text-lg px-8 py-4 border-4 border-neu-black rounded-lg transition-all uppercase btn-press cursor-pointer ${banner.btnStyle}`}
                  >
                    {banner.btnText}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Mobile Controls (Counter + Navigation Buttons) */}
        {totalBanners > 1 && (
          <div className="flex md:hidden justify-between items-center gap-4 mt-6">
            <div className="bg-surface-dim text-neu-black border-2 border-neu-black px-3 py-1 rounded-md font-mono text-xs font-black shadow-[2px_2px_0px_0px_#0D0D0D]">
              {String(currentIdx + 1).padStart(2, '0')} / {String(totalBanners).padStart(2, '0')}
            </div>

            <div className="flex gap-3">
              <button
                onClick={handlePrev}
                aria-label="Previous banner"
                className="w-11 h-11 bg-neu-white border-4 border-neu-black flex items-center justify-center shadow-[4px_4px_0px_0px_#0D0D0D] hover:shadow-[2px_2px_0px_0px_#0D0D0D] hover:translate-x-[2px] hover:translate-y-[2px] transition-all rounded-lg btn-press cursor-pointer"
              >
                <span className="material-symbols-outlined font-black text-2xl">arrow_back</span>
              </button>
              <button
                onClick={handleNext}
                aria-label="Next banner"
                className="w-11 h-11 bg-neu-white border-4 border-neu-black flex items-center justify-center shadow-[4px_4px_0px_0px_#0D0D0D] hover:shadow-[2px_2px_0px_0px_#0D0D0D] hover:translate-x-[2px] hover:translate-y-[2px] transition-all rounded-lg btn-press cursor-pointer"
              >
                <span className="material-symbols-outlined font-black text-2xl">arrow_forward</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
