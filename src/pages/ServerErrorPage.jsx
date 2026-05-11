import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Canvas, useFrame } from '@react-three/fiber';
import { gsap } from 'gsap';
import { cn } from '../utils/cn';

/* ─── 3D Scene: pulsing icosahedron + orbiting ring ─────────────────────── */
function Icosahedron() {
  const mesh = useRef(null);
  useFrame(({ clock }) => {
    if (!mesh.current) return;
    mesh.current.rotation.x += 0.007;
    mesh.current.rotation.y += 0.011;
    const s = 1 + Math.sin(clock.elapsedTime * 1.8) * 0.06;
    mesh.current.scale.setScalar(s);
  });
  return (
    <mesh ref={mesh}>
      <icosahedronGeometry args={[1.4, 0]} />
      <meshBasicMaterial color="#FF5C5C" wireframe />
    </mesh>
  );
}

function OrbitRing() {
  const mesh = useRef(null);
  useFrame(({ clock }) => {
    if (!mesh.current) return;
    mesh.current.rotation.x = clock.elapsedTime * 0.5;
    mesh.current.rotation.y = clock.elapsedTime * 0.3;
  });
  return (
    <mesh ref={mesh}>
      <torusGeometry args={[2.4, 0.05, 8, 64]} />
      <meshBasicMaterial color="#0D0D0D" />
    </mesh>
  );
}

function InnerSphere() {
  const mesh = useRef(null);
  useFrame(({ clock }) => {
    if (!mesh.current) return;
    const s = 1 + Math.sin(clock.elapsedTime * 2.2 + 1) * 0.08;
    mesh.current.scale.setScalar(s);
    mesh.current.rotation.y += 0.02;
  });
  return (
    <mesh ref={mesh}>
      <sphereGeometry args={[0.6, 8, 8]} />
      <meshBasicMaterial color="#FFD000" wireframe />
    </mesh>
  );
}

function Scene500() {
  return (
    <Canvas
      camera={{ position: [0, 0, 6], fov: 50 }}
      style={{ background: '#F5F0E8', width: '100%', height: '100%' }}
    >
      <ambientLight intensity={1} />
      <Icosahedron />
      <OrbitRing />
      <InnerSphere />
    </Canvas>
  );
}

/* ─── Page ───────────────────────────────────────────────────────────────── */
export default function ServerErrorPage() {
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

    gsap.to(sceneRef.current, {
      boxShadow: '10px 10px 0px #FF5C5C',
      repeat: -1, yoyo: true, duration: 1.4, ease: 'sine.inOut', delay: 1,
    });

    return () => { tl.kill(); gsap.killTweensOf(sceneRef.current); };
  }, []);

  return (
    <div className="min-h-screen w-full bg-neu-bg flex items-center justify-center overflow-hidden relative">

      {/* Background grid + accents */}
      <div ref={decorRef} className="absolute inset-0 pointer-events-none" aria-hidden>
        <div className="absolute inset-0" style={{
          backgroundImage: 'repeating-linear-gradient(0deg,transparent,transparent 39px,rgba(13,13,13,.06) 39px,rgba(13,13,13,.06) 40px),repeating-linear-gradient(90deg,transparent,transparent 39px,rgba(13,13,13,.06) 39px,rgba(13,13,13,.06) 40px)',
        }} />
        <div className="absolute top-6 left-6 w-16 h-16 border-2 border-neu-black bg-neu-accent shadow-neu" />
        <div className="absolute bottom-6 right-6 w-10 h-10 border-2 border-neu-black bg-neu-primary" />
        <div className="absolute top-1/3 right-10 w-6 h-6 border-2 border-neu-black bg-neu-accent" />
        <div className="absolute bottom-28 left-8 w-8 h-8 border-2 border-neu-black bg-neu-black" />
        <div className="absolute top-16 right-1/3 w-5 h-5 border-2 border-neu-black bg-neu-blue" />
      </div>

      <div className="relative z-10 w-full max-w-5xl mx-auto px-6 flex flex-col lg:flex-row items-center justify-between gap-12">

        {/* Left — text */}
        <div className="flex-1 min-w-0">
          <div ref={codeRef} className="mb-4">
            <span className="inline-block px-4 py-2 bg-neu-accent text-neu-white border-2 border-neu-black shadow-neu font-mono font-bold text-xs uppercase tracking-widest">
              Error 500
            </span>
          </div>

          <div className="relative mb-2">
            <h1 className="font-display font-bold leading-none select-none"
              style={{ fontSize: 'clamp(6rem,18vw,14rem)', color: 'transparent', WebkitTextStroke: '3px #0D0D0D' }}>
              500
            </h1>
            <div className="absolute inset-0 font-display font-bold leading-none select-none text-neu-accent"
              style={{ fontSize: 'clamp(6rem,18vw,14rem)', clipPath: 'inset(0 0 50% 0)', WebkitTextStroke: '3px #0D0D0D' }}>
              500
            </div>
          </div>

          <h2 ref={titleRef} className="font-display font-bold text-2xl md:text-3xl text-neu-black mb-3 leading-tight">
            Terjadi Kesalahan Server
          </h2>

          <p ref={descRef} className="font-body text-base text-neu-black/60 mb-8 max-w-md leading-relaxed">
            Server kami sedang mengalami masalah. Tim teknis kami sudah mengetahuinya dan sedang menangani. Coba muat ulang halaman, atau kembali beberapa saat lagi.
          </p>

          <div ref={actionsRef} className="flex flex-wrap gap-3">
            <button onClick={() => window.location.reload()} className={cn(
              'px-6 py-3 bg-neu-accent border-2 border-neu-black shadow-neu',
              'font-display font-bold text-sm uppercase tracking-wide text-neu-white',
              'transition-all duration-150 hover:translate-x-[3px] hover:translate-y-[3px] hover:shadow-neu-sm',
              'active:translate-x-1 active:translate-y-1 active:shadow-none',
            )}>↺ Muat Ulang</button>
            <button onClick={() => navigate('/dashboard')} className={cn(
              'px-6 py-3 bg-neu-white border-2 border-neu-black shadow-neu',
              'font-display font-bold text-sm uppercase tracking-wide text-neu-black',
              'transition-all duration-150 hover:translate-x-[3px] hover:translate-y-[3px] hover:shadow-neu-sm',
              'active:translate-x-1 active:translate-y-1 active:shadow-none',
            )}>Ke Dashboard</button>
          </div>

          <p className="mt-6 font-mono text-xs text-neu-black/30">
            Kode: INTERNAL_SERVER_ERROR · Hubungi tim jika masalah berlanjut
          </p>
        </div>

        {/* Right — 3D Scene */}
        <div ref={sceneRef} className="flex-shrink-0 flex flex-col items-center gap-3">
          <div className="relative border-2 border-neu-black shadow-neu-xl overflow-hidden"
            style={{ width: 300, height: 300 }}>
            {/* Corner badge */}
            <div className="absolute top-0 left-0 z-10 bg-neu-primary border-r-2 border-b-2 border-neu-black px-2 py-0.5">
              <span className="font-mono font-bold text-[10px] text-neu-black uppercase">server error</span>
            </div>
            <Scene500 />
          </div>
          <p className="font-mono text-xs text-neu-black/30 uppercase tracking-widest">
            synectra · 500
          </p>
        </div>

      </div>
    </div>
  );
}
