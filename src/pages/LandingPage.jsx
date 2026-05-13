import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createPortal } from 'react-dom';
import { useTranslation } from 'react-i18next';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, MeshDistortMaterial, Sphere, Torus, MeshWobbleMaterial, Icosahedron, Octahedron } from '@react-three/drei';
import Lenis from 'lenis';
import axios from 'axios';
import { cn } from '../utils/cn';
import { getPlatform } from '../constants/platforms';
import { API_BASE_URL } from '../constants/api';
import { LanguageSwitcher } from '../components/ui/LanguageSwitcher';

gsap.registerPlugin(ScrollTrigger);
const BASE = API_BASE_URL || '';

/* ─── Pastikan URL kontak punya prefix yang benar ────────────────────── */
function fixContactUrl(linkUrl, iconKey) {
  if (!linkUrl) return '#';
  const key = (iconKey || '').toLowerCase();
  // Sudah punya protocol → langsung pakai
  if (/^(https?:\/\/|mailto:|tel:)/i.test(linkUrl)) return linkUrl;
  
  // Cek apakah linkUrl adalah alamat email murni (misal: "budi@email.com")
  if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(linkUrl)) return `mailto:${linkUrl}`;

  // Auto-detect berdasarkan icon/platform
  if (key === 'email') return `mailto:${linkUrl}`;
  if (key === 'phone' || key === 'whatsapp') return `tel:${linkUrl.replace(/\s/g, '')}`;
  
  // Fallback: tambahkan https://
  return `https://${linkUrl}`;
}

/* ─── Lenis smooth scroll + GSAP ScrollTrigger sync ─────────────────── */
function useLenis() {
  useEffect(() => {
    const lenis = new Lenis({
      duration:  1.4,
      easing:    (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      syncTouch:   false,
    });

    // Sync Lenis dengan GSAP ScrollTrigger
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add((time) => lenis.raf(time * 1000));
    gsap.ticker.lagSmoothing(0);

    return () => {
      lenis.destroy();
      gsap.ticker.remove((time) => lenis.raf(time * 1000));
    };
  }, []);
}

/* ─── Barba-style page transition ─────────────────────────────────────── */
function usePageTransition() {
  const pageRef = useRef(null);
  const navigate = useNavigate();
  const transitionTo = async (path) => {
    if (!pageRef.current) { navigate(path); return; }
    await gsap.to(pageRef.current, { opacity: 0, y: -30, duration: 0.4, ease: 'power2.in' });
    navigate(path);
  };
  return { pageRef, transitionTo };
}

/* ─── Modern Hero 3D Scene ──────────────────────────────────────────── */
function HeroScene() {
  const groupRef = useRef(null);
  useFrame(({ clock }) => {
    if (groupRef.current) groupRef.current.rotation.y = clock.elapsedTime * 0.12;
  });
  return (
    <group ref={groupRef}>
      {/* Central sphere - holographic */}
      <Float speed={1.5} rotationIntensity={0.3} floatIntensity={0.8}>
        <Sphere args={[1.1, 128, 128]}>
          <MeshDistortMaterial color="#FFD000" distort={0.3} speed={3} roughness={0} metalness={0.9} envMapIntensity={1} />
        </Sphere>
      </Float>

      {/* Orbiting icosahedron */}
      <Float speed={3} rotationIntensity={2} floatIntensity={1}>
        <Icosahedron args={[0.4, 0]} position={[2, 0.5, 0]}>
          <meshStandardMaterial color="#4D61FF" roughness={0.1} metalness={1} wireframe={false} />
        </Icosahedron>
      </Float>

      {/* Small octahedron */}
      <Float speed={2.5} rotationIntensity={3} floatIntensity={1.5}>
        <Octahedron args={[0.3, 0]} position={[-1.8, -0.8, 0.5]}>
          <meshStandardMaterial color="#FF5C5C" roughness={0} metalness={1} />
        </Octahedron>
      </Float>

      {/* Outer wobble ring */}
      <Float speed={1} floatIntensity={0.3}>
        <Torus args={[2, 0.04, 8, 80]}>
          <meshBasicMaterial color="#FFD000" opacity={0.6} transparent />
        </Torus>
      </Float>
      <Float speed={0.8} floatIntensity={0.2}>
        <Torus args={[2.6, 0.02, 8, 80]} rotation={[Math.PI / 4, 0, 0]}>
          <meshBasicMaterial color="#4D61FF" opacity={0.4} transparent />
        </Torus>
      </Float>

      {/* Small floating dots */}
      {[[-1.2, 1.5, 0.3],[1.5, -1.2, 0.5],[0.8, 1.8, -0.3],[-1.8, 0.2, 0.8]].map((pos, i) => (
        <Float key={i} speed={2 + i * 0.5} floatIntensity={0.8}>
          <Sphere args={[0.08, 16, 16]} position={pos}>
            <meshBasicMaterial color={i % 2 === 0 ? '#FFD000' : '#4D61FF'} />
          </Sphere>
        </Float>
      ))}
    </group>
  );
}

/* ─── CTA 3D Object ─────────────────────────────────────────────────── */
function CtaScene() {
  const mesh = useRef(null);
  useFrame(({ clock }) => {
    if (!mesh.current) return;
    mesh.current.rotation.x = clock.elapsedTime * 0.4;
    mesh.current.rotation.y = clock.elapsedTime * 0.6;
  });
  return (
    <>
      <Float speed={2} rotationIntensity={1} floatIntensity={1.5}>
        <mesh ref={mesh}>
          <torusKnotGeometry args={[0.8, 0.25, 128, 32]} />
          <MeshWobbleMaterial color="#FFD000" factor={0.3} speed={2} roughness={0} metalness={0.8} />
        </mesh>
      </Float>
      <Float speed={1.5}>
        <Torus args={[1.8, 0.03, 8, 80]}>
          <meshBasicMaterial color="#0D0D0D" opacity={0.5} transparent />
        </Torus>
      </Float>
    </>
  );
}

/* ─── Anime.js counter ──────────────────────────────────────────────── */
function AnimatedCounter({ target, suffix = '' }) {
  const ref = useRef(null);
  const triggered = useRef(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && !triggered.current) {
        triggered.current = true;
        import('animejs').then(({ default: anime }) => {
          const obj = { val: 0 };
          anime({ targets: obj, val: target, round: 1, duration: 2000, easing: 'easeOutExpo',
            update: () => { if (el) el.textContent = obj.val.toLocaleString('id-ID') + suffix; },
          });
        });
      }
    }, { threshold: 0.5 });
    observer.observe(el);
    return () => observer.disconnect();
  }, [target, suffix]);
  return <span ref={ref}>0{suffix}</span>;
}

/* ─── Anime.js letter reveal ────────────────────────────────────────── */
function LetterReveal({ text, className, delay = 0 }) {
  const ref = useRef(null);
  const triggered = useRef(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.innerHTML = text.split('').map(c =>
      `<span style="display:inline-block;opacity:0">${c === ' ' ? '&nbsp;' : c}</span>`
    ).join('');
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && !triggered.current) {
        triggered.current = true;
        import('animejs').then(({ default: anime }) => {
          anime({ targets: el.querySelectorAll('span'), opacity: [0, 1], translateY: [30, 0],
            delay: anime.stagger(40, { start: delay }), duration: 500, easing: 'easeOutExpo' });
        });
      }
    }, { threshold: 0.3 });
    observer.observe(el);
    return () => observer.disconnect();
  }, [text, delay]);
  return <span ref={ref} className={className} />;
}

