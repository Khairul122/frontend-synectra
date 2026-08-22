import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { cn } from '../../utils/cn';

/* ─── Label pill "sticker" — header tiap section (mis. "SERVICES // WHAT_WE_DO") ──
   `shadow` menerima warna solid-shadow arbitrary per section, persis mock Stitch
   (tiap section punya warna shadow pill berbeda — bukan selalu hitam). ── */
export function SectionTag({ children, tone = 'black', rotate = '-rotate-1', shadow = '#0D0D0D', size = 'lg', className = '' }) {
  const TONES = {
    black: 'bg-neu-black text-neu-white',
    primary: 'bg-neu-primary text-neu-black',
    white: 'bg-neu-white text-neu-black',
  };
  const SIZES = {
    lg: 'text-xl px-8 py-3',
    sm: 'text-sm px-4 py-2',
  };
  const OFFSET = size === 'sm' ? 4 : 8;
  return (
    <div
      className={cn(
        'inline-block font-mono font-bold border-4 border-neu-black rounded-neu-sm uppercase tracking-wide',
        SIZES[size], TONES[tone], rotate, className,
      )}
      style={{ boxShadow: `${OFFSET}px ${OFFSET}px 0px 0px ${shadow}` }}
    >
      {children}
    </div>
  );
}

/* ─── Hero text reveal — overflow-hidden + GSAP translateY ──────────── */
export function HeroReveal({ children, delay = 0, className = '' }) {
  const innerRef = useRef(null);
  useEffect(() => {
    gsap.fromTo(
      innerRef.current,
      { y: '110%' },
      { y: '0%', duration: 1.0, delay, ease: 'power3.out' },
    );
  }, [delay]);
  return (
    <div className={`overflow-hidden pb-4 -mb-4 ${className}`}>
      <div ref={innerRef} style={{ transform: 'translateY(110%)' }}>
        {children}
      </div>
    </div>
  );
}

/* ─── Anime.js counter ──────────────────────────────────────────────── */
export function AnimatedCounter({ target, suffix = '' }) {
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
export function LetterReveal({ text, className, delay = 0 }) {
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
