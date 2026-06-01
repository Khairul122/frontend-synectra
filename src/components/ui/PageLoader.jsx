export function PageLoader() {
  return (
    <div className="fixed inset-0 z-[9999] bg-neu-black flex flex-col items-center justify-center overflow-hidden">

      {/* Subtle grid */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.04]"
        style={{
          backgroundImage:
            'repeating-linear-gradient(0deg,transparent,transparent 39px,#FAFAFA 39px,#FAFAFA 40px),repeating-linear-gradient(90deg,transparent,transparent 39px,#FAFAFA 39px,#FAFAFA 40px)',
        }}
      />

      {/* Corner brackets */}
      <div className="absolute top-5 left-5  w-10 h-10 border-t-2 border-l-2 border-neu-primary" />
      <div className="absolute top-5 right-5 w-10 h-10 border-t-2 border-r-2 border-neu-primary" />
      <div className="absolute bottom-5 left-5  w-10 h-10 border-b-2 border-l-2 border-neu-primary" />
      <div className="absolute bottom-5 right-5 w-10 h-10 border-b-2 border-r-2 border-neu-primary" />

      {/* Spinner */}
      <div className="relative w-24 h-24">
        <div className="absolute inset-0 border-2 border-neu-primary animate-spin" style={{ animationDuration: '3s' }} />
        <div className="absolute inset-3 border-2 border-neu-primary/50 animate-spin" style={{ animationDuration: '2s', animationDirection: 'reverse' }} />
        <div className="absolute inset-6 border-2 border-neu-primary/25 animate-spin" style={{ animationDuration: '1.5s' }} />
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="font-display font-bold text-lg text-neu-primary">S</span>
        </div>
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

      <span className="absolute bottom-7 font-mono text-[10px] text-neu-white/25 uppercase tracking-widest">
        Memuat...
      </span>
    </div>
  );
}
