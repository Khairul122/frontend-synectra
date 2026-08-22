import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { useLang } from './hooks';
import { supaImg } from '../../utils/imageUrl';

const DEFAULT_BANNERS = [
  {
    id: 'b-1',
    title: 'Jasa Pembuatan Alat IoT & Android',
    titleEn: 'IoT & Android Hardware-Software Development',
    badge: '🚀 HARDWARE + SOFTWARE',
    badgeEn: '🚀 HARDWARE + SOFTWARE',
    theme: 'bg-primary-container text-neu-black',
    accentColor: '#FFD000',
    icon: 'memory',
    iconBg: 'bg-neu-white text-neu-black',
    btnTheme: 'bg-neu-black text-primary-container hover:bg-neu-white hover:text-neu-black',
    description: 'Solusi hardware & software terintegrasi untuk otomasi industri, smart home, dan proyek akademik dengan monitoring realtime.',
    descriptionEn: 'Integrated hardware & software solutions for industrial automation, smart homes, and academic projects with realtime monitoring.',
  },
  {
    id: 'b-2',
    title: 'Diskon 20% Paket Website & Company Profile',
    titleEn: '20% OFF Website & Company Profile Packages',
    badge: '🔥 PROMO SPESIAL',
    badgeEn: '🔥 SPECIAL DEAL',
    theme: 'bg-secondary-container text-neu-black',
    accentColor: '#FE5B5B',
    icon: 'local_offer',
    iconBg: 'bg-neu-white text-neu-black',
    btnTheme: 'bg-neu-black text-secondary-container hover:bg-neu-white hover:text-neu-black',
    description: 'Tingkatkan kredibilitas bisnis Anda dengan website modern berkecepatan tinggi, SEO-friendly, dan gratis domain + hosting.',
    descriptionEn: 'Boost your business credibility with modern high-speed, SEO-friendly websites including free domain and hosting.',
  },
  {
    id: 'b-3',
    title: 'Joki Skripsi & Tugas Akhir Fast Track',
    titleEn: 'Fast-Track Thesis & Academic Project Support',
    badge: '⚡ GARANSI HINGGA ACC',
    badgeEn: '⚡ 100% ACC GUARANTEE',
    theme: 'bg-neu-purple text-neu-white',
    accentColor: '#A855F7',
    icon: 'school',
    iconBg: 'bg-neu-white text-neu-black',
    btnTheme: 'bg-primary-container text-neu-black hover:bg-neu-white hover:text-neu-black',
    description: 'Pengerjaan kode bersih, laporan komprehensif, bimbingan privat via Google Meet/WA, dan garansi plagiasi rendah Turnitin.',
    descriptionEn: 'Clean code delivery, comprehensive documentation, private guidance via Meet/WA, and Turnitin-verified low similarity.',
  },
];

