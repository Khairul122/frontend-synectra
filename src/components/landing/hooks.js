import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { gsap } from 'gsap';

/* ─── Pastikan URL kontak punya prefix yang benar ────────────────────── */
export function fixContactUrl(linkUrl, iconKey) {
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

/* ─── Ambil string sesuai bahasa aktif (id/en) ───────────────────────── */
export function useLang() {
  const { i18n } = useTranslation();
  return (id, en) => (i18n.language === 'en' && en ? en : id);
}

/* ─── Lenis smooth scroll — hanya desktop, lazy, hormati reduced-motion ── */
export function useLenis(enabled) {
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
export function usePageTransition() {
  const pageRef = useRef(null);
  const navigate = useNavigate();
  const transitionTo = async (path) => {
    if (!pageRef.current) { navigate(path); return; }
    await gsap.to(pageRef.current, { opacity: 0, y: -30, duration: 0.4, ease: 'power2.in' });
    navigate(path);
  };
  return { pageRef, transitionTo };
}
