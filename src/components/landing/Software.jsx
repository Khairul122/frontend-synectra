import { useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useLang } from './hooks';
import { ErrorState } from './ErrorState';

const DEFAULT_SOFTWARE = [
  {
    id: 'sw-1',
    category: 'WEB APP',
    name: 'Sistem Koperasi Syariah',
    nameEn: 'Sharia Cooperative System',
    description: 'Sistem manajemen koperasi berbasis syariah dengan fitur simpan pinjam, pembiayaan, dan bagi hasil otomatis.',
    descriptionEn: 'Sharia-based cooperative management with automated profit sharing features.',
    price: 2500000,
  },
  {
    id: 'sw-2',
    category: 'WEB APP',
    name: 'Agro-Tani — Manajemen Toko...',
    nameEn: 'Agro-Tani — Agricultural Store Management',
    description: 'Sistem manajemen toko pertanian dengan POS kasir, manajemen stok produk, dan laporan harian.',
    descriptionEn: 'Agricultural inventory & cashier POS with integrated daily reporting.',
    price: 1500000,
  },
  {
    id: 'sw-3',
    category: 'WEB APP',
    name: 'Sistem Keuangan & Akuntansi',
    nameEn: 'Financial & Accounting System',
    description: 'Sistem akuntansi lengkap dengan pencatatan transaksi, arus kas, neraca keuangan standar akuntansi.',
    descriptionEn: 'Transaction recording & financial reporting compliant with accounting standards.',
    price: 2000000,
  },
  {
    id: 'sw-4',
    category: 'WEB APP',
    name: 'SIMONTANA — Sistem Informasi...',
    nameEn: 'SIMONTANA — Information System',
    description: 'Sistem informasi monitoring bencana hierarkis multi-region dengan integrasi data real-time.',
    descriptionEn: 'Hierarchical disaster monitoring system with real-time notifications.',
    price: 3000000,
  },
  {
    id: 'sw-5',
    category: 'WEB APP',
    name: 'E-Commerce Retail Pro',
    nameEn: 'E-Commerce Retail Pro',
    description: 'Platform toko online modern dengan payment gateway otomatis, ongkir real-time, dan inventory.',
    descriptionEn: 'Modern online store platform with automated payment gateway and real-time shipping calculation.',
    price: 3500000,
  },
  {
    id: 'sw-6',
    category: 'MOBILE APP',
    name: 'Attendance GPS Mobile',
    nameEn: 'Attendance GPS Mobile',
    description: 'Aplikasi absensi karyawan berbasis GPS & Face Detection dengan validasi radius lokasi.',
    descriptionEn: 'GPS and Face Detection based employee attendance mobile application.',
    price: 2800000,
  },
];