export function Banners({ banners, setBannerModal, setBannerModalExp }) {
  const { t } = useTranslation();
  const lang = useLang();
  const [currentIdx, setCurrentIdx] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const bannerList = (banners && banners.length > 0)
    ? banners.map((b, i) => ({
        id: b.id,
        title: lang(b.title, b.titleEn),
        titleEn: b.titleEn || b.title,
        badge: b.promoCode ? `KODE: ${b.promoCode}` : '🔥 ANNOUNCEMENT',
        badgeEn: b.promoCode ? `CODE: ${b.promoCode}` : '🔥 ANNOUNCEMENT',
        theme: ['bg-primary-container text-neu-black', 'bg-secondary-container text-neu-black', 'bg-neu-purple text-neu-white'][i % 3],
        icon: b.icon || 'campaign',
        iconBg: 'bg-neu-white text-neu-black',
        btnTheme: 'bg-neu-black text-primary-container hover:bg-neu-white hover:text-neu-black',
        image: b.image,
        description: b.description ? b.description.replace(/<[^>]*>/g, ' ') : 'Dapatkan penawaran istimewa dan update terbaru dari Synectra.',
        descriptionEn: b.descriptionEn || b.description,
        rawBanner: b,
      }))
    : DEFAULT_BANNERS;

  // Auto-slide every 6 seconds if not paused
  useEffect(() => {
    if (isPaused || bannerList.length <= 1) return;
    const timer = setInterval(() => {
      setCurrentIdx((prev) => (prev + 1) % bannerList.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [isPaused, bannerList.length]);

  const active = bannerList[currentIdx] || bannerList[0];

  const handlePrev = () => {
    setCurrentIdx((prev) => (prev - 1 + bannerList.length) % bannerList.length);
  };

  const handleNext = () => {
    setCurrentIdx((prev) => (prev + 1) % bannerList.length);
  };

  const handleOpenDetail = () => {
    if (active.rawBanner) {
      setBannerModal(active.rawBanner);
      setBannerModalExp(true);
    } else {
      const contactEl = document.getElementById('kontak');
      if (contactEl) contactEl.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section className="w-full bg-neu-white overflow-hidden border-b-4 border-neu-black select-none">
      <div
        className="w-full"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
      >
        <div className="w-full max-w-7xl mx-auto md:border-x-4 border-neu-black">
          <AnimatePresence mode="wait">
            <motion.div
              key={active.id || currentIdx}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.35, ease: 'easeOut' }}
              className={`${active.theme} p-6 sm:p-8 md:p-12 relative flex flex-col md:flex-row items-center gap-6 md:gap-10 min-h-[340px] md:min-h-[300px] transition-colors duration-500`}
            >
              {/* Left Visual Icon / Image Box */}
              <div className="relative shrink-0">
                {active.image ? (
                  <div className="w-24 h-24 sm:w-28 sm:h-28 md:w-32 md:h-32 bg-neu-white border-4 border-neu-black rounded-2xl overflow-hidden shadow-[6px_6px_0px_0px_#0D0D0D]">
                    <img
                      src={supaImg(active.image, { width: 300 })}
                      alt={active.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ) : (
                  <div className="w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28 bg-neu-white border-4 border-neu-black rounded-2xl flex items-center justify-center shadow-[6px_6px_0px_0px_#0D0D0D] transform -rotate-3 hover:rotate-0 transition-transform">
                    <span className="material-symbols-outlined text-4xl sm:text-5xl md:text-6xl text-neu-black font-black">
                      {active.icon}
                    </span>
                  </div>
                )}
                {/* Floating pill badge on icon */}
                <div className="absolute -bottom-2.5 -right-2 bg-neu-black text-neu-white border-2 border-neu-black px-2 py-0.5 rounded-md font-mono text-[10px] md:text-xs font-black tracking-wider uppercase shadow-[3px_3px_0px_0px_#FAFAFA] max-w-[150px] truncate">
                  {active.badge}
                </div>
              </div>

              {/* Center Content with Line Clamping & Overflow Safety */}
              <div className="flex-1 min-w-0 text-center md:text-left z-10">
                <div className="bg-neu-black text-neu-white font-mono text-xs md:text-sm font-bold px-3.5 py-1.5 border-4 border-neu-black rounded-lg shadow-[4px_4px_0px_0px_#FAFAFA] inline-block mb-3 uppercase transform -rotate-1">
                  {t('landing.banner.title', 'ANNOUNCEMENTS')} // RECENT_UPDATES
                </div>

                <h3
                  title={active.title}
                  className="font-display text-xl sm:text-2xl md:text-3xl lg:text-4xl font-black uppercase tracking-tight mb-2 md:mb-3 leading-tight break-words line-clamp-2"
                >
                  {active.title}
                </h3>

                <p
                  title={active.description}
                  className="font-body font-bold mb-5 md:mb-6 text-sm sm:text-base md:text-lg leading-relaxed opacity-95 max-w-3xl break-words line-clamp-2 sm:line-clamp-3"
                >
                  {active.description}
                </p>

                <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 md:gap-4">
                  <button
                    onClick={handleOpenDetail}
                    className={`${active.btnTheme} font-display font-black text-sm md:text-base px-6 md:px-8 py-3 md:py-3.5 border-4 border-neu-black shadow-[4px_4px_0px_0px_#0D0D0D] hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all uppercase rounded-xl btn-press cursor-pointer flex items-center gap-2`}
                  >
                    <span>{t('landing.banner.consultNow', 'Konsultasi Sekarang')}</span>
                    <span className="material-symbols-outlined text-lg font-bold">arrow_forward</span>
                  </button>

                  <button
                    onClick={() => {
                      const pkgEl = document.getElementById('paket');
                      if (pkgEl) pkgEl.scrollIntoView({ behavior: 'smooth' });
                    }}
                    className="bg-neu-white text-neu-black font-display font-black text-xs md:text-sm px-5 md:px-6 py-3 md:py-3.5 border-4 border-neu-black shadow-[4px_4px_0px_0px_#0D0D0D] hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all uppercase rounded-xl btn-press cursor-pointer"
                  >
                    {t('landing.packages.tag', 'LIHAT PAKET')}
                  </button>
                </div>
              </div>

              {/* Slider Controls (Arrow Buttons & Dots) */}
              {bannerList.length > 1 && (
                <div className="flex flex-col items-center md:items-end gap-2.5 z-10 shrink-0">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={handlePrev}
                      aria-label="Previous banner"
                      className="w-9 h-9 md:w-11 md:h-11 bg-neu-white text-neu-black border-4 border-neu-black rounded-lg flex items-center justify-center shadow-[3px_3px_0px_0px_#0D0D0D] hover:bg-primary-container transition-all active:translate-x-0.5 active:translate-y-0.5 cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-xl md:text-2xl font-bold">arrow_back</span>
                    </button>
                    <button
                      onClick={handleNext}
                      aria-label="Next banner"
                      className="w-9 h-9 md:w-11 md:h-11 bg-neu-white text-neu-black border-4 border-neu-black rounded-lg flex items-center justify-center shadow-[3px_3px_0px_0px_#0D0D0D] hover:bg-primary-container transition-all active:translate-x-0.5 active:translate-y-0.5 cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-xl md:text-2xl font-bold">arrow_forward</span>
                    </button>
                  </div>

                  {/* Indicator dots */}
                  <div className="flex gap-1.5 mt-1">
                    {bannerList.map((_, dotIdx) => (
                      <button
                        key={dotIdx}
                        onClick={() => setCurrentIdx(dotIdx)}
                        aria-label={`Slide ${dotIdx + 1}`}
                        className={`h-2.5 rounded-full border-2 border-neu-black transition-all cursor-pointer ${
                          dotIdx === currentIdx
                            ? 'w-7 bg-neu-black'
                            : 'w-2.5 bg-neu-white hover:bg-neu-white/80'
                        }`}
                      />
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}
