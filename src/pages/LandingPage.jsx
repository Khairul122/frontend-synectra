import { Component, Suspense, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createPortal } from 'react-dom';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import {
  Dialog, DialogClose, DialogContent, DialogFooter,
  DialogHeader, DialogTitle, DialogDescription,
} from '../components/ui/dialog';
import { ElegantShape } from '../components/ui/shape-landing-hero';
import { gsap } from 'gsap';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, MeshDistortMaterial, Sphere, Torus, MeshWobbleMaterial, Icosahedron, Octahedron } from '@react-three/drei';
import Lenis from 'lenis';
import axios from 'axios';
import Spline from '@splinetool/react-spline';
import { cn } from '../utils/cn';
import { getPlatform } from '../constants/platforms';
import { API_BASE_URL } from '../constants/api';
import { LanguageSwitcher } from '../components/ui/LanguageSwitcher';

const BASE = API_BASE_URL || '';

/* ─── Framer Motion variants ────────────────────────────────────────── */
// Inline animation helpers — menghindari variants/stagger untuk kompatibilitas Framer Motion v12
const fadeUp   = (delay = 0) => ({
  initial:     { opacity: 0, y: 40 },
  whileInView: { opacity: 1, y: 0 },
  viewport:    { once: true },
  transition:  { duration: 0.6, delay, type: 'tween' },
});
const fadeLeft = (delay = 0) => ({
  initial:     { opacity: 0, x: -40 },
  whileInView: { opacity: 1, x: 0 },
  viewport:    { once: true },
  transition:  { duration: 0.6, delay, type: 'tween' },
});
const scaleUp  = (delay = 0) => ({
  initial:     { opacity: 0, scale: 0.88 },
  whileInView: { opacity: 1, scale: 1 },
  viewport:    { once: true },
  transition:  { duration: 0.5, delay, type: 'tween' },
});
const cardAnim = (delay = 0) => ({
  initial:     { opacity: 0, y: 30 },
  whileInView: { opacity: 1, y: 0 },
  viewport:    { once: true },
  transition:  { duration: 0.5, delay, type: 'tween' },
});

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

