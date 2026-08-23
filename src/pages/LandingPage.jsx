import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { useTranslation } from 'react-i18next';
import { useScroll, useSpring } from 'framer-motion';
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogTitle } from '../components/ui/dialog';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import axios from 'axios';

gsap.registerPlugin(ScrollTrigger);
import { cn } from '../utils/cn';
import { API_BASE_URL } from '../constants/api';
import { useIsDesktop } from '../hooks/useIsDesktop';
import { supaImg } from '../utils/imageUrl';

import { useLenis, usePageTransition } from '../components/landing/hooks';
import { PortfolioModal } from '../components/landing/PortfolioModal';
import { SoftwareDetailModal } from '../components/landing/SoftwareDetailModal';
import { BannerDetailModal } from '../components/landing/BannerDetailModal';
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
  const [bannerAd,          setBannerAd]          = useState(null);  // banner popup iklan awal
  const [activeBannerModal, setActiveBannerModal] = useState(null);  // banner detail modal
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

  const mainRef = useRef(null);

  // ── GSAP ScrollTrigger Per-Section Reveal Animations ──
  useEffect(() => {
    if (isLoading) return;

    const ctx = gsap.context(() => {
      const sections = gsap.utils.toArray('.gsap-section-reveal');

      sections.forEach((sec) => {
        gsap.fromTo(
          sec,
          { y: 55, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 0.85,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: sec,
              start: 'top 88%',
              toggleActions: 'play none none reverse',
            },
          }
        );

        const staggerItems = sec.querySelectorAll('.gsap-card-stagger');
        if (staggerItems.length > 0) {
          gsap.fromTo(
            staggerItems,
            { y: 40, opacity: 0, scale: 0.94 },
            {
              y: 0,
              opacity: 1,
              scale: 1,
              duration: 0.65,
              stagger: 0.12,
              ease: 'back.out(1.4)',
              scrollTrigger: {
                trigger: sec,
                start: 'top 82%',
                toggleActions: 'play none none reverse',
              },
            }
          );
        }
      });
    }, mainRef);

    return () => ctx.revert();
  }, [isLoading]);

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

      {/* ── Banner Detail Modal (Desktop Split Screen + Mobile Bottom Sheet) ── */}
      <BannerDetailModal
        banner={activeBannerModal || bannerAd}
        isOpen={!!activeBannerModal || !!bannerAd}
        onClose={() => {
          setActiveBannerModal(null);
          setBannerAd(null);
        }}
        onAction={() => {
          const el = document.getElementById('kontak');
          if (el) el.scrollIntoView({ behavior: 'smooth' });
        }}
      />

      {/* ── Portfolio Detail Modal ── */}
      <PortfolioModal
        item={activePortfolio}
        open={!!activePortfolio}
        onClose={() => setActivePortfolio(null)}
        transitionTo={transitionTo}
      />

      {/* ── Software Detail Modal ── */}
      <SoftwareDetailModal
        sw={activeSoftware}
        open={!!activeSoftware}
        onClose={() => setActiveSoftware(null)}
        transitionTo={transitionTo}
      />

      <Navbar activeSection={activeSection} menuOpen={menuOpen} setMenuOpen={setMenuOpen} transitionTo={transitionTo} scaleX={scaleX} />

      <main ref={mainRef} className="preserve-3d relative flex flex-col items-center w-full">
        <div className="gsap-section-reveal w-full">
          <Hero transitionTo={transitionTo} scrollTo={scrollTo} portfolioRef={portfolioRef} />
        </div>

        <div className="gsap-section-reveal w-full">
          <TechMarquee />
        </div>

        <div className="gsap-section-reveal w-full">
          <Stats stats={stats} isLoading={isLoading} error={errors.portfolios || errors.feedbacks} />
        </div>

        <div className="gsap-section-reveal w-full">
          <Services services={services} isLoading={isLoading} error={errors.services} />
        </div>

        <div className="gsap-section-reveal w-full">
          <About stats={stats} isLoading={isLoading} />
        </div>

        <div className="gsap-section-reveal w-full">
          <Packages
            packages={packages}
            isLoading={isLoading}
            error={errors.packages}
            pkgSliderRef={pkgSliderRef}
            pkgDrag={pkgDrag}
            scrollSlider={scrollSlider}
            navigateProtected={navigateProtected}
          />
        </div>

        <div className="gsap-section-reveal w-full">
          <Banners banners={banners} onOpenModal={setActiveBannerModal} />
        </div>

        <div className="gsap-section-reveal w-full">
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
        </div>

        <div className="gsap-section-reveal w-full">
          <Portfolio
            portfolios={portfolios}
            isLoading={isLoading}
            error={errors.portfolios}
            portfolioRef={portfolioRef}
            setActivePortfolio={setActivePortfolio}
            transitionTo={transitionTo}
          />
        </div>

        <div className="gsap-section-reveal w-full">
          <WhyChooseUs />
        </div>

        <div className="gsap-section-reveal w-full">
          <HowItWorks />
        </div>

        <div className="gsap-section-reveal w-full">
          <Contact contacts={contacts} socialMedia={socialMedia} showToast={showToast} />
        </div>

        <div className="gsap-section-reveal w-full">
          <FeedbackSection feedbacks={feedbacks} onSubmitted={fb => setFeedbacks(prev => [fb, ...prev])} />
        </div>

        <div className="gsap-section-reveal w-full">
          <CTAFinal transitionTo={transitionTo} />
        </div>

        <Footer socialMedia={socialMedia} services={services} transitionTo={transitionTo} />
      </main>

      <FloatingCTA showScrollTop={showScrollTop} transitionTo={transitionTo} />
    </div>
  );
}
