import { useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { gsap } from 'gsap';
import { ArrowRight } from 'lucide-react';

export default function NotFoundPage() {
  const navigate = useNavigate();

  const headerRef = useRef(null);
  const wrapperRef = useRef(null);
  const cardGroupRef = useRef(null);
  const stickerRef = useRef(null);
  const illustrationRef = useRef(null);
  const textGroupRef = useRef(null);
  const headingRef = useRef(null);
  const descRef = useRef(null);
  const ctaGroupRef = useRef(null);

  useEffect(() => {
    // 1. GSAP Entrance Timeline Animation
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });

      tl.fromTo(
        headerRef.current,
        { y: -40, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.7, ease: 'back.out(1.4)' }
      )
        .fromTo(
          stickerRef.current,
          { scale: 0, rotate: -25, opacity: 0 },
          { scale: 1, rotate: -3, opacity: 1, duration: 0.8, ease: 'back.out(1.8)' },
          '-=0.3'
        )
        .fromTo(
          illustrationRef.current,
          { scale: 0.8, rotate: 12, opacity: 0, y: 30 },
          { scale: 1, rotate: 2, opacity: 1, y: 0, duration: 0.8, ease: 'back.out(1.4)' },
          '-=0.5'
        )
        .fromTo(
          headingRef.current,
          { y: 30, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.6 },
          '-=0.4'
        )
        .fromTo(
          descRef.current,
          { y: 20, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.5 },
          '-=0.4'
        )
        .fromTo(
          ctaGroupRef.current,
          { y: 20, scale: 0.9, opacity: 0 },
          { y: 0, scale: 1, opacity: 1, duration: 0.5, ease: 'back.out(1.6)' },
          '-=0.3'
        );

      // 2. GSAP Continuous Floating Animation for Sticker & Illustration
      gsap.to(stickerRef.current, {
        y: -14,
        duration: 3,
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut',
      });

      gsap.to(illustrationRef.current, {
        y: -12,
        rotate: 3,
        duration: 3.5,
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut',
        delay: 0.4,
      });
    }, wrapperRef);

    // 3. Interactive Mouse / Touch 3D Parallax Tilt Effect
    const wrapper = wrapperRef.current;
    if (!wrapper) return () => ctx.revert();

    const handlePointerMove = (e) => {
      const clientX = e.touches ? e.touches[0].clientX : e.clientX;
      const clientY = e.touches ? e.touches[0].clientY : e.clientY;
      const { innerWidth, innerHeight } = window;

      const x = (clientX / innerWidth - 0.5) * 2;
      const y = (clientY / innerHeight - 0.5) * 2;

      // Card group (Deeper layer)
      if (cardGroupRef.current) {
        gsap.to(cardGroupRef.current, {
          rotateX: y * -12,
          rotateY: x * 12,
          translateZ: 25,
          duration: 0.4,
          ease: 'power2.out',
        });
      }

      // Text group (Mid layer)
      if (textGroupRef.current) {
        gsap.to(textGroupRef.current, {
          rotateX: y * -8,
          rotateY: x * 8,
          translateZ: 15,
          duration: 0.4,
          ease: 'power2.out',
        });
      }

      // CTA group (Top layer)
      if (ctaGroupRef.current) {
        gsap.to(ctaGroupRef.current, {
          rotateX: y * -5,
          rotateY: x * 5,
          translateZ: 30,
          duration: 0.4,
          ease: 'power2.out',
        });
      }
    };

    const handlePointerReset = () => {
      [cardGroupRef.current, textGroupRef.current, ctaGroupRef.current].forEach(
        (el) => {
          if (el) {
            gsap.to(el, {
              rotateX: 0,
              rotateY: 0,
              translateZ: 0,
              duration: 0.6,
              ease: 'power2.out',
            });
          }
        }
      );
    };

    window.addEventListener('mousemove', handlePointerMove);
    window.addEventListener('touchmove', handlePointerMove);
    window.addEventListener('mouseleave', handlePointerReset);
    window.addEventListener('touchend', handlePointerReset);

    return () => {
      ctx.revert();
      window.removeEventListener('mousemove', handlePointerMove);
      window.removeEventListener('touchmove', handlePointerMove);
      window.removeEventListener('mouseleave', handlePointerReset);
      window.removeEventListener('touchend', handlePointerReset);
    };
  }, []);

  return (
    <div className="bg-neu-bg min-h-screen flex flex-col relative overflow-hidden text-on-surface selection:bg-primary-container selection:text-neu-black font-body">
      {/* Millimetric Grid Background */}
      <div className="absolute -inset-x-[100px] -inset-y-[100px] z-0 bg-grid-pattern pointer-events-none" />

      {/* Minimal Header */}
      <header
        ref={headerRef}
        className="w-full px-6 py-6 md:py-8 z-10 relative flex justify-center md:justify-start max-w-7xl mx-auto"
      >
        <Link
          to="/"
          className="inline-block hover:-rotate-2 transition-transform duration-300"
        >
          <span className="font-display font-black text-2xl md:text-3xl tracking-tighter text-neu-black">
            Synectra
          </span>
        </Link>
      </header>

      {/* Main 404 Canvas */}
      <main
        ref={wrapperRef}
        className="flex-1 flex flex-col items-center justify-center px-6 py-8 md:py-12 z-10 relative w-full max-w-3xl mx-auto text-center gap-6 md:gap-10 parallax-container"
        id="parallax-wrapper"
      >
        {/* Visual Group (404 Sticker + Image Card) */}
        <div
          ref={cardGroupRef}
          className="relative flex flex-col items-center justify-center w-full parallax-element"
          id="parallax-card"
        >
          {/* Giant 404 Sticker */}
          <div
            ref={stickerRef}
            className="z-20 -mb-10 md:-mb-16 transform -rotate-3 hover:rotate-0 transition-transform duration-500"
          >
            <span className="inline-block bg-primary-container text-neu-white border-[4px] border-neu-black rounded-xl px-6 md:px-8 py-2 font-display font-black text-5xl md:text-7xl text-3d-block tracking-widest leading-none select-none">
              404
            </span>
          </div>

          {/* Illustration Card */}
          <div
            ref={illustrationRef}
            className="bg-neu-white border-[3px] md:border-[4px] border-neu-black rounded-xl p-3 md:p-4 shadow-neu-solid-md w-60 h-60 md:w-80 md:h-80 transform rotate-2 mx-auto relative overflow-hidden group select-none"
          >
            <div className="absolute inset-0 bg-secondary/10 opacity-0 group-hover:opacity-100 transition-opacity z-10 pointer-events-none rounded-lg" />
            <img
              src="https://lh3.googleusercontent.com/aida/AEtjO1WwbgrpQMzAwXjqf9L-aXuyUoTaz7SzU9K50QZcKglsYC75vJMAmHf_NAyeQP-3CX3zUUPsr3nQdZeM82SVS4oJIRTPYrrIq_1Knoe67ss8yzd37-S7tFk728PQ8W2XybChTNN8rZ96RRmO1k0rbu_HcbHyVNyIuQge86_PKBRbF9W7oz1jfUi9wADSM8L2sqnPXnQZDSaglP7qBQDIlfBYIYOKUhByOSGbqWKjzmwGg-_gdfHQ_t6YEVA"
              alt="Confused blue creature looking lost on a 404 page"
              className="w-full h-full object-cover rounded-lg border-2 border-neu-black filter contrast-105"
            />
          </div>
        </div>

        {/* Text Content */}
        <div
          ref={textGroupRef}
          className="flex flex-col gap-3 md:gap-4 mt-4 md:mt-8 items-center parallax-element"
          id="parallax-text"
        >
          <h1
            ref={headingRef}
            className="font-display font-bold text-3xl md:text-5xl text-neu-black max-w-2xl glitch-text leading-tight"
            data-text="Waduh! Kodingan Nyasar."
          >
            Waduh! Kodingan Nyasar.
          </h1>
          <p
            ref={descRef}
            className="font-body text-base md:text-lg text-on-surface-variant max-w-xl mx-auto leading-relaxed px-2"
          >
            Halaman yang Anda cari mungkin sudah dihapus, diubah namanya, atau memang tidak pernah ada di dimensi digital ini. Mari kembali ke jalur yang benar.
          </p>
        </div>

        {/* CTA Action */}
        <div
          ref={ctaGroupRef}
          className="mt-2 md:mt-4 pb-8 md:pb-12 parallax-element"
          id="parallax-cta"
        >
          <button
            onClick={() => navigate('/')}
            className="inline-flex items-center justify-center bg-primary-container text-neu-black font-display font-bold text-xs md:text-sm uppercase tracking-wider border-[3px] border-neu-black rounded-xl px-6 md:px-8 py-3.5 md:py-4 shadow-neu-button transition-all duration-250 ease-out hover-press-effect group cursor-pointer"
          >
            KEMBALI KE BERANDA
            <ArrowRight className="w-5 h-5 ml-2.5 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </main>
    </div>
  );
}