/* ─── Lenis smooth scroll ────────────────────────────────────────────── */
function useLenis() {
  useEffect(() => {
    const lenis = new Lenis({
      duration:    1.4,
      easing:      (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      syncTouch:   false,
    });

    function raf(time) { lenis.raf(time); requestAnimationFrame(raf); }
    const rafId = requestAnimationFrame(raf);

    return () => { lenis.destroy(); cancelAnimationFrame(rafId); };
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

/* ─── Public Spline scene URLs ──────────────────────────────────────── */
// Cara mendapatkan URL: buka spline.design → buat/pilih scene →
// Share → Public URL → copy link .splinecode → tempel di sini
const SPLINE_HERO   = '';   // ← tempel URL hero scene di sini
const SPLINE_ABOUT  = '';   // ← tempel URL about scene di sini

/* ─── Error boundary: Spline crash → render fallback R3F ────────────── */
class SplineErrorBoundary extends Component {
  constructor(props) { super(props); this.state = { failed: false }; }
  static getDerivedStateFromError() { return { failed: true }; }
  render() {
    return this.state.failed ? this.props.fallback : this.props.children;
  }
}

/* ─── Suspense fallback spinner ─────────────────────────────────────── */
function SplineFallback({ bg = '#F5F0E8' }) {
  return (
    <div className="w-full h-full flex items-center justify-center" style={{ background: bg }}>
      <div className="w-10 h-10 border-[3px] border-neu-black border-t-neu-primary animate-spin" />
    </div>
  );
}

/* ─── Wrapper: tampilkan Spline jika URL ada & valid, else R3F ──────── */
function SplineOrR3F({ scene, bg, r3fFallback, ...containerProps }) {
  if (!scene) return r3fFallback;
  return (
    <SplineErrorBoundary fallback={r3fFallback}>
      <Suspense fallback={<SplineFallback bg={bg} />}>
        <Spline scene={scene} style={{ width: '100%', height: '100%' }} />
      </Suspense>
    </SplineErrorBoundary>
  );
}

/* ─── Modern Hero 3D Scene (full-width background mode) ─────────────── */
function HeroScene() {
  const groupRef = useRef(null);
  useFrame(({ clock }) => {
    if (groupRef.current) groupRef.current.rotation.y = clock.elapsedTime * 0.08;
  });
  return (
    <group ref={groupRef} position={[1.5, 0, 0]}>
      {/* Central sphere — primary focus, shifted right */}
      <Float speed={1.5} rotationIntensity={0.3} floatIntensity={0.8}>
        <Sphere args={[1.2, 128, 128]}>
          <MeshDistortMaterial color="#FFD000" distort={0.3} speed={3} roughness={0} metalness={0.9} />
        </Sphere>
      </Float>

      <Float speed={3} rotationIntensity={2} floatIntensity={1}>
        <Icosahedron args={[0.45, 0]} position={[2.2, 0.6, 0]}>
          <meshStandardMaterial color="#4D61FF" roughness={0.1} metalness={1} />
        </Icosahedron>
      </Float>

      <Float speed={2.5} rotationIntensity={3} floatIntensity={1.5}>
        <Octahedron args={[0.35, 0]} position={[-1.5, -1, 0.5]}>
          <meshStandardMaterial color="#FF5C5C" roughness={0} metalness={1} />
        </Octahedron>
      </Float>

      <Float speed={1} floatIntensity={0.3}>
        <Torus args={[2.2, 0.04, 8, 80]}>
          <meshBasicMaterial color="#FFD000" opacity={0.6} transparent />
        </Torus>
      </Float>
      <Float speed={0.8} floatIntensity={0.2}>
        <Torus args={[3, 0.025, 8, 80]} rotation={[Math.PI / 4, 0, 0]}>
          <meshBasicMaterial color="#4D61FF" opacity={0.35} transparent />
        </Torus>
      </Float>

      {/* Floating accent dots */}
      {[[-1.5, 1.8, 0.3],[2.5, -1.5, 0.5],[1, 2.2, -0.3],[-2, 0.3, 0.8],[3.2, 1, -0.5],[-0.5, -2, 0.4]].map((pos, i) => (
        <Float key={i} speed={2 + i * 0.3} floatIntensity={0.8}>
          <Sphere args={[0.07, 16, 16]} position={pos}>
            <meshBasicMaterial color={i % 3 === 0 ? '#FFD000' : i % 3 === 1 ? '#4D61FF' : '#00C48C'} />
          </Sphere>
        </Float>
      ))}

      {/* Neubrutalism cube accent */}
      <Float speed={1.2} rotationIntensity={1} floatIntensity={0.5}>
        <mesh position={[2.8, 1.8, -1]} rotation={[0.5, 0.5, 0]}>
          <boxGeometry args={[0.5, 0.5, 0.5]} />
          <meshStandardMaterial color="#A855F7" roughness={0.1} metalness={0.8} />
        </mesh>
      </Float>
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

/* ─── Hero text reveal — overflow-hidden + GSAP translateY ──────────── */
function HeroReveal({ children, delay = 0, className = '' }) {
  const innerRef = useRef(null);
  useEffect(() => {
    gsap.fromTo(
      innerRef.current,
      { y: '110%' },
      { y: '0%', duration: 1.0, delay, ease: 'power3.out' },
    );
  }, [delay]);
  return (
    <div className={cn('overflow-hidden pb-4 -mb-4', className)}>
      <div ref={innerRef} style={{ transform: 'translateY(110%)' }}>
        {children}
      </div>
    </div>
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
        import('animejs').then(({ default: anime, stagger }) => {
          anime({ targets: el.querySelectorAll('span'), opacity: [0, 1], translateY: [30, 0],
            delay: stagger(40, { start: delay }), duration: 500, easing: 'easeOutExpo' });
        });
      }
    }, { threshold: 0.3 });
    observer.observe(el);
    return () => observer.disconnect();
  }, [text, delay]);
  return <span ref={ref} className={className} />;
}

/* ─── Portfolio Modal ───────────────────────────────────────────────── */
function PortfolioModal({ item, open, onClose, transitionTo }) {
  const { t } = useTranslation();
  const [imgIdx, setImgIdx] = useState(0);

  useEffect(() => { if (open) setImgIdx(0); }, [open]);

  const imgs = item?.images?.length ? item.images : (item?.image ? [item.image] : []);

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) onClose(); }}>
      <DialogContent className="sm:max-w-2xl p-0 flex flex-col max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>{item?.title}</DialogTitle>
          {item?.category && (
            <span className="font-mono text-xs text-neu-white/60 uppercase">
              {item.category.replace(/_/g, ' ')}
            </span>
          )}
        </DialogHeader>

        <div className="flex-1 overflow-y-auto min-h-0">
          {imgs.length > 0 && (
            <div className="relative border-b-2 border-neu-black bg-neu-bg">
              <img src={imgs[imgIdx]} alt={item?.title} className="w-full h-64 object-cover" loading="lazy" decoding="async" />
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
          <div className="px-5 py-4 border-b-2 border-neu-black">
            {item?.description
              ? <div className="font-body text-sm text-neu-black/80 leading-relaxed prose prose-sm max-w-none" dangerouslySetInnerHTML={{ __html: item.description }} />
              : <p className="font-body text-sm text-neu-black/40 italic">Tidak ada deskripsi.</p>}
          </div>
        </div>

        <DialogFooter className="gap-3 flex-wrap sm:flex-wrap">
          <button
            onClick={() => { onClose(); setTimeout(() => transitionTo('/register'), 350); }}
            className="flex-1 py-2.5 bg-neu-primary border-2 border-neu-black shadow-neu font-display font-bold text-sm uppercase text-neu-black transition-all duration-150 hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-neu-sm">
            {t('landing.order')}
          </button>
          <DialogClose className="px-5 py-2.5 bg-neu-white border-2 border-neu-black shadow-neu font-display font-bold text-sm uppercase text-neu-black transition-all duration-150 hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-neu-sm">
            Tutup
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/* ─── Software Detail Modal ─────────────────────────────────────────── */
function SoftwareDetailModal({ sw, open, onClose, transitionTo }) {
  const { t, i18n }  = useTranslation();
  const isEn         = i18n.language === 'en';
  const swName       = sw ? ((isEn && sw.nameEn) ? sw.nameEn : sw.name) : '';
  const swDesc       = sw ? ((isEn && sw.descriptionEn) ? sw.descriptionEn : sw.description) : '';
  const swFeatures   = sw ? ((isEn && sw.featuresEn) ? sw.featuresEn : sw.features) : '';
  const fmt          = (v) => `Rp ${Number(v).toLocaleString('id-ID')}`;

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) onClose(); }}>
      <DialogContent className="sm:max-w-lg p-0 flex flex-col max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>{swName}</DialogTitle>
          {sw?.category && (
            <span className="font-mono text-xs text-neu-white/50 uppercase">{sw.category}</span>
          )}
        </DialogHeader>

        {sw?.thumbnailUrl && (
          <div className="border-b-2 border-neu-black bg-neu-bg flex-shrink-0">
            <img src={sw.thumbnailUrl} alt={swName} className="w-full h-52 object-cover" loading="lazy" />
          </div>
        )}

        <div className="overflow-y-auto flex-1 divide-y-2 divide-neu-black min-h-0">
          <div className="px-5 py-3 flex items-center justify-between">
            <span className="font-mono text-xs text-neu-black/40 uppercase tracking-widest">Harga</span>
            <span className="font-display font-bold text-xl text-neu-black">{sw ? fmt(sw.price) : ''}</span>
          </div>

          {swDesc && (
            <div className="px-5 py-4">
              <p className="font-mono text-[10px] text-neu-black/40 uppercase tracking-widest mb-2">Deskripsi</p>
              <p className="font-body text-sm text-neu-black/80 leading-relaxed">{swDesc}</p>
            </div>
          )}

          {swFeatures && (
            <div className="px-5 py-4">
              <p className="font-mono text-[10px] text-neu-black/40 uppercase tracking-widest mb-3">Fitur</p>
              <ul className="space-y-2">
                {swFeatures.split('\n').filter(f => f.trim()).map((f, i) => (
                  <li key={i} className="flex items-start gap-2.5">
                    <span className="mt-0.5 w-4 h-4 flex-shrink-0 flex items-center justify-center bg-neu-primary border-2 border-neu-black">
                      <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    </span>
                    <span className="font-body text-sm text-neu-black">{f.trim()}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {sw?.techStack && (
            <div className="px-5 py-4">
              <p className="font-mono text-[10px] text-neu-black/40 uppercase tracking-widest mb-2">Tech Stack</p>
              <div className="flex flex-wrap gap-1.5">
                {sw.techStack.split('\n').filter(s => s.trim()).map(s => (
                  <span key={s} className="font-mono text-[10px] bg-neu-black text-neu-white px-2.5 py-1 border border-neu-black">{s.trim()}</span>
                ))}
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="gap-2 sm:flex-row">
          {sw?.demoUrl && (
            <a href={sw.demoUrl} target="_blank" rel="noopener noreferrer"
              className="flex-1 py-2.5 border-2 border-neu-black bg-neu-white font-display font-bold text-xs uppercase text-neu-black text-center transition-all duration-150 hover:bg-neu-bg hover:translate-x-[2px] hover:translate-y-[2px]">
              {t('landing.software.demo')}
            </a>
          )}
          <button
            onClick={() => { onClose(); setTimeout(() => transitionTo('/my-software'), 300); }}
            className="flex-1 py-2.5 bg-neu-primary border-2 border-neu-black shadow-neu font-display font-bold text-xs uppercase text-neu-black transition-all duration-150 hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-neu-sm">
            {t('landing.software.buyNow')}
          </button>
          <DialogClose className="px-5 py-2.5 bg-neu-white border-2 border-neu-black shadow-neu font-display font-bold text-xs uppercase text-neu-black transition-all duration-150 hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-neu-sm">
            Tutup
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
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
/* ─── Feedback Section ───────────────────────────────────────────────── */
function StarDisplay({ rating, size = 'sm' }) {
  const sz = size === 'lg' ? 'w-5 h-5' : 'w-3.5 h-3.5';
  return (
    <div className="flex gap-0.5">
      {[1,2,3,4,5].map(s => (
        <svg key={s} className={cn(sz, s <= rating ? 'text-neu-primary' : 'text-neu-black/20')} fill="currentColor" viewBox="0 0 20 20">
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </div>
  );
}

function FeedbackSection({ feedbacks, onSubmitted }) {
  const { t } = useTranslation();
  const [form, setForm]         = useState({ name: '', email: '', rating: 0, message: '' });
  const [hovered, setHovered]   = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted]       = useState(false);
  const [error, setError]               = useState('');
  const sliderRef = useRef(null);
  const drag      = useRef({ active: false, startX: 0, scrollLeft: 0 });

  const avg = feedbacks.length
    ? (feedbacks.reduce((s, f) => s + f.rating, 0) / feedbacks.length).toFixed(1)
    : null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim() || !form.email.trim() || form.rating === 0) {
      setError('Nama, email, dan rating wajib diisi.');
      return;
    }
    setError('');
    setIsSubmitting(true);
    try {
      const res = await axios.post(`${BASE}/api/feedbacks`, {
        name: form.name.trim(), email: form.email.trim(),
        rating: form.rating, message: form.message.trim() || undefined,
      });
      onSubmitted(res.data?.data ?? res.data);
      setSubmitted(true);
      setForm({ name: '', email: '', rating: 0, message: '' });
    } catch {
      setError('Gagal mengirim. Coba lagi.');
    } finally { setIsSubmitting(false); }
  };

  return (
    <section id="ulasan" className="border-b-2 border-neu-black bg-neu-white py-16">
      <div className="max-w-7xl mx-auto px-4 lg:px-6">

        {/* Header */}
        <div className="flex items-start justify-between mb-8 reveal-left">
          <div className="flex items-center gap-3">
            <div className="h-1 w-8 bg-neu-accent" />
            <div>
              <h2 className="font-display font-bold text-2xl uppercase tracking-wide text-neu-black">{t('landing.feedback.sectionTitle')}</h2>
              {avg && (
                <div className="flex items-center gap-2 mt-1">
                  <StarDisplay rating={Math.round(Number(avg))} size="lg" />
                  <span className="font-mono text-sm text-neu-black/60">{avg} — {t('landing.feedback.avgRating', { count: feedbacks.length })}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Review cards — drag slider */}
        {feedbacks.length === 0 ? (
          <p className="font-body text-sm text-neu-black/40 mb-10 border-2 border-dashed border-neu-black px-6 py-8 text-center">{t('landing.feedback.noReviews')}</p>
        ) : (
          <div
            ref={sliderRef}
            className="flex gap-4 overflow-x-auto pb-3 mb-10 -mx-4 px-4 lg:mx-0 lg:px-0 select-none"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none', cursor: 'grab' }}
            onMouseDown={e => { const el = sliderRef.current; drag.current = { active: true, startX: e.pageX - el.offsetLeft, scrollLeft: el.scrollLeft }; el.style.cursor = 'grabbing'; }}
            onMouseMove={e => { if (!drag.current.active) return; const el = sliderRef.current; el.scrollLeft = drag.current.scrollLeft - (e.pageX - el.offsetLeft - drag.current.startX); }}
            onMouseUp={() => { drag.current.active = false; sliderRef.current.style.cursor = 'grab'; }}
            onMouseLeave={() => { if (drag.current.active) { drag.current.active = false; sliderRef.current.style.cursor = 'grab'; } }}
          >
            {feedbacks.map(fb => (
              <div key={fb.id} className="flex-shrink-0 w-64 border-2 border-neu-black bg-neu-bg p-4 shadow-neu flex flex-col gap-2">
                <StarDisplay rating={fb.rating} />
                {fb.message && <p className="font-body text-sm text-neu-black/80 leading-relaxed line-clamp-4">"{fb.message}"</p>}
                <div className="mt-auto pt-2 border-t border-neu-black/10">
                  <p className="font-display font-bold text-xs text-neu-black">{fb.name}</p>
                  <p className="font-mono text-[10px] text-neu-black/40">{new Date(fb.createdAt).toLocaleDateString('id-ID', { day:'numeric', month:'short', year:'numeric' })}</p>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Divider */}
        <div className="flex items-center gap-4 mb-8">
          <div className="flex-1 h-px bg-neu-black/20" />
          <span className="font-mono text-xs text-neu-black/40 uppercase tracking-widest">{t('landing.feedback.formTitle')}</span>
          <div className="flex-1 h-px bg-neu-black/20" />
        </div>

        {/* Form */}
        {submitted ? (
          <div className="max-w-lg mx-auto text-center border-2 border-neu-green bg-neu-green/10 px-6 py-8">
            <svg className="w-10 h-10 text-neu-green mx-auto mb-3" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="font-display font-bold text-lg text-neu-black">{t('landing.feedback.success')}</p>
            <button onClick={() => setSubmitted(false)} className="mt-4 font-mono text-xs text-neu-black/50 hover:text-neu-black underline">
              {t('landing.feedback.submit')} →
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="max-w-lg mx-auto space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="font-display font-bold text-xs text-neu-black uppercase tracking-wide">{t('landing.feedback.nameLabel')}</label>
                <input type="text" value={form.name} onChange={e => setForm(p => ({...p, name: e.target.value}))}
                  placeholder="Nama Anda"
                  className="w-full px-4 py-2.5 bg-neu-white border-2 border-neu-black shadow-neu-sm font-body text-sm text-neu-black placeholder:text-gray-400 outline-none focus:shadow-neu transition-all duration-150" />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="font-display font-bold text-xs text-neu-black uppercase tracking-wide">{t('landing.feedback.emailLabel')}</label>
                <input type="email" value={form.email} onChange={e => setForm(p => ({...p, email: e.target.value}))}
                  placeholder="email@contoh.com"
                  className="w-full px-4 py-2.5 bg-neu-white border-2 border-neu-black shadow-neu-sm font-body text-sm text-neu-black placeholder:text-gray-400 outline-none focus:shadow-neu transition-all duration-150" />
              </div>
            </div>

            {/* Star selector */}
            <div className="flex flex-col gap-1.5">
              <label className="font-display font-bold text-xs text-neu-black uppercase tracking-wide">{t('landing.feedback.ratingLabel')}</label>
              <div className="flex gap-1">
                {[1,2,3,4,5].map(s => (
                  <button key={s} type="button"
                    onMouseEnter={() => setHovered(s)} onMouseLeave={() => setHovered(0)}
                    onClick={() => setForm(p => ({...p, rating: s}))}
                    className="w-10 h-10 flex items-center justify-center transition-transform duration-100 hover:scale-110 active:scale-95">
                    <svg className={cn('w-8 h-8 transition-colors duration-100', (hovered || form.rating) >= s ? 'text-neu-primary' : 'text-neu-black/20')} fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  </button>
                ))}
                {form.rating > 0 && <span className="ml-2 font-mono text-sm text-neu-black/50 self-center">{form.rating}/5</span>}
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="font-display font-bold text-xs text-neu-black uppercase tracking-wide">{t('landing.feedback.messageLabel')}</label>
              <textarea value={form.message} onChange={e => setForm(p => ({...p, message: e.target.value}))} rows={3}
                placeholder={t('landing.feedback.messagePlaceholder')}
                className="w-full px-4 py-2.5 bg-neu-white border-2 border-neu-black shadow-neu-sm font-body text-sm text-neu-black placeholder:text-gray-400 outline-none focus:shadow-neu transition-all duration-150 resize-none" />
            </div>

            {error && <p className="font-body text-xs text-neu-accent">{error}</p>}

            <button type="submit" disabled={isSubmitting}
              className={cn('w-full py-3 bg-neu-primary border-2 border-neu-black shadow-neu font-display font-bold text-sm uppercase text-neu-black transition-all duration-150 hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-neu-sm', isSubmitting && 'opacity-60 cursor-not-allowed')}>
              {isSubmitting ? t('landing.feedback.submitting') : t('landing.feedback.submit')}
            </button>
          </form>
        )}
      </div>
    </section>
  );
}

export default function LandingPage() {
  useLenis();
  const { t, i18n } = useTranslation();
  const { pageRef, transitionTo } = usePageTransition();
  const lang = (id, en) => i18n.language === 'en' && en ? en : id;
  const [portfolios,        setPortfolios]        = useState([]);
  const [packages,          setPackages]          = useState([]);
  const [softwareProducts,  setSoftwareProducts]  = useState([]);
  const [feedbacks,         setFeedbacks]         = useState([]);
  const [banners,           setBanners]           = useState([]);
  const [contacts,     setContacts]     = useState([]);
  const [socialMedia,  setSocialMedia]  = useState([]);
  const [bankAccounts, setBankAccounts] = useState([]);
  const [isLoading,    setIsLoading]    = useState(true);
  const [activePortfolio, setActivePortfolio] = useState(null);
  const [activeSoftware,  setActiveSoftware]  = useState(null);
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
  const swSliderRef   = useRef(null);
  const swDrag        = useRef({ active: false, startX: 0, scrollLeft: 0 });

  useEffect(() => {
    Promise.all([
      axios.get(`${BASE}/api/portfolio`).catch(() => ({ data: { data: [] } })),
      axios.get(`${BASE}/api/banners`).catch(() => ({ data: { data: [] } })),
      axios.get(`${BASE}/api/contacts`).catch(() => ({ data: { data: [] } })),
      axios.get(`${BASE}/api/social-media`).catch(() => ({ data: { data: [] } })),
      axios.get(`${BASE}/api/bank-accounts`).catch(() => ({ data: { data: [] } })),
      axios.get(`${BASE}/api/service-packages/public`).catch(() => ({ data: { data: [] } })),
      axios.get(`${BASE}/api/software-products/public`).catch(() => ({ data: { data: [] } })),
      axios.get(`${BASE}/api/feedbacks/public`).catch(() => ({ data: { data: [] } })),
    ]).then(([p, b, c, s, ba, pkg, sw, fb]) => {
      setPortfolios(p.data?.data ?? []);
      const activeBanners = (b.data?.data ?? []).filter(x => x.isActive);
      setBanners(activeBanners);
      if (activeBanners.length > 0) setBannerAd(activeBanners[0]); // tampilkan banner pertama sebagai popup
      setContacts((c.data?.data ?? []).filter(x => x.isActive));
      setSocialMedia((s.data?.data ?? []).filter(x => x.isActive));
      setBankAccounts((ba.data?.data ?? []).filter(x => x.isActive));
      setPackages(pkg.data?.data ?? []);
      setSoftwareProducts(sw.data?.data ?? []);
      setFeedbacks(fb.data?.data ?? []);
    }).finally(() => setIsLoading(false));
  }, []);


  // Hero entrance timeline — runs once on mount
  useEffect(() => {
    const tl = gsap.timeline({ delay: 0.15 });
    tl.to('.hero-badge',    { opacity: 1, y: 0, duration: 0.5, ease: 'power2.out' }, 0)
      .to('.hero-subtitle', { opacity: 1, y: 0, duration: 0.7, ease: 'power2.out' }, 0.75)
      .to('.hero-cta',      { opacity: 1, duration: 0.5, ease: 'power2.out' }, 0.95)
      .to('.hero-scroll',   { opacity: 1, duration: 0.6 }, 1.05)
    return () => tl.kill();
  }, []);

  const scrollTo = (ref) => ref.current?.scrollIntoView({ behavior: 'smooth' });

  const services = t('landing.services.items', { returnObjects: true });

  const avgRating = feedbacks.length > 0
    ? Math.round((feedbacks.reduce((s, f) => s + f.rating, 0) / feedbacks.length) / 5 * 100)
    : 0;

  const stats = [
    { labelKey: 'landing.stats.projects',    value: portfolios.length, suffix: '+' },
    { labelKey: 'landing.stats.clients',     value: feedbacks.length,  suffix: '+' },
    { labelKey: 'landing.stats.experience',  value: 5,                 suffix: '+' },
    { labelKey: 'landing.stats.satisfaction',value: avgRating,         suffix: '%' },
  ];

  const techStack = ['React', 'Next.js', 'Node.js', 'NestJS', 'Flutter', 'Laravel', 'Python', 'PostgreSQL', 'MongoDB', 'Docker', 'AWS', 'Figma'];


  return (
    <div ref={pageRef} className="min-h-screen bg-neu-bg overflow-x-hidden">
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
      <Dialog
        open={!!bannerAd}
        onOpenChange={(o) => { if (!o) { setBannerAd(null); setBannerExpanded(false); } }}
      >
        <DialogContent className={cn('p-0 transition-all duration-300', bannerExpanded ? 'sm:max-w-3xl' : 'sm:max-w-xl')}>
          <DialogTitle className="sr-only">{bannerAd?.title}</DialogTitle>
          {bannerAd && (
            !bannerExpanded ? (
              /* ── State 1: Gambar penuh, klik untuk expand ── */
              <div className="relative cursor-pointer group" onClick={() => setBannerExpanded(true)}>
                <DialogClose
                  onClick={(e) => e.stopPropagation()}
                  className="absolute top-3 right-3 z-10 w-9 h-9 bg-neu-black text-neu-white border-2 border-neu-black flex items-center justify-center font-mono text-base hover:bg-neu-accent transition-colors">
                  ×
                </DialogClose>
                <div className="absolute top-3 left-3 z-10 bg-neu-accent border-2 border-neu-black px-2 py-0.5">
                  <span className="font-mono font-bold text-[10px] text-neu-white uppercase">{t('landing.banner.promo')}</span>
                </div>
                {bannerAd.image ? (
                  <div className="relative overflow-hidden bg-neu-black">
                    <img src={bannerAd.image} alt={bannerAd.title} className="w-full max-h-[80vh] object-contain block mx-auto" />
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
                    <img src={bannerAd.image} alt={bannerAd.title} className="w-full h-full object-contain" />
                  </div>
                )}
                <div className={cn('bg-neu-white flex flex-col overflow-y-auto', bannerAd.image ? 'sm:w-1/2' : 'w-full')}>
                  <div className="flex items-center justify-between px-5 py-4 border-b-2 border-neu-black bg-neu-black flex-shrink-0">
                    <div className="flex items-center gap-2 min-w-0">
                      <div className="bg-neu-accent border-2 border-neu-accent px-2 py-0.5 flex-shrink-0">
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
                      className="flex-1 py-2.5 bg-neu-primary border-2 border-neu-black shadow-neu-sm font-display font-bold text-xs uppercase text-neu-black transition-all duration-150 hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none">
                      {t('landing.banner.learnMore')}
                    </button>
                    <DialogClose className="px-4 py-2.5 bg-neu-white border-2 border-neu-black font-display font-bold text-xs uppercase text-neu-black/60 hover:text-neu-black transition-colors">
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
          <DialogTitle className="sr-only">{bannerModal?.title}</DialogTitle>
          {bannerModal && (
            !bannerModalExp ? (
              /* State 1: Gambar penuh */
              <div
                className="relative cursor-pointer group"
                onClick={() => bannerModal.description ? setBannerModalExp(true) : null}
              >
                <DialogClose
                  onClick={(e) => e.stopPropagation()}
                  className="absolute top-3 right-3 z-10 w-9 h-9 bg-neu-black text-neu-white border-2 border-neu-black flex items-center justify-center font-mono text-base hover:bg-neu-accent transition-colors">
                  ×
                </DialogClose>
                <div className="absolute top-3 left-3 z-10 bg-neu-accent border-2 border-neu-black px-2 py-0.5">
                  <span className="font-mono font-bold text-[10px] text-neu-white uppercase">{t('landing.banner.promo')}</span>
                </div>
                {bannerModal.image ? (
                  <div className="relative overflow-hidden bg-neu-black">
                    <img src={bannerModal.image} alt={bannerModal.title} className="w-full max-h-[80vh] object-contain block mx-auto" loading="lazy" decoding="async" />
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
                    <img src={bannerModal.image} alt={bannerModal.title} className="w-full h-full object-contain" loading="lazy" decoding="async" />
                  </div>
                )}
                <div className={cn('bg-neu-white flex flex-col overflow-y-auto', bannerModal.image ? 'sm:w-1/2' : 'w-full')}>
                  <div className="flex items-center justify-between px-5 py-4 border-b-2 border-neu-black bg-neu-black flex-shrink-0">
                    <div className="flex items-center gap-2 min-w-0">
                      <div className="bg-neu-accent border-2 border-neu-accent px-2 py-0.5 flex-shrink-0">
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
                      className="flex-1 py-2.5 bg-neu-primary border-2 border-neu-black shadow-neu-sm font-display font-bold text-xs uppercase text-neu-black transition-all duration-150 hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none">
                      Pelajari Lebih Lanjut
                    </button>
                    <DialogClose className="px-4 py-2.5 bg-neu-white border-2 border-neu-black font-display font-bold text-xs uppercase text-neu-black/60 hover:text-neu-black transition-colors">
                      {t('landing.banner.close')}
                    </DialogClose>
                  </div>
                </div>
              </div>
            )
          )}
        </DialogContent>
      </Dialog>

      {/* ── NAVBAR ── */}
      <nav className="sticky top-0 z-40 bg-neu-white border-b-2 border-neu-black">
        <div className="max-w-7xl mx-auto px-4 lg:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-5">
            <img src="/logo-synectra.jpeg" alt="Synectra"
              className="h-9 w-auto max-w-[120px] border-2 border-neu-black object-contain shadow-neu-sm" />
            <div className="hidden md:flex items-center gap-6">
              {[
                { tKey: 'nav.services',    id: 'layanan'   },
                { tKey: 'nav.packages',    id: 'paket'     },
                { tKey: 'nav.software',    id: 'software'  },
                { tKey: 'nav.portfolio',   id: 'portofolio'},
                { tKey: 'nav.howItWorks',  id: 'cara-kerja'},
                { tKey: 'nav.reviews',     id: 'ulasan'    },
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
              { tKey: 'nav.packages',    id: 'paket'     },
              { tKey: 'nav.software',    id: 'software'  },
              { tKey: 'nav.portfolio',   id: 'portofolio'},
              { tKey: 'nav.howItWorks',  id: 'cara-kerja'},
              { tKey: 'nav.reviews',     id: 'ulasan'    },
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

      {/* ══════════════════════════════════════════
          HERO — Dark geometric hero
      ══════════════════════════════════════════ */}
      <section className="relative min-h-[95vh] border-b-2 border-neu-black overflow-hidden bg-[#0D0D0D]">

        {/* Layer 0 — Ambient color gradient */}
        <div className="absolute inset-0 z-0 pointer-events-none bg-gradient-to-br from-neu-primary/[0.04] via-transparent to-neu-blue/[0.05]" />

        {/* Layer 1 — Floating geometric shapes */}
        <div className="absolute inset-0 z-[1] overflow-hidden pointer-events-none">
          <ElegantShape
            delay={0.3} width={600} height={140} rotate={12}
            gradient="from-neu-primary/[0.12]"
            className="left-[-8%] md:left-[-3%] top-[15%] md:top-[18%]"
          />
          <ElegantShape
            delay={0.5} width={480} height={115} rotate={-14}
            gradient="from-neu-blue/[0.12]"
            className="right-[-4%] md:right-[2%] top-[65%] md:top-[72%]"
          />
          <ElegantShape
            delay={0.4} width={280} height={75} rotate={-8}
            gradient="from-neu-purple/[0.12]"
            className="left-[5%] md:left-[8%] bottom-[8%] md:bottom-[12%]"
          />
          <ElegantShape
            delay={0.6} width={190} height={55} rotate={20}
            gradient="from-neu-accent/[0.10]"
            className="right-[12%] md:right-[18%] top-[8%] md:top-[12%]"
          />
          <ElegantShape
            delay={0.7} width={140} height={38} rotate={-24}
            gradient="from-neu-green/[0.10]"
            className="left-[22%] md:left-[28%] top-[4%] md:top-[8%]"
          />
          {/* Extra large shape — far right, mid height */}
          <ElegantShape
            delay={0.2} width={360} height={90} rotate={5}
            gradient="from-white/[0.04]"
            className="right-[-5%] top-[30%]"
          />
        </div>

        {/* Layer 2 — Dot grid pattern */}
        <div className="absolute inset-0 z-[2] pointer-events-none"
             style={{ backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.05) 1px, transparent 1px)', backgroundSize: '32px 32px' }} />

        {/* Layer 3 — Left-side dark vignette so text stays readable */}
        <div className="absolute inset-0 z-[3] pointer-events-none"
             style={{ background: 'linear-gradient(to right, #0D0D0D 30%, rgba(13,13,13,0.85) 50%, rgba(13,13,13,0.35) 70%, transparent 100%)' }} />

        {/* Layer 4 — Content */}
        <div className="relative z-20 max-w-7xl mx-auto px-4 lg:px-6 min-h-[95vh] flex flex-col justify-center py-24">
          <div className="max-w-2xl">

            {/* Badge */}
            <div className="hero-badge inline-flex items-center gap-2 bg-white/[0.06] border border-white/[0.12] text-neu-white px-4 py-1.5 font-mono font-bold text-xs uppercase tracking-widest mb-8"
                 style={{ opacity: 0 }}>
              <span className="w-1.5 h-1.5 rounded-full bg-neu-green animate-pulse" />
              {t('landing.hero.badge')}
            </div>

            {/* Title — clip reveal per baris */}
            <h1 className="font-display font-bold text-6xl sm:text-7xl lg:text-8xl text-neu-white leading-[0.95] mb-6">
              <HeroReveal delay={0.1}>
                <span className="block">{t('landing.hero.title1')}</span>
              </HeroReveal>
              <HeroReveal delay={0.3}>
                <span className="block">
                  <span className="relative inline-block">
                    <span className="relative z-10 text-neu-primary">{t('landing.hero.title2')}</span>
                  </span>
                </span>
              </HeroReveal>
              <HeroReveal delay={0.5}>
                <span className="block">{t('landing.hero.title3')}</span>
              </HeroReveal>
            </h1>

            {/* Subtitle */}
            <p className="hero-subtitle font-body text-base lg:text-xl text-neu-white/55 mb-10 max-w-xl leading-relaxed"
               style={{ opacity: 0, transform: 'translateY(16px)' }}>
              {t('landing.hero.subtitle')}
            </p>

            {/* CTA Buttons */}
            <div className="hero-cta flex flex-wrap gap-3 mb-0" style={{ opacity: 0 }}>
              <button
                onClick={() => transitionTo('/register')}
                className="px-8 py-3.5 bg-neu-primary border-2 border-neu-primary shadow-[4px_4px_0px_#FFD000] font-display font-bold text-sm uppercase tracking-wide text-neu-black transition-all duration-150 hover:translate-x-[3px] hover:translate-y-[3px] hover:shadow-[2px_2px_0px_#FFD000] active:translate-x-1 active:translate-y-1 active:shadow-none">
                {t('landing.hero.cta')}
              </button>
              <button
                onClick={() => scrollTo(portfolioRef)}
                className="px-8 py-3.5 bg-transparent border-2 border-neu-white/40 font-display font-bold text-sm uppercase tracking-wide text-neu-white/80 transition-all duration-150 hover:border-neu-white hover:text-neu-white hover:translate-x-[3px] hover:translate-y-[3px]">
                {t('landing.hero.ctaSecondary')}
              </button>
            </div>

          </div>
        </div>

        {/* Scroll indicator */}
        <div className="hero-scroll absolute bottom-8 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center gap-2"
             style={{ opacity: 0 }}>
          <span className="font-mono text-[9px] text-neu-white/30 uppercase tracking-widest">Scroll</span>
          <div className="w-5 h-8 border-2 border-neu-white/20 flex items-start justify-center pt-1.5">
            <div className="w-1 h-2 bg-neu-white/30 animate-bounce" />
          </div>
        </div>

        {/* Bottom fade into next section */}
        <div className="absolute bottom-0 left-0 right-0 h-24 z-[4] pointer-events-none"
             style={{ background: 'linear-gradient(to bottom, transparent, #0D0D0D)' }} />
      </section>

      {/* ── MARQUEE — Tech Stack scrolling strip ── */}
      <section className="border-b-2 border-neu-black bg-neu-black overflow-hidden py-3.5">
        <div className="flex gap-10 animate-marquee whitespace-nowrap">
          {[...techStack, ...techStack, ...techStack].map((tech, i) => (
            <span key={i} className="inline-flex items-center gap-3 font-mono text-[11px] text-neu-white/40 uppercase tracking-widest flex-shrink-0">
              <span className="w-1 h-1 bg-neu-primary inline-block flex-shrink-0" />
              {tech}
            </span>
          ))}
        </div>
      </section>

      {/* ── STATS — Anime.js ── */}
      <section className="border-b-2 border-neu-black bg-neu-black py-14">
        <div className="max-w-7xl mx-auto px-4 lg:px-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 divide-x-0 lg:divide-x-2 divide-neu-white/10">
            {stats.map((s, i) => (
              <motion.div key={s.labelKey} {...scaleUp(i * 0.06)} className={cn('p-8 text-center', i > 0 && 'border-t-2 lg:border-t-0 border-neu-white/10')}>
                <p className="font-display font-bold text-4xl lg:text-5xl text-neu-primary mb-2"><AnimatedCounter key={s.value} target={s.value} suffix={s.suffix} /></p>
                <p className="font-body text-sm text-neu-white/60">{t(s.labelKey)}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── SERVICES ── */}
      <section id="layanan" className="border-b-2 border-neu-black py-20">
        <div className="max-w-7xl mx-auto px-4 lg:px-6">
          <motion.div className="max-w-2xl mb-12" {...fadeLeft()}>
            <div className="flex items-center gap-3 mb-2"><div className="h-1 w-10 bg-neu-accent" /><span className="font-mono text-xs text-neu-black/50 uppercase tracking-widest">{t('landing.services.tag')}</span></div>
            <h2 className="font-display font-bold text-3xl lg:text-4xl text-neu-black">{t('landing.services.title').split('\n').map((line, i) => <span key={i}>{line}{i === 0 && <br />}</span>)}</h2>
          </motion.div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {services.map((svc, i) => (
              <motion.div key={svc.title} {...fadeUp(i * 0.07)} className="border-2 border-neu-black bg-neu-white shadow-neu p-6 group hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-neu-lg transition-all duration-150">
                <div className="text-4xl mb-4">{svc.icon}</div>
                <h3 className="font-display font-bold text-lg text-neu-black mb-2">{svc.title}</h3>
                <p className="font-body text-sm text-neu-black/60 leading-relaxed">{svc.desc}</p>
                <div className="mt-4 h-0.5 w-0 bg-neu-primary group-hover:w-full transition-all duration-300" />
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── SPLINE 3D SECTION ── */}
      <section className="border-b-2 border-neu-black bg-neu-black py-20 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 lg:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <motion.div {...fadeUp()}>
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
            </motion.div>
            {/* ── About 3D (Spline jika URL diisi, else R3F) ── */}
            <div className="h-80 lg:h-[420px] border-2 border-neu-white/20 relative overflow-hidden"
                 style={{ boxShadow: '8px 8px 0px #FFD000' }}>

              {/* Badge */}
              <div className="absolute top-3 left-3 z-10 flex items-center gap-1.5 px-2.5 py-1 bg-neu-primary border border-neu-black">
                <span className="w-1.5 h-1.5 rounded-full bg-neu-black animate-pulse" />
                <span className="font-mono font-bold text-[9px] text-neu-black uppercase tracking-widest">3D Scene</span>
              </div>

              {/* Accent corner */}
              <div className="absolute bottom-0 right-0 w-12 h-12 bg-neu-blue border-t-2 border-l-2 border-neu-white/30 z-10 pointer-events-none" />

              <SplineOrR3F
                scene={SPLINE_ABOUT}
                bg="#0D0D0D"
                r3fFallback={
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
                }
              />
            </div>
          </div>
        </div>
      </section>

      {/* ── PAKET LAYANAN ── */}
      {packages.length > 0 && (
        <section id="paket" className="border-b-2 border-neu-black bg-neu-bg py-16">
          <div className="max-w-7xl mx-auto px-4 lg:px-6">

            {/* Section header */}
            <motion.div className="flex items-center gap-3 mb-8" {...fadeUp()}>
              <div className="h-1 w-8 bg-neu-black" />
              <h2 className="font-display font-bold text-2xl uppercase tracking-wide text-neu-black">{t('landing.packages.title')}</h2>
            </motion.div>

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

      {/* ── SOFTWARE SIAP PAKAI ── */}
      {softwareProducts.length > 0 && (
        <section id="software" className="border-b-2 border-neu-black bg-neu-black py-16">
          <div className="max-w-7xl mx-auto px-4 lg:px-6">

            {/* Header */}
            <motion.div className="flex items-center gap-3 mb-10" {...fadeLeft()}>
              <div className="h-1 w-8 bg-neu-primary" />
              <div>
                <h2 className="font-display font-bold text-2xl uppercase tracking-wide text-neu-white">
                  {t('landing.software.title')}
                </h2>
                <p className="font-body text-sm text-neu-white/50 mt-0.5">{t('landing.software.subtitle')}</p>
              </div>
            </motion.div>

            {/* Drag-to-scroll slider — no scrollbar UI */}
            <div
              ref={swSliderRef}
              className="flex gap-5 overflow-x-auto pt-5 pb-3 -mx-4 px-4 lg:mx-0 lg:px-0 select-none"
              style={{ scrollbarWidth: 'none', msOverflowStyle: 'none', cursor: 'grab' }}
              onMouseDown={e => {
                const el = swSliderRef.current;
                swDrag.current = { active: true, startX: e.pageX - el.offsetLeft, scrollLeft: el.scrollLeft };
                el.style.cursor = 'grabbing';
              }}
              onMouseMove={e => {
                if (!swDrag.current.active) return;
                const el = swSliderRef.current;
                el.scrollLeft = swDrag.current.scrollLeft - (e.pageX - el.offsetLeft - swDrag.current.startX);
              }}
              onMouseUp={() => { swDrag.current.active = false; swSliderRef.current.style.cursor = 'grab'; }}
              onMouseLeave={() => { if (swDrag.current.active) { swDrag.current.active = false; swSliderRef.current.style.cursor = 'grab'; } }}
            >
              {softwareProducts.map(sw => {
                const isEn   = i18n.language === 'en';
                const swName = (isEn && sw.nameEn)        ? sw.nameEn        : sw.name;
                const swDesc = (isEn && sw.descriptionEn) ? sw.descriptionEn : sw.description;
                const fmt    = (v) => `Rp ${Number(v).toLocaleString('id-ID')}`;
                return (
                  <motion.div key={sw.id} onClick={() => setActiveSoftware(sw)} {...cardAnim(0)} className="flex-shrink-0 w-72 flex flex-col bg-neu-white border-2 border-neu-black shadow-neu transition-all duration-200 hover:translate-x-[-3px] hover:translate-y-[-3px] hover:shadow-neu-lg cursor-pointer">

                    {/* Thumbnail */}
                    <div className="relative border-b-2 border-neu-black h-40 bg-neu-bg overflow-hidden flex items-center justify-center">
                      {sw.thumbnailUrl ? (
                        <img src={sw.thumbnailUrl} alt={swName} className="w-full h-full object-cover pointer-events-none" loading="lazy" draggable="false" />
                      ) : (
                        <svg className="w-12 h-12 text-neu-black/15" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24" draggable="false">
                          <rect x="2" y="3" width="20" height="14" /><line x1="8" y1="21" x2="16" y2="21" /><line x1="12" y1="17" x2="12" y2="21" />
                        </svg>
                      )}
                      {sw.category && (
                        <span className="absolute top-2 right-2 font-mono text-[10px] font-bold uppercase px-2 py-0.5 bg-neu-primary border border-neu-black text-neu-black">
                          {sw.category}
                        </span>
                      )}
                    </div>

                    {/* Body */}
                    <div className="p-4 flex-1 flex flex-col gap-2">
                      <p className="font-display font-bold text-sm text-neu-black leading-tight">{swName}</p>
                      {swDesc && (
                        <p className="font-body text-xs text-neu-black/60 line-clamp-2 leading-relaxed">{swDesc}</p>
                      )}
                      {sw.techStack && (
                        <div className="flex flex-wrap gap-1 mt-auto pt-1">
                          {sw.techStack.split('\n').filter(s => s.trim()).slice(0, 3).map(s => (
                            <span key={s} className="font-mono text-[10px] bg-neu-black text-neu-white px-2 py-0.5">{s.trim()}</span>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Footer */}
                    <div className="px-4 pb-4 border-t-2 border-neu-black pt-3 flex items-center justify-between gap-2">
                      <span className="font-display font-bold text-base text-neu-black whitespace-nowrap">{fmt(sw.price)}</span>
                      <div className="flex gap-1.5">
                        {sw.demoUrl && (
                          <a href={sw.demoUrl} target="_blank" rel="noopener noreferrer"
                            onMouseDown={e => e.stopPropagation()}
                            onClick={e => e.stopPropagation()}
                            className="px-2.5 py-1.5 border-2 border-neu-black bg-neu-white font-display font-bold text-[10px] uppercase text-neu-black transition-all duration-150 hover:bg-neu-bg hover:translate-x-[1px] hover:translate-y-[1px]">
                            {t('landing.software.demo')}
                          </a>
                        )}
                        <button
                          onMouseDown={e => e.stopPropagation()}
                          onClick={e => { e.stopPropagation(); transitionTo('/my-software'); }}
                          className="px-2.5 py-1.5 bg-neu-primary border-2 border-neu-black shadow-neu-sm font-display font-bold text-[10px] uppercase text-neu-black transition-all duration-150 hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none">
                          {t('landing.software.buyNow')}
                        </button>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
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
            <motion.div {...fadeUp()}>
              <div className="flex items-center gap-3 mb-2"><div className="h-1 w-10 bg-neu-blue" /><span className="font-mono text-xs text-neu-black/50 uppercase tracking-widest">{t('landing.portfolio.tag')}</span></div>
              <h2 className="font-display font-bold text-3xl lg:text-4xl text-neu-black">{t('landing.portfolio.title')}</h2>
              <p className="font-body text-sm text-neu-black/60 mt-1 max-w-md">{t('landing.portfolio.subtitle')}</p>
            </motion.div>
            <motion.button {...fadeUp()} onClick={() => transitionTo('/register')} className="px-5 py-2.5 bg-neu-primary border-2 border-neu-black shadow-neu-sm font-display font-bold text-xs uppercase text-neu-black hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all duration-150">{t('landing.portfolio.cta')}</motion.button>
          </div>
          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">{[1,2,3].map(i => <div key={i} className="border-2 border-neu-black bg-neu-white h-64 animate-pulse" />)}</div>
          ) : portfolios.length === 0 ? (
            <div className="border-2 border-dashed border-neu-black p-16 text-center"><p className="font-body text-neu-black/40">{t('landing.portfolio.noPortfolio')}</p></div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {portfolios.map((item, i) => {
                const imgs = item.images?.length ? item.images : (item.image ? [item.image] : []);
                return (
                  <motion.div key={item.id} {...cardAnim(i * 0.07)} className="border-2 border-neu-black shadow-neu bg-neu-white overflow-hidden group cursor-pointer" onClick={() => setActivePortfolio(item)}>
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
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* ── WHY CHOOSE US ── */}
      <section className="border-b-2 border-neu-black bg-neu-bg py-20">
        <div className="max-w-7xl mx-auto px-4 lg:px-6">
          <motion.div className="text-center mb-12" {...fadeLeft()}>
            <div className="flex items-center justify-center gap-3 mb-2"><div className="h-1 w-8 bg-neu-green" /><span className="font-mono text-xs text-neu-black/50 uppercase tracking-widest">{t('landing.why.tag')}</span><div className="h-1 w-8 bg-neu-green" /></div>
            <h2 className="font-display font-bold text-3xl lg:text-4xl text-neu-black">{t('landing.why.title')}</h2>
          </motion.div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {(t('landing.why.items', { returnObjects: true })).map((w, i) => (
              <motion.div key={w.title} {...fadeUp(i * 0.08)} className="border-2 border-neu-black bg-neu-white shadow-neu p-6 hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-neu-lg transition-all duration-150">
                <span className="text-3xl">{w.icon}</span>
                <h3 className="font-display font-bold text-base text-neu-black mt-3 mb-2">{w.title}</h3>
                <p className="font-body text-sm text-neu-black/60 leading-relaxed">{w.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section id="cara-kerja" className="border-b-2 border-neu-black bg-neu-black py-20">
        <div className="max-w-7xl mx-auto px-4 lg:px-6">
          <motion.div className="text-center mb-12" {...fadeUp()}>
            <span className="font-mono text-xs text-neu-white/40 uppercase tracking-widest">{t('landing.howItWorks.tag')}</span>
            <h2 className="font-display font-bold text-3xl lg:text-4xl text-neu-white mt-1">{t('landing.howItWorks.title')}</h2>
          </motion.div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {(t('landing.howItWorks.steps', { returnObjects: true })).map((step, si) => {
              const colors = ['bg-neu-primary','bg-neu-blue','bg-neu-green','bg-neu-accent'];
              const shadows = ['4px 4px 0px #FFD000','4px 4px 0px #4D61FF','4px 4px 0px #00C48C','4px 4px 0px #FF5C5C'];
              return { ...step, color: colors[si], shadow: shadows[si], idx: si };
            }).map(step => (
              <motion.div key={step.no} {...fadeUp(step.idx * 0.1)} className="border-2 border-neu-white/20 bg-neu-white/5 p-6" style={{ boxShadow: step.shadow }}>
                <div className={cn('w-12 h-12 border-2 border-neu-white/20 flex items-center justify-center mb-4', step.color)}>
                  <span className="font-display font-bold text-xl text-neu-black">{step.no.charAt(1)}</span>
                </div>
                <p className="font-mono font-bold text-xs text-neu-white/40 uppercase mb-1">{step.no}</p>
                <h3 className="font-display font-bold text-lg text-neu-white mb-2">{step.title}</h3>
                <p className="font-body text-xs text-neu-white/60 leading-relaxed">{step.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── TECH STACK — Double marquee running text ── */}
      <section className="border-b-2 border-neu-black bg-neu-bg py-8 overflow-hidden">
        {/* Label */}
        <p className="font-mono text-[10px] text-neu-black/35 uppercase tracking-widest text-center mb-5">
          {t('landing.tech.label')}
        </p>

        {/* Row 1 — kiri ke kanan */}
        <div className="relative overflow-hidden">
          <div className="flex gap-4 animate-marquee whitespace-nowrap">
            {[...techStack, ...techStack, ...techStack].map((tech, i) => (
              <div key={i} className="inline-flex items-center gap-3 flex-shrink-0 px-4 py-2 bg-neu-white border-2 border-neu-black shadow-neu-sm font-mono font-bold text-xs text-neu-black uppercase">
                <span className="w-1.5 h-1.5 bg-neu-primary flex-shrink-0" />
                {tech}
              </div>
            ))}
          </div>
        </div>

      </section>

      {/* ── CONTACT ── */}
      {(contacts.length > 0 || socialMedia.length > 0) && (
        <section id="kontak" className="border-b-2 border-neu-black py-20">
          <div className="max-w-7xl mx-auto px-4 lg:px-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
              <motion.div {...fadeUp()}>
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
              </motion.div>
              {socialMedia.length > 0 && (
                <motion.div {...fadeUp()}>
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
                </motion.div>
              )}
            </div>
          </div>
        </section>
      )}

      {/* ── RATING & ULASAN ── */}
      <FeedbackSection feedbacks={feedbacks} onSubmitted={fb => setFeedbacks(prev => [fb, ...prev])} />

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
            <motion.div className="py-16 px-8 lg:px-12" {...fadeUp()}>
              <h2 className="font-display font-bold text-4xl lg:text-5xl text-neu-black mb-4">{t('landing.cta.title').split('\n').map((l,i)=><span key={i}>{l}{i===0&&<br/>}</span>)}</h2>
              <p className="font-body text-base text-neu-black/70 mb-8 max-w-md">{t('landing.cta.subtitle')}</p>
              <div className="flex flex-col sm:flex-row gap-3">
                <button onClick={() => transitionTo('/register')} className="px-8 py-4 bg-neu-black border-2 border-neu-black text-neu-white font-display font-bold text-sm uppercase shadow-[6px_6px_0px_#0D0D0D] hover:translate-x-[3px] hover:translate-y-[3px] hover:shadow-none transition-all duration-150">{t('landing.cta.primary')}</button>
                <button onClick={() => transitionTo('/login')} className="px-8 py-4 bg-neu-white border-2 border-neu-black text-neu-black font-display font-bold text-sm uppercase shadow-[6px_6px_0px_#0D0D0D] hover:translate-x-[3px] hover:translate-y-[3px] hover:shadow-none transition-all duration-150">{t('landing.cta.secondary')}</button>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          FOOTER — Modern 2025
      ══════════════════════════════════════════ */}
      <motion.footer className="bg-neu-black" {...fadeUp()}>

        {/* Top strip */}
        <div className="border-b border-neu-white/10">
          <div className="max-w-7xl mx-auto px-4 lg:px-6 py-10 grid grid-cols-1 lg:grid-cols-4 gap-10">

            {/* Brand col — 2/5 */}
            <div className="lg:col-span-2">
              <div className="flex items-center gap-3 mb-5">
                <img src="/logo-synectra.jpeg" alt="Synectra"
                  className="h-9 w-auto max-w-[130px] border-2 border-neu-white/30 object-contain brightness-0 invert" />
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
      </motion.footer>
    </div>
  );
}
