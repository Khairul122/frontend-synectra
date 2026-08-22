import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { useTranslation } from 'react-i18next';
import { useScroll, useSpring } from 'framer-motion';
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogTitle } from '../components/ui/dialog';
import { gsap } from 'gsap';
import axios from 'axios';
import { cn } from '../utils/cn';
import { API_BASE_URL } from '../constants/api';
import { useIsDesktop } from '../hooks/useIsDesktop';
import { supaImg } from '../utils/imageUrl';

import { useLenis, usePageTransition } from '../components/landing/hooks';
import { PortfolioModal } from '../components/landing/PortfolioModal';
import { SoftwareDetailModal } from '../components/landing/SoftwareDetailModal';
import { FeedbackSection } from '../components/landing/FeedbackSection';
import { Navbar } from '../components/landing/Navbar';
import { Hero } from '../components/landing/Hero';
import { TechMarquee } from '../components/landing/TechMarquee';
import { Stats } from '../components/landing/Stats';
import { Services } from '../components/landing/Services';
import { About } from '../components/landing/About';
import { Packages } from '../components/landing/Packages';
import { Banners } from '../components/landing/Banners';
import { Software } from '../components/landing/Software';
import { Portfolio } from '../components/landing/Portfolio';
import { WhyChooseUs } from '../components/landing/WhyChooseUs';
import { HowItWorks } from '../components/landing/HowItWorks';
import { Contact } from '../components/landing/Contact';
import { CTAFinal } from '../components/landing/CTAFinal';
import { Footer } from '../components/landing/Footer';
import { FloatingCTA } from '../components/landing/FloatingCTA';

const BASE = API_BASE_URL || '';

