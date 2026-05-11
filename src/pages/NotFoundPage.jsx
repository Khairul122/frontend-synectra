import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Canvas, useFrame } from '@react-three/fiber';
import { gsap } from 'gsap';
import { cn } from '../utils/cn';

/* ─── 3D Scene: floating torus knot ─────────────────────────────────────── */
function TorusKnot() {
  const mesh = useRef(null);
  useFrame(({ clock }) => {
    if (!mesh.current) return;
    mesh.current.rotation.x = Math.sin(clock.elapsedTime * 0.4) * 0.4;
    mesh.current.rotation.y += 0.012;
    mesh.current.position.y = Math.sin(clock.elapsedTime * 0.7) * 0.25;
  });
  return (
    <mesh ref={mesh}>
      <torusKnotGeometry args={[1, 0.32, 128, 16]} />
      <meshBasicMaterial color="#FFD000" wireframe />
    </mesh>
  );
}

function Ring() {
  const mesh = useRef(null);
  useFrame(({ clock }) => {
    if (!mesh.current) return;
    mesh.current.rotation.x = clock.elapsedTime * 0.3;
    mesh.current.rotation.z = clock.elapsedTime * 0.2;
  });
  return (
    <mesh ref={mesh}>
      <torusGeometry args={[2.2, 0.04, 8, 60]} />
      <meshBasicMaterial color="#0D0D0D" wireframe={false} />
    </mesh>
  );
}

function Scene404() {
  return (
    <Canvas
      camera={{ position: [0, 0, 5.5], fov: 50 }}
      style={{ background: '#F5F0E8', width: '100%', height: '100%' }}
    >
      <ambientLight intensity={1} />
      <TorusKnot />
      <Ring />
    </Canvas>
  );
}

/* ─── Page ───────────────────────────────────────────────────────────────── */
export default function NotFoundPage() {
  const navigate = useNavigate();

  const codeRef    = useRef(null);
  const titleRef   = useRef(null);
  const descRef    = useRef(null);
  const actionsRef = useRef(null);
  const sceneRef   = useRef(null);
  const decorRef   = useRef(null);

  useEffect(() => {
    const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });
    tl.from(decorRef.current,   { opacity: 0, duration: 0.4 })
      .from(codeRef.current,    { x: -60, opacity: 0, duration: 0.6 }, '-=0.1')
      .from(titleRef.current,   { x: -50, opacity: 0, duration: 0.5 }, '-=0.3')
      .from(descRef.current,    { x: -40, opacity: 0, duration: 0.5 }, '-=0.3')
      .from(actionsRef.current, { y: 20,  opacity: 0, duration: 0.4 }, '-=0.2')
      .from(sceneRef.current,   { x: 80,  opacity: 0, duration: 0.7, ease: 'power2.out' }, 0.1);
    return () => tl.kill();
  }, []);

  return (
    <div className="min-h-screen w-full bg-neu-bg flex items-center justify-center overflow-hidden relative">

      {/* Background grid + accents */}
      <div ref={decorRef} className="absolute inset-0 pointer-events-none" aria-hidden>
        <div className="absolute inset-0" style={{
          backgroundImage: 'repeating-linear-gradient(0deg,transparent,transparent 39px,rgba(13,13,13,.06) 39px,rgba(13,13,13,.06) 40px),repeating-linear-gradient(90deg,transparent,transparent 39px,rgba(13,13,13,.06) 39px,rgba(13,13,13,.06) 40px)',
        }} />
        <div className="absolute top-6 left-6 w-16 h-16 border-2 border-neu-black bg-neu-primary shadow-neu" />
        <div className="absolute bottom-6 right-6 w-10 h-10 border-2 border-neu-black bg-neu-accent" />
        <div className="absolute top-1/2 right-8 w-6 h-6 border-2 border-neu-black bg-neu-black" />
        <div className="absolute bottom-24 left-10 w-8 h-8 border-2 border-neu-black bg-neu-blue" />
      </div>

      <div className="relative z-10 w-full max-w-5xl mx-auto px-6 flex flex-col lg:flex-row items-center justify-between gap-12">

        {/* Left — text */}
        <div className="flex-1 min-w-0">
          <div ref={codeRef} className="mb-4">
            <span className="inline-block px-4 py-2 bg-neu-black text-neu-white border-2 border-neu-black shadow-neu font-mono font-bold text-xs uppercase tracking-widest">
              Error 404
            </span>
          </div>

          <div className="relative mb-2">
            <h1 className="font-display font-bold leading-none select-none"
              style={{ fontSize: 'clamp(6rem,18vw,14rem)', color: 'transparent', WebkitTextStroke: '3px #0D0D0D' }}>
              404
            </h1>
            <div className="absolute inset-0 font-display font-bold leading-none select-none text-neu-primary"
              style={{ fontSize: 'clamp(6rem,18vw,14rem)', clipPath: 'inset(0 0 50% 0)', WebkitTextStroke: '3px #0D0D0D' }}>
              404
            </div>
          </div>

          <h2 ref={titleRef} className="font-display font-bold text-2xl md:text-3xl text-neu-black mb-3 leading-tight">
            Halaman Tidak Ditemukan
          </h2>

          <p ref={descRef} className="font-body text-base text-neu-black/60 mb-8 max-w-md leading-relaxed">
            Halaman yang kamu cari tidak ada, sudah dipindahkan, atau mungkin URL-nya salah ketik. Jangan panik — yuk balik ke tempat yang aman.
          </p>

          <div ref={actionsRef} className="flex flex-wrap gap-3">
            <button onClick={() => navigate(-1)} className={cn(
              'px-6 py-3 bg-neu-white border-2 border-neu-black shadow-neu',
              'font-display font-bold text-sm uppercase tracking-wide text-neu-black',
              'transition-all duration-150 hover:translate-x-[3px] hover:translate-y-[3px] hover:shadow-neu-sm',
              'active:translate-x-1 active:translate-y-1 active:shadow-none',
            )}>← Kembali</button>
            <button onClick={() => navigate('/dashboard')} className={cn(
              'px-6 py-3 bg-neu-primary border-2 border-neu-black shadow-neu',
              'font-display font-bold text-sm uppercase tracking-wide text-neu-black',
              'transition-all duration-150 hover:translate-x-[3px] hover:translate-y-[3px] hover:shadow-neu-sm',
              'active:translate-x-1 active:translate-y-1 active:shadow-none',
            )}>Ke Dashboard</button>
          </div>
        </div>

        {/* Right — 3D Scene */}
        <div ref={sceneRef} className="flex-shrink-0 flex flex-col items-center gap-3">
          <div className="relative border-2 border-neu-black shadow-neu-xl overflow-hidden"
            style={{ width: 300, height: 280 }}>
            {/* Corner badge */}
            <div className="absolute top-0 left-0 z-10 bg-neu-accent border-r-2 border-b-2 border-neu-black px-2 py-0.5">
              <span className="font-mono font-bold text-[10px] text-neu-white uppercase">not found</span>
            </div>
            <Scene404 />
          </div>
          <p className="font-mono text-xs text-neu-black/30 uppercase tracking-widest">
            synectra · 404
          </p>
        </div>

      </div>
    </div>
  );
}