/* ─── Portfolio Modal ───────────────────────────────────────────────── */
function PortfolioModal({ item, onClose, transitionTo }) {
  const backdropRef = useRef(null);
  const cardRef = useRef(null);
  const [imgIdx, setImgIdx] = useState(0);
  const imgs = item.images?.length ? item.images : (item.image ? [item.image] : []);

  useEffect(() => {
    gsap.fromTo(backdropRef.current, { opacity: 0 }, { opacity: 1, duration: 0.2 });
    gsap.fromTo(cardRef.current, { y: -40, opacity: 0, scale: 0.95 }, { y: 0, opacity: 1, scale: 1, duration: 0.35, ease: 'power3.out' });
    const handler = (e) => { if (e.key === 'Escape') handleClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  const handleClose = () => {
    gsap.to(cardRef.current, { y: -20, opacity: 0, scale: 0.95, duration: 0.2, ease: 'power2.in' });
    gsap.to(backdropRef.current, { opacity: 0, duration: 0.2, onComplete: onClose });
  };

  return createPortal(
    <div ref={backdropRef} className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neu-black/75 overflow-y-auto"
      onClick={(e) => { if (e.target === e.currentTarget) handleClose(); }}>
      <div ref={cardRef} className="w-full max-w-2xl bg-neu-white border-2 border-neu-black shadow-neu-xl my-4">
        <div className="flex items-center justify-between px-5 py-4 border-b-2 border-neu-black bg-neu-black">
          <div>
            <h3 className="font-display font-bold text-base text-neu-white">{item.title}</h3>
            {item.category && <span className="font-mono text-xs text-neu-white/60 uppercase">{item.category.replace(/_/g,' ')}</span>}
          </div>
          <button onClick={handleClose} className="text-neu-white/60 hover:text-neu-white font-mono text-2xl leading-none">×</button>
        </div>
        {imgs.length > 0 && (
          <div className="relative border-b-2 border-neu-black bg-neu-bg">
            <img src={imgs[imgIdx]} alt={item.title} className="w-full h-64 object-cover" loading="lazy" decoding="async" />
            {imgs.length > 1 && (
              <>
                <button onClick={() => setImgIdx(i => (i - 1 + imgs.length) % imgs.length)}
                  className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-neu-white/90 border-2 border-neu-black font-mono text-sm flex items-center justify-center hover:bg-neu-primary transition-colors">←</button>
                <button onClick={() => setImgIdx(i => (i + 1) % imgs.length)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-neu-white/90 border-2 border-neu-black font-mono text-sm flex items-center justify-center hover:bg-neu-primary transition-colors">→</button>
              </>
            )}
          </div>
        )}
        <div className="px-5 py-4 border-b-2 border-neu-black max-h-48 overflow-y-auto">
          {item.description
            ? <div className="font-body text-sm text-neu-black/80 leading-relaxed prose prose-sm max-w-none" dangerouslySetInnerHTML={{ __html: item.description }} />
            : <p className="font-body text-sm text-neu-black/40 italic">Tidak ada deskripsi.</p>}
        </div>
        <div className="px-5 py-4 flex gap-3 flex-wrap">
          <button onClick={() => { handleClose(); setTimeout(() => transitionTo('/register'), 350); }}
            className="flex-1 py-2.5 bg-neu-primary border-2 border-neu-black shadow-neu font-display font-bold text-sm uppercase text-neu-black transition-all duration-150 hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-neu-sm">
            {t('landing.order')}
          </button>
          <button onClick={handleClose}
            className="px-5 py-2.5 bg-neu-white border-2 border-neu-black shadow-neu font-display font-bold text-sm uppercase text-neu-black transition-all duration-150 hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-neu-sm">
            Tutup
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
}

/* ─── Package Card ──────────────────────────────────────────────────── */
function PackageCard({ pkg, onOrder }) {
  const { t, i18n } = useTranslation();
  const lang = (id, en) => i18n.language === 'en' && en ? en : id;
  const activeFeaturesText = lang(pkg.features, pkg.featuresEn);
  const featureList = activeFeaturesText
    ? activeFeaturesText.split('\n').filter(f => f.trim()).slice(0, 5)
    : [];
  const fmt = (val) => `Rp ${Number(val).toLocaleString('id-ID')}`;

  return (
    <div className="relative border-2 border-neu-black shadow-neu bg-neu-white flex flex-col h-full">
      {/* Badge */}
      {pkg.badge && (
        <span className="absolute -top-3 left-4 px-3 py-0.5 bg-neu-primary border-2 border-neu-black font-mono font-bold text-[10px] uppercase z-10">
          {pkg.badge}
        </span>
      )}

      {/* Header */}
      <div className="border-b-2 border-neu-black p-5 bg-neu-black">
        <div className="flex items-center gap-3 mb-3">
          {pkg.iconUrl ? (
            <div className="w-10 h-10 border-2 border-neu-white/30 overflow-hidden flex-shrink-0">
              <img src={pkg.iconUrl} alt={pkg.name} className="w-full h-full object-cover" loading="lazy" decoding="async" />
            </div>
          ) : (
            <div className="w-10 h-10 border-2 border-neu-white/30 bg-neu-white/10 flex items-center justify-center flex-shrink-0">
              <svg className="w-5 h-5 text-neu-white" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
              </svg>
            </div>
          )}
          <div>
            <p className="font-display font-bold text-base text-neu-white leading-tight">{lang(pkg.name, pkg.nameEn)}</p>
            {pkg.category && (
              <span className="font-mono text-[10px] text-neu-white/50 uppercase">{pkg.category}</span>
            )}
          </div>
        </div>
        <p className="font-display font-bold text-2xl text-neu-primary">{fmt(pkg.price)}</p>
        {pkg.duration && (
          <p className="font-mono text-xs text-neu-white/50 mt-1">{t('landing.packages.duration')}: {lang(pkg.duration, pkg.durationEn)}</p>
        )}
      </div>

      {/* Features */}
      <div className="p-5 flex-1">
        {pkg.description && (
          <p className="font-body text-xs text-neu-black/60 mb-4 leading-relaxed">{lang(pkg.description, pkg.descriptionEn)}</p>
        )}
        {featureList.length > 0 && (
          <ul className="space-y-2">
            {featureList.map((f, i) => (
              <li key={i} className="flex items-start gap-2">
                <div className="w-4 h-4 border-2 border-neu-black bg-neu-primary flex items-center justify-center flex-shrink-0 mt-0.5">
                  <svg className="w-2.5 h-2.5 text-neu-black" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                </div>
                <span className="font-body text-sm text-neu-black">{f.trim()}</span>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* CTA */}
      <div className="p-5 border-t-2 border-neu-black">
        <button
          onClick={onOrder}
          className="w-full py-2.5 bg-neu-primary border-2 border-neu-black shadow-neu font-display font-bold text-sm uppercase text-neu-black transition-all duration-150 hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-neu-sm active:translate-x-1 active:translate-y-1 active:shadow-none"
        >
          {t('landing.order')}
        </button>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════════
   MAIN LANDING PAGE
══════════════════════════════════════════════════════════════════════ */
export default function LandingPage() {
  useLenis();
  const { t, i18n } = useTranslation();
  const { pageRef, transitionTo } = usePageTransition();
  const lang = (id, en) => i18n.language === 'en' && en ? en : id;
  const [portfolios,   setPortfolios]   = useState([]);
  const [packages,     setPackages]     = useState([]);
  const [banners,      setBanners]      = useState([]);
  const [contacts,     setContacts]     = useState([]);
  const [socialMedia,  setSocialMedia]  = useState([]);
  const [bankAccounts, setBankAccounts] = useState([]);
  const [isLoading,    setIsLoading]    = useState(true);
  const [activePortfolio, setActivePortfolio] = useState(null);
  const [menuOpen,     setMenuOpen]     = useState(false);
  const [toast,        setToast]        = useState(null); // { msg, type }

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

  useEffect(() => {
    Promise.all([
      axios.get(`${BASE}/api/portfolio`).catch(() => ({ data: { data: [] } })),
      axios.get(`${BASE}/api/banners`).catch(() => ({ data: { data: [] } })),
      axios.get(`${BASE}/api/contacts`).catch(() => ({ data: { data: [] } })),
      axios.get(`${BASE}/api/social-media`).catch(() => ({ data: { data: [] } })),
      axios.get(`${BASE}/api/bank-accounts`).catch(() => ({ data: { data: [] } })),
      axios.get(`${BASE}/api/service-packages/public`).catch(() => ({ data: { data: [] } })),
    ]).then(([p, b, c, s, ba, pkg]) => {
      setPortfolios(p.data?.data ?? []);
      const activeBanners = (b.data?.data ?? []).filter(x => x.isActive);
      setBanners(activeBanners);
      if (activeBanners.length > 0) setBannerAd(activeBanners[0]); // tampilkan banner pertama sebagai popup
      setContacts((c.data?.data ?? []).filter(x => x.isActive));
      setSocialMedia((s.data?.data ?? []).filter(x => x.isActive));
      setBankAccounts((ba.data?.data ?? []).filter(x => x.isActive));
      setPackages(pkg.data?.data ?? []);
    }).finally(() => setIsLoading(false));
  }, []);

  useEffect(() => {
    if (isLoading) return;

    // reveal-up: animasi masuk saat scroll down, keluar saat scroll up
    document.querySelectorAll('.reveal-up').forEach(el => {
      gsap.fromTo(el,
        { y: 50, opacity: 0 },
        {
          y: 0, opacity: 1, duration: 0.7, ease: 'power2.out',
          scrollTrigger: {
            trigger: el,
            start: 'top 88%',
            end: 'top 30%',
            toggleActions: 'play reverse play reverse',
          },
        },
      );
    });

    // Portfolio cards: stagger masuk + keluar
    document.querySelectorAll('.portfolio-card').forEach((card, i) => {
      gsap.fromTo(card,
        { y: 40, opacity: 0, scale: 0.97 },
        {
          y: 0, opacity: 1, scale: 1,
          duration: 0.55, ease: 'power2.out',
          delay: (i % 3) * 0.07,
          scrollTrigger: {
            trigger: card,
            start: 'top 90%',
            end: 'top 20%',
            toggleActions: 'play reverse play reverse',
          },
        },
      );
    });

    // Section titles: slide dari kiri
    document.querySelectorAll('.reveal-left').forEach(el => {
      gsap.fromTo(el,
        { x: -50, opacity: 0 },
        {
          x: 0, opacity: 1, duration: 0.7, ease: 'power3.out',
          scrollTrigger: {
            trigger: el,
            start: 'top 88%',
            end: 'top 30%',
            toggleActions: 'play reverse play reverse',
          },
        },
      );
    });

    // Stat cards: scale masuk
    document.querySelectorAll('.reveal-scale').forEach((el, i) => {
      gsap.fromTo(el,
        { scale: 0.85, opacity: 0 },
        {
          scale: 1, opacity: 1,
          duration: 0.5, ease: 'back.out(1.4)',
          delay: i * 0.06,
          scrollTrigger: {
            trigger: el,
            start: 'top 90%',
            end: 'top 20%',
            toggleActions: 'play reverse play reverse',
          },
        },
      );
    });

    return () => ScrollTrigger.getAll().forEach(t => t.kill());
  }, [isLoading]);

  const scrollTo = (ref) => ref.current?.scrollIntoView({ behavior: 'smooth' });

  const services = t('landing.services.items', { returnObjects: true });

  const stats = [
    { labelKey: 'landing.stats.projects',    value: 150, suffix: '+' },
    { labelKey: 'landing.stats.clients',     value: 80,  suffix: '+' },
    { labelKey: 'landing.stats.experience',  value: 5,   suffix: '+' },
    { labelKey: 'landing.stats.satisfaction',value: 98,  suffix: '%' },
  ];

  const techStack = ['React', 'Next.js', 'Node.js', 'NestJS', 'Flutter', 'Laravel', 'Python', 'PostgreSQL', 'MongoDB', 'Docker', 'AWS', 'Figma'];


  return (
    <div ref={pageRef} className="min-h-screen bg-neu-bg overflow-x-hidden">
      {activePortfolio && (
        <PortfolioModal item={activePortfolio} onClose={() => setActivePortfolio(null)} transitionTo={transitionTo} />
      )}

      {/* ── Custom Toast Notification ── */}
      {toast && createPortal(
        <div className={cn(
          'fixed bottom-6 right-6 z-[9999] flex items-start gap-3 px-4 py-3 border-2 border-neu-black shadow-neu max-w-sm',
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
      {bannerAd && createPortal(
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neu-black/70"
          onClick={(e) => { if (e.target === e.currentTarget) { setBannerAd(null); setBannerExpanded(false); } }}>

          {!bannerExpanded ? (
            /* ── State 1: Gambar penuh, klik untuk expand ── */
            <div className="relative cursor-pointer group" onClick={() => setBannerExpanded(true)}>
              <button
                onClick={(e) => { e.stopPropagation(); setBannerAd(null); setBannerExpanded(false); }}
                className="absolute top-3 right-3 z-10 w-9 h-9 bg-neu-black text-neu-white border-2 border-neu-black flex items-center justify-center font-mono text-base hover:bg-neu-accent transition-colors">
                ×
              </button>
              <div className="absolute top-3 left-3 z-10 bg-neu-accent border-2 border-neu-black px-2 py-0.5">
                <span className="font-mono font-bold text-[10px] text-neu-white uppercase">{t('landing.banner.promo')}</span>
              </div>

              {bannerAd.image ? (
                <div className="relative border-2 border-neu-black shadow-neu-xl overflow-hidden">
                  <img
                    src={bannerAd.image}
                    alt={bannerAd.title}
                    className="w-[90vw] max-w-xl h-[70vh] max-h-[500px] object-cover block"
                  />
                  {/* Hover overlay */}
                  <div className="absolute inset-0 bg-neu-black/0 group-hover:bg-neu-black/40 transition-all duration-300 flex items-end">
                    <div className="w-full px-5 py-4 bg-gradient-to-t from-neu-black/80 to-transparent translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
                      <p className="font-display font-bold text-lg text-neu-white">{bannerAd.title}</p>
                      <p className="font-mono text-xs text-neu-white/70 mt-1">{t('landing.banner.clickDetail')}</p>
                    </div>
                  </div>
                </div>
              ) : (
                /* Jika tidak ada gambar — tampilkan card teks */
                <div className="w-[90vw] max-w-sm border-2 border-neu-black shadow-neu-xl bg-neu-white p-8">
                  <p className="font-display font-bold text-2xl text-neu-black mb-2">{bannerAd.title}</p>
                  <p className="font-mono text-xs text-neu-black/50 mt-2">{t('landing.banner.clickDetail')}</p>
                </div>
              )}
            </div>
          ) : (
            /* ── State 2: Split screen ── */
            <div className="w-full max-w-3xl border-2 border-neu-black shadow-neu-xl overflow-hidden flex flex-col sm:flex-row max-h-[85vh]">
              {/* Kiri: Gambar */}
              {bannerAd.image && (
                <div className="sm:w-1/2 flex-shrink-0 border-b-2 sm:border-b-0 sm:border-r-2 border-neu-black">
                  <img
                    src={bannerAd.image}
                    alt={bannerAd.title}
                    className="w-full h-52 sm:h-full object-cover"
                  />
                </div>
              )}

              {/* Kanan: Deskripsi */}
              <div className={cn(
                'bg-neu-white flex flex-col overflow-y-auto',
                bannerAd.image ? 'sm:w-1/2' : 'w-full',
              )}>
                {/* Header */}
                <div className="flex items-center justify-between px-5 py-4 border-b-2 border-neu-black bg-neu-black flex-shrink-0">
                  <div className="flex items-center gap-2">
                    <div className="bg-neu-accent border-2 border-neu-accent px-2 py-0.5">
                      <span className="font-mono font-bold text-[10px] text-neu-white uppercase">{t('landing.banner.promo')}</span>
                    </div>
                    <p className="font-display font-bold text-sm text-neu-white truncate">{bannerAd.title}</p>
                  </div>
                  <button onClick={() => { setBannerAd(null); setBannerExpanded(false); }}
                    className="text-neu-white/60 hover:text-neu-white font-mono text-2xl leading-none ml-3 flex-shrink-0">×</button>
                </div>

                {/* Konten */}
                <div className="flex-1 px-5 py-5 overflow-y-auto">
                  <h2 className="font-display font-bold text-xl text-neu-black mb-3">{bannerAd.title}</h2>
                  {bannerAd.description ? (
                    <div
                      className="font-body text-sm text-neu-black/70 leading-relaxed prose prose-sm max-w-none"
                      dangerouslySetInnerHTML={{ __html: bannerAd.description }}
                    />
                  ) : (
                    <p className="font-body text-sm text-neu-black/40 italic">{t('landing.banner.noDesc')}</p>
                  )}
                </div>

                {/* Actions */}
                <div className="px-5 py-4 border-t-2 border-neu-black flex gap-3 flex-shrink-0">
                  <button onClick={() => transitionTo('/register')}
                    className="flex-1 py-2.5 bg-neu-primary border-2 border-neu-black shadow-neu-sm font-display font-bold text-xs uppercase text-neu-black transition-all duration-150 hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none">
                    {t('landing.banner.learnMore')}
                  </button>
                  <button onClick={() => { setBannerAd(null); setBannerExpanded(false); }}
                    className="px-4 py-2.5 bg-neu-white border-2 border-neu-black font-display font-bold text-xs uppercase text-neu-black/60 hover:text-neu-black transition-colors">
                    {t('landing.banner.close')}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>,
        document.body
      )}

      {/* ── Modal Banner dari Section Banners ── */}
      {bannerModal && createPortal(
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neu-black/70"
          onClick={(e) => { if (e.target === e.currentTarget) { setBannerModal(null); setBannerModalExp(false); } }}>
          {!bannerModalExp ? (
            /* State 1: Gambar penuh */
            <div className="relative cursor-pointer group" onClick={() => bannerModal.description ? setBannerModalExp(true) : null}>
              <button onClick={(e) => { e.stopPropagation(); setBannerModal(null); setBannerModalExp(false); }}
                className="absolute top-3 right-3 z-10 w-9 h-9 bg-neu-black text-neu-white border-2 border-neu-black flex items-center justify-center font-mono text-base hover:bg-neu-accent transition-colors">×</button>
              <div className="absolute top-3 left-3 z-10 bg-neu-accent border-2 border-neu-black px-2 py-0.5">
                <span className="font-mono font-bold text-[10px] text-neu-white uppercase">{t('landing.banner.promo')}</span>
              </div>
              {bannerModal.image ? (
                <div className="relative border-2 border-neu-black shadow-neu-xl overflow-hidden">
                  <img src={bannerModal.image} alt={bannerModal.title} className="w-[90vw] max-w-xl h-[70vh] max-h-[500px] object-cover block" loading="lazy" decoding="async" />
                  <div className="absolute inset-0 bg-neu-black/0 group-hover:bg-neu-black/40 transition-all duration-300 flex items-end">
                    <div className="w-full px-5 py-4 bg-gradient-to-t from-neu-black/80 to-transparent translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
                      <p className="font-display font-bold text-lg text-neu-white">{bannerModal.title}</p>
                      {bannerModal.description && <p className="font-mono text-xs text-neu-white/70 mt-1">Klik untuk lihat detail →</p>}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="w-[90vw] max-w-sm border-2 border-neu-black shadow-neu-xl bg-neu-white p-8">
                  <p className="font-display font-bold text-2xl text-neu-black mb-2">{bannerModal.title}</p>
                  {bannerModal.description && <p className="font-mono text-xs text-neu-black/50 mt-2">Klik untuk lihat detail →</p>}
                </div>
              )}
            </div>
          ) : (
            /* State 2: Split screen */
            <div className="w-full max-w-3xl border-2 border-neu-black shadow-neu-xl overflow-hidden flex flex-col sm:flex-row max-h-[85vh]">
              {bannerModal.image && (
                <div className="sm:w-1/2 flex-shrink-0 border-b-2 sm:border-b-0 sm:border-r-2 border-neu-black">
                  <img src={bannerModal.image} alt={bannerModal.title} className="w-full h-52 sm:h-full object-cover" loading="lazy" decoding="async" />
                </div>
              )}
              <div className={cn('bg-neu-white flex flex-col overflow-y-auto', bannerModal.image ? 'sm:w-1/2' : 'w-full')}>
                <div className="flex items-center justify-between px-5 py-4 border-b-2 border-neu-black bg-neu-black flex-shrink-0">
                  <div className="flex items-center gap-2">
                    <div className="bg-neu-accent border-2 border-neu-accent px-2 py-0.5"><span className="font-mono font-bold text-[10px] text-neu-white uppercase">Promo</span></div>
                    <p className="font-display font-bold text-sm text-neu-white truncate">{bannerModal.title}</p>
                  </div>
                  <button onClick={() => { setBannerModal(null); setBannerModalExp(false); }} className="text-neu-white/60 hover:text-neu-white font-mono text-2xl leading-none ml-3 flex-shrink-0">×</button>
                </div>
                <div className="flex-1 px-5 py-5 overflow-y-auto">
                  <h2 className="font-display font-bold text-xl text-neu-black mb-3">{bannerModal.title}</h2>
                  {bannerModal.description
                    ? <div className="font-body text-sm text-neu-black/70 leading-relaxed prose prose-sm max-w-none" dangerouslySetInnerHTML={{ __html: bannerModal.description }} />
                    : <p className="font-body text-sm text-neu-black/40 italic">Tidak ada deskripsi.</p>}
                </div>
                <div className="px-5 py-4 border-t-2 border-neu-black flex gap-3 flex-shrink-0">
                  <button onClick={() => transitionTo('/register')} className="flex-1 py-2.5 bg-neu-primary border-2 border-neu-black shadow-neu-sm font-display font-bold text-xs uppercase text-neu-black transition-all duration-150 hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none">Pelajari Lebih Lanjut</button>
                  <button onClick={() => { setBannerModal(null); setBannerModalExp(false); }} className="px-4 py-2.5 bg-neu-white border-2 border-neu-black font-display font-bold text-xs uppercase text-neu-black/60 hover:text-neu-black transition-colors">{t('landing.banner.close')}</button>
                </div>
              </div>
            </div>
          )}
        </div>,
        document.body
      )}

      {/* ── NAVBAR ── */}
      <nav className="sticky top-0 z-40 bg-neu-white border-b-2 border-neu-black">
        <div className="max-w-7xl mx-auto px-4 lg:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-5">
            <div className="bg-neu-primary border-2 border-neu-black px-3 py-1 shadow-neu-sm">
              <span className="font-mono font-bold text-xs text-neu-black uppercase tracking-widest">Synectra</span>
            </div>
            <div className="hidden md:flex items-center gap-6">
              {[
                { tKey: 'nav.services',    id: 'layanan'   },
                { tKey: 'nav.portfolio',   id: 'portofolio'},
                { tKey: 'nav.howItWorks',  id: 'cara-kerja'},
                { tKey: 'nav.packages',    id: 'paket'     },
                { tKey: 'nav.contact',     id: 'kontak'    },
              ].map(({ tKey, id }) => (
                <button key={id}
                  onClick={() => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })}
                  className="font-display font-bold text-xs text-neu-black/60 hover:text-neu-black uppercase tracking-wide transition-colors">
                  {t(tKey)}
                </button>
              ))}
            </div>
          </div>
          <div className="hidden sm:flex items-center gap-3">
            <LanguageSwitcher variant="light" />
            <button onClick={() => transitionTo('/login')} className="px-4 py-2 border-2 border-neu-black font-display font-bold text-xs uppercase text-neu-black hover:bg-neu-bg transition-colors">{t('nav.login')}</button>
            <button onClick={() => transitionTo('/register')} className="px-4 py-2 bg-neu-primary border-2 border-neu-black shadow-neu-sm font-display font-bold text-xs uppercase text-neu-black transition-all duration-150 hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none">{t('nav.register')}</button>
          </div>
          <button onClick={() => setMenuOpen(o => !o)} className="sm:hidden w-9 h-9 border-2 border-neu-black flex items-center justify-center">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              {menuOpen ? <><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></> : <><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></>}
            </svg>
          </button>
        </div>
        {menuOpen && (
          <div className="sm:hidden border-t-2 border-neu-black bg-neu-white px-4 py-3 flex flex-col gap-1">
            {[
              { tKey: 'nav.services',    id: 'layanan'   },
              { tKey: 'nav.portfolio',   id: 'portofolio'},
              { tKey: 'nav.howItWorks',  id: 'cara-kerja'},
              { tKey: 'nav.packages',    id: 'paket'     },
              { tKey: 'nav.contact',     id: 'kontak'    },
            ].map(({ tKey, id }) => (
              <button key={id}
                onClick={() => { document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' }); setMenuOpen(false); }}
                className="font-display font-bold text-sm uppercase text-neu-black text-left py-1.5 border-b border-neu-black/10 last:border-0">
                {t(tKey)}
              </button>
            ))}
            <div className="pt-2 flex flex-col gap-2">
              <button onClick={() => { transitionTo('/login'); setMenuOpen(false); }} className="font-display font-bold text-sm uppercase text-neu-black text-left py-1.5">{t('nav.login')}</button>
              <button onClick={() => { transitionTo('/register'); setMenuOpen(false); }} className="px-4 py-2 bg-neu-primary border-2 border-neu-black font-display font-bold text-sm uppercase text-neu-black text-center">{t('nav.register')}</button>
              <div className="flex items-center gap-2 py-1">
                <span className="font-mono text-xs text-neu-black/40 uppercase">Lang</span>
                <LanguageSwitcher variant="light" />
              </div>
            </div>
          </div>
        )}
      </nav>

      {/* ── HERO — 3D + Anime.js ── */}
      <section className="relative min-h-[90vh] flex items-center border-b-2 border-neu-black overflow-hidden">
        <div className="absolute inset-0 pointer-events-none" style={{ backgroundImage: 'repeating-linear-gradient(0deg,transparent,transparent 39px,rgba(13,13,13,.05) 39px,rgba(13,13,13,.05) 40px),repeating-linear-gradient(90deg,transparent,transparent 39px,rgba(13,13,13,.05) 39px,rgba(13,13,13,.05) 40px)' }} />
        <div className="absolute top-10 right-10 w-24 h-24 border-2 border-neu-black bg-neu-primary hidden lg:block" />
        <div className="absolute bottom-16 left-10 w-14 h-14 border-2 border-neu-black bg-neu-accent hidden lg:block" />
        <div className="absolute top-1/3 right-1/4 w-6 h-6 border-2 border-neu-black bg-neu-blue hidden lg:block" />
        <div className="absolute bottom-1/3 right-16 w-10 h-10 border-2 border-neu-black bg-neu-green hidden lg:block" />

        <div className="max-w-7xl mx-auto px-4 lg:px-6 w-full grid grid-cols-1 lg:grid-cols-2 gap-12 items-center py-20">
          <div>
            <div className="inline-block bg-neu-black text-neu-white px-4 py-1.5 font-mono font-bold text-xs uppercase tracking-widest mb-6">{t('landing.hero.badge')}</div>
            <h1 className="font-display font-bold text-5xl sm:text-6xl lg:text-7xl text-neu-black leading-[0.9] mb-6">
              <LetterReveal text={t('landing.hero.title1')} className="block" />
              <span className="block mt-1 relative">
                <LetterReveal text={t('landing.hero.title2')} className="relative z-10" delay={400} />
                <span className="absolute bottom-2 left-0 h-5 w-full bg-neu-primary -z-0 block" />
              </span>
              <LetterReveal text={t('landing.hero.title3')} className="block mt-1" delay={800} />
            </h1>
            <p className="font-body text-base lg:text-lg text-neu-black/60 mb-8 max-w-lg leading-relaxed">
              {t('landing.hero.subtitle')}
            </p>
            <div className="flex flex-wrap gap-3">
              <button onClick={() => transitionTo('/register')} className="px-8 py-3.5 bg-neu-primary border-2 border-neu-black shadow-neu font-display font-bold text-sm uppercase tracking-wide text-neu-black transition-all duration-150 hover:translate-x-[3px] hover:translate-y-[3px] hover:shadow-neu-sm">{t('landing.hero.cta')}</button>
              <button onClick={() => scrollTo(portfolioRef)} className="px-8 py-3.5 bg-neu-white border-2 border-neu-black shadow-neu font-display font-bold text-sm uppercase tracking-wide text-neu-black transition-all duration-150 hover:translate-x-[3px] hover:translate-y-[3px] hover:shadow-neu-sm">{t('landing.hero.ctaSecondary')}</button>
            </div>
          </div>

          <div className="h-80 lg:h-[520px] border-2 border-neu-black bg-neu-bg relative overflow-hidden">
            <Canvas camera={{ position: [0, 0, 5.5], fov: 50 }} style={{ background: '#F5F0E8' }}>
              <ambientLight intensity={0.6} />
              <pointLight position={[5, 5, 5]} intensity={2} color="#ffffff" />
              <pointLight position={[-3, -3, 3]} intensity={1} color="#4D61FF" />
              <HeroScene />
            </Canvas>
          </div>
        </div>
      </section>

      {/* ── STATS — Anime.js ── */}
      <section className="border-b-2 border-neu-black bg-neu-black py-14">
        <div className="max-w-7xl mx-auto px-4 lg:px-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 divide-x-0 lg:divide-x-2 divide-neu-white/10">
            {stats.map((s, i) => (
              <div key={s.labelKey} className={cn('p-8 text-center reveal-scale', i > 0 && 'border-t-2 lg:border-t-0 border-neu-white/10')}>
                <p className="font-display font-bold text-4xl lg:text-5xl text-neu-primary mb-2"><AnimatedCounter target={s.value} suffix={s.suffix} /></p>
                <p className="font-body text-sm text-neu-white/60">{t(s.labelKey)}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── SERVICES ── */}
      <section id="layanan" className="border-b-2 border-neu-black py-20">
        <div className="max-w-7xl mx-auto px-4 lg:px-6">
          <div className="max-w-2xl mb-12 reveal-left">
            <div className="flex items-center gap-3 mb-2"><div className="h-1 w-10 bg-neu-accent" /><span className="font-mono text-xs text-neu-black/50 uppercase tracking-widest">{t('landing.services.tag')}</span></div>
            <h2 className="font-display font-bold text-3xl lg:text-4xl text-neu-black">{t('landing.services.title').split('\n').map((line, i) => <span key={i}>{line}{i === 0 && <br />}</span>)}</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {services.map(svc => (
              <div key={svc.title} className="reveal-up border-2 border-neu-black bg-neu-white shadow-neu p-6 group hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-neu-lg transition-all duration-150">
                <div className="text-4xl mb-4">{svc.icon}</div>
                <h3 className="font-display font-bold text-lg text-neu-black mb-2">{svc.title}</h3>
                <p className="font-body text-sm text-neu-black/60 leading-relaxed">{svc.desc}</p>
                <div className="mt-4 h-0.5 w-0 bg-neu-primary group-hover:w-full transition-all duration-300" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── SPLINE 3D SECTION ── */}
      <section className="border-b-2 border-neu-black bg-neu-black py-20 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 lg:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="reveal-up">
              <div className="flex items-center gap-3 mb-4"><div className="h-1 w-10 bg-neu-blue" /><span className="font-mono text-xs text-neu-white/50 uppercase tracking-widest">{t('landing.about.tag')}</span></div>
              <h2 className="font-display font-bold text-3xl lg:text-4xl text-neu-white mb-4">{t('landing.about.title').split('\n').map((l,i)=><span key={i}>{l}{i===0&&<br/>}</span>)}</h2>
              <p className="font-body text-sm text-neu-white/60 leading-relaxed mb-6">
                {t('landing.about.subtitle')}
              </p>
              <div className="flex flex-col gap-3">
                {(t('landing.about.features', { returnObjects: true })).map(f => (
                  <div key={f} className="flex items-center gap-3">
                    <div className="w-5 h-5 border-2 border-neu-primary bg-neu-primary flex items-center justify-center flex-shrink-0">
                      <svg className="w-3 h-3 text-neu-black" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12" /></svg>
                    </div>
                    <p className="font-body text-sm text-neu-white/70">{f}</p>
                  </div>
                ))}
              </div>
            </div>
            <div className="h-80 lg:h-[420px] border-2 border-neu-white/20 relative overflow-hidden">
              <Canvas camera={{ position: [0, 0, 4], fov: 60 }} style={{ background: '#0D0D0D' }}>
                <ambientLight intensity={0.5} />
                <pointLight position={[3, 3, 3]} intensity={2} color="#FFD000" />
                <Float speed={3} floatIntensity={2}>
                  <mesh rotation={[0.5, 0.5, 0]}>
                    <octahedronGeometry args={[1.2, 0]} />
                    <meshStandardMaterial color="#4D61FF" wireframe />
                  </mesh>
                </Float>
                <Float speed={2} floatIntensity={1}>
                  <Torus args={[2, 0.05, 8, 64]}><meshBasicMaterial color="#FFD000" /></Torus>
                </Float>
              </Canvas>
            </div>
          </div>
        </div>
      </section>

      {/* ── PAKET LAYANAN ── */}
      {packages.length > 0 && (
        <section id="paket" className="border-b-2 border-neu-black bg-neu-bg py-16">
          <div className="max-w-7xl mx-auto px-4 lg:px-6">

            {/* Section header */}
            <div className="flex items-center gap-3 mb-8">
              <div className="h-1 w-8 bg-neu-black" />
              <h2 className="font-display font-bold text-2xl uppercase tracking-wide text-neu-black">{t('landing.packages.title')}</h2>
            </div>

            {/* Drag-to-scroll slider */}
            <div
              ref={pkgSliderRef}
              className="flex gap-5 overflow-x-auto pt-5 pb-3 snap-x snap-mandatory -mx-4 px-4 lg:mx-0 lg:px-0 select-none"
              style={{ scrollbarWidth: 'none', msOverflowStyle: 'none', cursor: 'grab' }}
              onMouseDown={e => {
                const el = pkgSliderRef.current;
                pkgDrag.current = { active: true, startX: e.pageX - el.offsetLeft, scrollLeft: el.scrollLeft };
                el.style.cursor = 'grabbing';
                el.style.scrollSnapType = 'none';
              }}
              onMouseMove={e => {
                if (!pkgDrag.current.active) return;
                const el = pkgSliderRef.current;
                const x  = e.pageX - el.offsetLeft;
                el.scrollLeft = pkgDrag.current.scrollLeft - (x - pkgDrag.current.startX);
              }}
              onMouseUp={() => {
                pkgDrag.current.active = false;
                const el = pkgSliderRef.current;
                el.style.cursor = 'grab';
                el.style.scrollSnapType = 'x mandatory';
              }}
              onMouseLeave={() => {
                if (!pkgDrag.current.active) return;
                pkgDrag.current.active = false;
                const el = pkgSliderRef.current;
                el.style.cursor = 'grab';
                el.style.scrollSnapType = 'x mandatory';
              }}
            >
              {packages.map(pkg => (
                <div key={pkg.id} className="flex-shrink-0 w-72 snap-start">
                  <PackageCard pkg={pkg} onOrder={() => transitionTo('/my-orders/new')} />
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── BANNERS ── */}
      {banners.length > 0 && (
        <section className="border-b-2 border-neu-black bg-neu-primary py-10">
          <div className="max-w-7xl mx-auto px-4 lg:px-6">
            <div className="flex items-center gap-3 mb-5"><div className="h-1 w-8 bg-neu-black" /><h2 className="font-display font-bold text-lg uppercase tracking-wide text-neu-black">{t('landing.banner.title')}</h2></div>
            <div className="flex gap-4 overflow-x-auto pb-2 snap-x -mx-4 px-4 lg:mx-0 lg:px-0">
              {banners.map(b => (
                <div key={b.id}
                  onClick={() => { setBannerModal(b); setBannerModalExp(false); }}
                  className="flex-shrink-0 w-72 snap-start border-2 border-neu-black shadow-[4px_4px_0px_#0D0D0D] bg-neu-white overflow-hidden cursor-pointer group hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[6px_6px_0px_#0D0D0D] transition-all duration-150">
                  {b.image && (
                    <div className="relative border-b-2 border-neu-black overflow-hidden">
                      <img src={b.image} alt={b.title} className="w-full h-36 object-cover group-hover:scale-105 transition-transform duration-300" loading="lazy" decoding="async" />
                      <div className="absolute inset-0 bg-neu-black/0 group-hover:bg-neu-black/20 transition-all duration-200 flex items-center justify-center">
                        <span className="opacity-0 group-hover:opacity-100 transition-opacity font-mono text-xs text-neu-white bg-neu-black/70 px-3 py-1.5">{t('landing.portfolio.clickView')}</span>
                      </div>
                    </div>
                  )}
                  <div className="p-4">
                    <p className="font-display font-bold text-sm text-neu-black">{lang(b.title, b.titleEn)}</p>
                    {b.description && <p className="font-body text-xs text-neu-black/60 mt-1 line-clamp-2" dangerouslySetInnerHTML={{ __html: lang(b.description, b.descriptionEn)?.replace(/<[^>]*>/g,' ') }} />}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── PORTFOLIO ── */}
      <section id="portofolio" ref={portfolioRef} className="border-b-2 border-neu-black py-20">
        <div className="max-w-7xl mx-auto px-4 lg:px-6">
          <div className="flex items-end justify-between mb-10 flex-wrap gap-4">
            <div className="reveal-up">
              <div className="flex items-center gap-3 mb-2"><div className="h-1 w-10 bg-neu-blue" /><span className="font-mono text-xs text-neu-black/50 uppercase tracking-widest">{t('landing.portfolio.tag')}</span></div>
              <h2 className="font-display font-bold text-3xl lg:text-4xl text-neu-black">{t('landing.portfolio.title')}</h2>
              <p className="font-body text-sm text-neu-black/60 mt-1 max-w-md">{t('landing.portfolio.subtitle')}</p>
            </div>
            <button onClick={() => transitionTo('/register')} className="reveal-up px-5 py-2.5 bg-neu-primary border-2 border-neu-black shadow-neu-sm font-display font-bold text-xs uppercase text-neu-black hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all duration-150">{t('landing.portfolio.cta')}</button>
          </div>
          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">{[1,2,3].map(i => <div key={i} className="border-2 border-neu-black bg-neu-white h-64 animate-pulse" />)}</div>
          ) : portfolios.length === 0 ? (
            <div className="border-2 border-dashed border-neu-black p-16 text-center"><p className="font-body text-neu-black/40">{t('landing.portfolio.noPortfolio')}</p></div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {portfolios.map(item => {
                const imgs = item.images?.length ? item.images : (item.image ? [item.image] : []);
                return (
                  <div key={item.id} className="portfolio-card border-2 border-neu-black shadow-neu bg-neu-white overflow-hidden group cursor-pointer" onClick={() => setActivePortfolio(item)}>
                    <div className="relative h-48 bg-neu-bg border-b-2 border-neu-black overflow-hidden">
                      {imgs[0]
                        ? <img src={imgs[0]} alt={item.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-400" loading="lazy" decoding="async" />
                        : <div className="w-full h-full flex items-center justify-center"><span className="font-display font-bold text-5xl text-neu-black/15">{item.title?.charAt(0)}</span></div>}
                      {item.category && <span className="absolute top-2 left-2 bg-neu-black text-neu-white font-mono font-bold text-[10px] uppercase px-2 py-0.5">{item.category.replace(/_/g,' ')}</span>}
                      <div className="absolute inset-0 bg-neu-black/0 group-hover:bg-neu-black/20 transition-all duration-300 flex items-center justify-center">
                        <span className="opacity-0 group-hover:opacity-100 transition-opacity font-display font-bold text-sm text-neu-white bg-neu-black/80 px-4 py-2 border border-neu-white/30">{t('landing.portfolio.viewDetailHover')}</span>
                      </div>
                    </div>
                    <div className="p-4">
                      <h3 className="font-display font-bold text-base text-neu-black leading-tight mb-3">{item.title}</h3>
                      <button className="w-full py-2 bg-neu-primary border-2 border-neu-black shadow-neu-sm font-display font-bold text-xs uppercase text-neu-black transition-all duration-150 group-hover:translate-x-[2px] group-hover:translate-y-[2px] group-hover:shadow-none">{t('landing.portfolio.viewDetail')}</button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* ── WHY CHOOSE US ── */}
      <section className="border-b-2 border-neu-black bg-neu-bg py-20">
        <div className="max-w-7xl mx-auto px-4 lg:px-6">
          <div className="text-center mb-12 reveal-left">
            <div className="flex items-center justify-center gap-3 mb-2"><div className="h-1 w-8 bg-neu-green" /><span className="font-mono text-xs text-neu-black/50 uppercase tracking-widest">{t('landing.why.tag')}</span><div className="h-1 w-8 bg-neu-green" /></div>
            <h2 className="font-display font-bold text-3xl lg:text-4xl text-neu-black">{t('landing.why.title')}</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {(t('landing.why.items', { returnObjects: true })).map(w => (
              <div key={w.title} className="reveal-up border-2 border-neu-black bg-neu-white shadow-neu p-6 hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-neu-lg transition-all duration-150">
                <span className="text-3xl">{w.icon}</span>
                <h3 className="font-display font-bold text-base text-neu-black mt-3 mb-2">{w.title}</h3>
                <p className="font-body text-sm text-neu-black/60 leading-relaxed">{w.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section id="cara-kerja" className="border-b-2 border-neu-black bg-neu-black py-20">
        <div className="max-w-7xl mx-auto px-4 lg:px-6">
          <div className="text-center mb-12 reveal-up">
            <span className="font-mono text-xs text-neu-white/40 uppercase tracking-widest">{t('landing.howItWorks.tag')}</span>
            <h2 className="font-display font-bold text-3xl lg:text-4xl text-neu-white mt-1">{t('landing.howItWorks.title')}</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {(t('landing.howItWorks.steps', { returnObjects: true })).map((step, si) => {
              const colors = ['bg-neu-primary','bg-neu-blue','bg-neu-green','bg-neu-accent'];
              const shadows = ['4px 4px 0px #FFD000','4px 4px 0px #4D61FF','4px 4px 0px #00C48C','4px 4px 0px #FF5C5C'];
              return { ...step, color: colors[si], shadow: shadows[si] };
            }).map(step => (
              <div key={step.no} className="reveal-up border-2 border-neu-white/20 bg-neu-white/5 p-6" style={{ boxShadow: step.shadow }}>
                <div className={cn('w-12 h-12 border-2 border-neu-white/20 flex items-center justify-center mb-4', step.color)}>
                  <span className="font-display font-bold text-xl text-neu-black">{step.no.charAt(1)}</span>
                </div>
                <p className="font-mono font-bold text-xs text-neu-white/40 uppercase mb-1">{step.no}</p>
                <h3 className="font-display font-bold text-lg text-neu-white mb-2">{step.title}</h3>
                <p className="font-body text-xs text-neu-white/60 leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── TECH STACK ── */}
      <section className="border-b-2 border-neu-black bg-neu-bg py-12">
        <div className="max-w-7xl mx-auto px-4 lg:px-6">
          <p className="font-mono text-xs text-neu-black/40 uppercase tracking-widest text-center mb-6">{t('landing.tech.label')}</p>
          <div className="flex flex-wrap justify-center gap-3">
            {techStack.map(tech => (
              <div key={tech} className="px-4 py-2 bg-neu-white border-2 border-neu-black shadow-neu-sm font-mono font-bold text-xs text-neu-black uppercase hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-neu transition-all duration-150 cursor-default">{tech}</div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CONTACT ── */}
      {(contacts.length > 0 || socialMedia.length > 0) && (
        <section id="kontak" className="border-b-2 border-neu-black py-20">
          <div className="max-w-7xl mx-auto px-4 lg:px-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
              <div className="reveal-up">
                <div className="flex items-center gap-3 mb-2"><div className="h-1 w-10 bg-neu-green" /><span className="font-mono text-xs text-neu-black/50 uppercase tracking-widest">{t('landing.contact.tag')}</span></div>
                <h2 className="font-display font-bold text-3xl lg:text-4xl text-neu-black mb-3">{t('landing.contact.title').split('\n').map((l,i)=><span key={i}>{l}{i===0&&<br/>}</span>)}</h2>
                <p className="font-body text-sm text-neu-black/60 mb-6 leading-relaxed">{t('landing.contact.subtitle')}</p>
                {contacts.length > 0 && (
                  <div className="space-y-3">
                    {contacts.map(ct => {
                      const iconKey = (ct.icon || '').toLowerCase();
                      const { Icon, color } = getPlatform(iconKey);
                      const href = fixContactUrl(ct.linkUrl, iconKey);
                      const isEmail = iconKey === 'email' || href.startsWith('mailto:');
                      const isPhone = iconKey === 'phone' || href.startsWith('tel:');
                      return (
                        <a key={ct.id} href={href}
                          target={isEmail || isPhone ? '_self' : '_blank'}
                          rel="noopener noreferrer"
                          onClick={(e) => {
                            if (isEmail) {
                              try {
                                const emailAddr = href.replace('mailto:', '');
                                navigator.clipboard.writeText(emailAddr);
                                showToast(t('landing.contact.emailCopied', { email: emailAddr }));
                              } catch (err) {}
                            }
                          }}
                          className="flex items-center gap-4 p-4 bg-neu-white border-2 border-neu-black shadow-neu-sm hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-neu transition-all duration-150">
                          <div className="w-10 h-10 border-2 border-neu-black flex items-center justify-center flex-shrink-0" style={{ backgroundColor: color + '18' }}>
                            <Icon style={{ color }} className="w-5 h-5" />
                          </div>
                          <div><p className="font-display font-bold text-sm text-neu-black">{ct.nama}</p><p className="font-mono text-xs text-neu-black/50">{ct.contactInfo}</p></div>
                          <svg className="w-4 h-4 text-neu-black/30 ml-auto" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
                        </a>
                      );
                    })}
                  </div>
                )}
              </div>
              {socialMedia.length > 0 && (
                <div className="reveal-up">
                  <p className="font-display font-bold text-sm text-neu-black uppercase mb-4">{t('landing.contact.social')}</p>
                  <div className="grid grid-cols-2 gap-3">
                    {socialMedia.map(s => {
                      const { Icon, color } = getPlatform(s.icon ?? s.platformName?.toLowerCase());
                      return (
                        <a key={s.id} href={s.url} target="_blank" rel="noopener noreferrer"
                          className="flex items-center gap-3 p-3 bg-neu-white border-2 border-neu-black shadow-neu-sm hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-neu transition-all duration-150">
                          <Icon style={{ color }} className="w-5 h-5 flex-shrink-0" />
                          <div className="min-w-0"><p className="font-display font-bold text-xs text-neu-black truncate">{s.platformName}</p><p className="font-mono text-[10px] text-neu-black/40 truncate">{s.accountName}</p></div>
                        </a>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>
      )}

      {/* ── CTA FINAL + 3D ── */}
      <section className="border-b-2 border-neu-black bg-neu-primary overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 lg:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 items-center min-h-[480px]">
            {/* 3D Side */}
            <div className="h-64 lg:h-full border-b-2 lg:border-b-0 lg:border-r-2 border-neu-black relative overflow-hidden">
              <Canvas camera={{ position: [0, 0, 4], fov: 55 }} style={{ background: '#FFD000' }}>
                <ambientLight intensity={0.8} />
                <pointLight position={[3, 3, 3]} intensity={2} color="#ffffff" />
                <pointLight position={[-2, -2, 2]} intensity={1} color="#FF5C5C" />
                <CtaScene />
              </Canvas>
            </div>
            {/* Text Side */}
            <div className="py-16 px-8 lg:px-12">
              <h2 className="font-display font-bold text-4xl lg:text-5xl text-neu-black mb-4 reveal-up">{t('landing.cta.title').split('\n').map((l,i)=><span key={i}>{l}{i===0&&<br/>}</span>)}</h2>
              <p className="font-body text-base text-neu-black/70 mb-8 max-w-md reveal-up">{t('landing.cta.subtitle')}</p>
              <div className="flex flex-col sm:flex-row gap-3 reveal-up">
                <button onClick={() => transitionTo('/register')} className="px-8 py-4 bg-neu-black border-2 border-neu-black text-neu-white font-display font-bold text-sm uppercase shadow-[6px_6px_0px_#0D0D0D] hover:translate-x-[3px] hover:translate-y-[3px] hover:shadow-none transition-all duration-150">{t('landing.cta.primary')}</button>
                <button onClick={() => transitionTo('/login')} className="px-8 py-4 bg-neu-white border-2 border-neu-black text-neu-black font-display font-bold text-sm uppercase shadow-[6px_6px_0px_#0D0D0D] hover:translate-x-[3px] hover:translate-y-[3px] hover:shadow-none transition-all duration-150">{t('landing.cta.secondary')}</button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          FOOTER — Modern 2025
      ══════════════════════════════════════════ */}
      <footer className="bg-neu-black">

        {/* Top strip */}
        <div className="border-b border-neu-white/10">
          <div className="max-w-7xl mx-auto px-4 lg:px-6 py-10 grid grid-cols-1 lg:grid-cols-5 gap-10">

            {/* Brand col — 2/5 */}
            <div className="lg:col-span-2">
              <div className="flex items-center gap-3 mb-5">
                <div className="bg-neu-primary border-2 border-neu-primary px-3 py-1">
                  <span className="font-mono font-bold text-sm text-neu-black uppercase tracking-widest">Synectra</span>
                </div>
              </div>
              <p className="font-body text-sm text-neu-white/50 leading-relaxed mb-6 max-w-sm">
                {t('landing.footer.desc')}
              </p>
              {/* Social icons */}
              {socialMedia.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {socialMedia.slice(0, 6).map(s => {
                    const { Icon, color } = getPlatform(s.icon ?? s.platformName?.toLowerCase());
                    return (
                      <a key={s.id} href={s.url} target="_blank" rel="noopener noreferrer"
                        title={s.platformName}
                        className="group w-9 h-9 border border-neu-white/15 flex items-center justify-center hover:border-neu-primary hover:bg-neu-primary transition-all duration-200">
                        <Icon style={{ color: '#ffffff50' }} className="w-4 h-4 group-hover:!text-neu-black transition-colors duration-200" />
                      </a>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Layanan */}
            <div>
              <p className="font-mono font-bold text-[10px] text-neu-white/30 uppercase tracking-widest mb-5">{t('landing.footer.services')}</p>
              <ul className="flex flex-col gap-2.5">
                {['Web Development','Mobile App','UI/UX Design','Backend & API','Data Science','Joki Tugas'].map(item => (
                  <li key={item}>
                    <button onClick={() => transitionTo('/register')}
                      className="font-body text-sm text-neu-white/50 hover:text-neu-primary transition-colors text-left leading-none">
                      {item}
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            {/* Perusahaan */}
            <div>
              <p className="font-mono font-bold text-[10px] text-neu-white/30 uppercase tracking-widest mb-5">{t('landing.footer.company')}</p>
              <ul className="flex flex-col gap-2.5">
                {[
                  [t('landing.footer.links.home'), '/'],
                  [t('landing.footer.links.portfolio'), '/'],
                  [t('landing.footer.links.howItWorks'), '/'],
                  [t('landing.footer.links.pricing'), '/'],
                  [t('nav.login'), '/login'],
                  [t('nav.register'), '/register'],
                ].map(([label, href]) => (
                  <li key={label}>
                    <button onClick={() => transitionTo(href)}
                      className="font-body text-sm text-neu-white/50 hover:text-neu-primary transition-colors text-left leading-none">
                      {label}
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            {/* Pembayaran */}
            <div>
              <p className="font-mono font-bold text-[10px] text-neu-white/30 uppercase tracking-widest mb-5">{t('landing.footer.payment')}</p>
              <div className="flex flex-col gap-4">
                {bankAccounts.length > 0 ? bankAccounts.slice(0, 4).map(ba => (
                  <div key={ba.id} className="flex items-center gap-3">
                    {ba.bankLogo
                      ? <img src={ba.bankLogo} alt={ba.bankName} className="w-9 h-6 object-contain flex-shrink-0" />
                      : <div className="w-9 h-6 border border-neu-white/15 flex items-center justify-center flex-shrink-0"><span className="font-mono font-bold text-[9px] text-neu-white/40">{ba.bankName?.slice(0,3)}</span></div>
                    }
                    <div className="min-w-0">
                      <p className="font-mono font-bold text-xs text-neu-white/80">{ba.bankName}</p>
                      <p className="font-mono text-[10px] text-neu-white/35 truncate">{ba.accountNumber}</p>
                      <p className="font-mono text-[9px] text-neu-white/25 truncate">{ba.accountHolder}</p>
                    </div>
                  </div>
                )) : (
                  <p className="font-mono text-xs text-neu-white/20">{t('common.notConfigured')}</p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="max-w-7xl mx-auto px-4 lg:px-6 py-5 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-4 flex-wrap">
            <p className="font-mono text-[11px] text-neu-white/25">
              © {new Date().getFullYear()} Synectra. {t('landing.footer.rights')}
            </p>
          </div>
          <div className="flex items-center gap-4">
            {[t('landing.footer.privacy'), t('landing.footer.terms')].map(label => (
              <button key={label}
                className="font-mono text-[11px] text-neu-white/25 hover:text-neu-white/60 transition-colors">
                {label}
              </button>
            ))}
          </div>
        </div>
      </footer>
    </div>
  );
}