export default function LandingPage() {
  const isDesktop = useIsDesktop();
  useLenis(isDesktop);
  const { t } = useTranslation();

  // Smooth scroll progress hook
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 100, damping: 30, restDelta: 0.001 });

  // Slider programmatic scroller
  const scrollSlider = (ref, direction) => {
    if (ref.current) {
      const amt = 320;
      ref.current.scrollBy({
        left: direction === 'left' ? -amt : amt,
        behavior: 'smooth'
      });
    }
  };
  const { pageRef, transitionTo } = usePageTransition();
  const [portfolios,        setPortfolios]        = useState([]);
  const [services,          setServices]          = useState([]);
  const [packages,          setPackages]          = useState([]);
  const [softwareProducts,  setSoftwareProducts]  = useState([]);
  const [feedbacks,         setFeedbacks]         = useState([]);
  const [banners,           setBanners]           = useState([]);
  const [contacts,     setContacts]     = useState([]);
  const [socialMedia,  setSocialMedia]  = useState([]);
  const [bankAccounts, setBankAccounts] = useState([]);
  const [isLoading,    setIsLoading]    = useState(true);
  const [errors,       setErrors]       = useState({}); // { [resource]: true } untuk yang gagal fetch
  const [activePortfolio, setActivePortfolio] = useState(null);
  const [activeSoftware,  setActiveSoftware]  = useState(null);
  const [menuOpen,      setMenuOpen]      = useState(false);
  const [toast,         setToast]         = useState(null); // { msg, type }
  const [activeSection, setActiveSection] = useState('');
  const [showScrollTop, setShowScrollTop] = useState(false);

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };
  const [bannerAd,       setBannerAd]       = useState(null);  // banner popup iklan awal
  const [bannerExpanded, setBannerExpanded] = useState(false); // state split screen
  const [bannerModal,    setBannerModal]    = useState(null);  // modal dari section banners
  const [bannerModalExp, setBannerModalExp] = useState(false); // expand split screen
  const portfolioRef  = useRef(null);
  const pkgSliderRef  = useRef(null);
  const pkgDrag       = useRef({ active: false, startX: 0, scrollLeft: 0 });
  const swSliderRef   = useRef(null);
  const swDrag        = useRef({ active: false, startX: 0, scrollLeft: 0 });

  useEffect(() => {
    // Setiap resource dilacak sukses/gagalnya sendiri-sendiri (bukan digenapkan
    // jadi array kosong secara diam-diam) supaya tiap section bisa membedakan
    // "memang belum ada data" vs "API gagal dihubungi".
    const resources = [
      ['portfolios',       `${BASE}/api/portfolio`],
      ['services',         `${BASE}/api/services/public`],
      ['banners',          `${BASE}/api/banners`],
      ['contacts',         `${BASE}/api/contacts`],
      ['socialMedia',      `${BASE}/api/social-media`],
      ['bankAccounts',     `${BASE}/api/bank-accounts`],
      ['packages',         `${BASE}/api/service-packages/public`],
      ['softwareProducts', `${BASE}/api/software-products/public`],
      ['feedbacks',        `${BASE}/api/feedbacks/public`],
    ];

    Promise.allSettled(resources.map(([, url]) => axios.get(url))).then((results) => {
      const data = {};
      const nextErrors = {};
      results.forEach((result, i) => {
        const [key] = resources[i];
        if (result.status === 'fulfilled') {
          data[key] = result.value.data?.data ?? [];
        } else {
          data[key] = [];
          nextErrors[key] = true;
        }
      });

      setPortfolios(data.portfolios);
      setServices(data.services);
      const activeBanners = data.banners.filter(x => x.isActive);
      setBanners(activeBanners);
      if (activeBanners.length > 0) setBannerAd(activeBanners[0]); // tampilkan banner pertama sebagai popup
      setContacts(data.contacts.filter(x => x.isActive));
      setSocialMedia(data.socialMedia.filter(x => x.isActive));
      setBankAccounts(data.bankAccounts.filter(x => x.isActive));
      setPackages(data.packages);
      setSoftwareProducts(data.softwareProducts);
      setFeedbacks(data.feedbacks);
      setErrors(nextErrors);
    }).finally(() => setIsLoading(false));
  }, []);

  // Navigasi ke halaman protected — cek token dulu, kalau tidak ada langsung ke /login
  const navigateProtected = (path) => {
    const token = localStorage.getItem('synectra_token');
    transitionTo(token ? path : '/login');
  };

  // Active section highlight via IntersectionObserver
  useEffect(() => {
    const ids = ['layanan', 'paket', 'software', 'portofolio', 'cara-kerja', 'ulasan', 'kontak'];
    const observer = new IntersectionObserver(
      entries => {
        entries.forEach(e => { if (e.isIntersecting) setActiveSection(e.target.id); });
      },
      { rootMargin: '-40% 0px -55% 0px', threshold: 0 },
    );
    ids.forEach(id => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, []);

  // Show/hide scroll-to-top button
  useEffect(() => {
    const onScroll = () => setShowScrollTop(window.scrollY > 300);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Close mobile menu on Escape key
  useEffect(() => {
    if (!menuOpen) return;
    const handler = (e) => { if (e.key === 'Escape') setMenuOpen(false); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [menuOpen]);

  const scrollTo = (ref) => ref.current?.scrollIntoView({ behavior: 'smooth' });

  const avgRating = feedbacks.length > 0
    ? Math.round((feedbacks.reduce((s, f) => s + f.rating, 0) / feedbacks.length) / 5 * 100)
    : 98; // Fallback to 98% if no reviews yet

  const stats = [
    { labelKey: 'landing.stats.projects',    value: portfolios.length, suffix: '+' },
    { labelKey: 'landing.stats.clients',     value: feedbacks.length,  suffix: '+' },
    { labelKey: 'landing.stats.experience',  value: 5,                 suffix: '+' },
    { labelKey: 'landing.stats.satisfaction',value: avgRating,         suffix: '%' },
  ];

  return (
    <div ref={pageRef} className="min-h-screen bg-brutalist-grid overflow-x-hidden perspective-container">
      <PortfolioModal
        item={activePortfolio}
        open={!!activePortfolio}
        onClose={() => setActivePortfolio(null)}
        transitionTo={transitionTo}
      />
      <SoftwareDetailModal
        sw={activeSoftware}
        open={!!activeSoftware}
        onClose={() => setActiveSoftware(null)}
        transitionTo={transitionTo}
      />

      {/* ── Custom Toast Notification ── */}
      {toast && createPortal(
        <div className={cn(
          'fixed bottom-6 right-6 z-[9999] flex items-start gap-3 px-4 py-3 border-2 border-neu-black rounded-neu shadow-neu-solid max-w-sm',
          toast.type === 'success' ? 'bg-neu-green text-neu-white' : 'bg-neu-accent text-neu-white',
        )}>
          <svg className="w-5 h-5 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
            {toast.type === 'success'
              ? <polyline points="20 6 9 17 4 12" />
              : <><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></>}
          </svg>
          <p className="font-display font-bold text-sm leading-snug">{toast.msg}</p>
          <button onClick={() => setToast(null)} className="ml-auto text-neu-white/70 hover:text-neu-white font-mono text-lg leading-none flex-shrink-0">×</button>
        </div>,
        document.body
      )}

      {/* ── Banner Iklan Popup ── */}
      <Dialog
        open={!!bannerAd}
        onOpenChange={(o) => { if (!o) { setBannerAd(null); setBannerExpanded(false); } }}
      >
        <DialogContent className={cn('p-0 transition-all duration-300', bannerExpanded ? 'sm:max-w-3xl' : 'sm:max-w-xl')}>
          <DialogTitle className="sr-only">{bannerAd?.title || 'Banner Iklan'}</DialogTitle>
          <DialogDescription className="sr-only">{bannerAd?.title || 'Detail banner iklan promo'}</DialogDescription>
          {bannerAd && (
            !bannerExpanded ? (
              /* ── State 1: Gambar penuh, klik untuk expand ── */
              <div className="relative cursor-pointer group" onClick={() => setBannerExpanded(true)}>
                <DialogClose
                  onClick={(e) => e.stopPropagation()}
                  className="absolute top-3 right-3 z-10 w-9 h-9 bg-neu-black text-neu-white border-2 border-neu-black rounded-neu-sm flex items-center justify-center font-mono text-base hover:bg-neu-accent transition-colors">
                  ×
                </DialogClose>
                <div className="absolute top-3 left-3 z-10 bg-neu-accent border-2 border-neu-black rounded-neu-sm px-2 py-0.5">
                  <span className="font-mono font-bold text-[10px] text-neu-white uppercase">{t('landing.banner.promo')}</span>
                </div>
                {bannerAd.image ? (
                  <div className="relative overflow-hidden bg-neu-black">
                    <img src={supaImg(bannerAd.image, { width: 1200 })} alt={bannerAd.title} className="w-full max-h-[80vh] object-contain block mx-auto" loading="lazy" decoding="async" />
                    <div className="absolute inset-0 bg-neu-black/0 group-hover:bg-neu-black/40 transition-all duration-300 flex items-end">
                      <div className="w-full px-5 py-4 bg-gradient-to-t from-neu-black/80 to-transparent translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
                        <p className="font-display font-bold text-lg text-neu-white">{bannerAd.title}</p>
                        <p className="font-mono text-xs text-neu-white/70 mt-1">{t('landing.banner.clickDetail')}</p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="p-8">
                    <p className="font-display font-bold text-2xl text-neu-black mb-2">{bannerAd.title}</p>
                    <p className="font-mono text-xs text-neu-black/50 mt-2">{t('landing.banner.clickDetail')}</p>
                  </div>
                )}
              </div>
            ) : (
              /* ── State 2: Split screen ── */
              <div className="flex flex-col sm:flex-row max-h-[85vh] overflow-hidden">
                {bannerAd.image && (
                  <div className="sm:w-1/2 flex-shrink-0 border-b-2 sm:border-b-0 sm:border-r-2 border-neu-black bg-neu-black flex items-center justify-center min-h-[200px]">
                    <img src={supaImg(bannerAd.image, { width: 1000 })} alt={bannerAd.title} className="w-full h-full object-contain" loading="lazy" decoding="async" />
                  </div>
                )}
                <div className={cn('bg-neu-white flex flex-col overflow-y-auto', bannerAd.image ? 'sm:w-1/2' : 'w-full')}>
                  <div className="flex items-center justify-between px-5 py-4 border-b-2 border-neu-black bg-neu-black flex-shrink-0">
                    <div className="flex items-center gap-2 min-w-0">
                      <div className="bg-neu-accent border-2 border-neu-accent rounded-neu-sm px-2 py-0.5 flex-shrink-0">
                        <span className="font-mono font-bold text-[10px] text-neu-white uppercase">{t('landing.banner.promo')}</span>
                      </div>
                      <p className="font-display font-bold text-sm text-neu-white truncate">{bannerAd.title}</p>
                    </div>
                    <DialogClose className="text-neu-white/60 hover:text-neu-white font-mono text-2xl leading-none ml-3 flex-shrink-0">×</DialogClose>
                  </div>
                  <div className="flex-1 px-5 py-5 overflow-y-auto">
                    <h2 className="font-display font-bold text-xl text-neu-black mb-3">{bannerAd.title}</h2>
                    {bannerAd.description
                      ? <div className="font-body text-sm text-neu-black/70 leading-relaxed prose prose-sm max-w-none" dangerouslySetInnerHTML={{ __html: bannerAd.description }} />
                      : <p className="font-body text-sm text-neu-black/40 italic">{t('landing.banner.noDesc')}</p>}
                  </div>
                  <div className="px-5 py-4 border-t-2 border-neu-black flex gap-3 flex-shrink-0">
                    <button onClick={() => transitionTo('/register')}
                      className="flex-1 py-2.5 bg-neu-gold border-2 border-neu-black rounded-neu shadow-neu-solid-sm font-display font-bold text-xs uppercase text-neu-black transition-all duration-150 hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none">
                      {t('landing.banner.learnMore')}
                    </button>
                    <DialogClose className="px-4 py-2.5 bg-neu-white border-2 border-neu-black rounded-neu-sm font-display font-bold text-xs uppercase text-neu-black/60 hover:text-neu-black transition-colors">
                      {t('landing.banner.close')}
                    </DialogClose>
                  </div>
                </div>
              </div>
            )
          )}
        </DialogContent>
      </Dialog>

      {/* ── Modal Banner dari Section Banners ── */}
      <Dialog
        open={!!bannerModal}
        onOpenChange={(o) => { if (!o) { setBannerModal(null); setBannerModalExp(false); } }}
      >
        <DialogContent className={cn('p-0 transition-all duration-300', bannerModalExp ? 'sm:max-w-3xl' : 'sm:max-w-xl')}>
          <DialogTitle className="sr-only">{bannerModal?.title || 'Banner Promo'}</DialogTitle>
          <DialogDescription className="sr-only">{bannerModal?.title || 'Detail banner promo'}</DialogDescription>
          {bannerModal && (
            !bannerModalExp ? (
              /* State 1: Gambar penuh */
              <div
                className="relative cursor-pointer group"
                onClick={() => bannerModal.description ? setBannerModalExp(true) : null}
              >
                <DialogClose
                  onClick={(e) => e.stopPropagation()}
                  className="absolute top-3 right-3 z-10 w-9 h-9 bg-neu-black text-neu-white border-2 border-neu-black rounded-neu-sm flex items-center justify-center font-mono text-base hover:bg-neu-accent transition-colors">
                  ×
                </DialogClose>
                <div className="absolute top-3 left-3 z-10 bg-neu-accent border-2 border-neu-black rounded-neu-sm px-2 py-0.5">
                  <span className="font-mono font-bold text-[10px] text-neu-white uppercase">{t('landing.banner.promo')}</span>
                </div>
                {bannerModal.image ? (
                  <div className="relative overflow-hidden bg-neu-black">
                    <img src={supaImg(bannerModal.image, { width: 1200 })} alt={bannerModal.title} className="w-full max-h-[80vh] object-contain block mx-auto" loading="lazy" decoding="async" />
                    <div className="absolute inset-0 bg-neu-black/0 group-hover:bg-neu-black/40 transition-all duration-300 flex items-end">
                      <div className="w-full px-5 py-4 bg-gradient-to-t from-neu-black/80 to-transparent translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
                        <p className="font-display font-bold text-lg text-neu-white">{bannerModal.title}</p>
                        {bannerModal.description && <p className="font-mono text-xs text-neu-white/70 mt-1">Klik untuk lihat detail →</p>}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="p-8">
                    <p className="font-display font-bold text-2xl text-neu-black mb-2">{bannerModal.title}</p>
                    {bannerModal.description && <p className="font-mono text-xs text-neu-black/50 mt-2">Klik untuk lihat detail →</p>}
                  </div>
                )}
              </div>
            ) : (
              /* State 2: Split screen */
              <div className="flex flex-col sm:flex-row max-h-[85vh] overflow-hidden">
                {bannerModal.image && (
                  <div className="sm:w-1/2 flex-shrink-0 border-b-2 sm:border-b-0 sm:border-r-2 border-neu-black bg-neu-black flex items-center justify-center min-h-[200px]">
                    <img src={supaImg(bannerModal.image, { width: 1000 })} alt={bannerModal.title} className="w-full h-full object-contain" loading="lazy" decoding="async" />
                  </div>
                )}
                <div className={cn('bg-neu-white flex flex-col overflow-y-auto', bannerModal.image ? 'sm:w-1/2' : 'w-full')}>
                  <div className="flex items-center justify-between px-5 py-4 border-b-2 border-neu-black bg-neu-black flex-shrink-0">
                    <div className="flex items-center gap-2 min-w-0">
                      <div className="bg-neu-accent border-2 border-neu-accent rounded-neu-sm px-2 py-0.5 flex-shrink-0">
                        <span className="font-mono font-bold text-[10px] text-neu-white uppercase">Promo</span>
                      </div>
                      <p className="font-display font-bold text-sm text-neu-white truncate">{bannerModal.title}</p>
                    </div>
                    <DialogClose className="text-neu-white/60 hover:text-neu-white font-mono text-2xl leading-none ml-3 flex-shrink-0">×</DialogClose>
                  </div>
                  <div className="flex-1 px-5 py-5 overflow-y-auto">
                    <h2 className="font-display font-bold text-xl text-neu-black mb-3">{bannerModal.title}</h2>
                    {bannerModal.description
                      ? <div className="font-body text-sm text-neu-black/70 leading-relaxed prose prose-sm max-w-none" dangerouslySetInnerHTML={{ __html: bannerModal.description }} />
                      : <p className="font-body text-sm text-neu-black/40 italic">Tidak ada deskripsi.</p>}
                  </div>
                  <div className="px-5 py-4 border-t-2 border-neu-black flex gap-3 flex-shrink-0">
                    <button onClick={() => transitionTo('/register')}
                      className="flex-1 py-2.5 bg-neu-gold border-2 border-neu-black rounded-neu shadow-neu-solid-sm font-display font-bold text-xs uppercase text-neu-black transition-all duration-150 hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none">
                      Pelajari Lebih Lanjut
                    </button>
                    <DialogClose className="px-4 py-2.5 bg-neu-white border-2 border-neu-black rounded-neu-sm font-display font-bold text-xs uppercase text-neu-black/60 hover:text-neu-black transition-colors">
                      {t('landing.banner.close')}
                    </DialogClose>
                  </div>
                </div>
              </div>
            )
          )}
        </DialogContent>
      </Dialog>

      <Navbar activeSection={activeSection} menuOpen={menuOpen} setMenuOpen={setMenuOpen} transitionTo={transitionTo} scaleX={scaleX} />

      <main className="preserve-3d relative flex flex-col items-center w-full">
        <Hero transitionTo={transitionTo} scrollTo={scrollTo} portfolioRef={portfolioRef} />

        <TechMarquee />

        <Stats stats={stats} isLoading={isLoading} error={errors.portfolios || errors.feedbacks} />

        <Services services={services} isLoading={isLoading} error={errors.services} />

        <About stats={stats} isLoading={isLoading} />

        <Packages
          packages={packages}
          isLoading={isLoading}
          error={errors.packages}
          pkgSliderRef={pkgSliderRef}
          pkgDrag={pkgDrag}
          scrollSlider={scrollSlider}
          navigateProtected={navigateProtected}
        />

        <Banners banners={banners} setBannerModal={setBannerModal} setBannerModalExp={setBannerModalExp} />

        <Software
          softwareProducts={softwareProducts}
          isLoading={isLoading}
          error={errors.softwareProducts}
          swSliderRef={swSliderRef}
          swDrag={swDrag}
          scrollSlider={scrollSlider}
          setActiveSoftware={setActiveSoftware}
          navigateProtected={navigateProtected}
        />

        <Portfolio
          portfolios={portfolios}
          isLoading={isLoading}
          error={errors.portfolios}
          portfolioRef={portfolioRef}
          setActivePortfolio={setActivePortfolio}
          transitionTo={transitionTo}
        />

        <WhyChooseUs />

        <HowItWorks />

        <Contact contacts={contacts} socialMedia={socialMedia} showToast={showToast} />

        {/* ── RATING & ULASAN ── */}
        <FeedbackSection feedbacks={feedbacks} onSubmitted={fb => setFeedbacks(prev => [fb, ...prev])} />

        <CTAFinal transitionTo={transitionTo} />

        <Footer socialMedia={socialMedia} services={services} transitionTo={transitionTo} />
      </main>

      <FloatingCTA showScrollTop={showScrollTop} transitionTo={transitionTo} />
    </div>
  );
}
