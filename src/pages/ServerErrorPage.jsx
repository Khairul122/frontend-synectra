import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Lottie from 'lottie-react';
import { gsap } from 'gsap';
import { cn } from '../utils/cn';

export default function ServerErrorPage() {
  const navigate = useNavigate();

  const codeRef    = useRef(null);
  const titleRef   = useRef(null);
  const descRef    = useRef(null);
  const actionsRef = useRef(null);
  const lottieRef  = useRef(null);
  const decorRef   = useRef(null);

  useEffect(() => {
    const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });

    tl.from(decorRef.current,  { opacity: 0, duration: 0.4 })
      .from(codeRef.current,   { x: -60, opacity: 0, duration: 0.6 }, '-=0.1')
      .from(titleRef.current,  { x: -50, opacity: 0, duration: 0.5 }, '-=0.3')
      .from(descRef.current,   { x: -40, opacity: 0, duration: 0.5 }, '-=0.3')
      .from(actionsRef.current,{ y: 20,  opacity: 0, duration: 0.4 }, '-=0.2')
      .from(lottieRef.current, { x: 60,  opacity: 0, duration: 0.7, ease: 'power2.out' }, 0.1);

    // Subtle continuous pulse on the lottie container border
    gsap.to(lottieRef.current, {
      boxShadow: '10px 10px 0px #FF5C5C',
      repeat: -1,
      yoyo: true,
      duration: 1.2,
      ease: 'sine.inOut',
      delay: 1,
    });

    return () => { tl.kill(); gsap.killTweensOf(lottieRef.current); };
  }, []);

  const handleReload = () => {
    window.location.reload();
  };

  return (
    <div className="min-h-screen w-full bg-neu-bg flex items-center justify-center overflow-hidden relative">

      {/* Decorative background */}
      <div ref={decorRef} className="absolute inset-0 pointer-events-none" aria-hidden>
        <div className="absolute inset-0"
          style={{
            backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 39px, rgba(13,13,13,0.06) 39px, rgba(13,13,13,0.06) 40px), repeating-linear-gradient(90deg, transparent, transparent 39px, rgba(13,13,13,0.06) 39px, rgba(13,13,13,0.06) 40px)',
          }}
        />
        {/* Accent squares — gunakan warna merah (accent) untuk tema error server */}
        <div className="absolute top-6 left-6 w-16 h-16 border-2 border-neu-black bg-neu-accent shadow-neu" />
        <div className="absolute bottom-6 right-6 w-10 h-10 border-2 border-neu-black bg-neu-primary" />
        <div className="absolute top-1/3 right-10 w-6 h-6 border-2 border-neu-black bg-neu-accent" />
        <div className="absolute bottom-28 left-8 w-8 h-8 border-2 border-neu-black bg-neu-black" />
        <div className="absolute top-16 right-1/3 w-5 h-5 border-2 border-neu-black bg-neu-blue" />
      </div>

      {/* Main content */}
      <div className="relative z-10 w-full max-w-5xl mx-auto px-6 flex flex-col lg:flex-row items-center justify-between gap-12">

        {/* Left — text */}
        <div className="flex-1 min-w-0">

          {/* Status badge */}
          <div ref={codeRef} className="mb-4">
            <span className="inline-block px-4 py-2 bg-neu-accent text-neu-white border-2 border-neu-black shadow-neu font-mono font-bold text-xs uppercase tracking-widest">
              Error 500
            </span>
          </div>

          {/* Big number */}
          <div className="relative mb-2">
            <h1
              className="font-display font-bold leading-none select-none"
              style={{ fontSize: 'clamp(6rem, 18vw, 14rem)', color: 'transparent', WebkitTextStroke: '3px #0D0D0D' }}
            >
              500
            </h1>
            <div
              className="absolute inset-0 font-display font-bold leading-none select-none text-neu-accent"
              style={{ fontSize: 'clamp(6rem, 18vw, 14rem)', clipPath: 'inset(0 0 50% 0)', WebkitTextStroke: '3px #0D0D0D' }}
            >
              500
            </div>
          </div>

          {/* Title */}
          <h2 ref={titleRef} className="font-display font-bold text-2xl md:text-3xl text-neu-black mb-3 leading-tight">
            Terjadi Kesalahan Server
          </h2>

          {/* Description */}
          <p ref={descRef} className="font-body text-base text-neu-black/60 mb-8 max-w-md leading-relaxed">
            Server kami sedang mengalami masalah. Tim teknis kami sudah mengetahuinya dan sedang menangani. Coba muat ulang halaman, atau kembali beberapa saat lagi.
          </p>

          {/* Actions */}
          <div ref={actionsRef} className="flex flex-wrap gap-3">
            <button
              onClick={handleReload}
              className={cn(
                'px-6 py-3 bg-neu-accent border-2 border-neu-black shadow-neu',
                'font-display font-bold text-sm uppercase tracking-wide text-neu-white',
                'transition-all duration-150',
                'hover:translate-x-[3px] hover:translate-y-[3px] hover:shadow-neu-sm',
                'active:translate-x-1 active:translate-y-1 active:shadow-none',
              )}
            >
              ↺ Muat Ulang
            </button>
            <button
              onClick={() => navigate('/dashboard')}
              className={cn(
                'px-6 py-3 bg-neu-white border-2 border-neu-black shadow-neu',
                'font-display font-bold text-sm uppercase tracking-wide text-neu-black',
                'transition-all duration-150',
                'hover:translate-x-[3px] hover:translate-y-[3px] hover:shadow-neu-sm',
                'active:translate-x-1 active:translate-y-1 active:shadow-none',
              )}
            >
              Ke Dashboard
            </button>
          </div>

          {/* Error code detail */}
          <p className="mt-6 font-mono text-xs text-neu-black/30">
            Kode: INTERNAL_SERVER_ERROR · Hubungi tim jika masalah berlanjut
          </p>
        </div>

        {/* Right — Lottie */}
        <div ref={lottieRef} className="flex-shrink-0 flex flex-col items-center gap-4">
          <div className="border-2 border-neu-black shadow-neu-xl bg-neu-white p-6 relative"
            style={{ boxShadow: '8px 8px 0px #0D0D0D' }}
          >
            {/* Corner tag */}
            <div className="absolute -top-3 -right-3 bg-neu-primary border-2 border-neu-black px-2 py-0.5">
              <span className="font-mono font-bold text-[10px] text-neu-black uppercase">server error</span>
            </div>
            <Lottie
              path="/lottie/500.json"
              loop
              autoplay
              style={{ width: 240, height: 240 }}
            />
          </div>
          <p className="font-mono text-xs text-neu-black/30 uppercase tracking-widest">
            synectra · error page
          </p>
        </div>

      </div>
    </div>
  );
}