export function Software({ softwareProducts, isLoading, error, setActiveSoftware, navigateProtected }) {
  const { t } = useTranslation();
  const lang = useLang();
  const sliderRef = useRef(null);

  // Mouse Drag to Scroll State
  const [isDown, setIsDown] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeftState, setScrollLeftState] = useState(0);
  const [isDragged, setIsDragged] = useState(false);

  const displayList = (!isLoading && softwareProducts && softwareProducts.length > 0)
    ? softwareProducts
    : DEFAULT_SOFTWARE;

  const fmt = (val) => `Rp ${Number(val).toLocaleString('id-ID')}`;

  const handleMouseDown = (e) => {
    if (!sliderRef.current) return;
    setIsDown(true);
    setIsDragged(false);
    setStartX(e.pageX - sliderRef.current.offsetLeft);
    setScrollLeftState(sliderRef.current.scrollLeft);
  };

  const handleMouseLeave = () => {
    setIsDown(false);
  };

  const handleMouseUp = () => {
    setIsDown(false);
    // Allow small timeout so click events know if it was a drag
    setTimeout(() => setIsDragged(false), 50);
  };

  const handleMouseMove = (e) => {
    if (!isDown || !sliderRef.current) return;
    e.preventDefault();
    const x = e.pageX - sliderRef.current.offsetLeft;
    const walk = (x - startX) * 1.6; // Scroll speed multiplier
    if (Math.abs(walk) > 6) {
      setIsDragged(true);
    }
    sliderRef.current.scrollLeft = scrollLeftState - walk;
  };

  return (
    <section id="software" className="w-full bg-surface-dim py-16 md:py-20 px-4 md:px-8 border-b-4 border-neu-black overflow-hidden select-none">
      <div className="max-w-7xl mx-auto w-full">
        {/* Header Tag */}
        <div className="flex justify-center mb-10 md:mb-12">
          <div className="bg-neu-black text-neu-white font-mono text-base md:text-xl font-bold px-6 md:px-8 py-3 border-4 border-neu-black rounded-lg shadow-[8px_8px_0px_0px_#00C48C] transform rotate-1 uppercase tracking-wide">
            {t('landing.software.title', 'SOFTWARE')} // READY_TO_DEPLOY
          </div>
        </div>

        {error ? (
          <ErrorState message="Gagal memuat daftar software." />
        ) : (
          /* Interactive 1-Row Mouse Drag & Touch Slider without Left/Right Nav UI */
          <div
            ref={sliderRef}
            onMouseDown={handleMouseDown}
            onMouseLeave={handleMouseLeave}
            onMouseUp={handleMouseUp}
            onMouseMove={handleMouseMove}
            className={`flex flex-nowrap gap-6 md:gap-8 overflow-x-auto py-4 px-2 no-scrollbar scroll-smooth cursor-grab active:cursor-grabbing ${
              isDown ? 'cursor-grabbing' : 'cursor-grab'
            }`}
            style={{
              scrollbarWidth: 'none',
              msOverflowStyle: 'none',
              WebkitOverflowScrolling: 'touch',
            }}
          >
            {displayList.map((sw) => {
              const swName = lang(sw.name, sw.nameEn);
              const swDesc = lang(sw.description, sw.descriptionEn);
              const category = sw.category || 'WEB APP';

              return (
                <div
                  key={sw.id}
                  className="w-[280px] sm:w-[320px] md:w-[340px] shrink-0 bg-neu-white border-4 border-neu-black p-6 md:p-8 rounded-xl shadow-[8px_8px_0px_0px_#0D0D0D] hover:-translate-y-2 transition-transform flex flex-col justify-between select-none"
                >
                  <div>
                    <div className="bg-neu-purple text-neu-white border-4 border-neu-black px-3 py-1 rounded-md font-mono font-bold text-xs uppercase mb-6 self-start inline-block shadow-[2px_2px_0px_0px_#0D0D0D]">
                      {category}
                    </div>
                    <h4
                      title={swName}
                      className="font-display text-lg md:text-xl font-black mb-3 md:mb-4 uppercase text-neu-black break-words line-clamp-2"
                    >
                      {swName}
                    </h4>
                    <p
                      title={swDesc}
                      className="font-body text-sm md:text-base text-neu-black mb-6 flex-1 font-medium leading-relaxed break-words line-clamp-3"
                    >
                      {swDesc}
                    </p>
                  </div>

                  <div>
                    <div className="text-2xl md:text-3xl font-display font-black text-neu-black mb-6">
                      {fmt(sw.price)}
                    </div>
                    <button
                      onClick={(e) => {
                        if (isDragged) {
                          e.preventDefault();
                          return;
                        }
                        if (setActiveSoftware) setActiveSoftware(sw);
                        else navigateProtected('/my-software');
                      }}
                      className="w-full bg-primary-container text-neu-black font-display font-black text-sm md:text-base py-3.5 md:py-4 border-4 border-neu-black rounded-lg shadow-[4px_4px_0px_0px_#0D0D0D] btn-press cursor-pointer uppercase text-center"
                    >
                      {t('landing.software.demo', 'LIHAT DEMO')}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
