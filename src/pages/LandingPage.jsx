import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createPortal } from 'react-dom';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence, useScroll, useSpring } from 'framer-motion';
import {
  Dialog, DialogClose, DialogContent, DialogFooter,
  DialogHeader, DialogTitle, DialogDescription,
} from '../components/ui/dialog';
import { ElegantShape } from '../components/ui/shape-landing-hero';
import { gsap } from 'gsap';
import axios from 'axios';
import { cn } from '../utils/cn';
import { getPlatform } from '../constants/platforms';
import { API_BASE_URL } from '../constants/api';
import { LanguageSwitcher } from '../components/ui/LanguageSwitcher';
import { useIsDesktop } from '../hooks/useIsDesktop';
import { supaImg } from '../utils/imageUrl';
import { Terminal, Code, Sparkles, LayoutGrid, Award, Play, X, Minus, Maximize2, ChevronDown, ChevronRight, FolderTree, Loader2 } from 'lucide-react';

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

/* ─── Lenis smooth scroll — hanya desktop, lazy, hormati reduced-motion ── */
function useLenis(enabled) {
  useEffect(() => {
    if (!enabled) return;            // mobile / reduced-motion → native scroll
    let lenis, rafId, cancelled = false;
    // Lazy-load: vendor-lenis tidak masuk bundle awal & tak ter-load di mobile
    import('lenis').then(({ default: Lenis }) => {
      if (cancelled) return;
      lenis = new Lenis({
        duration:    1.4,
        easing:      (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        smoothWheel: true,
        syncTouch:   false,
      });
      const raf = (time) => { lenis.raf(time); rafId = requestAnimationFrame(raf); };
      rafId = requestAnimationFrame(raf);
    });
    return () => {
      cancelled = true;
      if (rafId) cancelAnimationFrame(rafId);
      if (lenis) lenis.destroy();
    };
  }, [enabled]);
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
        import('animejs').then(({ animate }) => {
          const obj = { val: 0 };
          animate(obj, { val: target, duration: 2000, ease: 'outExpo',
            onUpdate: () => { if (el) el.textContent = Math.round(obj.val).toLocaleString('id-ID') + suffix; },
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
        import('animejs').then(({ animate, stagger }) => {
          animate(el.querySelectorAll('span'), { opacity: [0, 1], translateY: [30, 0],
            delay: stagger(40, { start: delay }), duration: 500, ease: 'outExpo' });
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
            <div className="border-b-2 border-neu-black">
              {/* Image area */}
              <div className="relative bg-neu-black flex items-center justify-center" style={{ maxHeight: '65vh', minHeight: '200px' }}>
                <img
                  key={imgs[imgIdx]}
                  src={supaImg(imgs[imgIdx], { width: 900 })}
                  alt={item?.title}
                  className="max-w-full object-contain block"
                  style={{ maxHeight: '65vh', animation: 'imgFadeIn 0.2s ease' }}
                  loading="lazy"
                  decoding="async"
                />
                {imgs.length > 1 && (
                  <>
                    <button onClick={() => setImgIdx(i => (i - 1 + imgs.length) % imgs.length)}
                      className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-neu-white/90 border-2 border-neu-black font-mono text-sm flex items-center justify-center hover:bg-neu-primary transition-colors">←</button>
                    <button onClick={() => setImgIdx(i => (i + 1) % imgs.length)}
                      className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-neu-white/90 border-2 border-neu-black font-mono text-sm flex items-center justify-center hover:bg-neu-primary transition-colors">→</button>
                  </>
                )}
              </div>
              {/* Dot indicators */}
              {imgs.length > 1 && (
                <div className="flex justify-center gap-1.5 py-2.5 bg-neu-bg border-t border-neu-black/10">
                  {imgs.map((_, idx) => (
                    <button
                      key={idx}
                      onClick={() => setImgIdx(idx)}
                      className={cn('w-2 h-2 border border-neu-black transition-all duration-150', idx === imgIdx ? 'bg-neu-primary' : 'bg-neu-black/20')}
                      aria-label={`Foto ${idx + 1}`}
                    />
                  ))}
                </div>
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
            <img src={supaImg(sw.thumbnailUrl, { width: 800 })} alt={swName} width="800" height="208" className="w-full h-52 object-cover" loading="lazy" decoding="async" />
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
    <div className="relative border-2 border-neu-black shadow-neu bg-neu-white flex flex-col h-full overflow-hidden transition-all duration-300 hover:-translate-x-1.5 hover:-translate-y-1.5 hover:shadow-neu-lg hover:rotate-[-0.5deg]">
      {/* Badge */}
      {pkg.badge && (
        <span className="absolute -top-3 left-4 px-3 py-0.5 bg-neu-primary border-2 border-neu-black font-mono font-bold text-[10px] uppercase z-10">
          {pkg.badge}
        </span>
      )}

      {/* Header */}
      <div className="border-b-2 border-neu-black p-5 bg-neu-black relative">
        {/* Index label */}
        <span className="absolute top-4 right-4 font-mono text-[10px] text-neu-white/30 select-none pointer-events-none">
          {String(pkg._idx ?? 1).padStart(2, '0')}
        </span>
        <div className="flex items-center gap-3 mb-3">
          {pkg.iconUrl ? (
            <div className="w-10 h-10 border-2 border-neu-white/30 overflow-hidden flex-shrink-0">
              <img src={supaImg(pkg.iconUrl, { width: 80 })} alt={pkg.name} width="40" height="40" className="w-full h-full object-cover" loading="lazy" decoding="async" />
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
        <p className="font-mono font-bold text-2xl text-neu-primary tracking-tight">{fmt(pkg.price)}</p>
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
          className="w-full py-2.5 bg-neu-primary border-2 border-neu-black shadow-neu font-display font-bold text-sm uppercase text-neu-black transition-all duration-150 hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-neu-sm active:translate-x-[4px] active:translate-y-[4px] active:shadow-none"
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
  const [formErrors, setFormErrors]     = useState({ name: '', email: '', rating: '' });
  const sliderRef = useRef(null);
  const drag      = useRef({ active: false, startX: 0, scrollLeft: 0 });

  const avg = feedbacks.length
    ? (feedbacks.reduce((s, f) => s + f.rating, 0) / feedbacks.length).toFixed(1)
    : null;

  const validate = () => {
    const errs = { name: '', email: '', rating: '' };
    if (!form.name.trim()) errs.name = 'Nama wajib diisi';
    if (!form.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) errs.email = 'Email tidak valid';
    if (!form.rating) errs.rating = 'Pilih rating terlebih dahulu';
    setFormErrors(errs);
    return !Object.values(errs).some(Boolean);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
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
            <div className="h-1 w-8 bg-neu-primary" />
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
          <div className="relative mb-10">
          <div
            ref={sliderRef}
            className="flex gap-4 overflow-x-auto pb-3 -mx-4 px-4 lg:mx-0 lg:px-0 select-none"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none', cursor: 'grab' }}
            onMouseDown={e => { const el = sliderRef.current; drag.current = { active: true, startX: e.pageX, scrollLeft: el.scrollLeft }; el.style.cursor = 'grabbing'; }}
            onMouseMove={e => { if (!drag.current.active) return; sliderRef.current.scrollLeft = drag.current.scrollLeft - (e.pageX - drag.current.startX); }}
            onMouseUp={() => { drag.current.active = false; sliderRef.current.style.cursor = 'grab'; }}
            onMouseLeave={() => { if (drag.current.active) { drag.current.active = false; sliderRef.current.style.cursor = 'grab'; } }}
            onTouchStart={e => { const el = sliderRef.current; drag.current = { active: true, startX: e.touches[0].pageX, scrollLeft: el.scrollLeft }; }}
            onTouchMove={e => { if (!drag.current.active) return; const el = sliderRef.current; el.scrollLeft = drag.current.scrollLeft - (e.touches[0].pageX - drag.current.startX); }}
            onTouchEnd={() => { drag.current.active = false; }}
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
          {/* Fade overlay kanan — menandakan ada konten lebih */}
          <div className="absolute right-0 top-0 bottom-3 w-16 bg-gradient-to-l from-neu-white to-transparent pointer-events-none" />
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
                <label className="font-display font-bold text-xs text-neu-black uppercase tracking-wide">
                  {t('landing.feedback.nameLabel')} <span className="text-neu-accent">*</span>
                </label>
                <input type="text" value={form.name} onChange={e => { setForm(p => ({...p, name: e.target.value})); setFormErrors(p => ({...p, name: ''})); }}
                  placeholder="Nama Anda"
                  required aria-required="true"
                  className={cn('w-full px-4 py-2.5 bg-neu-white border-2 shadow-neu-sm font-body text-sm text-neu-black placeholder:text-gray-400 outline-none focus:shadow-neu transition-all duration-150', formErrors.name ? 'border-neu-accent' : 'border-neu-black')} />
                {formErrors.name && <span className="font-body text-xs text-neu-accent">{formErrors.name}</span>}
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="font-display font-bold text-xs text-neu-black uppercase tracking-wide">
                  {t('landing.feedback.emailLabel')} <span className="text-neu-accent">*</span>
                </label>
                <input type="email" value={form.email} onChange={e => { setForm(p => ({...p, email: e.target.value})); setFormErrors(p => ({...p, email: ''})); }}
                  placeholder="email@contoh.com"
                  required aria-required="true"
                  className={cn('w-full px-4 py-2.5 bg-neu-white border-2 shadow-neu-sm font-body text-sm text-neu-black placeholder:text-gray-400 outline-none focus:shadow-neu transition-all duration-150', formErrors.email ? 'border-neu-accent' : 'border-neu-black')} />
                {formErrors.email && <span className="font-body text-xs text-neu-accent">{formErrors.email}</span>}
              </div>
            </div>

            {/* Star selector */}
            <div className="flex flex-col gap-1.5">
              <label className="font-display font-bold text-xs text-neu-black uppercase tracking-wide">
                {t('landing.feedback.ratingLabel')} <span className="text-neu-accent">*</span>
              </label>
              <div className="flex gap-1 items-center">
                {[1,2,3,4,5].map(s => (
                  <button key={s} type="button"
                    aria-label={`${s} bintang`}
                    onMouseEnter={() => setHovered(s)} onMouseLeave={() => setHovered(0)}
                    onClick={() => { setForm(p => ({...p, rating: s})); setFormErrors(p => ({...p, rating: ''})); }}
                    className="w-11 h-11 flex items-center justify-center transition-transform duration-100 hover:scale-110 active:scale-95">
                    <svg className={cn('w-8 h-8 transition-colors duration-100', (hovered || form.rating) >= s ? 'text-neu-primary' : 'text-neu-black/20')} fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  </button>
                ))}
                {form.rating > 0 && <span className="ml-2 font-mono text-sm text-neu-black/50">{form.rating}/5</span>}
              </div>
              {formErrors.rating && <span className="font-body text-xs text-neu-accent">{formErrors.rating}</span>}
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

/* ─── Robust Mock Fallback Datasets for Neobrutalist UI ──────────────── */
const MOCK_PORTFOLIOS = [
  {
    id: 'mock-p1',
    title: 'Synectra POS (Cloud SaaS)',
    category: 'web_development',
    image: '',
    description: 'Sistem kasir digital berbasis cloud (SaaS) untuk bisnis retail dan F&B dengan laporan realtime, multi-outlet, dan integrasi pembayaran QRIS.',
    techStack: 'React\nTailwindCSS\nNode.js\nPostgreSQL\nDocker',
  },
  {
    id: 'mock-p2',
    title: 'RekanTernak Mobile App',
    category: 'mobile_development',
    image: '',
    description: 'Aplikasi manajemen peternakan IoT & mobile untuk monitoring kesehatan ternak, jadwal pakan otomatis, dan marketplace terintegrasi.',
    techStack: 'Flutter\nNestJS\nSupabase\nMQTT\nGoogle Maps API',
  },
  {
    id: 'mock-p3',
    title: 'EduLearn LMS Dashboard',
    category: 'ui_ux_design',
    image: '',
    description: 'Perancangan desain UI/UX platform Learning Management System sekolah menengah dengan fokus pada aksesibilitas dan gamifikasi.',
    techStack: 'Figma\nUser Research\nWireframing\nPrototyping',
  }
];

const MOCK_PACKAGES = [
  {
    id: 'mock-pkg1',
    name: 'Website Starter',
    nameEn: 'Website Starter',
    price: 1500000,
    duration: '7 - 10 Hari',
    durationEn: '7 - 10 Days',
    badge: 'Populer',
    category: 'Web',
    description: 'Solusi cepat dan hemat untuk landing page bisnis, portofolio online, atau profil perusahaan.',
    descriptionEn: 'Quick and cost-effective solution for business landing pages, online portfolios, or company profiles.',
    features: 'Desain Neobrutalism Modern\nResponsive Mobile Friendly\nOptimasi SEO Basic\nIntegrasi WhatsApp & Kontak\nFree Hosting 1 Tahun\nRevisi 3x',
    featuresEn: 'Modern Neobrutalism Design\nResponsive Mobile Friendly\nBasic SEO Optimization\nWhatsApp & Contact Integration\nFree 1-Year Hosting\n3x Revisions',
  },
  {
    id: 'mock-pkg2',
    name: 'Custom Web Application',
    nameEn: 'Custom Web Application',
    price: 4500000,
    duration: '2 - 3 Minggu',
    durationEn: '2 - 3 Weeks',
    badge: 'Terbaik',
    category: 'SaaS / App',
    description: 'Pengembangan web app dengan database, dashboard admin terintegrasi, dan arsitektur tangguh.',
    descriptionEn: 'Development of web apps with databases, integrated admin dashboard, and robust architecture.',
    features: 'Frontend React/Next.js\nBackend Node.js / Laravel\nDashboard Admin & Panel Kontrol\nAutentikasi Multi-role\nIntegrasi API Pihak Ketiga\nRevisi 5x & Garansi Bug 3 Bulan',
    featuresEn: 'React/Next.js Frontend\nNode.js / Laravel Backend\nAdmin Dashboard & Control Panel\nMulti-role Authentication\nThird-Party API Integration\n5x Revisions & 3-Month Bug Warranty',
  },
  {
    id: 'mock-pkg3',
    name: 'Premium SaaS Platform',
    nameEn: 'Premium SaaS Platform',
    price: 9500000,
    duration: '4 - 6 Minggu',
    durationEn: '4 - 6 Weeks',
    badge: 'Enterprise',
    category: 'Custom Complex',
    description: 'Platform skala industri dengan dukungan integrasi payment gateway, multi-tenant SaaS, dan skalabilitas tinggi.',
    descriptionEn: 'Industrial scale platform supporting payment gateway integration, multi-tenant SaaS, and high scalability.',
    features: 'Arsitektur Cloud Skalabel\nMulti-Tenant SaaS System\nIntegrasi Midtrans / Xendit\nNotifikasi Email & WhatsApp OTP\nLaporan & Analisis Statistik Lengkap\nPremium Support 6 Bulan',
    featuresEn: 'Scalable Cloud Architecture\nMulti-Tenant SaaS System\nMidtrans / Xendit Integration\nEmail & WhatsApp OTP Alerts\nComprehensive Statistical Reports\n6-Month Premium Support',
  }
];

const MOCK_SOFTWARE = [
  {
    id: 'mock-sw1',
    name: 'Synectra POS Cloud',
    nameEn: 'Synectra POS Cloud',
    price: 750000,
    category: 'SaaS POS',
    description: 'Aplikasi kasir online siap pakai dengan manajemen inventori stok, pencetakan struk, laporan laba rugi otomatis, dan dashboard owner.',
    descriptionEn: 'Ready-to-use online cashier app with stock inventory management, receipt printing, automatic profit/loss reports, and owner dashboard.',
    features: 'Transaksi Kasir Offline/Online\nPencatatan Stok & Alarm Stok Tipis\nLaporan Keuangan Realtime\nMulti-Outlet / Multi-Cabang\nImport/Export Excel',
    featuresEn: 'Offline/Online Cashier Transaction\nStock Tracking & Low Stock Alert\nRealtime Financial Reports\nMulti-Outlet / Multi-Branch Support\nImport/Export Excel',
    techStack: 'React\nNode.js\nSQLite\nTailwindCSS',
    demoUrl: 'https://demo-pos.synectra.com',
  },
  {
    id: 'mock-sw2',
    name: 'Smart School LMS',
    nameEn: 'Smart School LMS',
    price: 1200000,
    category: 'Pendidikan',
    description: 'Learning Management System sekolah untuk pembelajaran online, ujian CBT online, pembagian raport digital, dan forum diskusi kelas.',
    descriptionEn: 'School Learning Management System for online learning, online CBT exams, digital report cards, and classroom discussion forums.',
    features: 'Ujian CBT dengan Anti-Cheat\nNilai Raport & Absensi Digital\nUpload Tugas & Materi Video\nForum Diskusi & Chat Guru-Siswa\nNotifikasi WhatsApp Wali Murid',
    featuresEn: 'CBT Exam with Anti-Cheat\nDigital Grades & Attendance\nAssignment Upload & Video Materials\nTeacher-Student Forum & Chat\nParent WhatsApp Notification',
    techStack: 'Next.js\nNestJS\nPostgreSQL\nSocket.io',
    demoUrl: 'https://demo-lms.synectra.com',
  },
  {
    id: 'mock-sw3',
    name: 'Multi-Vendor E-Commerce',
    nameEn: 'Multi-Vendor E-Commerce',
    price: 2500000,
    category: 'Marketplace',
    description: 'Source code marketplace mirip Tokopedia/Shopee lengkap dengan hitung ongkir otomatis rajaongkir, pembayaran QRIS/E-Wallet, dan chat pembeli-penjual.',
    descriptionEn: 'Marketplace source code like Tokopedia/Shopee with automatic rajaongkir shipping fee calculation, QRIS/E-Wallet payment, and buyer-seller chat.',
    features: 'Hitung Ongkir Multi-Kurir\nPembayaran QRIS Otomatis\nSystem Bagi Hasil Admin-Penjual\nLive Chat Terintegrasi\nSEO Optimized & SSR Ready',
    featuresEn: 'Multi-Courier Shipping Calc\nAutomatic QRIS Payment\nAdmin-Seller Profit Split System\nIntegrated Live Chat\nSEO Optimized & SSR Ready',
    techStack: 'Next.js\nLaravel\nMySQL\nTailwindCSS',
    demoUrl: 'https://demo-shop.synectra.com',
  }
];

const MOCK_FEEDBACKS = [
  {
    id: 'mock-fb1',
    name: 'Budi Santoso',
    rating: 5,
    message: 'Sangat puas dengan pembuatan website POS toko kami. Projek selesai tepat waktu dan tim Synectra sangat responsif jika ada kendala. Sangat direkomendasikan!',
    createdAt: '2026-06-15T08:00:00.000Z',
  },
  {
    id: 'mock-fb2',
    name: 'Clara Wijaya',
    rating: 5,
    message: 'Desain UI/UX yang dibuat sangat fresh, neobrutalism keren banget dan modern! Feedback dari tim developer kami juga lancar karena aset Figma-nya sangat rapi.',
    createdAt: '2026-06-20T09:30:00.000Z',
  },
  {
    id: 'mock-fb3',
    name: 'Rian Hidayat',
    rating: 4,
    message: 'Tugas kuliah pemrograman web terbantu sekali, penjelasannya detail saat serah terima sehingga saya paham alur kodenya saat presentasi di depan dosen.',
    createdAt: '2026-06-28T14:15:00.000Z',
  },
  {
    id: 'mock-fb4',
    name: 'Amanda Lestari',
    rating: 5,
    message: 'Jasa pembuatan web app SaaS kami dikerjakan dengan sangat profesional. Arsitekturnya bagus dan payment gateway integrasi berjalan lancar.',
    createdAt: '2026-07-01T10:00:00.000Z',
  }
];

/* ─── Brand Icons & Tech Info for Dual-Direction Marquee ─────────────── */
const TECH_PILLS = [
  { name: 'React', border: 'border-cyan-500/30', text: 'text-cyan-400', logo: (
    <svg className="w-3.5 h-3.5 text-cyan-400" viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="8">
      <ellipse cx="50" cy="50" rx="15" ry="42" transform="rotate(30 50 50)" />
      <ellipse cx="50" cy="50" rx="15" ry="42" transform="rotate(90 50 50)" />
      <ellipse cx="50" cy="50" rx="15" ry="42" transform="rotate(150 50 50)" />
      <circle cx="50" cy="50" r="7" fill="currentColor" />
    </svg>
  )},
  { name: 'Next.js', border: 'border-white/30', text: 'text-white', logo: (
    <svg className="w-3.5 h-3.5 text-white" viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="8">
      <circle cx="50" cy="50" r="42" />
      <path d="M68,32 L40,70 L52,70 L72,40 Z" fill="currentColor" />
    </svg>
  )},
  { name: 'TypeScript', border: 'border-blue-500/30', text: 'text-blue-400', logo: (
    <svg className="w-3.5 h-3.5 text-blue-400" viewBox="0 0 100 100" fill="currentColor">
      <rect width="100" height="100" rx="15" />
      <text x="50" y="80" fontStyle="normal" fontWeight="bold" fontSize="70" fontFamily="sans-serif" textAnchor="middle" fill="#0D0D0D">TS</text>
    </svg>
  )},
  { name: 'Node.js', border: 'border-green-500/30', text: 'text-green-400', logo: (
    <svg className="w-3.5 h-3.5 text-green-400" viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="8">
      <path d="M50,15 L80,32 L80,68 L50,85 L20,68 L20,32 Z" />
      <circle cx="50" cy="50" r="9" fill="currentColor" />
    </svg>
  )},
  { name: 'Figma', border: 'border-purple-500/30', text: 'text-purple-400', logo: (
    <svg className="w-3.5 h-3.5 text-purple-400" viewBox="0 0 100 100" fill="currentColor">
      <circle cx="35" cy="25" r="20" />
      <circle cx="65" cy="25" r="20" />
      <circle cx="35" cy="55" r="20" />
      <circle cx="65" cy="55" r="20" />
    </svg>
  )},
  { name: 'Docker', border: 'border-sky-500/30', text: 'text-sky-400', logo: (
    <svg className="w-3.5 h-3.5 text-sky-400" viewBox="0 0 100 100" fill="currentColor">
      <path d="M10,60 H90 V70 H10 Z M20,48 H30 V58 H20 Z M35,48 H45 V58 H35 Z M50,48 H60 V58 H50 Z" />
    </svg>
  )},
  { name: 'TailwindCSS', border: 'border-teal-500/30', text: 'text-teal-400', logo: (
    <svg className="w-3.5 h-3.5 text-teal-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
      <path d="M12 3c-1.2 0-2.4.6-3.2 1.5C7.2 3.6 5.6 3 4 3c-2.2 0-4 1.8-4 4 0 2.2 1.8 4 4 4h8c2.2 0 4-1.8 4-4 0-2.2-1.8-4-4-4z" />
      <path d="M12 21c1.2 0 2.4-.6 3.2-1.5 1.6.9 3.2 1.5 4.8 1.5 2.2 0 4-1.8 4-4 0-2.2-1.8-4-4-4H8c-2.2 0-4 1.8-4 4 0 2.2 1.8 4 4 4z" />
    </svg>
  )},
  { name: 'NestJS', border: 'border-red-500/30', text: 'text-red-500', logo: (
    <svg className="w-3.5 h-3.5 text-red-500" viewBox="0 0 100 100" fill="currentColor">
      <polygon points="50,10 90,40 75,85 25,85 10,40" />
    </svg>
  )},
  { name: 'PostgreSQL', border: 'border-blue-600/30', text: 'text-blue-300', logo: (
    <svg className="w-3.5 h-3.5 text-blue-300" viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="8">
      <path d="M30,30 Q50,15 70,30 T50,85 Z" />
    </svg>
  )},
];

const techStack = [
  'React', 'Next.js', 'TypeScript', 'Node.js', 'NestJS', 
  'PostgreSQL', 'TailwindCSS', 'Figma', 'Docker', 'Vite', 
  'GSAP', 'Lenis', 'Three.js', 'Supabase'
];

function MockIDE() {
  const [activeTab, setActiveTab] = useState('App.jsx');
  const [activeTheme, setActiveTheme] = useState('brutalist');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isReady, setIsReady] = useState(true);
  const [completedProjects, setCompletedProjects] = useState(142);
  const [liveUsers, setLiveUsers] = useState(38);
  const [isClosed, setIsClosed] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [isGlowActive, setIsGlowActive] = useState(false);
  
  // Compilation states
  const [buildStatus, setBuildStatus] = useState('idle'); // 'idle' | 'compiling' | 'success'
  const [buildLogs, setBuildLogs] = useState([]);
  
  // Live user ticker
  useEffect(() => {
    const interval = setInterval(() => {
      setLiveUsers(prev => {
        const diff = Math.floor(Math.random() * 5) - 2;
        const textNext = prev + diff;
        return textNext < 15 ? 15 : textNext > 95 ? 95 : textNext;
      });
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const THEMES = {
    brutalist: {
      name: 'Brutalist Gold',
      primary: '#FFD000',
      accent: '#FF5C5C',
      bgClass: 'bg-[#121214]',
      textClass: 'text-[#FFD000]',
      glowColor: 'from-[#FFD000]/20 via-[#FF5C5C]/15 to-transparent',
      borderColor: 'border-[#FFD000]/20'
    },
    cyberpunk: {
      name: 'Neon Cyber',
      primary: '#00F0FF',
      accent: '#FF007F',
      bgClass: 'bg-[#0b0c10]',
      textClass: 'text-[#00F0FF]',
      glowColor: 'from-[#00F0FF]/25 via-[#FF007F]/15 to-transparent',
      borderColor: 'border-[#00F0FF]/30'
    },
    sunset: {
      name: 'Sunset Glow',
      primary: '#FF7E5F',
      accent: '#FEB47B',
      bgClass: 'bg-[#181214]',
      textClass: 'text-[#FF7E5F]',
      glowColor: 'from-[#FF7E5F]/20 via-[#FEB47B]/15 to-transparent',
      borderColor: 'border-[#FF7E5F]/20'
    },
    emerald: {
      name: 'Mint Emerald',
      primary: '#00C48C',
      accent: '#A855F7',
      bgClass: 'bg-[#080d0b]',
      textClass: 'text-[#00C48C]',
      glowColor: 'from-[#00C48C]/20 via-[#A855F7]/15 to-transparent',
      borderColor: 'border-[#00C48C]/20'
    }
  };

  const currentTheme = THEMES[activeTheme];

  // Simulated compilation logs
  const runBuild = () => {
    if (buildStatus === 'compiling') return;
    setBuildStatus('compiling');
    setActiveTab('terminal.log');
    setBuildLogs([]);

    const logSteps = [
      { text: '$ synectra build --prod', delay: 100 },
      { text: '⠋ Resolving modules and dependencies...', delay: 350 },
      { text: '✔ Resolution finished [0.3s]', delay: 600 },
      { text: '⠙ Packaging files and styling assets...', delay: 850 },
      { text: '✔ App.jsx compiled [12ms]', delay: 1100 },
      { text: '✔ synectra.css compiled [8ms]', delay: 1300 },
      { text: '✔ Bundles optimized successfully (124kb)', delay: 1550 },
      { text: '🚀 Pushing staging deployment to Edge nodes...', delay: 1750 },
      { text: '✔ Live deployment: https://synectra.agency', delay: 2000 },
      { text: '🎉 SUCCESS: App is fully live!', delay: 2200 }
    ];

    logSteps.forEach((step, index) => {
      setTimeout(() => {
        setBuildLogs(prev => [...prev, step.text]);
        if (index === logSteps.length - 1) {
          setBuildStatus('success');
          // auto transition to preview dashboard after build success
          setTimeout(() => {
            setActiveTab('dashboard.jsx');
            // Trigger temporary glow burst
            setIsGlowActive(true);
            setTimeout(() => setIsGlowActive(false), 1200);
          }, 800);
        }
      }, step.delay);
    });
  };

  const files = [
    { name: 'App.jsx', type: 'code', icon: <Code className="w-3 h-3 text-[#4D61FF]" /> },
    { name: 'dashboard.jsx', type: 'preview', icon: <LayoutGrid className="w-3 h-3 text-[#00C48C]" /> },
    { name: 'synectra.css', type: 'style', icon: <Sparkles className="w-3 h-3 text-[#FFD000]" /> }
  ];

  if (buildStatus !== 'idle') {
    files.push({ name: 'terminal.log', type: 'log', icon: <Terminal className="w-3 h-3 text-white/40" /> });
  }

  if (isClosed) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.8, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.8 }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsClosed(false)}
        className="cursor-pointer group relative flex items-center gap-3 px-5 py-3.5 bg-[#0d0d0f]/95 border-2 border-neu-black rounded-xl shadow-neu hover:translate-x-[-2px] hover:translate-y-[-2px] transition-transform select-none z-30"
        style={{ borderColor: currentTheme.primary }}
      >
        <div className="absolute -inset-2 rounded-xl blur-lg opacity-40 transition-all duration-300 bg-gradient-to-r from-neu-primary to-neu-accent animate-pulse" />
        <div className="w-6 h-6 rounded-full bg-white/5 border border-white/10 flex items-center justify-center">
          <Terminal className="w-3.5 h-3.5 text-white/70 animate-pulse" />
        </div>
        <div className="flex flex-col">
          <span className="font-mono text-[8px] text-white/40 uppercase tracking-widest font-bold">IDE COLLAPSED</span>
          <span className="font-display text-xs text-white/90 font-bold tracking-wide">
            Restore Workstation ✦
          </span>
        </div>
        <span className="flex w-2 h-2 rounded-full relative">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75" style={{ backgroundColor: currentTheme.primary }} />
          <span className="relative inline-flex rounded-full h-2 w-2" style={{ backgroundColor: currentTheme.primary }} />
        </span>
      </motion.div>
    );
  }

  return (
    <div className="relative w-full max-w-[500px]">
      {/* Ambient background glow */}
      <div className={cn(
        "absolute -inset-10 rounded-full blur-[100px] opacity-40 transition-all duration-700 pointer-events-none bg-gradient-to-tr",
        currentTheme.glowColor
      )} />

      {/* Main IDE Window */}
      <motion.div
        initial={{ opacity: 0, scale: 0.92, y: 40 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.85, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
        className={cn(
          "relative w-full bg-[#121214]/85 backdrop-blur-xl border-2 rounded-xl overflow-hidden shadow-[0_30px_80px_rgba(0,0,0,0.85)] group flex flex-col transition-all duration-500",
          isGlowActive ? "shadow-[0_0_35px_rgba(0,196,140,0.25)] border-[#00C48C]" : currentTheme.borderColor
        )}
      >
        {/* Top Bar / Chrome Window Header */}
        <div className="flex items-center justify-between px-4 py-2.5 bg-[#0a0a0c] border-b border-white/5 relative z-10">
          <div className="flex items-center gap-1.5">
            <button 
              onClick={() => setIsClosed(true)} 
              className="w-3 h-3 rounded-full bg-neu-accent/80 border border-neu-accent flex items-center justify-center group/btn relative cursor-pointer"
              title="Close Editor"
            >
              <X className="w-1.5 h-1.5 text-black opacity-0 group-hover/btn:opacity-100 transition-opacity absolute" />
            </button>
            <button 
              onClick={() => setIsMinimized(!isMinimized)} 
              className="w-3 h-3 rounded-full bg-[#FFB800] border border-[#E0A200] flex items-center justify-center group/btn relative cursor-pointer"
              title="Toggle Minimize"
            >
              <Minus className="w-1.5 h-1.5 text-black opacity-0 group-hover/btn:opacity-100 transition-opacity absolute" />
            </button>
            <button 
              onClick={() => {
                setIsGlowActive(true);
                setTimeout(() => setIsGlowActive(false), 1200);
              }} 
              className="w-3 h-3 rounded-full bg-[#00C48C]/80 border border-[#00A877] flex items-center justify-center group/btn relative cursor-pointer"
              title="Trigger Boost"
            >
              <Maximize2 className="w-1.5 h-1.5 text-black opacity-0 group-hover/btn:opacity-100 transition-opacity absolute" />
            </button>
          </div>
          
          <div className="flex items-center gap-2">
            <Terminal className="w-3 h-3 text-white/35" />
            <span className="font-mono text-[9px] text-white/35 uppercase tracking-widest font-bold">synectra-compiler v2.4</span>
          </div>

          {/* Run Button */}
          <div className="flex items-center">
            <button
              onClick={runBuild}
              disabled={buildStatus === 'compiling'}
              className={cn(
                "flex items-center gap-1 px-2.5 py-0.5 rounded bg-white/5 hover:bg-white/10 text-white/80 hover:text-white transition-all text-[9.5px] font-mono border border-white/10 font-bold cursor-pointer",
                buildStatus === 'compiling' && "opacity-50 cursor-not-allowed bg-[#FFD000]/10 border-[#FFD000]/20 text-[#FFD000]"
              )}
            >
              {buildStatus === 'compiling' ? (
                <Loader2 className="w-2.5 h-2.5 animate-spin text-[#FFD000]" />
              ) : (
                <Play className="w-2.5 h-2.5 fill-current text-[#00C48C]" />
              )}
              <span>{buildStatus === 'compiling' ? 'BUILDING...' : 'RUN BUILD'}</span>
            </button>
          </div>
        </div>

        {/* If Minimized, show simple status info */}
        {isMinimized && (
          <div className="px-4 py-2 bg-[#0d0d0f] text-[9.5px] font-mono text-white/40 flex justify-between border-t border-white/5 items-center">
            <span>Editor minimized. Workstation active.</span>
            <span className="text-[#FFD000] cursor-pointer hover:underline font-bold" onClick={() => setIsMinimized(false)}>Expand Workspace</span>
          </div>
        )}

        {/* Editor Main Content Section */}
        {!isMinimized && (
          <div className="flex flex-1 min-h-[250px] relative">
            {/* Sidebar File Explorer */}
            {isSidebarOpen && (
              <div className="w-[125px] flex-shrink-0 bg-[#0d0d0f] border-r border-white/5 flex flex-col justify-between p-3 font-mono text-[9.5px] select-none text-white/60">
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-[8px] uppercase tracking-wider text-white/35 font-bold">
                    <span>WORKSPACE</span>
                    <FolderTree className="w-2.5 h-2.5 text-white/30" />
                  </div>
                  
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-1 text-white/40">
                      <ChevronDown className="w-2.5 h-2.5" />
                      <span>src</span>
                    </div>
                    <div className="pl-2 space-y-1">
                      {files.map(f => (
                        <button
                          key={f.name}
                          onClick={() => setActiveTab(f.name)}
                          className={cn(
                            "flex items-center gap-1.5 w-full text-left py-0.5 px-1 rounded transition-colors cursor-pointer",
                            activeTab === f.name 
                              ? "bg-white/[0.06] text-white font-bold" 
                              : "hover:bg-white/[0.03] text-white/60 hover:text-white"
                          )}
                        >
                          {f.icon}
                          <span className="truncate">{f.name}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Quick Stats in Sidebar */}
                <div className="pt-2 border-t border-white/5 space-y-0.5 text-[8px] text-white/30">
                  <div className="flex justify-between">
                    <span>Branch:</span>
                    <span className="text-white/60 font-bold">main</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Modules:</span>
                    <span className="text-white/60">42</span>
                  </div>
                </div>
              </div>
            )}

            {/* Editor Content Area */}
            <div className="flex-1 flex flex-col bg-[#121214]/90 backdrop-blur-md relative overflow-hidden">
              {/* Tabs Bar */}
              <div className="flex bg-[#0d0d0f] border-b border-white/5 text-[10px] font-mono relative z-10 justify-between items-center pr-2">
                <div className="flex overflow-x-auto scrollbar-none">
                  {/* Sidebar toggle button */}
                  <button
                    onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                    className="p-2 border-r border-white/5 text-white/40 hover:text-white hover:bg-white/5 transition-all flex items-center justify-center cursor-pointer"
                    title="Toggle Sidebar"
                  >
                    <LayoutGrid className="w-3.5 h-3.5 rotate-90" />
                  </button>

                  {files.map(tab => (
                    <button
                      key={tab.name}
                      onClick={() => setActiveTab(tab.name)}
                      className={cn(
                        "px-3 py-2 border-r border-white/5 transition-all flex items-center gap-1.5 relative cursor-pointer",
                        activeTab === tab.name 
                          ? "bg-[#121214] text-white font-bold" 
                          : "text-white/40 hover:text-white/70 hover:bg-white/5"
                      )}
                    >
                      {tab.name === 'App.jsx' && <Code className="w-2.5 h-2.5 text-[#4D61FF]" />}
                      {tab.name === 'dashboard.jsx' && <LayoutGrid className="w-2.5 h-2.5 text-[#00C48C]" />}
                      {tab.name === 'synectra.css' && <Sparkles className="w-2.5 h-2.5 text-[#FFD000]" />}
                      {tab.name === 'terminal.log' && <Terminal className="w-2.5 h-2.5 text-white/40" />}
                      
                      {tab.name}
                      {activeTab === tab.name && (
                        <span 
                          className="absolute top-0 left-0 right-0 h-[2px] transition-colors duration-300"
                          style={{ backgroundColor: currentTheme.primary }} 
                        />
                      )}
                    </button>
                  ))}
                </div>

                <div className="text-white/30">
                  <span className="text-[8px] font-mono">UTF-8</span>
                </div>
              </div>

              {/* Text/Content view */}
              <div className="p-4 flex-1 font-mono text-[9.5px] leading-relaxed overflow-y-auto scrollbar-none relative z-10 select-text">
                {/* TAB 1: App.jsx */}
                {activeTab === 'App.jsx' && (
                  <div className="space-y-1">
                    <div>
                      <span className="text-[#FF5C5C]">import</span> React, &#123;{' '}
                      <span className="text-white/70">useState</span> &#125;{' '}
                      <span className="text-[#FF5C5C]">from</span>{' '}
                      <span className="text-[#00C48C]">'react'</span>;
                    </div>
                    <div>
                      <span className="text-[#FF5C5C]">import</span> &#123;{' '}
                      <span className="text-white/70">SystemBuilder</span> &#125;{' '}
                      <span className="text-[#FF5C5C]">from</span>{' '}
                      <span className="text-[#00C48C]">'./synectra-core'</span>;
                    </div>
                    <div className="h-1" />
                    <div>
                      <span className="text-[#FF5C5C] font-bold">export default function</span>{' '}
                      <span className="text-[#4D61FF] font-bold">DigitalPartner</span>() &#123;
                    </div>
                    
                    <div className="pl-4">
                      <span className="text-[#FF5C5C]">const</span> [isReady, setIsReady] ={' '}
                      <span className="text-[#4D61FF]">useState</span>(
                      <button
                        onClick={() => setIsReady(!isReady)}
                        className="mx-1 px-1.5 py-0.5 rounded bg-white/5 hover:bg-white/10 hover:text-white text-white border border-white/10 font-bold transition-all cursor-pointer inline-flex items-center gap-1 select-none text-[8.5px]"
                        title="Click to toggle boolean!"
                      >
                        <span className={cn("w-1.5 h-1.5 rounded-full", isReady ? "bg-[#00C48C]" : "bg-[#FF5C5C]")} />
                        {isReady ? 'true' : 'false'}
                      </button>
                      );
                    </div>

                    <div className="pl-4">
                      <span className="text-[#FF5C5C]">const</span> features = [
                      <span className="text-[#00C48C]">'Web'</span>,{' '}
                      <span className="text-[#00C48C]">'Mobile'</span>,{' '}
                      <span className="text-[#00C48C]">'Design'</span>
                      ];
                    </div>
                    <div className="h-1" />
                    <div className="pl-4"><span className="text-[#FF5C5C]">return</span> (</div>
                    <div className="pl-8 text-white/40">&lt;<span className="text-white font-bold" style={{ color: currentTheme.primary }}>SystemBuilder</span></div>
                    <div className="pl-12 text-white/50">
                      client=<span className="text-white">"You"</span>
                    </div>
                    <div className="pl-12 text-white/50">
                      status=
                      <span className="text-white">
                        &#123;isReady ?{' '}
                        <span className="text-[#00C48C]">'ACTIVE'</span> :{' '}
                        <span className="text-[#FF5C5C]">'STAGING'</span>&#125;
                      </span>
                    </div>
                    <div className="pl-12 text-white/50">
                      stack=&#123;features&#125;
                    </div>
                    <div className="pl-8 text-white/40">/&gt;</div>
                    <div className="pl-4">);</div>
                    <div>&#125;</div>

                    <div className="mt-3 pt-2.5 border-t border-white/5 text-[8.5px] text-white/30 flex items-center gap-1.5 select-none">
                      <span className="flex w-1.5 h-1.5 rounded-full bg-neu-primary animate-pulse" />
                      <span>Interactive: Click the <code className="bg-white/5 px-1 py-0.5 rounded text-white/60 font-mono">true/false</code> button above to toggle compilation state!</span>
                    </div>
                  </div>
                )}

                {/* TAB 2: dashboard.jsx */}
                {activeTab === 'dashboard.jsx' && (
                  <div className="flex flex-col gap-2.5 h-full select-none">
                    {/* Header Preview bar */}
                    <div className="flex items-center justify-between pb-1.5 border-b border-white/5">
                      <div className="flex items-center gap-1.5">
                        <span className={cn("w-1.5 h-1.5 rounded-full animate-pulse", isReady ? "bg-[#00C48C]" : "bg-[#FF5C5C]")} />
                        <span className="text-[8px] text-white/50 font-bold uppercase tracking-wider">
                          {isReady ? 'ACTIVE ENVIRONMENT' : 'STAGING MODE'}
                        </span>
                      </div>
                      <span className="px-1.5 py-0.5 rounded bg-white/5 text-white/60 text-[7px] uppercase tracking-wider border border-white/10">
                        synectra-os
                      </span>
                    </div>

                    {/* Grid cards */}
                    <div className="grid grid-cols-3 gap-2">
                      <div className="p-2 border border-white/5 bg-[#0a0a0c] rounded flex flex-col justify-between hover:border-white/10 transition-colors">
                        <p className="text-[7px] text-white/40 uppercase font-bold tracking-wider leading-tight">Completed Projects</p>
                        <div className="flex items-center justify-between mt-1">
                          <p className="text-xs font-bold text-white font-display">{completedProjects}+</p>
                          <button
                            onClick={() => setCompletedProjects(prev => prev + 1)}
                            className="w-3.5 h-3.5 rounded bg-white/5 hover:bg-[#00C48C]/20 hover:text-[#00C48C] text-white/40 flex items-center justify-center text-[8.5px] font-bold border border-white/10 transition-colors cursor-pointer"
                            title="Increment Project Counter"
                          >
                            +
                          </button>
                        </div>
                      </div>

                      <div className="p-2 border border-white/5 bg-[#0a0a0c] rounded flex flex-col justify-between hover:border-white/10 transition-colors">
                        <p className="text-[7px] text-white/40 uppercase font-bold tracking-wider leading-tight">Active Visitors</p>
                        <div className="flex items-baseline gap-1 mt-1">
                          <p className="text-xs font-bold font-display text-white">{liveUsers}</p>
                          <span className="text-[6.5px] text-[#00C48C] animate-pulse">● live</span>
                        </div>
                      </div>

                      <div className="p-2 border border-white/5 bg-[#0a0a0c] rounded flex flex-col justify-between hover:border-white/10 transition-colors">
                        <p className="text-[7px] text-white/40 uppercase font-bold tracking-wider leading-tight">Client Rating</p>
                        <div className="flex items-center gap-1 mt-1">
                          <p className="text-xs font-bold text-white font-display">4.9</p>
                          <span className="text-[8px] text-[#FFD000]">★</span>
                          <span className="text-[6.5px] text-white/30 font-mono">(118)</span>
                        </div>
                      </div>
                    </div>

                    {/* Interactive Performance SVG Waveform */}
                    <div className="border border-white/5 bg-[#0a0a0c]/80 rounded p-2 flex flex-col justify-between h-[75px] hover:border-white/10 transition-all">
                      <div className="flex items-center justify-between mb-0.5">
                        <span className="text-[7px] text-white/40 uppercase font-bold tracking-wider">PERFORMANCE MONITOR</span>
                        <span className="text-[7px] font-mono" style={{ color: currentTheme.primary }}>+18.4% monthly growth</span>
                      </div>
                      
                      <div className="flex-1 w-full relative flex items-end overflow-hidden">
                        <svg className="w-full h-full" viewBox="0 0 320 50">
                          <defs>
                            <linearGradient id="gradient-wave" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="0%" stopColor={currentTheme.primary} stopOpacity="0.25" />
                              <stop offset="100%" stopColor={currentTheme.primary} stopOpacity="0.0" />
                            </linearGradient>
                          </defs>
                          {/* Shadow path */}
                          <path
                            d="M0 45 C40 35, 80 40, 120 15 C160 -10, 200 45, 240 25 C280 5, 300 15, 320 20 L320 50 L0 50 Z"
                            fill="url(#gradient-wave)"
                          />
                          {/* Main stroke */}
                          <path
                            d="M0 45 C40 35, 80 40, 120 15 C160 -10, 200 45, 240 25 C280 5, 300 15, 320 20"
                            fill="none"
                            stroke={currentTheme.primary}
                            strokeWidth="2"
                            strokeLinecap="round"
                          />
                          
                          {/* Floating target point */}
                          <circle cx="240" cy="25" r="3.5" fill={currentTheme.accent} />
                          <circle cx="240" cy="25" r="7" fill="none" stroke={currentTheme.accent} strokeWidth="1" className="animate-ping" />
                        </svg>
                        
                        {/* Tooltip Overlay */}
                        <div className="absolute top-0 right-1 bg-white/[0.04] border border-white/10 px-1 py-0.5 rounded text-[6.5px] text-white/80 font-mono">
                          Node Server Response: 14ms
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* TAB 3: synectra.css */}
                {activeTab === 'synectra.css' && (
                  <div className="space-y-1">
                    <div><span className="text-[#A855F7]">:root</span> &#123;</div>
                    <div className="pl-4">--font-display: <span className="text-[#00C48C]">"Space Grotesk", sans-serif</span>;</div>
                    <div className="pl-4">--font-body: <span className="text-[#00C48C]">"DM Sans", sans-serif</span>;</div>
                    <div className="h-1" />
                    <div className="pl-4 text-white/30">/* Color Variables: Click a button below to swap IDE Theme */</div>
                    
                    {/* Swapper code line */}
                    <div className="pl-4 flex items-center gap-2 flex-wrap">
                      <span>--color-primary:</span>
                      <span className="font-bold" style={{ color: currentTheme.primary }}>{currentTheme.primary}</span>;
                    </div>

                    {/* Interactive Swatches selectors */}
                    <div className="pl-4 py-2 my-1 bg-white/5 rounded-lg border border-white/5 space-y-1.5 select-none">
                      <p className="text-[8px] uppercase tracking-wider text-white/40 font-bold">Select Active Workspace Color Theme:</p>
                      <div className="flex gap-2 flex-wrap">
                        {Object.entries(THEMES).map(([key, t]) => (
                          <button
                            key={key}
                            onClick={() => setActiveTheme(key)}
                            className={cn(
                              "flex items-center gap-1 px-2 py-0.5 rounded text-[8px] transition-all border font-bold cursor-pointer",
                              activeTheme === key 
                                ? "bg-white/10 text-white border-white/20 shadow-sm" 
                                : "bg-transparent text-white/40 border-transparent hover:text-white hover:bg-white/[0.03]"
                            )}
                          >
                            <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: t.primary }} />
                            <span>{t.name}</span>
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="pl-4">--color-accent: <span style={{ color: currentTheme.accent }}>{currentTheme.accent}</span>;</div>
                    <div className="pl-4">--theme-background: <span className="text-white/60">#121214</span>;</div>
                    <div className="pl-4">--border-cyber: <span className="text-white/60">1px solid var(--color-primary)</span>;</div>
                    <div>&#125;</div>
                  </div>
                )}

                {/* TAB 4: terminal.log */}
                {activeTab === 'terminal.log' && (
                  <div className="space-y-1 font-mono text-[8.5px] text-white/80 select-text">
                    {buildLogs.map((log, index) => (
                      <div 
                        key={index}
                        className={cn(
                          "flex items-start gap-1.5",
                          log.includes('✔') && "text-[#00C48C]",
                          log.includes('🚀') && "text-white font-bold",
                          log.includes('🎉') && "text-white font-bold bg-[#00C48C]/15 border border-[#00C48C]/20 px-2 py-0.5 rounded my-0.5 inline-block"
                        )}
                      >
                        {(log.includes('⠋') || log.includes('⠙')) ? (
                          <Loader2 className="w-2.5 h-2.5 text-neu-primary animate-spin inline-shrink-0 mt-0.5" />
                        ) : null}
                        <span>{(log.includes('⠋') || log.includes('⠙')) ? log.substring(1) : log}</span>
                      </div>
                    ))}
                    
                    {buildStatus === 'compiling' && (
                      <div className="w-1.5 h-2.5 bg-white/70 animate-pulse inline-block" />
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Status Bar */}
        {!isMinimized && (
          <div className="h-6 bg-[#0a0a0c] border-t border-white/5 px-3 flex items-center justify-between text-[8px] font-mono text-white/30 select-none z-10 relative">
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1 text-[#00C48C] font-bold">
                <span className="w-1 h-1 rounded-full bg-[#00C48C] animate-ping" />
                Connected
              </span>
              <span>git: main</span>
              <span style={{ color: currentTheme.primary }}>● {currentTheme.name} Theme</span>
            </div>
            <div className="flex items-center gap-3">
              <span>Ln 14, Col 5</span>
              <span>UTF-8</span>
              <span>React</span>
            </div>
          </div>
        )}
      </motion.div>

      {/* Floating Badges - Dynamically styled based on active theme colors! */}
      <div className="absolute -top-3.5 -right-3.5 z-30">
        <motion.div
          animate={{ y: [-3, 3, -3] }}
          transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
          className="text-neu-black border-2 border-neu-black px-2.5 py-1 text-[8.5px] font-mono font-black uppercase tracking-wider rotate-[6deg] shadow-neu-sm transition-colors duration-300"
          style={{ backgroundColor: currentTheme.primary }}
        >
          ✦ TECH-PARTNER
        </motion.div>
      </div>

      <div className="absolute -bottom-3.5 -left-3.5 z-30">
        <motion.div
          animate={{ y: [3, -3, 3] }}
          transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut' }}
          className="text-neu-white border-2 border-neu-black px-2.5 py-1 text-[8.5px] font-mono font-black uppercase tracking-wider rotate-[-4deg] shadow-neu-sm transition-colors duration-300"
          style={{ backgroundColor: currentTheme.accent }}
        >
          ✦ 100% SATISFACTION
        </motion.div>
      </div>
    </div>
  );
}

export default function LandingPage() {
  const isDesktop = useIsDesktop();
  useLenis(isDesktop);
  const { t, i18n } = useTranslation();
  
  // Smooth scroll progress hook
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 100, damping: 30, restDelta: 0.001 });

  // Interactive mouse tracking state for Hero background
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [isHoveredHero, setIsHoveredHero] = useState(false);
  const handleHeroMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setMousePos({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    });
  };

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

  const activePortfolios = portfolios.length > 0 ? portfolios : MOCK_PORTFOLIOS;
  const activePackages = packages.length > 0 ? packages : MOCK_PACKAGES;
  const activeSoftwareProducts = softwareProducts.length > 0 ? softwareProducts : MOCK_SOFTWARE;
  const activeFeedbacks = feedbacks.length > 0 ? feedbacks : MOCK_FEEDBACKS;

  const services = t('landing.services.items', { returnObjects: true });

  const avgRating = activeFeedbacks.length > 0
    ? Math.round((activeFeedbacks.reduce((s, f) => s + f.rating, 0) / activeFeedbacks.length) / 5 * 100)
    : 98; // Fallback to 98% if no reviews yet

  const stats = [
    { labelKey: 'landing.stats.projects',    value: activePortfolios.length, suffix: '+' },
    { labelKey: 'landing.stats.clients',     value: activeFeedbacks.length,  suffix: '+' },
    { labelKey: 'landing.stats.experience',  value: 5,                 suffix: '+' },
    { labelKey: 'landing.stats.satisfaction',value: avgRating,         suffix: '%' },
  ];


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
      <motion.div 
        className="fixed top-0 left-0 right-0 h-[3.5px] bg-neu-accent z-[99] origin-left"
        style={{ scaleX }}
      />
      <nav className="sticky top-0 z-40 bg-neu-white border-b-2 border-neu-black">
        <div className="max-w-7xl mx-auto px-4 lg:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-5">
            <picture>
              <source srcSet="/logo-synectra.webp" type="image/webp" />
              <img src="/logo-synectra.jpeg" alt="Synectra" width="120" height="36"
                className="h-9 w-auto max-w-[120px] border-2 border-neu-black object-contain shadow-neu-sm" />
            </picture>
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
                  className={cn(
                    'font-display font-bold text-xs uppercase tracking-wide transition-all duration-200 pb-0.5',
                    activeSection === id
                      ? 'text-neu-primary border-b-2 border-neu-primary'
                      : 'text-neu-black/60 hover:text-neu-black border-b-2 border-transparent',
                  )}>
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
          <button
            onClick={() => setMenuOpen(o => !o)}
            aria-expanded={menuOpen}
            aria-label={menuOpen ? 'Tutup menu' : 'Buka menu'}
            className="sm:hidden w-11 h-11 border-2 border-neu-black flex items-center justify-center">
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
      <section
        onMouseMove={handleHeroMouseMove}
        onMouseEnter={() => setIsHoveredHero(true)}
        onMouseLeave={() => setIsHoveredHero(false)}
        className="relative min-h-[95vh] border-b-2 border-neu-black overflow-hidden bg-[#0D0D0D]"
      >

        {/* Layer 0 — Ambient color gradient */}
        <div className="absolute inset-0 z-0 pointer-events-none bg-gradient-to-br from-neu-primary/[0.04] via-transparent to-white/[0.03]" />

        {/* Layer 0.5 — Cursor glow spotlight */}
        {isHoveredHero && (
          <div
            className="absolute inset-0 pointer-events-none z-[1] transition-opacity duration-300"
            style={{
              background: `radial-gradient(600px circle at ${mousePos.x}px ${mousePos.y}px, rgba(255, 208, 0, 0.08), transparent 80%)`,
            }}
          />
        )}

        {/* Layer 1 — Floating geometric shapes (monokrom: kuning + putih) */}
        <div className="absolute inset-0 z-[1] overflow-hidden pointer-events-none">
          <ElegantShape
            delay={0.3} width={600} height={140} rotate={12}
            gradient="from-neu-primary/[0.12]"
            className="left-[-8%] md:left-[-3%] top-[15%] md:top-[18%]"
          />
          <ElegantShape
            delay={0.5} width={420} height={100} rotate={-12}
            gradient="from-white/[0.05]"
            className="right-[-4%] md:right-[2%] top-[64%] md:top-[70%]"
          />
          <ElegantShape
            delay={0.4} width={220} height={60} rotate={-8}
            gradient="from-neu-primary/[0.08]"
            className="left-[6%] md:left-[10%] bottom-[10%] md:bottom-[14%]"
          />
        </div>

        {/* Layer 2 — Dot grid pattern */}
        <div className="absolute inset-0 z-[2] pointer-events-none"
             style={{ backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.035) 1px, transparent 1px)', backgroundSize: '34px 34px' }} />

        {/* Layer 3 — Left-side dark vignette so text stays readable */}
        <div className="absolute inset-0 z-[3] pointer-events-none"
             style={{ background: 'linear-gradient(to right, #0D0D0D 30%, rgba(13,13,13,0.85) 50%, rgba(13,13,13,0.35) 70%, transparent 100%)' }} />

        {/* Layer 3b — Background monumental text */}
        <div className="absolute inset-0 z-[4] pointer-events-none flex items-center justify-end overflow-hidden">
          <span className="font-display font-black text-[18vw] leading-none text-neu-white/[0.025] select-none tracking-tighter pr-4 lg:pr-8">
            SYNECTRA
          </span>
        </div>

        {/* Layer 4 — Content */}
        <div className="relative z-20 max-w-7xl mx-auto px-4 lg:px-6 min-h-[95vh] flex flex-col justify-center py-16 lg:py-24">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center w-full">
            
            {/* Left Column — Text & CTAs */}
            <div className="lg:col-span-7 flex flex-col justify-center text-left">
              {/* Badge */}
              <div className="hero-badge inline-flex self-start items-center gap-2 bg-white/[0.06] border border-white/[0.12] text-neu-white px-4 py-1.5 font-mono font-bold text-xs uppercase tracking-widest mb-6"
                   style={{ opacity: 0 }}>
                <span className="w-1.5 h-1.5 bg-neu-primary animate-pulse" />
                {t('landing.hero.badge').replace('✦ ', '').replace('✦', '')}
              </div>

              {/* Horizontal rule separator */}
              <div className="w-16 h-px bg-neu-white/20 mb-6 ml-1" />

              {/* Title — clip reveal per baris */}
              <h1 className="font-display font-black text-5xl sm:text-6xl lg:text-7xl xl:text-8xl text-neu-white leading-[0.95] mb-6">
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
              <p className="hero-subtitle font-body text-sm sm:text-base lg:text-lg text-neu-white/55 mb-8 max-w-xl leading-relaxed"
                 style={{ opacity: 0, transform: 'translateY(16px)' }}>
                {t('landing.hero.subtitle')}
              </p>

              {/* CTA Buttons */}
              <div className="hero-cta flex flex-wrap gap-3 mb-0" style={{ opacity: 0 }}>
                <button
                  onClick={() => transitionTo('/register')}
                  className="px-8 py-3.5 bg-neu-primary border-2 border-neu-primary shadow-[4px_4px_0px_#FFD000] font-display font-bold text-sm uppercase tracking-wide text-neu-black transition-all duration-150 hover:translate-x-[3px] hover:translate-y-[3px] hover:shadow-[2px_2px_0px_#FFD000] active:translate-x-[4px] active:translate-y-[4px] active:shadow-none">
                  {t('landing.hero.cta')}
                </button>
                <button
                  onClick={() => scrollTo(portfolioRef)}
                  className="px-8 py-3.5 bg-transparent border-2 border-neu-white/40 font-display font-bold text-sm uppercase tracking-wide text-neu-white/80 transition-all duration-150 hover:border-neu-white hover:text-neu-white hover:translate-x-[3px] hover:translate-y-[3px] active:translate-x-[4px] active:translate-y-[4px]">
                  {t('landing.hero.ctaSecondary')}
                </button>
              </div>
            </div>

            {/* Right Column — Mock IDE Visual */}
            <div className="lg:col-span-5 w-full flex justify-center lg:justify-end mt-12 lg:mt-0">
              <MockIDE />
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
      <section className="border-b-2 border-t-4 border-neu-black border-t-neu-primary bg-neu-black overflow-hidden">
        <div className="flex items-stretch">
          {/* Fixed label */}
          <div className="flex-shrink-0 border-r-2 border-neu-white/10 px-4 flex items-center">
            <span className="font-mono font-bold text-[9px] text-neu-white/30 uppercase tracking-[0.2em] whitespace-nowrap">STACK</span>
          </div>
          {/* Scrolling */}
          <div className="overflow-hidden py-3 flex-1">
            <div className="flex gap-10 animate-marquee whitespace-nowrap">
              {[...techStack, ...techStack, ...techStack].map((tech, i) => (
                <span key={i} className="inline-flex items-center gap-3 font-mono text-[11px] text-neu-white/40 uppercase tracking-widest flex-shrink-0">
                  <span className="w-1 h-1 bg-neu-primary inline-block flex-shrink-0" />
                  {tech}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── STATS — Oversized numbers ── */}
      <section id="statistik" className="border-b-2 border-neu-black bg-neu-black py-16 lg:py-20">
        <div className="max-w-7xl mx-auto px-4 lg:px-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 divide-neu-white/10 divide-x-0 lg:divide-x-2">
            {stats.map((s, i) => (
              <motion.div
                key={s.labelKey}
                {...scaleUp(i * 0.06)}
                className={cn('px-6 lg:px-10 py-8 flex flex-col justify-center', i > 0 && 'border-t-2 lg:border-t-0 border-neu-white/10')}
              >
                <p className={cn(
                  'font-display font-black leading-none tracking-tighter',
                  'text-[3.5rem] sm:text-[4.5rem] lg:text-[5.5rem]',
                  i === 3 ? 'text-neu-primary' : 'text-neu-white',
                )}>
                  <AnimatedCounter key={s.value} target={s.value} suffix={s.suffix} />
                </p>
                <p className="font-mono text-[10px] text-neu-white/40 uppercase tracking-[0.2em] mt-3">{t(s.labelKey)}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── SERVICES — Editorial grid ── */}
      <section id="layanan" className="border-b-2 border-neu-black py-16 lg:py-20">
        <div className="max-w-7xl mx-auto px-4 lg:px-6">
          <div className="flex items-start justify-between gap-6 mb-12 flex-wrap">
            <motion.div {...fadeLeft()}>
              <span className="font-mono text-[10px] text-neu-black/50 uppercase tracking-widest block mb-2">{t('landing.services.tag')}</span>
              <div className="h-px w-8 bg-neu-primary mb-4" />
              <h2 className="font-display font-bold text-3xl lg:text-4xl text-neu-black max-w-md leading-tight">{t('landing.services.title').split('\n').map((line, i) => <span key={i}>{line}{i === 0 && <br />}</span>)}</h2>
            </motion.div>
            <motion.p {...fadeUp(0.1)} className="font-mono text-[10px] text-neu-black/30 uppercase tracking-widest self-end hidden lg:block">
              — {services.length} {t('landing.services.tag').toLowerCase()}
            </motion.p>
          </div>

          {(() => {
            const svcIcons = [
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><rect x="3" y="3" width="18" height="18" rx="0"/><path d="M9 9h6M9 13h4"/></svg>,
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><rect x="5" y="2" width="14" height="20" rx="0"/><line x1="12" y1="18" x2="12.01" y2="18"/></svg>,
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><path d="M8 14s1.5 2 4 2 4-2 4-2"/><line x1="9" y1="9" x2="9.01" y2="9"/><line x1="15" y1="9" x2="15.01" y2="9"/></svg>,
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg>,
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 3H5a2 2 0 00-2 2v4m6-6h10a2 2 0 012 2v4M9 3v18m0 0h10a2 2 0 002-2V9M9 21H5a2 2 0 01-2-2V9m0 0h18"/></svg>,
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"/></svg>,
            ];
            return (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 border-2 border-neu-black">
                {services.map((svc, i) => (
                  <motion.div
                    key={svc.title}
                    {...fadeUp(i * 0.06)}
                    className={cn(
                      'relative p-7 lg:p-8 group border-b-2 border-r-0 sm:border-r-2 border-neu-black transition-colors duration-150 hover:bg-neu-bg',
                      // Remove right border on last item of each row
                      (i + 1) % 3 === 0 ? 'lg:border-r-0' : '',
                      (i + 1) % 2 === 0 ? 'sm:border-r-0 lg:border-r-2' : '',
                      // Last two rows: drop bottom border so the wrapper border closes cleanly
                      i >= services.length - (services.length % 3 === 0 ? 3 : services.length % 3) ? 'lg:border-b-0' : '',
                    )}
                  >
                    {/* Index number */}
                    <span className="absolute top-5 right-5 font-mono text-xs font-bold text-neu-black/20">
                      {String(i + 1).padStart(2, '0')}
                    </span>

                    <div className="w-10 h-10 border-2 border-neu-black bg-neu-primary text-neu-black flex items-center justify-center mb-5">
                      {svcIcons[i % svcIcons.length]}
                    </div>

                    <h3 className="font-display font-bold text-base text-neu-black mb-2">{svc.title}</h3>
                    <p className="font-body text-sm leading-relaxed text-neu-black/55">{svc.desc}</p>

                    <div className="mt-5 h-px w-full bg-neu-primary origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-300" />
                  </motion.div>
                ))}
              </div>
            );
          })()}
        </div>
      </section>

      {/* ── ABOUT SECTION ── */}
      <section className="border-b-2 border-neu-black bg-neu-black py-20 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 lg:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">

            {/* Left — text + features */}
            <motion.div {...fadeUp()} className="border-l-4 border-neu-primary pl-6">
              <span className="font-mono text-[10px] text-neu-white/40 uppercase tracking-widest block mb-2">{t('landing.about.tag')}</span>
              <div className="h-px w-8 bg-neu-primary mb-4" />
              <h2 className="font-display font-bold text-3xl lg:text-4xl text-neu-white mb-4 leading-tight">
                {t('landing.about.title').split('\n').map((l, i) => <span key={i} className="block">{l}</span>)}
              </h2>
              <p className="font-body text-sm text-neu-white/55 leading-relaxed mb-8">
                {t('landing.about.subtitle')}
              </p>
              <div className="flex flex-col gap-4 border-t border-neu-white/10 pt-6">
                {(t('landing.about.features', { returnObjects: true })).map((f, fi) => (
                  <div key={f} className="flex items-start gap-4">
                    <span className="font-mono font-bold text-xs text-neu-primary/70 flex-shrink-0 mt-0.5">
                      {String(fi + 1).padStart(2, '0')}.
                    </span>
                    <p className="font-body text-sm text-neu-white/65 leading-relaxed">{f}</p>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Right — stats panel */}
            <motion.div {...fadeUp(0.15)} className="border-2 border-neu-white/20" style={{ boxShadow: '8px 8px 0px #FFD000' }}>
              {/* Stats row */}
              <div className="grid grid-cols-3 divide-x divide-neu-white/15">
                {[
                  { value: '5+',   label: t('landing.stats.experience') },
                  { value: '100+', label: t('landing.stats.projects')   },
                  { value: '4.9★', label: t('landing.stats.satisfaction') },
                ].map((s, i) => (
                  <div key={i} className="px-5 py-8 text-center">
                    <p className="font-display font-black text-3xl lg:text-4xl text-neu-primary leading-none mb-2">{s.value}</p>
                    <p className="font-mono text-[10px] text-neu-white/45 uppercase tracking-wider leading-snug">{s.label}</p>
                  </div>
                ))}
              </div>
              {/* Quote */}
              <div className="border-t border-neu-white/15 px-6 py-7">
                <p className="font-display font-bold text-lg lg:text-xl text-neu-white leading-snug mb-2">
                  &ldquo;{t('landing.about.quote', 'Kualitas bukan pilihan,')}&rdquo;
                </p>
                <p className="font-mono text-[10px] text-neu-white/35 uppercase tracking-widest">— Synectra Team</p>
              </div>
            </motion.div>

          </div>
        </div>
      </section>

      {/* ── PAKET LAYANAN ── */}
      {activePackages.length > 0 && (
        <section id="paket" className="border-b-2 border-neu-black bg-neu-bg py-16">
          <div className="max-w-7xl mx-auto px-4 lg:px-6">

            {/* Section header */}
            <div className="flex items-end justify-between mb-8">
              <motion.div {...fadeUp()}>
                <div className="h-px w-8 bg-neu-primary mb-4" />
                <h2 className="font-display font-bold text-3xl lg:text-4xl text-neu-black leading-tight">{t('landing.packages.title')}</h2>
              </motion.div>
              {/* Navigation arrows */}
              <div className="flex gap-2">
                <button 
                  onClick={() => scrollSlider(pkgSliderRef, 'left')} 
                  aria-label="Scroll left"
                  className="w-10 h-10 border-2 border-neu-black bg-neu-white shadow-neu-sm flex items-center justify-center font-bold hover:bg-neu-primary active:translate-x-[1px] active:translate-y-[1px] active:shadow-none transition-all"
                >
                  ←
                </button>
                <button 
                  onClick={() => scrollSlider(pkgSliderRef, 'right')} 
                  aria-label="Scroll right"
                  className="w-10 h-10 border-2 border-neu-black bg-neu-primary shadow-neu-sm flex items-center justify-center font-bold hover:bg-neu-white active:translate-x-[1px] active:translate-y-[1px] active:shadow-none transition-all"
                >
                  →
                </button>
              </div>
            </div>

            {/* Drag-to-scroll slider */}
            <div className="relative">
              {isLoading ? (
                <div className="flex gap-5 pt-5 pb-3">
                  {[1,2,3].map(i => <div key={i} className="flex-shrink-0 w-72 h-80 border-2 border-neu-black animate-pulse bg-neu-white" />)}
                </div>
              ) : (
              <div
                ref={pkgSliderRef}
                className="flex gap-5 overflow-x-auto pt-5 pb-3 snap-x snap-mandatory -mx-4 px-4 lg:mx-0 lg:px-0 select-none"
                style={{ scrollbarWidth: 'none', msOverflowStyle: 'none', cursor: 'grab' }}
                onMouseDown={e => {
                  const el = pkgSliderRef.current;
                  pkgDrag.current = { active: true, startX: e.pageX, scrollLeft: el.scrollLeft };
                  el.style.cursor = 'grabbing';
                  el.style.scrollSnapType = 'none';
                }}
                onMouseMove={e => {
                  if (!pkgDrag.current.active) return;
                  pkgSliderRef.current.scrollLeft = pkgDrag.current.scrollLeft - (e.pageX - pkgDrag.current.startX);
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
                onTouchStart={e => {
                  const el = pkgSliderRef.current;
                  pkgDrag.current = { active: true, startX: e.touches[0].pageX, scrollLeft: el.scrollLeft };
                }}
                onTouchMove={e => {
                  if (!pkgDrag.current.active) return;
                  const el = pkgSliderRef.current;
                  el.scrollLeft = pkgDrag.current.scrollLeft - (e.touches[0].pageX - pkgDrag.current.startX);
                }}
                onTouchEnd={() => { pkgDrag.current.active = false; }}
              >
                {activePackages.map((pkg, pi) => (
                  <div key={pkg.id} className="flex-shrink-0 w-72 snap-start">
                    <PackageCard pkg={{ ...pkg, _idx: pi + 1 }} onOrder={() => navigateProtected('/my-orders/new')} />
                  </div>
                ))}
              </div>
              )}
              {/* Fade overlay kanan */}
              <div className="absolute right-0 top-0 bottom-3 w-16 bg-gradient-to-l from-neu-bg to-transparent pointer-events-none" />
            </div>
          </div>
        </section>
      )}

      {/* ── SOFTWARE SIAP PAKAI ── */}
      {activeSoftwareProducts.length > 0 && (
        <section id="software" className="border-b-2 border-neu-black bg-neu-black py-16">
          <div className="max-w-7xl mx-auto px-4 lg:px-6">

            {/* Header */}
            <div className="flex items-end justify-between mb-10">
              <motion.div {...fadeLeft()}>
                <span className="font-mono text-[10px] text-neu-white/40 uppercase tracking-widest block mb-2">{t('landing.software.title')}</span>
                <div className="h-px w-8 bg-neu-primary mb-4" />
                <h2 className="font-display font-bold text-3xl lg:text-4xl text-neu-white leading-tight">
                  {t('landing.software.subtitle')}
                </h2>
              </motion.div>
              {/* Navigation arrows */}
              <div className="flex gap-2">
                <button 
                  onClick={() => scrollSlider(swSliderRef, 'left')} 
                  aria-label="Scroll left"
                  className="w-10 h-10 border-2 border-neu-black bg-neu-white shadow-neu-sm flex items-center justify-center font-bold hover:bg-neu-primary active:translate-x-[1px] active:translate-y-[1px] active:shadow-none transition-all"
                >
                  ←
                </button>
                <button 
                  onClick={() => scrollSlider(swSliderRef, 'right')} 
                  aria-label="Scroll right"
                  className="w-10 h-10 border-2 border-neu-primary bg-neu-primary shadow-neu-sm flex items-center justify-center font-bold hover:bg-neu-white active:translate-x-[1px] active:translate-y-[1px] active:shadow-none transition-all"
                >
                  →
                </button>
              </div>
            </div>

            {/* Drag-to-scroll slider — no scrollbar UI */}
            <div className="relative">
            {isLoading ? (
              <div className="flex gap-5 pt-5 pb-3">
                {[1,2,3].map(i => <div key={i} className="flex-shrink-0 w-72 h-72 border-2 border-neu-white/20 animate-pulse bg-neu-white/10" />)}
              </div>
            ) : (
            <div
              ref={swSliderRef}
              className="flex gap-5 overflow-x-auto pt-5 pb-3 -mx-4 px-4 lg:mx-0 lg:px-0 select-none"
              style={{ scrollbarWidth: 'none', msOverflowStyle: 'none', cursor: 'grab' }}
              onMouseDown={e => {
                const el = swSliderRef.current;
                swDrag.current = { active: true, startX: e.pageX, scrollLeft: el.scrollLeft };
                el.style.cursor = 'grabbing';
              }}
              onMouseMove={e => {
                if (!swDrag.current.active) return;
                swSliderRef.current.scrollLeft = swDrag.current.scrollLeft - (e.pageX - swDrag.current.startX);
              }}
              onMouseUp={() => { swDrag.current.active = false; swSliderRef.current.style.cursor = 'grab'; }}
              onMouseLeave={() => { if (swDrag.current.active) { swDrag.current.active = false; swSliderRef.current.style.cursor = 'grab'; } }}
              onTouchStart={e => {
                const el = swSliderRef.current;
                swDrag.current = { active: true, startX: e.touches[0].pageX, scrollLeft: el.scrollLeft };
              }}
              onTouchMove={e => {
                if (!swDrag.current.active) return;
                const el = swSliderRef.current;
                el.scrollLeft = swDrag.current.scrollLeft - (e.touches[0].pageX - swDrag.current.startX);
              }}
              onTouchEnd={() => { swDrag.current.active = false; }}
            >
              {activeSoftwareProducts.map(sw => {
                const isEn   = i18n.language === 'en';
                const swName = (isEn && sw.nameEn)        ? sw.nameEn        : sw.name;
                const swDesc = (isEn && sw.descriptionEn) ? sw.descriptionEn : sw.description;
                const fmt    = (v) => `Rp ${Number(v).toLocaleString('id-ID')}`;
                return (
                  <motion.div key={sw.id} onClick={() => setActiveSoftware(sw)} {...cardAnim(0)} className="flex-shrink-0 w-72 flex flex-col bg-neu-white border-2 border-neu-black shadow-neu transition-all duration-200 hover:-translate-x-2 hover:-translate-y-2 hover:shadow-neu-lg hover:rotate-[-0.5deg] cursor-pointer select-none">

                    {/* Thumbnail / Flat Graphic */}
                    <div className="relative border-b-2 border-neu-black h-40 bg-neu-bg overflow-hidden flex items-center justify-center">
                      {sw.id.startsWith('mock-') ? (
                        <div className={cn(
                          "w-full h-full flex items-center justify-center p-6 text-neu-black",
                          sw.id === 'mock-sw1' ? 'bg-neu-primary' : sw.id === 'mock-sw2' ? 'bg-neu-purple' : 'bg-neu-accent'
                        )}>
                          {sw.id === 'mock-sw1' && (
                            <svg className="w-16 h-16" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                              <rect x="2" y="4" width="20" height="12" rx="0" />
                              <path d="M12 20h.01M6 20h.01M18 20h.01 M2 8h20 M5 12h2 M17 12h2" />
                            </svg>
                          )}
                          {sw.id === 'mock-sw2' && (
                            <svg className="w-16 h-16 text-neu-white" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
                            </svg>
                          )}
                          {sw.id === 'mock-sw3' && (
                            <svg className="w-16 h-16 text-neu-white" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                              <circle cx="9" cy="21" r="1" /><circle cx="20" cy="21" r="1" />
                              <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
                            </svg>
                          )}
                        </div>
                      ) : sw.thumbnailUrl ? (
                        <img src={supaImg(sw.thumbnailUrl, { width: 576 })} alt={swName} width="288" height="160" className="w-full h-full object-cover pointer-events-none" loading="lazy" decoding="async" draggable="false" />
                      ) : (
                        <svg className="w-12 h-12 text-neu-black/15" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24" draggable="false">
                          <rect x="2" y="3" width="20" height="14" /><line x1="8" y1="21" x2="16" y2="21" /><line x1="12" y1="17" x2="12" y2="21" />
                        </svg>
                      )}
                      {sw.category && (
                        <span className="absolute top-2 right-2 font-mono text-[9px] font-bold uppercase px-2 py-0.5 bg-neu-white border border-neu-black text-neu-black">
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
                            <span key={s} className="font-mono text-[9px] border border-neu-black text-neu-black bg-transparent px-2 py-0.5">{s.trim()}</span>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Footer */}
                    <div className="px-4 pb-4 border-t-2 border-neu-black pt-3 flex items-center justify-between gap-2">
                      <span className="font-mono font-bold text-sm text-neu-black whitespace-nowrap">{fmt(sw.price)}</span>
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
                          onClick={e => { e.stopPropagation(); navigateProtected('/my-software'); }}
                          className="px-2.5 py-1.5 bg-neu-primary border-2 border-neu-black shadow-neu-sm font-display font-bold text-[10px] uppercase text-neu-black transition-all duration-150 hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none">
                          {t('landing.software.buyNow')}
                        </button>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
            )}
            {/* Fade overlay kanan */}
            <div className="absolute right-0 top-0 bottom-3 w-16 bg-gradient-to-l from-neu-black to-transparent pointer-events-none" />
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
                      <img src={supaImg(b.image, { width: 576 })} alt={b.title} width="288" height="144" className="w-full h-36 object-cover group-hover:scale-105 transition-transform duration-300" loading="lazy" decoding="async" />
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
              <span className="font-mono text-[10px] text-neu-black/50 uppercase tracking-widest block mb-2">{t('landing.portfolio.tag')}</span>
              <div className="h-px w-8 bg-neu-primary mb-4" />
              <h2 className="font-display font-bold text-3xl lg:text-4xl text-neu-black leading-tight">{t('landing.portfolio.title')}</h2>
              <p className="font-body text-sm text-neu-black/55 mt-2 max-w-md">{t('landing.portfolio.subtitle')}</p>
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
                  <motion.div
                    key={item.id}
                    {...cardAnim(i * 0.07)}
                    className="border-2 border-neu-black shadow-neu bg-neu-white overflow-hidden group cursor-pointer"
                    onClick={() => setActivePortfolio(item)}
                  >
                    <div className="relative bg-neu-bg border-b-2 border-neu-black overflow-hidden aspect-video">
                      {imgs[0]
                        ? <img src={supaImg(imgs[0], { width: 600 })} alt={item.title} width="600" height="338" className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-400" loading="lazy" decoding="async" />
                        : <div className="w-full h-full flex items-center justify-center"><span className="font-display font-bold text-5xl text-neu-black/15">{item.title?.charAt(0)}</span></div>}
                      {/* Overlay selalu tipis agar teks screenshot tidak terbaca mentah */}
                      <div className="absolute inset-0 bg-neu-black/20" />
                      {item.category && <span className="absolute top-2 left-2 bg-neu-black text-neu-white font-mono font-bold text-[10px] uppercase px-2 py-0.5 z-10">{item.category.replace(/_/g,' ')}</span>}
                      <div className="absolute inset-0 group-hover:bg-neu-black/20 transition-all duration-300 flex items-center justify-center z-10">
                        <span className="opacity-0 group-hover:opacity-100 transition-opacity font-display font-bold text-sm text-neu-white px-4 py-2 border border-neu-white/30 bg-neu-black/70">{item.title}</span>
                      </div>
                    </div>
                    <div className="p-4 flex items-center justify-between gap-3">
                      <h3 className="font-display font-bold text-sm text-neu-black leading-tight">{item.title}</h3>
                      <button className="flex-shrink-0 px-4 py-2 bg-neu-primary border-2 border-neu-black shadow-neu-sm font-display font-bold text-xs uppercase text-neu-black transition-all duration-150 group-hover:translate-x-[2px] group-hover:translate-y-[2px] group-hover:shadow-none">{t('landing.portfolio.viewDetail')}</button>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* ── WHY CHOOSE US — Statement section ── */}
      <section className="border-b-2 border-t-4 border-neu-black bg-neu-white overflow-hidden">
        {/* Static value-prop band */}
        <div className="bg-neu-primary border-b-2 border-neu-black py-3 px-4 lg:px-6">
          <div className="max-w-7xl mx-auto flex flex-wrap items-center gap-x-6 gap-y-2">
            {(t('landing.why.items', { returnObjects: true })).map((w, i) => (
              <span key={w.title} className="inline-flex items-center gap-6 font-mono font-bold text-[11px] uppercase tracking-widest text-neu-black">
                {i > 0 && <span className="text-neu-black/30">/</span>}
                {w.title}
              </span>
            ))}
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 lg:px-6 py-20 lg:py-28">
          {/* Header */}
          <motion.div className="mb-12" {...fadeLeft()}>
            <div className="h-px w-8 bg-neu-primary mb-4" />
            <h2 className="font-display font-bold text-3xl lg:text-4xl text-neu-black leading-tight max-w-lg">
              {t('landing.why.title')}
            </h2>
          </motion.div>

          {/* Items — sharp small numeral, no icon box */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-0 border-l-2 border-t-2 border-neu-black">
            {(t('landing.why.items', { returnObjects: true })).map((w, i) => (
              <motion.div
                key={w.title}
                {...fadeUp(i * 0.06)}
                className="border-r-2 border-b-2 border-neu-black p-6 lg:p-8 hover:bg-neu-bg transition-colors duration-150"
              >
                <div className="flex items-center gap-2 mb-4">
                  <span className="font-mono font-bold text-xs text-neu-primary bg-neu-black px-1.5 py-0.5">{String(i + 1).padStart(2, '0')}</span>
                </div>
                <h3 className="font-display font-bold text-base text-neu-black mb-2">{w.title}</h3>
                <p className="font-body text-sm text-neu-black/55 leading-relaxed">{w.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS — Horizontal timeline ── */}
      <section id="cara-kerja" className="border-b-2 border-neu-black bg-neu-black py-20 lg:py-28">
        <div className="max-w-7xl mx-auto px-4 lg:px-6">
          <motion.div className="mb-14" {...fadeUp()}>
            <span className="font-mono text-[10px] text-neu-white/40 uppercase tracking-widest block mb-2">{t('landing.howItWorks.tag')}</span>
            <div className="h-px w-8 bg-neu-primary mb-4" />
            <h2 className="font-display font-bold text-3xl lg:text-4xl text-neu-white leading-tight">{t('landing.howItWorks.title')}</h2>
          </motion.div>

          {/* Steps */}
          <div className="relative grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
            {/* Connector line (desktop only) */}
            <div className="hidden lg:block absolute top-[1.4rem] left-[12.5%] right-[12.5%] h-px border-t-2 border-dashed border-neu-white/15 z-0" />

            {(t('landing.howItWorks.steps', { returnObjects: true })).map((step, si) => (
              <motion.div
                key={step.no}
                {...{ initial: { opacity: 0, y: 20 }, whileInView: { opacity: 1, y: 0 }, viewport: { once: true }, transition: { duration: 0.5, delay: si * 0.12 } }}
                className="relative z-10 border-b-2 border-r-0 sm:border-r-2 border-neu-white/10 last:border-r-0 lg:border-b-0 px-6 pb-10 lg:pb-0 pt-4 lg:pt-0 first:pl-0 lg:first:pl-0"
              >
                {/* Step numeral — sharp, on-brand */}
                <div className="inline-flex items-center justify-center w-11 h-11 bg-neu-primary border-2 border-neu-primary mb-5 relative">
                  <span className="font-mono font-bold text-base text-neu-black">{step.no}</span>
                </div>
                <h3 className="font-display font-bold text-lg text-neu-white mb-2">{step.title}</h3>
                <p className="font-body text-xs text-neu-white/50 leading-relaxed">{step.desc}</p>
              </motion.div>
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
                <span className="font-mono text-[10px] text-neu-black/50 uppercase tracking-widest block mb-2">{t('landing.contact.tag')}</span>
                <div className="h-px w-8 bg-neu-primary mb-4" />
                <h2 className="font-display font-bold text-3xl lg:text-4xl text-neu-black mb-4 leading-tight">
                  {t('landing.contact.title').split('\n').map((l, i) => <span key={i} className="block">{l}</span>)}
                </h2>
                <p className="font-body text-sm text-neu-black/55 mb-6 leading-relaxed max-w-sm">{t('landing.contact.subtitle')}</p>
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
                          className="flex items-center gap-4 p-4 bg-neu-white border-2 border-neu-black border-l-4 shadow-neu-sm hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-neu transition-all duration-150" style={{ borderLeftColor: color }}>
                          <div className="w-9 h-9 flex items-center justify-center flex-shrink-0">
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

      {/* ── CTA FINAL ── */}
      <section className="border-b-2 border-neu-black bg-neu-primary overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 lg:px-6">
          <motion.div className="py-24 flex flex-col items-center text-center" {...fadeUp()}>
            <div className="h-px w-12 bg-neu-black/30 mb-8" />
            <h2 className="font-display font-black text-5xl lg:text-6xl text-neu-black mb-5 leading-[0.95] max-w-2xl">
              {t('landing.cta.title').split('\n').map((l, i) => <span key={i} className="block">{l}</span>)}
            </h2>
            <p className="font-body text-base text-neu-black/65 mb-10 max-w-md leading-relaxed">
              {t('landing.cta.subtitle')}
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={() => transitionTo('/register')}
                className="px-10 py-4 bg-neu-black border-2 border-neu-black text-neu-white font-display font-bold text-sm uppercase shadow-[6px_6px_0px_#0D0D0D] hover:translate-x-[3px] hover:translate-y-[3px] hover:shadow-none transition-all duration-150">
                {t('landing.cta.primary')}
              </button>
              <button
                onClick={() => transitionTo('/login')}
                className="px-10 py-4 bg-transparent border-2 border-neu-black text-neu-black font-display font-bold text-sm uppercase hover:bg-neu-black/10 transition-all duration-150">
                {t('landing.cta.secondary')}
              </button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          FOOTER — Modern 2025
      ══════════════════════════════════════════ */}
      <motion.footer className="bg-neu-black relative overflow-hidden" {...fadeUp()}>
        {/* Top strip */}
        <div className="border-b border-neu-white/10">
          <div className="max-w-7xl mx-auto px-4 lg:px-6 py-10 grid grid-cols-1 lg:grid-cols-4 gap-10">

            {/* Brand col — 2/5 */}
            <div className="lg:col-span-2">
              <div className="flex items-center gap-3 mb-5">
                <picture>
                  <source srcSet="/logo-synectra.webp" type="image/webp" />
                  <img src="/logo-synectra.jpeg" alt="Synectra" width="130" height="36" loading="lazy" decoding="async"
                    className="h-9 w-auto max-w-[130px] border-2 border-neu-white/30 object-contain brightness-0 invert" />
                </picture>
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

      {/* ── Back-to-Top Button ── */}
      <AnimatePresence>
        {showScrollTop && (
          <motion.button
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.2 }}
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            aria-label="Kembali ke atas"
            className="fixed bottom-20 sm:bottom-6 right-4 sm:right-6 z-50 w-11 h-11 bg-neu-black border-2 border-neu-black shadow-neu text-neu-white flex items-center justify-center hover:bg-neu-primary hover:text-neu-black transition-colors duration-150">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 15l7-7 7 7" />
            </svg>
          </motion.button>
        )}
      </AnimatePresence>

      {/* ── Mobile Sticky CTA Bar (≤640px) ── */}
      <AnimatePresence>
        {showScrollTop && (
          <motion.div
            initial={{ y: 80 }}
            animate={{ y: 0 }}
            exit={{ y: 80 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            className="sm:hidden fixed bottom-0 left-0 right-0 z-50 bg-neu-white border-t-2 border-neu-black px-4 py-3 flex gap-3">
            <button
              onClick={() => transitionTo('/register')}
              className="flex-1 py-3 bg-neu-primary border-2 border-neu-black shadow-neu-sm font-display font-bold text-sm uppercase text-neu-black transition-all duration-150 hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none">
              {t('nav.register')}
            </button>
            <button
              onClick={() => transitionTo('/login')}
              className="px-5 py-3 bg-neu-white border-2 border-neu-black font-display font-bold text-sm uppercase text-neu-black/70 hover:text-neu-black transition-colors">
              {t('nav.login')}
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
