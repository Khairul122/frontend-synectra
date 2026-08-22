import { useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { PackageCard } from './PackageCard';
import { ErrorState } from './ErrorState';

const DEFAULT_PACKAGES = [
  {
    id: 'pkg-1',
    _idx: 1,
    name: 'Landing Page',
    nameEn: 'Landing Page',
    category: 'WEB',
    price: 1000000,
    duration: '5-7 Hari',
    durationEn: '5-7 Days',
    description: 'Landing page profesional untuk promosi produk atau bisnis kamu. Desain modern, responsif, dan dioptimalkan untuk konversi.',
    descriptionEn: 'Professional landing page to promote your product or business. Modern, responsive, and conversion-optimized design.',
    features: [
      'Desain custom neubrutalism',
      'Responsif mobile & desktop',
      '3 halaman penuh',
      'Formulir kontak terintegrasi',
      'Optimasi SEO dasar',
    ],
  },
  {
    id: 'pkg-2',
    _idx: 2,
    badge: 'TERLARIS',
    name: 'Company Profile',
    nameEn: 'Company Profile',
    category: 'WEB',
    price: 1700000,
    duration: '10-14 Hari',
    durationEn: '10-14 Days',
    description: 'Website company profile lengkap untuk membangun kepercayaan dan branding bisnis kamu secara profesional.',
    descriptionEn: 'Complete company profile website to build trust and brand your business professionally.',
    features: [
      'Desain custom (min. 5 hal)',
      'Halaman: Home, About, etc.',
      'Responsif mobile & desktop',
      'CMS sederhana untuk update',
      'Optimasi SEO on-page',
    ],
  },
  {
    id: 'pkg-3',
    _idx: 3,
    name: 'Aplikasi Mobile',
    nameEn: 'Mobile App',
    category: 'MOBILE',
    price: 3500000,
    duration: '21-30 Hari',
    durationEn: '21-30 Days',
    description: 'Aplikasi mobile Android/iOS untuk kebutuhan bisnis atau personal. Dari konsep hingga siap publish.',
    descriptionEn: 'Android/iOS mobile application for business or personal needs. From concept to publish-ready.',
    features: [
      'Android & iOS (React Native)',
      'Desain UI/UX custom',
      'Autentikasi pengguna',
      'Integrasi REST API backend',
      'Push notification',
    ],
  },
  {
    id: 'pkg-4',
    _idx: 4,
    badge: 'POPULER',
    name: 'Joki Tugas Akhir',
    nameEn: 'Academic Project / Thesis',
    category: 'TUGAS',
    price: 750000,
    duration: 'Kesepakatan',
    durationEn: 'By Agreement',
    description: 'Bantuan pengerjaan skripsi, thesis, laporan PKL. Dikerjakan oleh tim berpengalaman, tepat waktu, dan terjamin.',
    descriptionEn: 'Assistance for thesis, final project, and internship reports. Delivered by experienced team, on time and guaranteed.',
    features: [
      'Skripsi / Laporan PKL / TA',
      'Semua jurusan',
      'Plagiarisme < 20% (Turnitin)',
      'Bimbingan via WhatsApp',
      'Revisi hingga ACC',
    ],
  },
  {
    id: 'pkg-5',
    _idx: 5,
    name: 'Sistem ERP / POS Custom',
    nameEn: 'Custom ERP / POS System',
    category: 'ENTERPRISE',
    price: 5000000,
    duration: '30-45 Hari',
    durationEn: '30-45 Days',
    description: 'Solusi sistem informasi enterprise terintegrasi manajemen stok, multi-cabang, laporan akuntansi, dan role pengguna.',
    descriptionEn: 'Integrated enterprise system with inventory, multi-branch, accounting reports, and role access.',
    features: [
      'Manajemen multi-cabang & user',
      'Laporan keuangan & invoice PDF',
      'Real-time inventory database',
      'Pelatihan tim & garansi support',
      'Deployment VPS & SSL',
    ],
  },
];

export function Packages({ packages, isLoading, error, navigateProtected }) {
  const { t } = useTranslation();
  const sliderRef = useRef(null);

  // Mouse Drag to Scroll State
  const [isDown, setIsDown] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeftState, setScrollLeftState] = useState(0);
  const [isDragged, setIsDragged] = useState(false);

  const displayList = (!isLoading && packages && packages.length > 0)
    ? packages.map((pkg, i) => ({
        ...pkg,
        _idx: i + 1,
      }))
    : DEFAULT_PACKAGES;

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
    setTimeout(() => setIsDragged(false), 50);
  };

  const handleMouseMove = (e) => {
    if (!isDown || !sliderRef.current) return;
    e.preventDefault();
    const x = e.pageX - sliderRef.current.offsetLeft;
    const walk = (x - startX) * 1.6;
    if (Math.abs(walk) > 6) {
      setIsDragged(true);
    }
    sliderRef.current.scrollLeft = scrollLeftState - walk;
  };

  const handleOrder = (pkg) => {
    if (isDragged) return;
    navigateProtected('/my-orders/new');
  };

  return (
    <section id="paket" className="w-full bg-primary-container py-16 md:py-20 px-4 md:px-8 border-b-4 border-neu-black overflow-hidden select-none">
      <div className="max-w-7xl mx-auto w-full">
        {/* Section Header */}
        <div className="flex justify-center mb-10 md:mb-14">
          <div className="bg-neu-black text-neu-white font-mono text-base md:text-xl font-bold px-6 md:px-8 py-3 border-4 border-neu-black rounded-lg shadow-[8px_8px_0px_0px_#FAFAFA] transform -rotate-1 uppercase tracking-wide">
            {t('landing.packages.tag', 'PACKAGES')} // TIERS_AND_PRICING
          </div>
        </div>

        {error ? (
          <ErrorState message="Gagal memuat daftar paket layanan." />
        ) : (
          /* Interactive 1-Row Mouse Drag & Touch Slider without Left/Right Navigation UI */
          <div
            ref={sliderRef}
            onMouseDown={handleMouseDown}
            onMouseLeave={handleMouseLeave}
            onMouseUp={handleMouseUp}
            onMouseMove={handleMouseMove}
            className={`flex flex-nowrap gap-6 md:gap-8 overflow-x-auto py-6 px-2 no-scrollbar scroll-smooth ${
              isDown ? 'cursor-grabbing' : 'cursor-grab'
            }`}
            style={{
              scrollbarWidth: 'none',
              msOverflowStyle: 'none',
              WebkitOverflowScrolling: 'touch',
            }}
          >
            {displayList.map((pkg) => (
              <div
                key={pkg.id}
                className="w-[290px] sm:w-[320px] md:w-[350px] shrink-0 flex flex-col"
              >
                <PackageCard
                  pkg={pkg}
                  onOrder={() => handleOrder(pkg)}
                />
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
