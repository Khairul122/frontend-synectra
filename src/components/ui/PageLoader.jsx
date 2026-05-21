import { Suspense } from 'react';
import Spline from '@splinetool/react-spline';

// Scene: Abstract rotating geometric shapes — public community scene
const LOADING_SCENE = 'https://prod.spline.design/6Wq1Q7YGyM-iab9i/scene.splinecode';

function SpinnerFallback() {
  return (
    <div className="w-full h-full flex items-center justify-center bg-neu-black">
      <div className="w-10 h-10 border-[3px] border-neu-primary border-t-transparent animate-spin" />
    </div>
  );
}

export function PageLoader() {
  return (
    <div className="fixed inset-0 z-[9999] bg-neu-black flex flex-col items-center justify-center overflow-hidden">

      {/* Subtle grid background */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.04]"
        style={{
          backgroundImage:
            'repeating-linear-gradient(0deg,transparent,transparent 39px,#FAFAFA 39px,#FAFAFA 40px),repeating-linear-gradient(90deg,transparent,transparent 39px,#FAFAFA 39px,#FAFAFA 40px)',
        }}
      />

      {/* Neubrutalism corner brackets */}
      <div className="absolute top-5 left-5 w-10 h-10 border-t-2 border-l-2 border-neu-primary" />
      <div className="absolute top-5 right-5 w-10 h-10 border-t-2 border-r-2 border-neu-primary" />
      <div className="absolute bottom-5 left-5 w-10 h-10 border-b-2 border-l-2 border-neu-primary" />
      <div className="absolute bottom-5 right-5 w-10 h-10 border-b-2 border-r-2 border-neu-primary" />

      {/* Spline 3D scene container — neubrutalism framed */}
      <div className="relative w-72 h-72 border-2 border-neu-white/10 overflow-hidden"
           style={{ boxShadow: '8px 8px 0px #FFD000' }}>

        {/* Tag label */}
        <div className="absolute top-2 left-2 z-10 px-2 py-0.5 bg-neu-primary border border-neu-black">
          <span className="font-mono font-bold text-[9px] text-neu-black uppercase tracking-widest">3D</span>
        </div>

        <Suspense fallback={<SpinnerFallback />}>
          <Spline
            scene={LOADING_SCENE}
            style={{ width: '100%', height: '100%' }}
          />
        </Suspense>
      </div>

      {/* Branding */}
      <div className="mt-8 flex flex-col items-center gap-3">
        <div className="flex items-center gap-3">
          <div className="h-px w-8 bg-neu-primary" />
          <span className="font-display font-bold text-xl text-neu-white tracking-[0.3em] uppercase">
            Synectra
          </span>
          <div className="h-px w-8 bg-neu-primary" />
        </div>

        {/* Animated loading dots */}
        <div className="flex gap-2 mt-1">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="w-2 h-2 bg-neu-primary border border-neu-black animate-bounce"
              style={{ animationDelay: `${i * 0.15}s` }}
            />
          ))}
        </div>
      </div>

      {/* Status label */}
      <span className="absolute bottom-7 font-mono text-[10px] text-neu-white/25 uppercase tracking-widest">
        Memuat...
      </span>
    </div>
  );
}
